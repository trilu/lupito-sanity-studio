import { GeneratedContent } from '../types'

export async function formatContentForSanity(content: GeneratedContent) {
  // Convert markdown content to Sanity block content format
  const formatBlockContent = (markdown: string) => {
    const blocks: any[] = []
    const lines = markdown.split('\n')

    for (const line of lines) {
      if (!line.trim()) continue

      // Headers
      if (line.startsWith('# ')) {
        blocks.push({
          _type: 'block',
          style: 'h1',
          children: [{ _type: 'span', text: line.slice(2) }]
        })
      } else if (line.startsWith('## ')) {
        blocks.push({
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: line.slice(3) }]
        })
      } else if (line.startsWith('### ')) {
        blocks.push({
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: line.slice(4) }]
        })
      }
      // Blockquote
      else if (line.startsWith('> ')) {
        blocks.push({
          _type: 'block',
          style: 'blockquote',
          children: [{ _type: 'span', text: line.slice(2) }]
        })
      }
      // Regular paragraph
      else {
        const children = parseInlineFormatting(line)
        blocks.push({
          _type: 'block',
          style: 'normal',
          children
        })
      }
    }

    return blocks
  }

  // Parse inline formatting (bold, italic, links)
  const parseInlineFormatting = (text: string) => {
    const spans: any[] = []
    let currentText = text

    // Simple regex for **bold** and *italic*
    const parts = currentText.split(/(\*\*.*?\*\*|\*.*?\*)/g)

    parts.forEach(part => {
      if (!part) return

      if (part.startsWith('**') && part.endsWith('**')) {
        spans.push({
          _type: 'span',
          text: part.slice(2, -2),
          marks: ['strong']
        })
      } else if (part.startsWith('*') && part.endsWith('*')) {
        spans.push({
          _type: 'span',
          text: part.slice(1, -1),
          marks: ['em']
        })
      } else {
        spans.push({
          _type: 'span',
          text: part
        })
      }
    })

    return spans.length > 0 ? spans : [{ _type: 'span', text }]
  }

  // Format content for each language
  const formattedContent: any = {
    title: {},
    excerpt: {},
    content: {},
    seo: content.seo ? {
      metaTitle: {},
      metaDescription: {}
    } : undefined,
    tags: content.tags
  }

  // Process each language
  const languages = ['ro', 'en', 'pl', 'hu', 'cs'] as const

  for (const lang of languages) {
    if (content.title[lang]) {
      formattedContent.title[lang] = content.title[lang]
    }

    if (content.excerpt[lang]) {
      formattedContent.excerpt[lang] = content.excerpt[lang]
    }

    if (content.content[lang]) {
      // If content is already in block format, use it directly
      if (Array.isArray(content.content[lang])) {
        formattedContent.content[lang] = content.content[lang]
      }
      // Otherwise, convert from markdown
      else if (typeof content.content[lang] === 'string') {
        formattedContent.content[lang] = formatBlockContent(content.content[lang])
      }
    }

    if (content.seo) {
      if (content.seo.metaTitle[lang]) {
        formattedContent.seo.metaTitle[lang] = content.seo.metaTitle[lang]
      }
      if (content.seo.metaDescription[lang]) {
        formattedContent.seo.metaDescription[lang] = content.seo.metaDescription[lang]
      }
    }
  }

  return formattedContent
}

// Export function to add image placeholders
export function addImagePlaceholders(blocks: any[], count: number = 2) {
  const totalBlocks = blocks.length
  if (totalBlocks < 3) return blocks

  const newBlocks = [...blocks]
  const positions = []

  // Calculate evenly distributed positions
  const spacing = Math.floor(totalBlocks / (count + 1))
  for (let i = 1; i <= count; i++) {
    positions.push(spacing * i)
  }

  // Insert placeholders in reverse order to maintain positions
  positions.reverse().forEach((pos, index) => {
    newBlocks.splice(pos, 0, {
      _type: 'image',
      alt: `[Placeholder ${count - index}: Add relevant image here]`,
      caption: 'Replace with appropriate image'
    })
  })

  return newBlocks
}