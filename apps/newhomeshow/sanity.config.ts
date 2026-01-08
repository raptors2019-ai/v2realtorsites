import { defineConfig, defineField, defineType } from 'sanity'
import { structureTool } from 'sanity/structure'

// Product Type Schema (e.g., Townhomes, Detached 36', Semis)
const productType = defineType({
  name: 'productType',
  title: 'Product Type',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g., Townhomes, Detached 36\', Semi-Detached',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priceFrom',
      title: 'Price From',
      type: 'number',
      description: 'Starting price (e.g., 899900)',
    }),
    defineField({
      name: 'priceTo',
      title: 'Price To',
      type: 'number',
      description: 'Maximum price (optional)',
    }),
    defineField({
      name: 'sqftFrom',
      title: 'Sq Ft From',
      type: 'number',
      description: 'Minimum square footage',
    }),
    defineField({
      name: 'sqftTo',
      title: 'Sq Ft To',
      type: 'number',
      description: 'Maximum square footage',
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'string',
      description: 'e.g., 3-4 Bed, 4+ Bed',
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'string',
      description: 'e.g., 2.5-3.5 Bath',
    }),
    defineField({
      name: 'garages',
      title: 'Garages',
      type: 'string',
      description: 'e.g., 2 Car Garage',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      priceFrom: 'priceFrom',
      priceTo: 'priceTo',
    },
    prepare({ title, priceFrom, priceTo }) {
      const formatPrice = (n: number) => n ? `$${(n/1000).toFixed(0)}K` : ''
      return {
        title,
        subtitle: priceFrom ? `From ${formatPrice(priceFrom)}${priceTo ? ` - ${formatPrice(priceTo)}` : '+'}` : '',
      }
    },
  },
})

