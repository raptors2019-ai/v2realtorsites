import { Property, IDXSearchParams, ListingType } from "@repo/types";
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
    const propertyTypeSet = new Set<string>();
    listings.forEach(listing => {
      if (listing.City) citySet.add(listing.City);
      if (listing.PropertyType) propertyTypeSet.add(listing.PropertyType);
    });
    const cities = Array.from(citySet).sort();
    const propertyTypes = Array.from(propertyTypeSet).sort();

    console.log('[IDX] Loaded', properties.length, 'of', response.total, 'properties,', cities.length, 'cities');
    console.log('[IDX.cities]', cities);
    console.log('[IDX.propertyTypes]', propertyTypes);

    return { properties, total: response.total, cities };
  } catch (error) {
    console.error('[data.getAllPropertiesWithTotal] Failed:', error);
    return { properties: [], total: 0, cities: [] };
  }
}

/**
 * Get a single property by ID
 * Uses direct API lookup instead of searching through all properties
 */
export async function getPropertyById(id: string): Promise<Property | undefined> {
  const client = new IDXClient();

  if (!client.isConfigured) {
    console.error('[data.getPropertyById] IDX_API_KEY not configured');
    return undefined;
  }

  try {
    // Fetch the listing directly from the API
    const listing = await client.getListing(id);
    if (!listing) {
      console.log('[data.getPropertyById] Property not found:', id);
      return undefined;
    }

    // Fetch media for this listing
    const mediaMap = await client.fetchMediaForListings([listing.ListingKey]);
    const listingWithMedia = {
      ...listing,
      Media: mediaMap.get(listing.ListingKey) || [],
    };

    // Convert to Property format
    const property = convertIDXToProperty(listingWithMedia);
    return property;
  } catch (error) {
    console.error('[data.getPropertyById] Failed:', error);
    return undefined;
  }
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

interface UserPreferences {
  cities?: string[];
  priceMin?: number;
  priceMax?: number;
  listingType?: string | string[];
  propertyTypes?: string[];
  bedrooms?: number | number[];
  bathrooms?: number | number[];
}

/**
 * Get similar properties with smart recommendations
 * ALWAYS filters by: city, property class (residential), listing type, property type
 * Uses user preferences for: price range, bedrooms, bathrooms (if provided)
 */
export async function getSimilarProperties(
  property: Property,
  limit: number = 3,
  userPreferences?: UserPreferences
): Promise<Property[]> {
  // Determine listing type: use user preference if provided, otherwise match current property
  const listingType = userPreferences?.listingType
    ? (Array.isArray(userPreferences.listingType)
        ? userPreferences.listingType[0]
        : userPreferences.listingType) as 'sale' | 'lease'
    : (property.listingType as 'sale' | 'lease') || 'sale';

  // Determine property type: use user preference if provided, otherwise match current property
  const propertyTypes = userPreferences?.propertyTypes && userPreferences.propertyTypes.length > 0
    ? userPreferences.propertyTypes
    : [property.propertyType];

  // Build search params with REQUIRED filters
  const searchParams: IDXSearchParams = {
    city: property.city,              // REQUIRED: same city as current property
    propertyClass: 'residential',     // REQUIRED: always residential
    listingType: listingType,         // REQUIRED: same listing type (sale/lease)
    propertyTypes: propertyTypes,     // REQUIRED: same property type(s)
    limit: 50,                        // Get more properties for better selection
  };

  // Add user's budget preferences if available
  if (userPreferences?.priceMin) {
    searchParams.minPrice = userPreferences.priceMin;
  }
  if (userPreferences?.priceMax) {
    searchParams.maxPrice = userPreferences.priceMax;
  }

  // Add bedrooms filter if user specified (use minimum from array)
  if (userPreferences?.bedrooms) {
    const bedroomValues = Array.isArray(userPreferences.bedrooms)
      ? userPreferences.bedrooms
      : [userPreferences.bedrooms];
    if (bedroomValues.length > 0) {
      searchParams.bedrooms = Math.min(...bedroomValues);
    }
  }

  // Add bathrooms filter if user specified (use minimum from array)
  if (userPreferences?.bathrooms) {
    const bathroomValues = Array.isArray(userPreferences.bathrooms)
      ? userPreferences.bathrooms
      : [userPreferences.bathrooms];
    if (bathroomValues.length > 0) {
      searchParams.bathrooms = Math.min(...bathroomValues);
    }
  }

  console.log('[similar.fetch]', {
    city: property.city,
    propertyClass: 'residential',
    listingType: listingType,
    propertyTypes: propertyTypes,
    priceRange: { min: searchParams.minPrice, max: searchParams.maxPrice },
    bedrooms: searchParams.bedrooms,
    bathrooms: searchParams.bathrooms,
  });

  const allProperties = await getAllProperties(searchParams);

  // Ensure limit is between 3-5
  const maxResults = Math.min(Math.max(limit, 3), 5);

  // Score each property based on relevance (most filters already applied at API level)
  const scored = allProperties
    .filter(p => p.id !== property.id) // Exclude current property
    .map(p => {
      let score = 0;

      // 1. Base score for being in the same city (already filtered)
      if (p.city === property.city) {
        score += 30;
      }

      // 2. Property type exact match: +25 points
      if (p.propertyType === property.propertyType) {
        score += 25;
      }

      // 3. Price similarity (within 20% of current property): +20 points
      const priceDiff = Math.abs(p.price - property.price);
      const priceRange = property.price * 0.2;
      if (priceDiff <= priceRange) {
        score += 20;
      }

      // 4. Bedrooms match: +15 points
      if (p.bedrooms === property.bedrooms) {
        score += 15;
      } else if (Math.abs(p.bedrooms - property.bedrooms) === 1) {
        score += 8;  // Close match (±1 bedroom)
      }

      // 5. Bathrooms match: +10 points
      if (p.bathrooms === property.bathrooms) {
        score += 10;
      } else if (Math.abs(p.bathrooms - property.bathrooms) <= 1) {
        score += 5;  // Close match (±1 bathroom)
      }

      return { property: p, score };
    })
    .filter(({ score }) => score > 0) // Only include properties with some match
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, maxResults)
    .map(({ property }) => property);

  console.log('[similar.results]', {
    city: property.city,
    propertyType: property.propertyType,
    listingType: listingType,
    fetched: allProperties.length,
    matched: scored.length,
  });

  return scored;
}
