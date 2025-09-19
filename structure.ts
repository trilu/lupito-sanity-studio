import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Blog section
      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog')
            .items([
              S.listItem()
                .title('Posts')
                .child(S.documentTypeList('blogPost').title('Posts')),
              S.listItem()
                .title('Authors')
                .child(S.documentTypeList('author').title('Authors')),
              S.listItem()
                .title('Categories')
                .child(S.documentTypeList('category').title('Categories')),
            ])
        ),

      // Divider
      S.divider(),

      // All other document types
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !['blogPost', 'author', 'category'].includes(listItem.getId() || '')
      ),
    ])