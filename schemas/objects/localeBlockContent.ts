import { defineType } from 'sanity'

const locales = [
  { title: 'Romanian', value: 'ro' },
  { title: 'English', value: 'en' },
  { title: 'Polish', value: 'pl' },
  { title: 'Hungarian', value: 'hu' },
  { title: 'Czech', value: 'cs' },
]

export default defineType({
  name: 'localeBlockContent',
  title: 'Localized block content',
  type: 'object',
  fields: locales.map((locale) => ({
    name: locale.value,
    title: locale.title,
    type: 'array',
    of: [
      {
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'H1', value: 'h1' },
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' },
          { title: 'H4', value: 'h4' },
          { title: 'Quote', value: 'blockquote' },
        ],
        marks: {
          decorators: [
            { title: 'Strong', value: 'strong' },
            { title: 'Emphasis', value: 'em' },
            { title: 'Code', value: 'code' },
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [
                {
                  name: 'href',
                  type: 'url',
                  title: 'URL',
                },
                {
                  title: 'Open in new tab',
                  name: 'blank',
                  type: 'boolean',
                },
              ],
            },
          ],
        },
      },
      {
        type: 'image',
        options: { hotspot: true },
        fields: [
          {
            name: 'alt',
            type: 'string',
            title: 'Alternative text',
          },
        ],
      },
    ],
  })),
  preview: {
    select: {
      ro: 'ro',
      en: 'en',
    },
    prepare({ ro, en }) {
      const content = ro || en
      return {
        title: content?.[0]?.children?.[0]?.text || 'No content',
        subtitle: 'Rich text content',
      }
    },
  },
})