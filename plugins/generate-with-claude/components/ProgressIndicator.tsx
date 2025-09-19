import React from 'react'
import { Stack, Card, Text, Flex, Box, Spinner } from '@sanity/ui'
import { GenerationState, GenerationProgress } from '../types'

interface ProgressIndicatorProps {
  state: GenerationState
  progress: GenerationProgress
}

export function ProgressIndicator({ state, progress }: ProgressIndicatorProps) {
  const getStateMessage = () => {
    // Use custom message if available
    if (progress.message) {
      return progress.message
    }

    switch (state) {
      case 'validating':
        return 'Validating input...'
      case 'searching-images':
        return 'Searching for images...'
      case 'generating':
        return progress.currentLanguage
          ? `Generating content in ${progress.currentLanguage}...`
          : 'Generating content...'
      case 'formatting':
        return 'Formatting content...'
      case 'saving':
        return 'Saving document...'
      case 'complete':
        return 'Generation complete!'
      default:
        return 'Processing...'
    }
  }

  const getProgressPercentage = () => {
    const totalSteps = 5
    let currentStep = 0

    switch (state) {
      case 'validating':
        currentStep = 1
        break
      case 'searching-images':
        currentStep = 2
        break
      case 'generating':
        currentStep = 3
        break
      case 'formatting':
        currentStep = 4
        break
      case 'saving':
      case 'complete':
        currentStep = 5
        break
    }

    return Math.round((currentStep / totalSteps) * 100)
  }

  const percentage = getProgressPercentage()

  return (
    <Card padding={3} border tone="primary">
      <Stack space={3}>
        <Flex align="center">
          <Spinner />
          <Box marginLeft={2}>
            <Text size={2} weight="medium">
              {getStateMessage()}
            </Text>
          </Box>
        </Flex>

        {/* Progress Bar */}
        <Box>
          <Box
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--card-bg2-color)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <Box
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: 'var(--card-accent-fg-color)',
                transition: 'width 0.3s ease-in-out'
              }}
            />
          </Box>
        </Box>

        {/* Language Progress */}
        {progress.completedLanguages.length > 0 && (
          <Text size={1} muted>
            Completed languages: {progress.completedLanguages.join(', ')}
          </Text>
        )}

        {/* Time Estimate */}
        {progress.estimatedTimeRemaining && (
          <Text size={1} muted>
            Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 1000)}s
          </Text>
        )}
      </Stack>
    </Card>
  )
}