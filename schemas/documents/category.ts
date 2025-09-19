import { defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title.ro',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'localeText',
    },
    {
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          { title: 'Red', value: 'red' },
          { title: 'Orange', value: 'orange' },
          { title: 'Yellow', value: 'yellow' },
          { title: 'Green', value: 'green' },
          { title: 'Blue', value: 'blue' },
          { title: 'Purple', value: 'purple' },
          { title: 'Pink', value: 'pink' },
          { title: 'Gray', value: 'gray' },
        ],
      },
      initialValue: 'green',
    },
  ],
  preview: {
    select: {
      title: 'title.ro',
      subtitle: 'description.ro',
    },
  },
})