import React from 'react'
import { Stack, Checkbox, Text, Box, Flex, Card, Button } from '@sanity/ui'
import { SUPPORTED_LANGUAGES } from '../types'

interface LanguageSelectorProps {
  selectedLanguages: string[]
  onChange: (languages: string[]) => void
  disabled?: boolean
}

export function LanguageSelector({ selectedLanguages, onChange, disabled }: LanguageSelectorProps) {
  const handleToggle = (language: string) => {
    if (selectedLanguages.includes(language)) {
      onChange(selectedLanguages.filter(l => l !== language))
    } else {
      onChange([...selectedLanguages, language])
    }
  }

  const selectAll = () => {
    onChange(SUPPORTED_LANGUAGES.map(l => l.value))
  }

  const deselectAll = () => {
    onChange([])
  }

  return (
    <Stack space={3}>
      <Flex gap={2}>
        <Button
          text="Select All"
          mode="ghost"
          onClick={selectAll}
          disabled={disabled}
          fontSize={1}
        />
        <Button
          text="Clear All"
          mode="ghost"
          onClick={deselectAll}
          disabled={disabled}
          fontSize={1}
        />
      </Flex>

      <Card padding={3} border radius={2}>
        <Stack space={3}>
          {SUPPORTED_LANGUAGES.map(language => (
            <Flex key={language.value} align="center">
              <Checkbox
                checked={selectedLanguages.includes(language.value)}
                onChange={() => handleToggle(language.value)}
                disabled={disabled}
              />
              <Box marginLeft={2}>
                <Text size={2}>{language.label}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      </Card>

      {selectedLanguages.length === 0 && (
        <Card padding={2} tone="caution" border>
          <Text size={1}>Please select at least one language</Text>
        </Card>
      )}

      <Text size={1} muted>
        Selected: {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''}
      </Text>
    </Stack>
  )
}