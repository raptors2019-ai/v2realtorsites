/**
 * Sanity schema definition for Builder Projects
 * Enhanced with detailed descriptions to help clients enter data from builder PDFs
 */
export const builderProjectSchema = {
  name: 'builderProject',
  title: 'Builder Project',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'pricing', title: 'Pricing & Dates' },
    { name: 'media', title: 'Images' },
    { name: 'details', title: 'Details & Features' },
    { name: 'incentives', title: 'Incentives & Deposits' },
  ],
  fields: [
    // === BASIC INFO ===
    {
      name: 'name',
      title: 'Project Name',
      type: 'string',
      group: 'basic',
      description: 'The name of the development (e.g., "Seatonville", "Aurora Heights")',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'basic',
      description: 'Auto-generated from project name. Used in the website URL.',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'builder',
      title: 'Builder Name',
      type: 'string',
      group: 'basic',
      description: 'The builder/developer name (e.g., "Opus Homes", "Fieldgate Homes")',
    },
    {
      name: 'status',
      title: 'Project Status',
      type: 'string',
      group: 'basic',
      description: 'Current sales status of the project',
      options: {
        list: [
          { title: 'Coming Soon - Not yet selling', value: 'coming-soon' },
          { title: 'Now Selling - Actively selling', value: 'selling' },
          { title: 'Sold Out - No more units available', value: 'sold-out' },
        ],
        layout: 'radio',
      },
      initialValue: 'selling',
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
      group: 'basic',
      description: 'City where the project is located (e.g., "Pickering", "Aurora", "Maple")',
    },
    {
      name: 'intersection',
      title: 'Intersection / Location',
      type: 'string',
      group: 'basic',
      description: 'Major intersection or address (e.g., "Whitevale Rd. & Brock Rd.")',
    },

    // === PRICING & DATES ===
    {
      name: 'startingPrice',
      title: 'Starting Price',
      type: 'number',
      group: 'pricing',
      description: 'Lowest price in the project. Enter numbers only, no $ or commas (e.g., 999990)',
      validation: (Rule: { min: (n: number) => unknown }) => Rule.min(0),
    },
    {
      name: 'closingDate',
      title: 'Estimated Closing Date',
      type: 'date',
      group: 'pricing',
      description: 'When buyers can expect to take possession. Usually found at bottom of price list.',
      options: {
        dateFormat: 'MMMM YYYY',
      },
    },

    // === MEDIA ===
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'media',
      description: 'Main image shown on project cards. Use a high-quality exterior or rendering.',
      options: { hotspot: true },
    },
    {
      name: 'gallery',
      title: 'Gallery Images',
      type: 'array',
      group: 'media',
      description: 'Additional images - interiors, floor plans, site plans, amenities',
      of: [{ type: 'image', options: { hotspot: true } }],
    },

    // === DETAILS & FEATURES ===
    {
      name: 'productTypes',
      title: 'Product Types (Home Types)',
      type: 'array',
      group: 'details',
      description: 'Types of homes available (e.g., "30\' Detached", "Townhomes", "Semis")',
      of: [{ type: 'reference', to: [{ type: 'productType' }] }],
    },
    {
      name: 'description',
      title: 'Project Description',
      type: 'text',
      group: 'details',
      description: 'Marketing description of the project. 2-3 sentences about location, lifestyle, etc.',
      rows: 4,
    },
    {
      name: 'features',
      title: 'Community Highlights',
      type: 'array',
      group: 'details',
      description: 'Key selling points - proximity to transit, schools, amenities, etc.',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },

    // === INCENTIVES & DEPOSITS ===
    {
      name: 'incentives',
      title: 'Current Incentives / Bonus Package',
      type: 'array',
      group: 'incentives',
      description: 'Special offers from builder (e.g., "5 Piece Appliance Package", "$15,000 Decor Dollars")',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'depositStructure',
      title: 'Deposit Structure',
      type: 'text',
      group: 'incentives',
      description: 'Payment schedule from the price list (e.g., "$30,000 with Offer | $30,000 in 30 Days...")',
      rows: 3,
    },
    {
      name: 'totalDeposit',
      title: 'Total Deposit Amount',
      type: 'number',
      group: 'incentives',
      description: 'Total deposit required (e.g., 100000 for $100,000)',
    },
    {
      name: 'displaySections',
      title: 'Display In Sections',
      type: 'array',
      group: 'basic',
      description: 'Choose which website tabs/sections this project should appear in. Select all that apply.',
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
      validation: (Rule: { min: (n: number) => { (): unknown; message: (msg: string) => unknown } }) =>
        Rule.min(1).message('Select at least one section to display this project'),
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'city',
      status: 'status',
      media: 'featuredImage',
    },
    prepare({ title, subtitle, status, media }: { title: string; subtitle: string; status: string; media: unknown }) {
      const statusLabels: Record<string, string> = {
        'coming-soon': '🔵 Coming Soon',
        'selling': '🟢 Now Selling',
        'sold-out': '⚫ Sold Out',
      }
      return {
        title,
        subtitle: `${subtitle || 'No city'} • ${statusLabels[status] || status}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Closing Date',
      name: 'closingDateAsc',
      by: [{ field: 'closingDate', direction: 'asc' }],
    },
    {
      title: 'Price (Low to High)',
      name: 'priceAsc',
      by: [{ field: 'startingPrice', direction: 'asc' }],
    },
  ],
}
