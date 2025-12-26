export type PropertyType = 'detached' | 'semi-detached' | 'townhouse' | 'condo'

export type ListingType = 'sale' | 'lease'

export interface Property {
  id: string
  title: string
  address: string
  city: string
  province: string
  postalCode: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  propertyType: 'detached' | 'semi-detached' | 'townhouse' | 'condo'
  status: 'active' | 'pending' | 'sold'
  listingType: ListingType // 'sale' or 'lease' - derived from price threshold
  featured: boolean
  images: string[]
  description: string
  listingDate: Date
  mlsNumber?: string
}

export interface BuilderProject {
  id: string
  slug: string
  name: string
  developer: string
  status: 'coming-soon' | 'selling' | 'sold-out'
  address: string
  city: string
  startingPrice: number
  closingDate: string
  propertyTypes: Property['propertyType'][]
  images: string[]
  features: string[]
  description: string
}

// Property Class for filtering
export type PropertyClass = 'residential' | 'commercial'

// Filter Types
export interface PropertyFilters {
  type?: Property['propertyType'][]
  priceRange?: { min?: number; max?: number }
  bedrooms?: number[] // Multiple bedroom counts
  bathrooms?: number[] // Multiple bathroom counts
  location?: string // Single city
  locations?: string[] // Multiple cities (for regions)
  listingType?: ListingType[] // Multiple listing types ('sale' and/or 'lease')
  propertyClass?: PropertyClass[] // Multiple property classes ('residential' and/or 'commercial')
}

// Sort Options
export type SortOption = 'latest' | 'price-asc' | 'price-desc' | 'featured'
