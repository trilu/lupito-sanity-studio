import { definePlugin } from 'sanity'
import { GenerateAction } from './GenerateAction'

export const generateWithClaude = definePlugin(() => {
  return {
    name: 'generate-with-claude',
    document: {
      actions: (prev, context) => {
        // Only add the action for blogPost documents
        if (context.schemaType === 'blogPost') {
          return [...prev, GenerateAction]
        }
        return prev
      }
    }
  }
})