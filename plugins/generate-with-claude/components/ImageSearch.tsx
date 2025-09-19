import React, { useState } from 'react'
import {
  Stack,
  TextInput,
  Button,
  Grid,
  Card,
  Text,
  Box,
  Spinner,
  Flex
} from '@sanity/ui'
import { SearchIcon } from '@sanity/icons'
import { UnsplashImage } from '../types'
import { useUnsplashSearch } from '../hooks/useUnsplashSearch'

interface ImageSearchProps {
  defaultQuery?: string
  onSelect: (image: UnsplashImage | null) => void
  disabled?: boolean
}

export function ImageSearch({ defaultQuery = '', onSelect, disabled }: ImageSearchProps) {
  const [query, setQuery] = useState(defaultQuery)
  const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null)
  const { search, images, loading, error } = useUnsplashSearch()

  const handleSearch = async () => {
    if (!query.trim()) return
    await search(query)
  }

  const handleSelect = (image: UnsplashImage) => {
    setSelectedImage(image)
    onSelect(image)
  }

  const handleClear = () => {
    setSelectedImage(null)
    onSelect(null)
  }

  return (
    <Stack space={3}>
      {/* Search Bar */}
      <Flex gap={2}>
        <Box flex={1}>
          <TextInput
            placeholder="Search for images..."
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
            disabled={disabled || loading}
          />
        </Box>
        <Button
          text="Search"
          icon={SearchIcon}
          onClick={handleSearch}
          disabled={disabled || loading || !query.trim()}
          tone="primary"
        />
      </Flex>

      {/* Loading State */}
      {loading && (
        <Card padding={4} border>
          <Flex justify="center" align="center">
            <Spinner />
            <Box marginLeft={2}>
              <Text size={1}>Searching Unsplash...</Text>
            </Box>
          </Flex>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card padding={3} tone="critical" border>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <Card border radius={2} overflow="hidden">
          <Stack space={0}>
            <Box style={{ position: 'relative', paddingBottom: '56.25%' }}>
              <img
                src={selectedImage.urls.small}
                alt={selectedImage.alt_description || 'Selected image'}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>
            <Box padding={3}>
              <Stack space={2}>
                <Text size={1} weight="medium">
                  {selectedImage.alt_description || 'Untitled'}
                </Text>
                <Text size={1} muted>
                  Photo by {selectedImage.user.name} on Unsplash
                </Text>
                <Button
                  text="Remove selection"
                  mode="ghost"
                  onClick={handleClear}
                  fontSize={1}
                />
              </Stack>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Image Grid */}
      {images.length > 0 && !selectedImage && (
        <Grid columns={3} gap={2}>
          {images.map(image => (
            <Card
              key={image.id}
              radius={2}
              overflow="hidden"
              shadow={1}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelect(image)}
            >
              <Box style={{ position: 'relative', paddingBottom: '75%' }}>
                <img
                  src={image.urls.thumb}
                  alt={image.alt_description || 'Unsplash image'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Box padding={2}>
                <Text size={1} muted textOverflow="ellipsis">
                  by {image.user.name}
                </Text>
              </Box>
            </Card>
          ))}
        </Grid>
      )}

      {/* No Results */}
      {images.length === 0 && !loading && query && (
        <Card padding={3} border>
          <Text size={1} muted align="center">
            No images found. Try different keywords.
          </Text>
        </Card>
      )}
    </Stack>
  )
}