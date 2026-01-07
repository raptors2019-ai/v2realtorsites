/**
 * Seed Sanity with sample builder projects
 * Run with: npx tsx scripts/seed-sanity.ts
 *
 * Requires SANITY_API_TOKEN in .env.local
 */

import { config } from 'dotenv'
import { createClient } from '@sanity/client'

// Load .env.local
config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Sample Product Types
const productTypes = [
  {
    _type: 'productType',
    _id: 'product-townhomes',
    name: 'Townhomes',
    priceFrom: 899900,
    priceTo: 1099900,
    sqftFrom: 1800,
    sqftTo: 2200,
    bedrooms: '3-4 Bed',
    bathrooms: '2.5-3.5 Bath',
    garages: '2 Car Garage',
  },
  {
    _type: 'productType',
    _id: 'product-detached-36',
    name: "Detached 36'",
    priceFrom: 1299900,
    priceTo: 1499900,
    sqftFrom: 2800,
    sqftTo: 3200,
    bedrooms: '4-5 Bed',
    bathrooms: '3.5-4.5 Bath',
    garages: '2 Car Garage',
  },
  {
    _type: 'productType',
    _id: 'product-detached-43',
    name: "Detached 43'",
    priceFrom: 1599900,
    priceTo: 1899900,
    sqftFrom: 3200,
    sqftTo: 3800,
    bedrooms: '4-5 Bed',
    bathrooms: '4.5-5.5 Bath',
    garages: '3 Car Garage',
  },
  {
    _type: 'productType',
    _id: 'product-semis',
    name: 'Semi-Detached',
    priceFrom: 949900,
    priceTo: 1149900,
    sqftFrom: 2000,
    sqftTo: 2400,
    bedrooms: '3-4 Bed',
    bathrooms: '2.5-3.5 Bath',
    garages: '1-2 Car Garage',
  },
]

// Sample Builder Projects
const projects = [
  {
    _type: 'builderProject',
    _id: 'project-seatonville',
    name: 'Seatonville',
    slug: { _type: 'slug', current: 'seatonville' },
    builder: 'Fieldgate Homes',
    status: 'selling',
    description: 'A master-planned community in Pickering offering a variety of home types with modern designs and family-friendly amenities.',
    city: 'Pickering',
    intersection: 'Whitevale Rd. & Brock Rd.',
    address: '1234 Seatonville Dr, Pickering, ON',
    region: 'Durham Region',
    startingPrice: 899900,
    occupancy: 'Fall 2025',
    depositStructure: '$10,000 on signing\n5% in 30 days\n5% in 90 days\n5% in 180 days\n5% on occupancy',
    features: [
      '9\' ceilings on main floor',
      'Quartz countertops',
      'Hardwood flooring',
      'Energy Star certified',
      'Smart home ready',
    ],
    highlights: [
      'Minutes to GO Transit',
      'Close to Rouge National Urban Park',
      'Near top-rated schools',
      'Easy access to Highway 401',
    ],
    isQuickClosing: true,
    quickClosingDate: '2025-06-30',
    hasPromotion: true,
    promotionTitle: 'Spring Savings Event',
    promotionDetails: '$15,000 in upgrades + free appliance package',
    promotionExpiry: '2025-03-31',
    productTypes: [
      { _type: 'reference', _ref: 'product-townhomes' },
      { _type: 'reference', _ref: 'product-detached-36' },
    ],
  },
  {
    _type: 'builderProject',
    _id: 'project-unionville-gardens',
    name: 'Unionville Gardens',
    slug: { _type: 'slug', current: 'unionville-gardens' },
    builder: 'Tribute Communities',
    status: 'coming-soon',
    description: 'An exclusive collection of luxury homes in the heart of historic Unionville, combining classic charm with modern living.',
    city: 'Markham',
    intersection: 'Kennedy Rd. & 16th Ave.',
    address: 'Kennedy Rd. & 16th Ave., Markham, ON',
    region: 'York Region',
    startingPrice: 1499900,
    occupancy: 'Q2 2026',
    depositStructure: '$20,000 on signing\n5% in 30 days\n5% in 120 days\n5% in 365 days\n5% on occupancy',
    features: [
      '10\' ceilings on main floor',
      'Chef\'s kitchen with island',
      'Premium engineered hardwood',
      'Custom millwork throughout',
      'Heated garage floors',
    ],
    highlights: [
      'Steps to Main Street Unionville',
      'Top-rated schools nearby',
      'Parks and trails at doorstep',
      'Easy access to Highway 407',
    ],
    isQuickClosing: false,
    hasPromotion: false,
    productTypes: [
      { _type: 'reference', _ref: 'product-detached-43' },
    ],
  },
  {
    _type: 'builderProject',
    _id: 'project-lakeside-estates',
    name: 'Lakeside Estates',
    slug: { _type: 'slug', current: 'lakeside-estates' },
    builder: 'Mattamy Homes',
    status: 'selling',
    description: 'Waterfront living at its finest. Lakeside Estates offers stunning views and resort-style amenities in Whitby.',
    city: 'Whitby',
    intersection: 'Thickson Rd. & Victoria St.',
    address: 'Thickson Rd. & Victoria St., Whitby, ON',
    region: 'Durham Region',
    startingPrice: 1199900,
    occupancy: 'Spring 2025',
    depositStructure: '$15,000 on signing\n5% in 30 days\n5% in 90 days\n5% on occupancy',
    features: [
      'Lake views available',
      'Community clubhouse',
      'Walking trails',
      'Modern open concepts',
      'Premium finishes',
    ],
    highlights: [
      'Waterfront location',
      'Community amenities',
      'Close to downtown Whitby',
      'Near schools and shopping',
    ],
    isQuickClosing: true,
    quickClosingDate: '2025-04-30',
    hasPromotion: true,
    promotionTitle: 'Move-In Ready Specials',
    promotionDetails: 'Select units available for immediate closing with $20,000 in incentives',
    promotionExpiry: '2025-02-28',
    productTypes: [
      { _type: 'reference', _ref: 'product-townhomes' },
      { _type: 'reference', _ref: 'product-semis' },
      { _type: 'reference', _ref: 'product-detached-36' },
    ],
  },
]

async function seed() {
  console.log('🌱 Seeding Sanity database...\n')

  // Check for API token
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN is required in .env.local')
    console.log('\nTo get a token:')
    console.log('1. Go to https://www.sanity.io/manage/project/iyyofewc')
    console.log('2. Click API → Tokens → Add API token')
    console.log('3. Name it "Seed Script", select "Editor" permissions')
    console.log('4. Copy the token to .env.local as SANITY_API_TOKEN=...')
    process.exit(1)
  }

  try {
    // Create product types first
    console.log('📦 Creating product types...')
    for (const productType of productTypes) {
      const result = await client.createOrReplace(productType)
      console.log(`  ✓ ${result.name}`)
    }

    // Create projects
    console.log('\n🏠 Creating builder projects...')
    for (const project of projects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await client.createOrReplace(project as any)
      console.log(`  ✓ ${result.name} (${result.city})`)
    }

    console.log('\n✅ Seeding complete!')
    console.log('\nView your content at:')
    console.log('https://www.sanity.io/manage/project/iyyofewc')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
