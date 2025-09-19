import { defineType } from 'sanity'

const locales = [
  { title: 'Romanian', value: 'ro' },
  { title: 'English', value: 'en' },
  { title: 'Polish', value: 'pl' },
  { title: 'Hungarian', value: 'hu' },
  { title: 'Czech', value: 'cs' },
]

export default defineType({
  name: 'localeText',
  title: 'Localized text',
  type: 'object',
  fields: locales.map((locale) => ({
    name: locale.value,
    title: locale.title,
    type: 'text',
    rows: 3,
  })),
  preview: {
    select: {
      ro: 'ro',
      en: 'en',
    },
    prepare({ ro, en }) {
      return {
        title: ro || en || 'No translation',
        subtitle: 'Text content',
      }
    },
  },
})