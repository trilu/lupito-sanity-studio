import { defineType } from 'sanity'

const locales = [
  { title: 'Romanian', value: 'ro' },
  { title: 'English', value: 'en' },
  { title: 'Polish', value: 'pl' },
  { title: 'Hungarian', value: 'hu' },
  { title: 'Czech', value: 'cs' },
]

export default defineType({
  name: 'localeString',
  title: 'Localized string',
  type: 'object',
  fields: locales.map((locale) => ({
    name: locale.value,
    title: locale.title,
    type: 'string',
  })),
  preview: {
    select: {
      ro: 'ro',
      en: 'en',
    },
    prepare({ ro, en }) {
      return {
        title: ro || en || 'No translation',
      }
    },
  },
})