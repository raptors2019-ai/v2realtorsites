export interface ContactData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source?: 'newhomeshow' | 'sri-collective' | 'website';
  leadType?: 'buyer' | 'seller' | 'investor' | 'general';
  customFields?: Record<string, unknown>;
}

export interface ContactResponse {
  success: boolean;
  contactId?: string;
  fallback?: boolean;
  error?: string;
}

/**
 * Data that can be used to update/enrich an existing contact
 * All fields are optional - only non-empty values will be sent to CRM
 */
export interface ContactUpdateData {
  // Basic info
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  // Lead classification
  leadType?: 'buyer' | 'seller' | 'investor' | 'general';

  // Buyer preferences
  averagePrice?: number;
  averageBeds?: number;
  averageBaths?: number;
  primaryCity?: string;

  // Mortgage/affordability data
  mortgageEstimate?: {
    maxHomePrice: number;
    downPayment: number;
    monthlyPayment: number;
    annualIncome: number;
    cmhcPremium?: number;
  };

  // Engagement tracking
  hashtags?: string[];
  conversationSummary?: string;

  // Neighborhoods of interest
  preferredNeighborhoods?: string[];

  // Properties viewed
  viewedListings?: Array<{
    listingId: string;
    address: string;
    price: number;
  }>;

  // Timeline and intent
  timeline?: string;
  preApproved?: boolean;
  firstTimeBuyer?: boolean;
  urgencyFactors?: string[];
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
