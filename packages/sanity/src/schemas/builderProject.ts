/**
 * Sanity schema definition for Builder Projects
 * Use this when setting up Sanity Studio
 */
export const builderProjectSchema = {
  name: 'builderProject',
  title: 'Builder Project',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Project Name',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Coming Soon', value: 'coming-soon' },
          { title: 'Now Selling', value: 'selling' },
          { title: 'Sold Out', value: 'sold-out' },
        ],
      },
      initialValue: 'selling',
    },
    {
      name: 'intersection',
      title: 'Intersection',
      type: 'string',
      description: 'e.g., "Whitevale Rd. & Brock Rd."',
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
    },
    {
      name: 'startingPrice',
      title: 'Starting Price',
      type: 'number',
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'productTypes',
      title: 'Product Types',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'productType' }] }],
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'closingDate',
      title: 'Closing Date',
      type: 'date',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'city',
      media: 'featuredImage',
    },
  },
}
