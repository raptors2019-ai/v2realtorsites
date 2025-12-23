import type { Property, PropertyFilters, SortOption, IDXListing } from '@repo/types'
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

  // Filter by price range
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    filtered = filtered.filter((property) => {
      const price = property.price;
      return price >= min && price <= max;
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

  // Extract images from media
  // Ampre API returns MediaType as MIME type (e.g., "image/jpeg") and MediaCategory as "Photo"
  // Filter by MediaCategory === 'Photo' or accept image/* MIME types
  // Deduplicate by Order number (same Order = same image in different sizes)
  const mediaItems = listing.Media
    ?.filter(m => m.MediaURL && (
      m.MediaCategory === 'Photo' ||
      m.MediaType?.startsWith('image/') ||
      (!m.MediaCategory && !m.MediaType) // Accept if no type info
    ))
    .sort((a, b) => (a.Order ?? 999) - (b.Order ?? 999)) || []

  // Deduplicate: keep only unique images based on Order number
  // API returns multiple sizes of same image with same Order
  const seenOrders = new Set<number>()
  const images = mediaItems
    .filter(m => {
      const order = m.Order ?? 0
      if (seenOrders.has(order)) return false
      seenOrders.add(order)
      return true
    })
    .map(m => m.MediaURL)

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
    sqft: listing.LivingArea || 0,
    propertyType,
    status,
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
