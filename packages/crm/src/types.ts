export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: 'newhomeshow' | 'sri-collective' | 'chatbot';
  leadType: 'buyer' | 'seller' | 'investor' | 'general';
  customFields?: Record<string, any>;
}

export interface ContactResponse {
  success: boolean;
  contactId?: string;
  fallback?: boolean;
  error?: string;
}

// Listing Types
export interface ListingFilters {
  limit?: number;
  status?: 'active' | 'pending' | 'sold' | 'all';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  city?: string;
}

export interface BoldTrailListing {
  id: string;
  mlsNumber?: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  propertyType: string;
  status: 'active' | 'pending' | 'sold';
  listingDate: string;
  photos: string[];
  description?: string;
  features?: string[];
  lat?: number;
  lng?: number;
}

export interface ListingsResponse {
  success: boolean;
  data?: BoldTrailListing[];
  total?: number;
  error?: string;
}
