import { Property, IDXSearchParams } from "@repo/types";
import { IDXClient } from "@repo/crm";
import { convertIDXToProperty } from "@repo/lib";

// Re-export utilities from shared lib
export { formatPrice, cn } from "@repo/lib";

/**
 * Get all properties from IDX API (TRREB/Ampre)
 * Fetches properties and their media in parallel for performance
 * Returns empty array with error logged if API fails - NO MOCK DATA
 */
export async function getAllProperties(filters?: IDXSearchParams): Promise<Property[]> {
  const result = await getAllPropertiesWithTotal(filters);
  return result.properties;
}

/**
 * Get properties with total count for pagination
 * Returns { properties, total, cities } for "Show More" functionality and filtering
 */
export async function getAllPropertiesWithTotal(
  filters?: IDXSearchParams
): Promise<{ properties: Property[]; total: number; cities: string[] }> {
  const client = new IDXClient();

  if (!client.isConfigured) {
    console.error('[data.getAllPropertiesWithTotal] IDX_API_KEY not configured');
    return { properties: [], total: 0, cities: [] };
  }

  try {
    // Step 1: Fetch listings (default to 20 for performance)
    const response = await client.searchListings(filters || { limit: 20 });

    if (!response.success) {
      console.error('[data.getAllPropertiesWithTotal] IDX API error:', response.error);
      return { properties: [], total: 0, cities: [] };
    }

    const listings = response.listings;
    if (listings.length === 0) {
      return { properties: [], total: response.total, cities: [] };
    }

    // Step 2: Fetch media for all listings (batch request)
    const listingKeys = listings.map(l => l.ListingKey);
    const mediaMap = await client.fetchMediaForListings(listingKeys);

    // Step 3: Attach media to each listing before converting
    const listingsWithMedia = listings.map(listing => ({
      ...listing,
      Media: mediaMap.get(listing.ListingKey) || [],
    }));

    // Step 4: Convert to Property format
    const properties = listingsWithMedia.map(convertIDXToProperty);

    // Step 5: Extract unique cities for filtering
    const citySet = new Set<string>();
    listings.forEach(listing => {
      if (listing.City) citySet.add(listing.City);
    });
    const cities = Array.from(citySet).sort();

    console.log('[IDX] Loaded', properties.length, 'of', response.total, 'properties,', cities.length, 'cities');

    return { properties, total: response.total, cities };
  } catch (error) {
    console.error('[data.getAllPropertiesWithTotal] Failed:', error);
    return { properties: [], total: 0, cities: [] };
  }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string): Promise<Property | undefined> {
  const properties = await getAllProperties();
  return properties.find((property) => property.id === id);
}

/**
 * Get featured properties
 */
export async function getFeaturedProperties(limit?: number): Promise<Property[]> {
  const properties = await getAllProperties();
  const featured = properties.filter((property) => property.featured);

  if (limit) {
    return featured.slice(0, limit);
  }

  return featured;
}

/**
 * Get similar properties
 */
export async function getSimilarProperties(
  property: Property,
  limit: number = 3
): Promise<Property[]> {
  const allProperties = await getAllProperties();
  const priceRange = property.price * 0.2; // 20% price variance

  const similar = allProperties
    .filter((p) => {
      if (p.id === property.id) return false;
      if (p.propertyType !== property.propertyType) return false;
      const priceDiff = Math.abs(p.price - property.price);
      if (priceDiff > priceRange) return false;
      return true;
    })
    .slice(0, limit);

  return similar;
}
