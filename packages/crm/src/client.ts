import { ContactData, ContactResponse, ListingFilters, ListingsResponse, BoldTrailListing } from './types';

export class BoldTrailClient {
  private apiKey: string;
  // kvCORE Public API V2 base URL
  private baseUrl = 'https://api.kvcore.com/v2/public';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BOLDTRAIL_API_KEY || '';
  }

  async createContact(data: ContactData): Promise<ContactResponse> {
    if (!this.apiKey) {
      console.warn('[crm.boldtrail.noApiKey] BoldTrail API key not configured - using email fallback');
      return this.sendEmailFallback(data);
    }

    try {
      // Build the payload with kvCORE V2 field names
      // API uses: cell_phone_1, avg_price, avg_beds, avg_baths, deal_type, primary_city
      const payload: Record<string, unknown> = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        source: data.source,
        deal_type: data.leadType, // kvCORE uses deal_type not lead_type
      };

      // Add phone as cell_phone_1 (priority field in kvCORE)
      if (data.phone) {
        payload.cell_phone_1 = data.phone;
      }

      // Map custom fields to kvCORE V2 field names
      if (data.customFields) {
        if (data.customFields.average_price) {
          payload.avg_price = data.customFields.average_price; // kvCORE uses avg_price
        }
        if (data.customFields.average_beds) {
          payload.avg_beds = data.customFields.average_beds; // kvCORE uses avg_beds
        }
        if (data.customFields.average_bathrooms) {
          payload.avg_baths = data.customFields.average_bathrooms; // kvCORE uses avg_baths
        }
        if (data.customFields.city) {
          payload.primary_city = data.customFields.city; // kvCORE uses primary_city
        }
        if (data.customFields.hashtags) {
          payload.hashtags = data.customFields.hashtags;
        }
        if (data.customFields.notes) {
          payload.notes = data.customFields.notes;
        }
      }

      // kvCORE V2 uses singular /contact endpoint
      const response = await fetch(`${this.baseUrl}/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[crm.boldtrail.createContact.failed]', {
          status: response.status,
          error: errorText,
        });
        throw new Error(`BoldTrail API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as { id: string };
      console.error('[crm.boldtrail.createContact.success]', { contactId: result.id });
      return {
        success: true,
        contactId: result.id,
      };
    } catch (error) {
      console.error('[crm.boldtrail.createContact.error]', error);
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

      // kvCORE V2 uses /manuallistings endpoint
      const response = await fetch(`${this.baseUrl}/manuallistings?${params.toString()}`, {
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
      // kvCORE V2 uses /manuallisting/{id} for single listing
      const response = await fetch(`${this.baseUrl}/manuallisting/${listingId}`, {
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
