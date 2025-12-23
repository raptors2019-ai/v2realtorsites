/**
 * GTA Cities with SEO-friendly slugs
 */
export interface CityConfig {
  slug: string
  name: string
  province: string
  neighborhoods: NeighborhoodConfig[]
}

export interface NeighborhoodConfig {
  slug: string
  name: string
  city: string
}

export interface PriceRange {
  slug: string
  label: string
  min: number | null
  max: number | null
}

export interface PropertyTypeConfig {
  slug: string
  label: string
  idxValue: string // Maps to IDX PropertyType
}

export interface BedroomConfig {
  slug: string
  label: string
  min: number
}

export interface SEOFilterParams {
  city?: string
  neighborhood?: string
  priceRange?: string
  propertyType?: string
  bedrooms?: string
}

export interface SEOMetadata {
  title: string
  description: string
  canonical: string
  openGraph: {
    title: string
    description: string
    url: string
    images?: string[]
  }
}

// Static configuration
export const GTA_CITIES: CityConfig[] = [
  {
    slug: 'toronto',
    name: 'Toronto',
    province: 'ON',
    neighborhoods: [
      { slug: 'yorkville', name: 'Yorkville', city: 'Toronto' },
      { slug: 'king-west', name: 'King West', city: 'Toronto' },
      { slug: 'liberty-village', name: 'Liberty Village', city: 'Toronto' },
      { slug: 'queen-west', name: 'Queen West', city: 'Toronto' },
      { slug: 'the-annex', name: 'The Annex', city: 'Toronto' },
      { slug: 'leslieville', name: 'Leslieville', city: 'Toronto' },
      { slug: 'riverdale', name: 'Riverdale', city: 'Toronto' },
      { slug: 'the-beaches', name: 'The Beaches', city: 'Toronto' },
      { slug: 'high-park', name: 'High Park', city: 'Toronto' },
      { slug: 'junction', name: 'The Junction', city: 'Toronto' },
    ],
  },
  {
    slug: 'mississauga',
    name: 'Mississauga',
    province: 'ON',
    neighborhoods: [
      { slug: 'port-credit', name: 'Port Credit', city: 'Mississauga' },
      { slug: 'square-one', name: 'Square One', city: 'Mississauga' },
      { slug: 'cooksville', name: 'Cooksville', city: 'Mississauga' },
      { slug: 'streetsville', name: 'Streetsville', city: 'Mississauga' },
      { slug: 'erin-mills', name: 'Erin Mills', city: 'Mississauga' },
    ],
  },
  {
    slug: 'brampton',
    name: 'Brampton',
    province: 'ON',
    neighborhoods: [
      { slug: 'downtown-brampton', name: 'Downtown Brampton', city: 'Brampton' },
      { slug: 'bramalea', name: 'Bramalea', city: 'Brampton' },
      { slug: 'springdale', name: 'Springdale', city: 'Brampton' },
      { slug: 'castlemore', name: 'Castlemore', city: 'Brampton' },
    ],
  },
  {
    slug: 'markham',
    name: 'Markham',
    province: 'ON',
    neighborhoods: [
      { slug: 'unionville', name: 'Unionville', city: 'Markham' },
      { slug: 'markham-village', name: 'Markham Village', city: 'Markham' },
      { slug: 'thornhill', name: 'Thornhill', city: 'Markham' },
    ],
  },
  {
    slug: 'vaughan',
    name: 'Vaughan',
    province: 'ON',
    neighborhoods: [
      { slug: 'woodbridge', name: 'Woodbridge', city: 'Vaughan' },
      { slug: 'kleinburg', name: 'Kleinburg', city: 'Vaughan' },
      { slug: 'maple', name: 'Maple', city: 'Vaughan' },
    ],
  },
  {
    slug: 'oakville',
    name: 'Oakville',
    province: 'ON',
    neighborhoods: [
      { slug: 'downtown-oakville', name: 'Downtown Oakville', city: 'Oakville' },
      { slug: 'bronte', name: 'Bronte', city: 'Oakville' },
      { slug: 'glen-abbey', name: 'Glen Abbey', city: 'Oakville' },
    ],
  },
  {
    slug: 'richmond-hill',
    name: 'Richmond Hill',
    province: 'ON',
    neighborhoods: [
      { slug: 'oak-ridges', name: 'Oak Ridges', city: 'Richmond Hill' },
      { slug: 'mill-pond', name: 'Mill Pond', city: 'Richmond Hill' },
    ],
  },
]

export const PRICE_RANGES: PriceRange[] = [
  { slug: 'under-500k', label: 'Under $500K', min: null, max: 500000 },
  { slug: '500k-750k', label: '$500K-$750K', min: 500000, max: 750000 },
  { slug: '750k-1m', label: '$750K-$1M', min: 750000, max: 1000000 },
  { slug: '1m-1.5m', label: '$1M-$1.5M', min: 1000000, max: 1500000 },
  { slug: '1.5m-2m', label: '$1.5M-$2M', min: 1500000, max: 2000000 },
  { slug: '2m-3m', label: '$2M-$3M', min: 2000000, max: 3000000 },
  { slug: '3m-5m', label: '$3M-$5M', min: 3000000, max: 5000000 },
  { slug: 'over-5m', label: 'Over $5M', min: 5000000, max: null },
]

export const PROPERTY_TYPES: PropertyTypeConfig[] = [
  { slug: 'detached', label: 'Detached Homes', idxValue: 'Residential' },
  { slug: 'semi-detached', label: 'Semi-Detached', idxValue: 'Residential' },
  { slug: 'townhouse', label: 'Townhouses', idxValue: 'Townhouse' },
  { slug: 'condo', label: 'Condos', idxValue: 'Condo' },
]

export const BEDROOM_OPTIONS: BedroomConfig[] = [
  { slug: '1-bed', label: '1+ Bedroom', min: 1 },
  { slug: '2-bed', label: '2+ Bedrooms', min: 2 },
  { slug: '3-bed', label: '3+ Bedrooms', min: 3 },
  { slug: '4-bed', label: '4+ Bedrooms', min: 4 },
]
