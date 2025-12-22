import { Property } from "@repo/types";
import propertiesData from "@/data/properties.json";
import { BoldTrailClient, ListingFilters } from "@repo/crm";
import { convertToProperty } from "@repo/lib";

// Re-export utilities from shared lib
export { formatPrice, cn } from "@repo/lib";

// Type for JSON data (listingDate is string in JSON)
interface PropertyJSON {
  id: string;
  title: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  propertyType: 'detached' | 'semi-detached' | 'townhouse' | 'condo';
  status: 'active' | 'pending' | 'sold';
  featured: boolean;
  images: string[];
  description: string;
  listingDate: string; // JSON stores as string
  mlsNumber?: string;
}

/**
 * Convert JSON property data to Property type
 * Handles listingDate string -> Date conversion
 */
function convertJSONToProperty(json: PropertyJSON): Property {
  return {
    ...json,
    listingDate: new Date(json.listingDate),
  };
}

/**
 * Get mock properties with proper type conversion
 */
function getMockPropertiesConverted(): Property[] {
  return (propertiesData as PropertyJSON[]).map(convertJSONToProperty);
}

/**
 * Get all properties from BoldTrail API
 * Falls back to mock data if API is not configured
 */
export async function getAllProperties(filters?: ListingFilters): Promise<Property[]> {
  const apiKey = process.env.BOLDTRAIL_API_KEY;

  // Use mock data if API key is not configured
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Using mock property data (BOLDTRAIL_API_KEY not set)');
    }
    return getMockPropertiesConverted();
  }

  try {
    const client = new BoldTrailClient(apiKey);
    const response = await client.getListings(filters || { limit: 50, status: 'active' });

    if (!response.success || !response.data) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEV] BoldTrail API unavailable, using mock data:', response.error);
      }
      // Fallback to mock data
      return getMockPropertiesConverted();
    }

    // Convert BoldTrail listings to Property format
    const properties = response.data.map(convertToProperty);
    return properties;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] BoldTrail API error, using mock data');
    }
    // Fallback to mock data on error
    return getMockPropertiesConverted();
  }
}

/**
 * Get all properties from mock data (synchronous fallback)
 */
export function getMockProperties(): Property[] {
  return getMockPropertiesConverted();
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