// Builder Project Schema
const builderProject = defineType({
  name: 'builderProject',
  title: 'Builder Project',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'location', title: 'Location' },
    { name: 'pricing', title: 'Pricing & Timeline' },
    { name: 'media', title: 'Media' },
    { name: 'features', title: 'Features' },
    { name: 'promotions', title: 'Promotions' },
  ],
  fields: [
    // Basic Info
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
      group: 'basic',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basic',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'basic',
      options: {
        list: [
          { title: 'Coming Soon', value: 'coming-soon' },
          { title: 'Now Selling', value: 'selling' },
          { title: 'Sold Out', value: 'sold-out' },
        ],
        layout: 'radio',
      },
      initialValue: 'selling',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'basic',
      rows: 4,
      description: 'Brief description of the project',
    }),
    defineField({
      name: 'displaySections',
      title: 'Display In Sections',
      type: 'array',
      group: 'basic',
      description: 'Choose which website tabs/sections this project should appear in.',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Projects (Main listing page)', value: 'projects' },
          { title: 'Quick Closings (Move-in ready)', value: 'quick-closings' },
          { title: 'Promotions (Special offers)', value: 'promotions' },
          { title: 'Assignments (Contract transfers)', value: 'assignments' },
        ],
        layout: 'grid',
      },
      initialValue: ['projects'],
      validation: (Rule) => Rule.min(1).error('Select at least one section'),
    }),

    // Location
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'location',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'intersection',
      title: 'Intersection',
      type: 'string',
      group: 'location',
      description: 'e.g., Whitevale Rd. & Brock Rd.',
    }),
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'string',
      group: 'location',
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      group: 'location',
      options: {
        list: [
          'GTA East',
          'GTA West',
          'GTA North',
          'Toronto',
          'Durham Region',
          'York Region',
          'Peel Region',
          'Halton Region',
          'Hamilton',
          'Niagara',
          'Other',
        ],
      },
    }),

    // Pricing & Timeline
    defineField({
      name: 'startingPrice',
      title: 'Starting From Price',
      type: 'number',
      group: 'pricing',
      description: 'Lowest price point (e.g., 899900)',
    }),
    defineField({
      name: 'productTypes',
      title: 'Product Types',
      type: 'array',
      group: 'pricing',
      of: [{ type: 'reference', to: [{ type: 'productType' }] }],
      description: 'Link to available product types with pricing',
    }),
    defineField({
      name: 'closingDate',
      title: 'Closing Date',
      type: 'date',
      group: 'pricing',
      description: 'Expected closing/occupancy date',
    }),
    defineField({
      name: 'occupancy',
      title: 'Occupancy',
      type: 'string',
      group: 'pricing',
      description: 'e.g., Fall 2025, Q1 2026, 2027',
    }),
    defineField({
      name: 'depositStructure',
      title: 'Deposit Structure',
      type: 'text',
      group: 'pricing',
      rows: 3,
      description: 'e.g., $10,000 on signing, 5% in 30 days...',
    }),
    defineField({
      name: 'totalDeposit',
      title: 'Total Deposit Amount',
      type: 'number',
      group: 'pricing',
      description: 'Total deposit required (e.g., 100000 for $100,000)',
    }),

    // Media
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      description: 'Main image shown on project cards',
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery Images',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'floorPlans',
      title: 'Floor Plans',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'file',
          options: { accept: '.pdf' },
          fields: [
            { name: 'title', type: 'string', title: 'Plan Name' },
          ],
        },
      ],
    }),
    defineField({
      name: 'brochureUrl',
      title: 'Brochure URL',
      type: 'url',
      group: 'media',
    }),

    // Features
    defineField({
      name: 'features',
      title: 'Features & Amenities',
      type: 'array',
      group: 'features',
      of: [{ type: 'string' }],
      description: 'Key selling points and amenities',
    }),
    defineField({
      name: 'highlights',
      title: 'Neighborhood Highlights',
      type: 'array',
      group: 'features',
      of: [{ type: 'string' }],
      description: 'Nearby schools, transit, shopping, etc.',
    }),

    // Promotions & Incentives
    defineField({
      name: 'incentives',
      title: 'Current Incentives',
      type: 'array',
      group: 'promotions',
      of: [{ type: 'string' }],
      description: 'Special offers (e.g., "$15,000 Decor Dollars", "Free Appliance Package")',
    }),
    defineField({
      name: 'isQuickClosing',
      title: 'Quick Closing Available',
      type: 'boolean',
      group: 'promotions',
      initialValue: false,
      description: 'Units closing within 6 months',
    }),
    defineField({
      name: 'quickClosingDate',
      title: 'Quick Closing Date',
      type: 'date',
      group: 'promotions',
      hidden: ({ document }) => !document?.isQuickClosing,
    }),
    defineField({
      name: 'hasPromotion',
      title: 'Has Active Promotion',
      type: 'boolean',
      group: 'promotions',
      initialValue: false,
    }),
    defineField({
      name: 'promotionTitle',
      title: 'Promotion Title',
      type: 'string',
      group: 'promotions',
      hidden: ({ document }) => !document?.hasPromotion,
      description: 'e.g., "Spring Savings Event"',
    }),
    defineField({
      name: 'promotionDetails',
      title: 'Promotion Details',
      type: 'text',
      group: 'promotions',
      hidden: ({ document }) => !document?.hasPromotion,
      description: 'e.g., "$10,000 off + free upgrades"',
    }),
    defineField({
      name: 'promotionExpiry',
      title: 'Promotion Expiry',
      type: 'date',
      group: 'promotions',
      hidden: ({ document }) => !document?.hasPromotion,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'city',
      status: 'status',
      media: 'featuredImage',
    },
    prepare({ title, subtitle, status, media }) {
      const statusLabels: Record<string, string> = {
        'coming-soon': '🟡 Coming Soon',
        'selling': '🟢 Now Selling',
        'sold-out': '🔴 Sold Out',
      }
      return {
        title,
        subtitle: `${subtitle || ''} ${statusLabels[status] || ''}`.trim(),
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Status',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'City',
      name: 'cityAsc',
      by: [{ field: 'city', direction: 'asc' }],
    },
  ],
})

export default defineConfig({
  name: 'newhomeshow',
  title: 'NewHomeShow CMS',

  projectId: 'iyyofewc',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: [productType, builderProject],
  },
})
