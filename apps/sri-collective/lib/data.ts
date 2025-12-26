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
 * Uses user preferences to show more relevant properties
 * Prioritizes: user's selected cities > price range > listing type > property features
 */
export async function getSimilarProperties(
  property: Property,
  limit: number = 3,
  userPreferences?: UserPreferences
): Promise<Property[]> {
  const allProperties = await getAllProperties();

  // Ensure limit is between 3-5
  const maxResults = Math.min(Math.max(limit, 3), 5);

  // Score each property based on relevance
  const scored = allProperties
    .filter(p => p.id !== property.id) // Exclude current property
    .map(p => {
      let score = 0;

      // 1. City match (highest priority)
      if (userPreferences?.cities && userPreferences.cities.length > 0) {
        // If property is in user's selected cities: +50 points
        if (userPreferences.cities.includes(p.city)) {
          score += 50;
        }
      } else {
        // Fallback: same city as current property: +30 points
        if (p.city === property.city) {
          score += 30;
        }
      }

      // 2. Price range match
      if (userPreferences?.priceMin !== undefined && userPreferences?.priceMax !== undefined) {
        // Within user's budget: +40 points
        if (p.price >= userPreferences.priceMin && p.price <= userPreferences.priceMax) {
          score += 40;
        }
        // Close to budget (within 10%): +20 points
        else if (
          p.price >= userPreferences.priceMin * 0.9 &&
          p.price <= userPreferences.priceMax * 1.1
        ) {
          score += 20;
        }
      } else {
        // Fallback: similar price to current property (±20%): +20 points
        const priceDiff = Math.abs(p.price - property.price);
        const priceRange = property.price * 0.2;
        if (priceDiff <= priceRange) {
          score += 20;
        }
      }

      // 3. Listing type match (sale/lease)
      if (userPreferences?.listingType) {
        const listingTypes = Array.isArray(userPreferences.listingType)
          ? userPreferences.listingType
          : [userPreferences.listingType];
        if (listingTypes.includes(p.listingType)) {
          score += 30;
        }
      } else if (p.listingType === property.listingType) {
        score += 15;
      }

      // 4. Property type match
      if (userPreferences?.propertyTypes && userPreferences.propertyTypes.length > 0) {
        if (userPreferences.propertyTypes.includes(p.propertyType)) {
          score += 25;
        }
      } else if (p.propertyType === property.propertyType) {
        score += 15;
      }

      // 5. Bedrooms match
      if (userPreferences?.bedrooms) {
        const bedrooms = Array.isArray(userPreferences.bedrooms)
          ? userPreferences.bedrooms
          : [userPreferences.bedrooms];
        // If property has bedrooms >= any of the selected values: +15 points
        if (bedrooms.some(b => p.bedrooms >= b)) {
          score += 15;
        }
      } else if (p.bedrooms === property.bedrooms) {
        score += 10;
      }

      // 6. Bathrooms match
      if (userPreferences?.bathrooms) {
        const bathrooms = Array.isArray(userPreferences.bathrooms)
          ? userPreferences.bathrooms
          : [userPreferences.bathrooms];
        // If property has bathrooms >= any of the selected values: +10 points
        if (bathrooms.some(b => p.bathrooms >= b)) {
          score += 10;
        }
      } else if (p.bathrooms === property.bathrooms) {
        score += 5;
      }

      return { property: p, score };
    })
    .filter(({ score }) => score > 0) // Only include properties with some match
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, maxResults)
    .map(({ property }) => property);

  return scored;
}
