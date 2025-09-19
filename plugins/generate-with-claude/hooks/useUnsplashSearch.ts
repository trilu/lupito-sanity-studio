import { useState } from 'react'
import { UnsplashImage } from '../types'

export function useUnsplashSearch() {
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string) => {
    setLoading(true)
    setError(null)
    setImages([])

    try {
      // Use the production API URL when in Sanity Studio
      const apiUrl = window.location.hostname === 'lupito.sanity.studio'
        ? 'https://lupito.pet/api/unsplash-search'
        : '/api/unsplash-search'

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, perPage: 9 })
      })

      if (!response.ok) {
        throw new Error('Failed to search images')
      }

      const data = await response.json()
      setImages(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images')
    } finally {
      setLoading(false)
    }
  }

  return {
    search,
    images,
    loading,
    error
  }
}