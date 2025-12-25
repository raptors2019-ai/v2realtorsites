import type { Property, PropertyFilters, SortOption, IDXListing, ListingType, IDXMedia } from '@repo/types'
import type { BoldTrailListing } from '@repo/crm'

/**
 * Filter properties based on criteria
 */
export function filterProperties(
  properties: Property[],
  filters: PropertyFilters
): Property[] {
  let filtered = [...properties];

  // Filter by property type
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter((property) =>
      filters.type?.includes(property.propertyType)
    );
  }

  // Filter by price range (handles partial min/max)
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    filtered = filtered.filter((property) => {
      const price = property.price;
      if (min !== undefined && price < min) return false;
      if (max !== undefined && price > max) return false;
      return true;
    });
  }

  // Filter by bedrooms (minimum)
  if (filters.bedrooms !== undefined) {
    filtered = filtered.filter(
      (property) => property.bedrooms >= filters.bedrooms!
    );
  }

  // Filter by bathrooms (minimum)
  if (filters.bathrooms !== undefined) {
    filtered = filtered.filter(
      (property) => property.bathrooms >= filters.bathrooms!
    );
  }

  // Filter by location/city
  if (filters.location) {
    filtered = filtered.filter((property) =>
      property.city.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  // Filter by listing type (sale/lease)
  if (filters.listingType) {
    filtered = filtered.filter((property) =>
      property.listingType === filters.listingType
    );
  }

  return filtered;
}

/**
 * Sort properties
 */
export function sortProperties(
  properties: Property[],
  sortBy: SortOption
): Property[] {
  const sorted = [...properties];

  switch (sortBy) {
    case 'latest':
      return sorted.sort(
        (a, b) =>
          new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
      );

    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);

    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);

    case 'featured':
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });

    default:
      return sorted;
  }
}

/**
 * Convert IDX API listing to Property type
 */
