/**
 * Sanity schema definition for Product Types (Home Types)
 * These are reusable across projects - create once, reference many times
 *
 * Common types to pre-create:
 * - Townhomes
 * - 30' Detached
 * - 36' Detached
 * - 40' Detached
 * - Semi-Detached
 * - Stacked Townhomes
 * - Condos
 */
export const productTypeSchema = {
  name: 'productType',
  title: 'Product Type (Home Type)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Home Type Name',
      type: 'string',
      description: 'e.g., "Townhomes", "30\' Detached", "Semi-Detached", "Stacked Towns"',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'priceRange',
      title: 'Price Range',
      type: 'object',
      description: 'Min and max prices from the builder price list',
      fields: [
        {
          name: 'min',
          title: 'Minimum Price',
          type: 'number',
          description: 'Lowest price for this home type (e.g., 799990)',
        },
        {
          name: 'max',
          title: 'Maximum Price',
          type: 'number',
          description: 'Highest price for this home type (e.g., 999990)',
        },
      ],
    },
    {
      name: 'sqftRange',
      title: 'Square Footage Range',
      type: 'object',
      description: 'Size range from builder floor plans',
      fields: [
        {
          name: 'min',
          title: 'Minimum Sqft',
          type: 'number',
          description: 'Smallest home size (e.g., 1800)',
        },
        {
          name: 'max',
          title: 'Maximum Sqft',
          type: 'number',
          description: 'Largest home size (e.g., 2400)',
        },
      ],
    },
    {
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'string',
      description: 'Number of bedrooms (e.g., "3-4" or "4")',
    },
    {
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'string',
      description: 'Number of bathrooms (e.g., "2.5-3.5" or "3")',
    },
    {
      name: 'garages',
      title: 'Garage',
      type: 'string',
      description: 'Garage type (e.g., "1-Car", "2-Car", "Single", "Double")',
    },
    {
      name: 'features',
      title: 'Key Features',
      type: 'array',
      description: 'Notable features for this home type',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
  ],
  preview: {
    select: {
      title: 'name',
      minPrice: 'priceRange.min',
      maxPrice: 'priceRange.max',
    },
    prepare({ title, minPrice, maxPrice }: { title: string; minPrice?: number; maxPrice?: number }) {
      const priceRange = minPrice && maxPrice
        ? `$${(minPrice / 1000).toFixed(0)}K - $${(maxPrice / 1000).toFixed(0)}K`
        : 'No price set'
      return {
        title,
        subtitle: priceRange,
      }
    },
  },
}
