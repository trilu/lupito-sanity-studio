import { SanityClient } from 'sanity'
import { UnsplashImage } from '../types'

export async function uploadImageToSanity(
  client: SanityClient,
  imageUrl: string,
  unsplashData: UnsplashImage
): Promise<string> {
  try {
    // Fetch the image from Unsplash
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch image from Unsplash')
    }

    const blob = await response.blob()

    // Upload to Sanity
    const asset = await client.assets.upload('image', blob, {
      filename: `unsplash-${unsplashData.id}.jpg`,
      source: {
        name: 'unsplash',
        id: unsplashData.id,
        url: unsplashData.links.html
      },
      creditLine: `Photo by ${unsplashData.user.name} on Unsplash`,
      description: unsplashData.description || unsplashData.alt_description
    })

    return asset._id
  } catch (error) {
    console.error('Failed to upload image to Sanity:', error)
    throw new Error('Failed to upload image')
  }
}

export function getUnsplashAttribution(image: UnsplashImage): string {
  return `Photo by <a href="${image.user.links.html}?utm_source=lupito&utm_medium=referral">${image.user.name}</a> on <a href="https://unsplash.com?utm_source=lupito&utm_medium=referral">Unsplash</a>`
}

export function validateImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:' &&
           (urlObj.hostname.includes('unsplash.com') ||
            urlObj.hostname === 'images.unsplash.com')
  } catch {
    return false
  }
}