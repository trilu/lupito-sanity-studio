import { defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'localeText',
    },
    {
      name: 'role',
      title: 'Role',
      type: 'localeString',
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'Twitter',
          type: 'url',
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url',
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role.ro',
      media: 'image',
    },
  },
})