export interface ListingFilters {
  limit?: number
  status?: 'active' | 'pending' | 'sold'
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  city?: string
  propertyType?: 'detached' | 'semi-detached' | 'townhouse' | 'condo'
}

export interface BoldTrailListing {
  id: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  beds: number
  baths: number
  sqft: number
  status: string
  mls_number?: string
  photos?: string[]
  description?: string
  listing_date?: string
}
