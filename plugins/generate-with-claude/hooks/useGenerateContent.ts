import { useState, useCallback } from 'react'
import { useClient } from 'sanity'
import {
  GenerationFormData,
  GenerationState,
  GenerationProgress,
  GeneratedContent
} from '../types'
import { formatContentForSanity } from '../utils/contentFormatter'
import { uploadImageToSanity } from '../utils/imageHandler'

export function useGenerateContent() {
  // Use withConfig to ensure we have write permissions
  const client = useClient({ apiVersion: '2024-01-01' }).withConfig({
    // Ensure we're using the token from the Studio session
    useCdn: false,
    ignoreBrowserTokenWarning: true
  })
  const [state, setState] = useState<GenerationState>('idle')
  const [progress, setProgress] = useState<GenerationProgress>({
    state: 'idle',
    completedLanguages: []
  })
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (formData: GenerationFormData, documentId: string) => {
    console.log('🚀 Starting generation with:', {
      formData,
      documentId,
      timestamp: new Date().toISOString()
    })

    setState('validating')
    setError(null)
    setProgress({
      state: 'validating',
      completedLanguages: []
    })

    try {
      // Step 1: Validate inputs
      console.log('✅ Step 1: Validating inputs...')
      if (!formData.topic || formData.languages.length === 0) {
        throw new Error('Topic and at least one language are required')
      }
      console.log('✅ Validation passed')

      // Step 2: Search for featured image if enabled
      let featuredImage = null
      if (formData.imageSettings.featuredImage) {
        console.log('🖼️ Step 2: Searching for featured image...')
        setState('searching-images')
        setProgress(prev => ({ ...prev, state: 'searching-images' }))

        const imageQuery = formData.imageSettings.imageKeywords || formData.topic

        // Use the production API URL when in Sanity Studio
        const apiUrl = window.location.hostname === 'lupito.sanity.studio'
          ? 'https://lupito.pet/api/unsplash-search'
          : '/api/unsplash-search'

        console.log('📡 Fetching image from:', apiUrl, 'with query:', imageQuery)

        const imageResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: imageQuery, perPage: 1 })
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          console.log('✅ Image search response:', imageData)
          if (imageData.results && imageData.results.length > 0) {
            featuredImage = imageData.results[0]
            console.log('✅ Featured image selected:', featuredImage.id)
          }
        } else {
          console.warn('⚠️ Image search failed:', imageResponse.status)
        }
      }

      // Step 3: Generate content with Claude (language by language)
      console.log('🤖 Step 3: Generating content with Claude...')
      setState('generating')

      const totalLanguages = formData.languages.length
      let completedLanguages = 0

      // Use the production API URL when in Sanity Studio
      const generateApiUrl = window.location.hostname === 'lupito.sanity.studio'
        ? 'https://lupito.pet/api/generate-article'
        : '/api/generate-article'

      // Initialize the generated content structure
      const generatedContent: GeneratedContent = {
        title: {},
        excerpt: {},
        content: {},
        tags: formData.keywords || [],
        featuredImage: featuredImage ? {
          url: featuredImage.urls.regular,
          alt: featuredImage.alt_description || `Image related to ${formData.topic}`,
          photographer: featuredImage.user.name,
          photographerUrl: featuredImage.user.links.html,
          unsplashId: featuredImage.id,
        } : undefined,
      }

      if (formData.includeSeo) {
        generatedContent.seo = {
          metaTitle: {},
          metaDescription: {},
        }
      }

      // Generate content for each language separately
      for (const lang of formData.languages) {
        completedLanguages++
        const languageName = lang.toUpperCase()

        console.log(`📝 Generating ${languageName} content (${completedLanguages}/${totalLanguages})...`)
        setProgress({
          state: 'generating',
          completedLanguages: [],
          currentLanguage: lang,
          message: `Generating ${languageName} content (${completedLanguages}/${totalLanguages})...`
        })

        try {
          const response = await fetch(generateApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              languages: [lang], // Only send one language at a time
              featuredImage: null // Already handled above
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error(`❌ Failed to generate ${languageName} content:`, errorData)
            continue // Skip this language and continue with others
          }

          const langContent = await response.json()
          console.log(`✅ ${languageName} content generated successfully`)

          // Merge the language-specific content
          const langKey = lang as keyof typeof generatedContent.title

          if (langContent.title[langKey]) {
            generatedContent.title[langKey] = langContent.title[langKey]
          }
          if (langContent.excerpt[langKey]) {
            generatedContent.excerpt[langKey] = langContent.excerpt[langKey]
          }
          if (langContent.content[langKey]) {
            generatedContent.content[langKey] = langContent.content[langKey]
          }

          if (formData.includeSeo && langContent.seo) {
            if (langContent.seo.metaTitle[langKey]) {
              generatedContent.seo!.metaTitle[langKey] = langContent.seo.metaTitle[langKey]
            }
            if (langContent.seo.metaDescription[langKey]) {
              generatedContent.seo!.metaDescription[langKey] = langContent.seo.metaDescription[langKey]
            }
          }

          // Merge tags (only from first language to avoid duplicates)
          if (completedLanguages === 1 && langContent.tags) {
            const allTags = [...generatedContent.tags, ...langContent.tags]
            generatedContent.tags = Array.from(new Set(allTags))
          }

        } catch (langError) {
          console.error(`❌ Error generating ${languageName} content:`, langError)
          // Continue with other languages
        }
      }

      console.log('✅ All content generation completed:', generatedContent)

      // Step 4: Format content for Sanity
      console.log('📝 Step 4: Formatting content for Sanity...')
      setState('formatting')
      setProgress(prev => ({ ...prev, state: 'formatting' }))

      const formattedContent = await formatContentForSanity(generatedContent)
      console.log('✅ Formatted content:', formattedContent)

      // Step 5: Upload featured image to Sanity if present
      let imageAssetId = null
      if (featuredImage && generatedContent.featuredImage) {
        console.log('📤 Step 5: Uploading featured image to Sanity...')
        try {
          imageAssetId = await uploadImageToSanity(
            client,
            generatedContent.featuredImage.url,
            featuredImage
          )
          console.log('✅ Image uploaded with ID:', imageAssetId)
        } catch (uploadError) {
          console.error('❌ Image upload failed:', uploadError)
          // Continue without image
        }
      }

      // Step 6: Prepare the final data (don't save, just return it)
      console.log('📦 Step 6: Preparing final data...')
      setState('saving')
      setProgress(prev => ({ ...prev, state: 'saving' }))

      // Get category reference
      let categoryRef = null
      if (formData.category) {
        categoryRef = {
          _type: 'reference',
          _ref: formData.category
        }
        console.log('📁 Category reference:', categoryRef)
      }

      // Prepare the document data structure
      const documentData = {
        title: formattedContent.title,
        slug: {
          current: generateSlug(formattedContent.title.ro || formattedContent.title.en || '')
        },
        excerpt: formattedContent.excerpt,
        featuredImage: imageAssetId ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAssetId
          },
          alt: generatedContent.featuredImage?.alt,
          caption: generatedContent.featuredImage ?
            `Photo by ${generatedContent.featuredImage.photographer}` : undefined
        } : undefined,
        content: formattedContent.content,
        categories: categoryRef ? [categoryRef] : [],
        tags: generatedContent.tags,
        seo: generatedContent.seo,
        publishedAt: new Date().toISOString(),
        featured: false
      }

      console.log('📊 Document data prepared:', documentData)

      // Step 7: Complete
      console.log('🎉 Step 7: Generation complete!')
      setState('complete')
      setProgress({
        state: 'complete',
        completedLanguages: formData.languages
      })

      // Return the document data so it can be used to update the form
      return documentData
    } catch (err) {
      console.error('❌ Generation error:', err)
      console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack trace')

      let errorMessage = 'An error occurred during generation'
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Generation timed out. The request took too long. Try with a shorter article or simpler topic.'
        } else {
          errorMessage = err.message
        }
      }

      setState('error')
      setError(errorMessage)
      setProgress(prev => ({ ...prev, state: 'error' }))
      throw err
    }
  }, [client])

  return {
    generate,
    state,
    progress,
    error
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}