export function convertIDXToProperty(listing: IDXListing): Property {
  // Map IDX PropertyType to our property types
  const propertyTypeMap: Record<string, Property['propertyType']> = {
    'residential': 'detached',
    'condo': 'condo',
    'townhouse': 'townhouse',
  }
  const propertyType = propertyTypeMap[listing.PropertyType?.toLowerCase()] || 'detached'

  // Map IDX status to our status
  const statusMap: Record<string, Property['status']> = {
    'active': 'active',
    'pending': 'pending',
    'sold': 'sold',
  }
  const status = statusMap[listing.StandardStatus?.toLowerCase()] || 'active'

  // Determine listing type based on price threshold
  // Properties under $10,000 are likely rentals/leases (monthly amount)
  const LEASE_PRICE_THRESHOLD = 10000
  const listingType: ListingType = listing.ListPrice < LEASE_PRICE_THRESHOLD ? 'lease' : 'sale'

  // Extract images from media
  // Ampre API returns MediaType as MIME type (e.g., "image/jpeg") and MediaCategory as "Photo"
  // Filter by MediaCategory === 'Photo' or accept image/* MIME types
  // Deduplicate by MediaKey (unique identifier for each image)
  // TRREB API returns many duplicate images with different resize params in the URL path
  const mediaItems = listing.Media
    ?.filter(m => m.MediaURL && (
      m.MediaCategory === 'Photo' ||
      m.MediaType?.startsWith('image/') ||
      (!m.MediaCategory && !m.MediaType) // Accept if no type info
    ))
    .sort((a, b) => (a.Order ?? 999) - (b.Order ?? 999)) || []

  /**
   * Extract base image ID from Ampre CDN URL
   * Ampre uses format: https://trreb-image.ampre.ca/{IMAGE_ID}/rs:fit:240:240/wm:.5.../path.jpg
   * The IMAGE_ID is the unique identifier - everything after is resize/watermark params
   */
  const extractImageId = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(Boolean)
      // First part is the unique image ID (hash)
      return pathParts[0] || url
    } catch {
      return url
    }
  }

  /**
   * Extract size from Ampre CDN URL (e.g., rs:fit:800:600 returns 800)
   */
  const extractSize = (url: string): number => {
    const match = url.match(/rs:fit:(\d+):/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Group by image ID (MediaKey or URL-based), keeping the largest version of each
  const imageMap = new Map<string, IDXMedia>()

  for (const media of mediaItems) {
    // Get unique ID (MediaKey or URL-based image ID)
    const id = media.MediaKey?.replace(/-t$/, '') || extractImageId(media.MediaURL)

    // Get existing entry or add new one
    const existing = imageMap.get(id)
    if (!existing) {
      imageMap.set(id, media)
      continue
    }

    // If this version is larger, replace the existing one
    const existingSize = extractSize(existing.MediaURL)
    const currentSize = extractSize(media.MediaURL)
    if (currentSize > existingSize) {
      imageMap.set(id, media)
    }
  }

  // Convert map to array, sort by original Order, limit to 40 images
  const uniqueMedia = Array.from(imageMap.values())
    .sort((a, b) => (a.Order ?? 999) - (b.Order ?? 999))
    .slice(0, 40)

  const images = uniqueMedia.map(m => m.MediaURL)

  console.log('[convertIDXToProperty.images]', {
    listingKey: listing.ListingKey,
    total: mediaItems.length,
    unique: uniqueMedia.length,
    final: images.length,
    duplicatesRemoved: mediaItems.length - uniqueMedia.length
  })

  // Try multiple fields for square footage
  // TRREB/Ampre API returns LivingAreaRange as a string like "0-499", "500-999", etc.
  // We parse this to get a midpoint estimate, or use direct values if available
  let sqft = listing.LivingArea || listing.BuildingAreaTotal || listing.AboveGradeFinishedArea || 0

  if (!sqft && (listing as any).LivingAreaRange) {
    const range = (listing as any).LivingAreaRange as string
    const match = range.match(/(\d+)-(\d+)/)
    if (match) {
      const min = parseInt(match[1], 10)
      const max = parseInt(match[2], 10)
      sqft = Math.round((min + max) / 2) // Use midpoint of range
    }
  }

  return {
    id: listing.ListingKey,
    title: listing.UnparsedAddress,
    address: listing.UnparsedAddress,
    city: listing.City,
    province: listing.StateOrProvince,
    postalCode: listing.PostalCode,
    price: listing.ListPrice,
    bedrooms: listing.BedroomsTotal,
    bathrooms: listing.BathroomsTotalInteger,
    sqft,
    propertyType,
    status,
    listingType,
    featured: false,
    images,
    description: listing.PublicRemarks || '',
    listingDate: new Date(listing.ModificationTimestamp),
    mlsNumber: listing.ListingId || listing.ListingKey,
  }
}

/**
 * Convert BoldTrail API listing to Property type
 */
export function convertToProperty(listing: BoldTrailListing): Property {
  // Map propertyType to valid values
  const propertyTypeMap: Record<string, Property['propertyType']> = {
    'detached': 'detached',
    'semi-detached': 'semi-detached',
    'townhouse': 'townhouse',
    'condo': 'condo',
  }
  const propertyType = propertyTypeMap[listing.propertyType?.toLowerCase()] || 'detached'

  // Determine listing type based on price threshold
  const LEASE_PRICE_THRESHOLD = 10000
  const listingType: ListingType = listing.price < LEASE_PRICE_THRESHOLD ? 'lease' : 'sale'

  return {
    id: listing.id,
    title: listing.address,
    address: listing.address,
    city: listing.city,
    province: listing.province,
    postalCode: listing.postalCode,
    price: listing.price,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft || 0,
    propertyType,
    status: listing.status,
    listingType,
    featured: false,
    images: listing.photos,
    description: listing.description || '',
    listingDate: new Date(listing.listingDate),
    mlsNumber: listing.mlsNumber,
  }
}

/**
 * Retry fetch with exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      // If not ok and last retry, throw
      if (i === maxRetries - 1) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error
      // Wait with exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000))
    }
  }
  throw new Error('Max retries exceeded')
}
