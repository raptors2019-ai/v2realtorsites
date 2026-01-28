import { ContactData, ContactResponse, ContactUpdateData, ListingFilters, ListingsResponse, BoldTrailListing } from './types';

/**
 * Helper to remove null, undefined, empty strings, and empty arrays from an object
 * Only includes fields with actual values
 */
function cleanPayload(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'number' && value === 0) continue; // Skip zero values for optional fields
    cleaned[key] = value;
  }
  return cleaned;
}

/**
 * Format budget to hashtag-friendly format
 */
function formatBudgetHashtag(budget: number): string {
  if (budget < 500000) return 'budget-under-500k';
  if (budget < 750000) return 'budget-500k-750k';
  if (budget < 1000000) return 'budget-750k-1m';
  if (budget < 1500000) return 'budget-1m-1.5m';
  if (budget < 2000000) return 'budget-1.5m-2m';
  return 'budget-2m-plus';
}

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

      // Log the payload being sent (for debugging)
      console.error('[crm.boldtrail.createContact.payload]', {
        hasCity: !!payload.primary_city,
        city: payload.primary_city,
        hasHashtags: !!payload.hashtags,
        hashtagCount: Array.isArray(payload.hashtags) ? payload.hashtags.length : 0,
        fields: Object.keys(payload),
      });

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
   * Update/enrich an existing contact with additional data
   * Only sends non-empty fields to avoid overwriting with nulls
   */
  async updateContact(contactId: string, data: ContactUpdateData): Promise<ContactResponse> {
    if (!this.apiKey) {
      console.warn('[crm.boldtrail.updateContact.noApiKey] BoldTrail API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    if (!contactId) {
      return { success: false, error: 'Contact ID required for update' };
    }

    try {
      // Build hashtags from the data
      const hashtags: string[] = data.hashtags || [];

      // Add budget hashtag if we have price data
      const priceValue = data.averagePrice || data.mortgageEstimate?.maxHomePrice;
      if (priceValue && priceValue > 0) {
        hashtags.push(formatBudgetHashtag(priceValue));
      }

      // Add first-time buyer tag
      if (data.firstTimeBuyer) {
        hashtags.push('first-time-buyer');
      }

      // Add pre-approved tag
      if (data.preApproved) {
        hashtags.push('pre-approved');
      }

      // Add timeline tag
      if (data.timeline) {
        hashtags.push(`timeline-${data.timeline}`);
      }

      // Add location tags
      if (data.primaryCity) {
        hashtags.push(data.primaryCity.toLowerCase().replace(/\s+/g, '-'));
      }
      if (data.preferredNeighborhoods?.length) {
        hashtags.push(...data.preferredNeighborhoods.map(n => n.toLowerCase().replace(/\s+/g, '-')));
      }

      // Add mortgage-related tags
      if (data.mortgageEstimate) {
        hashtags.push('mortgage-estimated');
        if (data.mortgageEstimate.cmhcPremium && data.mortgageEstimate.cmhcPremium > 0) {
          hashtags.push('cmhc-required');
        }
      }

      // Add urgency tags
      if (data.urgencyFactors?.length) {
        hashtags.push(...data.urgencyFactors.map(f => f.toLowerCase().replace(/\s+/g, '-')));
      }

      // Build human-readable notes for agent reference
      const noteLines: string[] = [];

      noteLines.push(`📝 ENRICHMENT UPDATE - ${new Date().toLocaleDateString('en-CA')}`);

      if (data.conversationSummary) {
        noteLines.push(`💬 ${data.conversationSummary}`);
      }

      if (data.mortgageEstimate) {
        noteLines.push('');
        noteLines.push('💰 AFFORDABILITY:');
        noteLines.push(`  • Max Budget: $${data.mortgageEstimate.maxHomePrice.toLocaleString()}`);
        if (data.mortgageEstimate.cmhcPremium) {
          noteLines.push(`  • CMHC Premium: $${data.mortgageEstimate.cmhcPremium.toLocaleString()}`);
        }
      }

      if (data.primaryCity || data.preferredNeighborhoods?.length) {
        noteLines.push('');
        noteLines.push('📍 LOCATION UPDATE:');
        if (data.primaryCity) noteLines.push(`  • City: ${data.primaryCity}`);
        if (data.preferredNeighborhoods?.length) {
          noteLines.push(`  • Neighborhoods: ${data.preferredNeighborhoods.join(', ')}`);
        }
      }

      if (data.viewedListings?.length) {
        noteLines.push('');
        noteLines.push(`🏠 PROPERTIES VIEWED (${data.viewedListings.length}):`);
        data.viewedListings.slice(0, 5).forEach(l => {
          noteLines.push(`  • ${l.address} ($${l.price.toLocaleString()})`);
        });
      }

      const notes = noteLines.length > 1 ? noteLines.join('\n') : undefined;

      // Build the payload with only non-empty values
      const rawPayload: Record<string, unknown> = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        cell_phone_1: data.phone,
        deal_type: data.leadType,
        avg_price: data.averagePrice || data.mortgageEstimate?.maxHomePrice,
        avg_beds: data.averageBeds,
        avg_baths: data.averageBaths,
        primary_city: data.primaryCity,
        hashtags: hashtags.length > 0 ? [...new Set(hashtags)] : undefined, // Dedupe hashtags
        notes,
      };

      const payload = cleanPayload(rawPayload);

      // Don't make API call if there's nothing to update
      if (Object.keys(payload).length === 0) {
        console.log('[crm.boldtrail.updateContact.noData] No data to update');
        return { success: true, contactId };
      }

      console.error('[crm.boldtrail.updateContact.payload]', {
        contactId,
        fieldsToUpdate: Object.keys(payload),
        hashtagCount: hashtags.length,
      });

      const response = await fetch(`${this.baseUrl}/contact/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[crm.boldtrail.updateContact.failed]', {
          status: response.status,
          error: errorText,
        });
        return { success: false, error: `API error: ${response.status}` };
      }

      console.error('[crm.boldtrail.updateContact.success]', { contactId });
      return { success: true, contactId };
    } catch (error) {
      console.error('[crm.boldtrail.updateContact.error]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a contact by ID
   */
  async getContact(contactId: string): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/contact/${contactId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return { success: false, error: `API returned ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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
