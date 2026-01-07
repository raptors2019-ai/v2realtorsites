/**
 * Sanity schema definition for Product Types
 * Use this when setting up Sanity Studio
 */
export const productTypeSchema = {
  name: 'productType',
  title: 'Product Type',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g., "Townhomes", "Detached", "Semi-Detached"',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'priceRange',
      title: 'Price Range',
      type: 'object',
      fields: [
        { name: 'min', title: 'Minimum Price', type: 'number' },
        { name: 'max', title: 'Maximum Price', type: 'number' },
      ],
    },
    {
      name: 'sqftRange',
      title: 'Square Footage Range',
      type: 'object',
      fields: [
        { name: 'min', title: 'Minimum Sqft', type: 'number' },
        { name: 'max', title: 'Maximum Sqft', type: 'number' },
      ],
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
}
