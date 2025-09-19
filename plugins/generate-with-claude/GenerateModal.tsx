import React, { useState, useEffect } from 'react'
import {
  Dialog,
  Box,
  Card,
  Stack,
  Text,
  TextInput,
  Button,
  Spinner,
  Select,
  Checkbox,
  Grid,
  Label,
  Heading,
  Flex,
  TabList,
  TabPanel,
  Tab,
} from '@sanity/ui'
import { useClient } from 'sanity'
import {
  GenerationFormData,
  GenerationState,
  SUPPORTED_LANGUAGES,
  TONE_OPTIONS,
  LENGTH_OPTIONS
} from './types'
import { LanguageSelector } from './components/LanguageSelector'
import { ImageSearch } from './components/ImageSearch'
import { ProgressIndicator } from './components/ProgressIndicator'
import { useGenerateContent } from './hooks/useGenerateContent'

interface GenerateModalProps {
  documentId: string
  onClose: () => void
  onSuccess?: (data: any) => void
}

export function GenerateModal({ documentId, onClose, onSuccess }: GenerateModalProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const { generate, state, progress, error } = useGenerateContent()

  const [activeTab, setActiveTab] = useState('content')
  const [categories, setCategories] = useState<Array<{ _id: string; title: any }>>([])
  const [formData, setFormData] = useState<GenerationFormData>({
    topic: '',
    category: '',
    keywords: [],
    languages: ['ro'],
    tone: 'professional',
    length: 'medium',
    includeSeo: true,
    imageSettings: {
      featuredImage: true,
      imageKeywords: '',
      includeInlineImages: false
    }
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await client.fetch(`*[_type == "category"] { _id, title }`)
      setCategories(result)
    }
    fetchCategories()
  }, [client])

  const handleSubmit = async (e?: React.MouseEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log('🚀 Submit button clicked')
    console.log('📋 Form data:', formData)

    if (!formData.topic || formData.languages.length === 0) {
      console.warn('⚠️ Validation failed: Missing topic or languages')
      return
    }

    try {
      console.log('📝 Document ID:', documentId)
      console.log('🔄 Starting generation...')

      // Generate content and get the document data
      const generatedData = await generate(formData, documentId)

      console.log('✅ Generation completed!')
      console.log('📄 Generated data:', generatedData)

      // If we have a success callback, call it with the generated data
      if (onSuccess && generatedData) {
        console.log('🔄 Updating document with generated content...')
        onSuccess(generatedData)
      }

      // Close the modal after a short delay to show completion
      setTimeout(() => {
        onClose()
      }, 1000)

    } catch (err) {
      console.error('❌ Generation failed:', err)
      // Don't close modal on error so user can see what happened
    }
  }

  const updateFormData = (updates: Partial<GenerationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const isGenerating = state !== 'idle' && state !== 'error' && state !== 'complete'

  return (
    <Dialog
      header="Generate Article with Claude AI"
      id="generate-dialog"
      onClose={onClose}
      zOffset={1000}
      width={2}
    >
      <Card padding={4}>
        <Stack space={4}>
          {/* Progress Indicator */}
          {isGenerating && (
            <ProgressIndicator
              state={state}
              progress={progress}
            />
          )}

          {/* Error Display */}
          {error && (
            <Card padding={3} tone="critical" border>
              <Text size={1}>{error}</Text>
            </Card>
          )}

          {/* Tab Navigation */}
          <TabList space={2}>
            <Tab
              aria-controls="content-panel"
              id="content-tab"
              label="Content"
              onClick={() => setActiveTab('content')}
              selected={activeTab === 'content'}
            />
            <Tab
              aria-controls="language-panel"
              id="language-tab"
              label="Languages"
              onClick={() => setActiveTab('language')}
              selected={activeTab === 'language'}
            />
            <Tab
              aria-controls="style-panel"
              id="style-tab"
              label="Style"
              onClick={() => setActiveTab('style')}
              selected={activeTab === 'style'}
            />
            <Tab
              aria-controls="image-panel"
              id="image-tab"
              label="Images"
              onClick={() => setActiveTab('image')}
              selected={activeTab === 'image'}
            />
          </TabList>

          {/* Content Tab */}
          <TabPanel
            aria-labelledby="content-tab"
            hidden={activeTab !== 'content'}
            id="content-panel"
          >
            <Stack space={3}>
              <Stack space={2}>
                <Label>Topic *</Label>
                <TextInput
                  placeholder="Enter the main topic for your article"
                  value={formData.topic}
                  onChange={(event) => updateFormData({ topic: event.currentTarget.value })}
                  disabled={isGenerating}
                />
              </Stack>

              <Stack space={2}>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onChange={(event) => updateFormData({ category: event.currentTarget.value })}
                  disabled={isGenerating}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title?.ro || cat.title?.en || 'Untitled'}
                    </option>
                  ))}
                </Select>
              </Stack>

              <Stack space={2}>
                <Label>Keywords (comma-separated)</Label>
                <TextInput
                  placeholder="e.g., dog training, puppy care, pet health"
                  value={formData.keywords.join(', ')}
                  onChange={(event) => {
                    const keywords = event.currentTarget.value
                      .split(',')
                      .map(k => k.trim())
                      .filter(Boolean)
                    updateFormData({ keywords })
                  }}
                  disabled={isGenerating}
                />
              </Stack>
            </Stack>
          </TabPanel>

          {/* Language Tab */}
          <TabPanel
            aria-labelledby="language-tab"
            hidden={activeTab !== 'language'}
            id="language-panel"
          >
            <LanguageSelector
              selectedLanguages={formData.languages}
              onChange={(languages) => updateFormData({ languages })}
              disabled={isGenerating}
            />
          </TabPanel>

          {/* Style Tab */}
          <TabPanel
            aria-labelledby="style-tab"
            hidden={activeTab !== 'style'}
            id="style-panel"
          >
            <Stack space={3}>
              <Stack space={2}>
                <Label>Tone</Label>
                <Select
                  value={formData.tone}
                  onChange={(event) => updateFormData({
                    tone: event.currentTarget.value as GenerationFormData['tone']
                  })}
                  disabled={isGenerating}
                >
                  {TONE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Stack>

              <Stack space={2}>
                <Label>Article Length</Label>
                <Select
                  value={formData.length}
                  onChange={(event) => updateFormData({
                    length: event.currentTarget.value as GenerationFormData['length']
                  })}
                  disabled={isGenerating}
                >
                  {LENGTH_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Stack>

              <Flex align="center">
                <Checkbox
                  checked={formData.includeSeo}
                  onChange={(event) => updateFormData({
                    includeSeo: event.currentTarget.checked
                  })}
                  disabled={isGenerating}
                />
                <Box marginLeft={2}>
                  <Text size={1}>Generate SEO metadata</Text>
                </Box>
              </Flex>
            </Stack>
          </TabPanel>

          {/* Image Tab */}
          <TabPanel
            aria-labelledby="image-tab"
            hidden={activeTab !== 'image'}
            id="image-panel"
          >
            <Stack space={3}>
              <Flex align="center">
                <Checkbox
                  checked={formData.imageSettings.featuredImage}
                  onChange={(event) => updateFormData({
                    imageSettings: {
                      ...formData.imageSettings,
                      featuredImage: event.currentTarget.checked
                    }
                  })}
                  disabled={isGenerating}
                />
                <Box marginLeft={2}>
                  <Text size={1}>Include featured image from Unsplash</Text>
                </Box>
              </Flex>

              {formData.imageSettings.featuredImage && (
                <Stack space={2}>
                  <Label>Image search keywords</Label>
                  <TextInput
                    placeholder="Leave empty to use topic"
                    value={formData.imageSettings.imageKeywords}
                    onChange={(event) => updateFormData({
                      imageSettings: {
                        ...formData.imageSettings,
                        imageKeywords: event.currentTarget.value
                      }
                    })}
                    disabled={isGenerating}
                  />
                  <Text size={1} muted>
                    Keywords to search for images on Unsplash
                  </Text>
                </Stack>
              )}

              <Flex align="center">
                <Checkbox
                  checked={formData.imageSettings.includeInlineImages}
                  onChange={(event) => updateFormData({
                    imageSettings: {
                      ...formData.imageSettings,
                      includeInlineImages: event.currentTarget.checked
                    }
                  })}
                  disabled={isGenerating}
                />
                <Box marginLeft={2}>
                  <Text size={1}>Add image placeholders in content</Text>
                </Box>
              </Flex>
            </Stack>
          </TabPanel>

          {/* Action Buttons */}
          <Flex gap={2} justify="flex-end">
            <Button
              text="Cancel"
              mode="ghost"
              onClick={onClose}
              disabled={isGenerating}
              type="button"
            />
            <Button
              text={isGenerating ? "Generating..." : "Generate"}
              tone="primary"
              onClick={(e) => handleSubmit(e)}
              disabled={isGenerating || !formData.topic || formData.languages.length === 0}
              icon={isGenerating ? Spinner : undefined}
              type="button"
            />
          </Flex>
        </Stack>
      </Card>
    </Dialog>
  )
}