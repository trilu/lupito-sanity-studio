import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { assist } from '@sanity/assist'
import { schemaTypes } from './schemas'
import { structure } from './structure'

// Hardcode values for deployed Studio
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'svg08vjt'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'lupito-sanity-studio',
  title: 'Lupito CMS',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
    assist(),
  ],
  schema: {
    types: schemaTypes,
  },
})