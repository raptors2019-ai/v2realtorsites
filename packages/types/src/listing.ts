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

/**
 * IDX Listing from MLS via RESO Web API
 * Field names follow RESO Data Dictionary
 */
export interface IDXListing {
  ListingKey: string
  ListingId?: string
  ListPrice: number
  OriginalListPrice?: number
  BedroomsTotal: number
  BathroomsTotalInteger: number
  LivingArea?: number // Square feet - primary field
  LivingAreaUnits?: string
  BuildingAreaTotal?: number // Alternative sqft field
  AboveGradeFinishedArea?: number // Another alternative
  LotSizeArea?: number
  PropertyType: 'Residential' | 'Condo' | 'Townhouse' | 'Land' | 'Commercial'
  PropertySubType?: string

  // Address
  UnparsedAddress: string
  StreetNumber?: string
  StreetName?: string
  StreetSuffix?: string
  City: string
  StateOrProvince: string
  PostalCode: string

  // Status
  StandardStatus: 'Active' | 'Pending' | 'Sold' | 'Expired' | 'Withdrawn'
  ListingContractDate?: string
  CloseDate?: string
  DaysOnMarket?: number

  // Media
  Media?: IDXMedia[]

  // Description
  PublicRemarks?: string

  // Timestamps
  ModificationTimestamp: string
  PhotosChangeTimestamp?: string
}

export interface IDXMedia {
  MediaKey: string
  MediaURL: string
  MediaType?: string // MIME type like "image/jpeg" or legacy "Photo"
  MediaCategory?: 'Photo' | 'Video' | 'VirtualTour' // Ampre uses this for media classification
  Order?: number
  ShortDescription?: string
  // Ampre-specific fields
  ResourceName?: 'Property' | 'Office' | 'Member'
  ResourceRecordKey?: string
  ImageSizeDescription?: string
  ModificationTimestamp?: string
}

export interface IDXMediaResponse {
  success: boolean
  media: IDXMedia[]
  error?: string
}

export interface IDXSearchParams {
  city?: string
  cities?: string[] // Multiple cities with OR condition
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  listingType?: 'sale' | 'lease' // Filters by price threshold ($10k)
  status?: 'Active' | 'Pending' | 'Sold' | 'all'
  limit?: number
  offset?: number
}

export interface IDXSearchResponse {
  success: boolean
  listings: IDXListing[]
  total: number
  error?: string
}
