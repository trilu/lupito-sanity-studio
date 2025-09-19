import React, { useState } from 'react'
import { DocumentActionComponent, useClient } from 'sanity'
import { SparklesIcon } from '@sanity/icons'
import { GenerateModal } from './GenerateModal'

export const GenerateAction: DocumentActionComponent = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const client = useClient({ apiVersion: '2024-01-01' })

  // Only show for new or draft documents
  if (props.published && !props.draft) {
    return null
  }

  // Create a function to update the document with generated content
  const handleGeneratedContent = async (generatedData: any) => {
    console.log('📝 Updating document with generated content:', generatedData)

    try {
      // Use client.patch to update the document in Sanity v3
      const patch = client.patch(props.id)

      // Add all the fields
      if (generatedData.title) {
        patch.set({ title: generatedData.title })
      }

      if (generatedData.slug) {
        patch.set({ slug: generatedData.slug })
      }

      if (generatedData.excerpt) {
        patch.set({ excerpt: generatedData.excerpt })
      }

      if (generatedData.content) {
        patch.set({ content: generatedData.content })
      }

      if (generatedData.featuredImage) {
        patch.set({ featuredImage: generatedData.featuredImage })
      }

      if (generatedData.categories) {
        patch.set({ categories: generatedData.categories })
      }

      if (generatedData.tags) {
        patch.set({ tags: generatedData.tags })
      }

      if (generatedData.seo) {
        patch.set({ seo: generatedData.seo })
      }

      if (generatedData.publishedAt) {
        patch.set({ publishedAt: generatedData.publishedAt })
      }

      if (generatedData.featured !== undefined) {
        patch.set({ featured: generatedData.featured })
      }

      // Execute the patch
      await patch.commit()

      console.log('✅ Document patched successfully')

      // Refresh the document in the Studio to show updated content
      props.onComplete && props.onComplete()
    } catch (error) {
      console.error('❌ Failed to patch document:', error)
    }
  }

  return {
    label: 'Generate with Claude',
    icon: SparklesIcon,
    onHandle: () => {
      setIsModalOpen(true)
    },
    dialog: isModalOpen && {
      type: 'custom',
      component: (
        <GenerateModal
          documentId={props.id}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleGeneratedContent}
        />
      )
    }
  }
}