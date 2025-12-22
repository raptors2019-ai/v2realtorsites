import { ContactData, ContactResponse, ListingFilters, ListingsResponse, BoldTrailListing } from './types';

export class BoldTrailClient {
  private apiKey: string;
  private baseUrl = 'https://api.kvcore.com';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BOLDTRAIL_API_KEY || '';
  }

  async createContact(data: ContactData): Promise<ContactResponse> {
    if (!this.apiKey) {
      console.warn('BoldTrail API key not configured - using email fallback');
      return this.sendEmailFallback(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          source: data.source,
          lead_type: data.leadType,
          custom_fields: data.customFields,
        }),
      });

      if (!response.ok) {
        throw new Error(`BoldTrail API error: ${response.status}`);
      }

      const result = await response.json() as { id: string };
      return {
        success: true,
        contactId: result.id,
      };
    } catch (error) {
      console.error('BoldTrail API error:', error);
      // Fallback to email
      return this.sendEmailFallback(data);
    }
  }

  private async sendEmailFallback(data: ContactData): Promise<ContactResponse> {
    // TODO: Implement email fallback (SendGrid, Resend, etc.)
    console.log('[EMAIL FALLBACK] New contact:', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      source: data.source,
      leadType: data.leadType,
      customFields: data.customFields,
    });

    // For now, just log it
    // You can implement actual email sending here tonight after testing CRM
    return {
      success: true,
      fallback: true,
    };
  }

  /**
   * Get property listings from BoldTrail
   */
  async getListings(filters: ListingFilters = {}): Promise<ListingsResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key not configured',
      };
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', (filters.limit || 25).toString());

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }

      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice.toString());
      }

      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice.toString());
      }

      if (filters.bedrooms) {
        params.append('bedrooms', filters.bedrooms.toString());
      }

      if (filters.bathrooms) {
        params.append('bathrooms', filters.bathrooms.toString());
      }

      if (filters.propertyType) {
        params.append('propertyType', filters.propertyType);
      }

      if (filters.city) {
        params.append('city', filters.city);
      }

      const response = await fetch(`${this.baseUrl}/listings?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API returned ${response.status}`,
        };
      }

      const result = await response.json() as { data?: any[]; listings?: any[]; total?: number };

      return {
        success: true,
        data: result.data || result.listings || [],
        total: result.total || result.data?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a single listing by ID
   */
  async getListing(listingId: string): Promise<{ success: boolean; data?: BoldTrailListing; error?: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key not configured',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/listings/${listingId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API returned ${response.status}`,
        };
      }

      const result = await response.json() as any;

      return {
        success: true,
        data: result.data || result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
