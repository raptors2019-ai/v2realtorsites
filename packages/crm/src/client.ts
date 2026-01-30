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
 * Format budget to hashtag-friendly format (no periods allowed in BoldTrail)
 */
function formatBudgetHashtag(budget: number): string {
  if (budget < 500000) return 'budget-under-500k';
  if (budget < 750000) return 'budget-500k-750k';
  if (budget < 1000000) return 'budget-750k-1m';
  if (budget < 2000000) return 'budget-1m-2m';
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

      // Get full response text for debugging
      const responseText = await response.text();

      // Log complete response details
      console.error('[crm.boldtrail.createContact.response]', {
        status: response.status,
        statusText: response.statusText,
        body: responseText.slice(0, 1000), // Log first 1000 chars
      });

      if (!response.ok) {
        console.error('[crm.boldtrail.createContact.failed]', {
          status: response.status,
          error: responseText,
        });
        throw new Error(`BoldTrail API error: ${response.status} - ${responseText}`);
      }

      // Parse response
      let result: { id: string };
      try {
        result = JSON.parse(responseText) as { id: string };
      } catch {
        console.error('[crm.boldtrail.createContact.parseError]', { responseText });
        throw new Error('Failed to parse API response');
      }

      const contactId = result.id;
      console.error('[crm.boldtrail.createContact.success]', { contactId });

      // Attempt to add hashtags separately if they were provided
      // (since hashtags in payload may be silently ignored)
      if (data.customFields?.hashtags && Array.isArray(data.customFields.hashtags) && data.customFields.hashtags.length > 0) {
        console.error('[crm.boldtrail.createContact.attemptHashtags]', {
          contactId,
          hashtagCount: data.customFields.hashtags.length,
        });
        const hashtagResult = await this.addContactHashtags(contactId, data.customFields.hashtags);
        if (!hashtagResult.success) {
          console.error('[crm.boldtrail.createContact.hashtagsFailed]', {
            contactId,
            error: hashtagResult.error,
            note: 'Contact created but hashtags not applied - may need to be pre-created in BoldTrail UI',
          });
        }
      }

      // Attempt to add notes separately if provided
      // (since notes in payload may not appear in activity timeline)
      if (data.customFields?.notes && typeof data.customFields.notes === 'string') {
        console.error('[crm.boldtrail.createContact.attemptNote]', {
          contactId,
          noteLength: data.customFields.notes.length,
        });
        const noteResult = await this.addContactNote(contactId, data.customFields.notes);
        if (!noteResult.success) {
          console.error('[crm.boldtrail.createContact.noteFailed]', {
            contactId,
            error: noteResult.error,
            note: 'Contact created but activity note not added - may not be available in public API',
          });
        }
      }

      return {
        success: true,
        contactId,
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
        hashtags: hashtags.length > 0 ? Array.from(new Set(hashtags)) : undefined, // Dedupe hashtags
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
   * Add a note to a contact's activity timeline
   * Tries multiple endpoint variations since kvCORE public API documentation is unclear
   */
  async addContactNote(contactId: string, note: string): Promise<ContactResponse> {
    if (!this.apiKey) {
      console.warn('[crm.boldtrail.addContactNote.noApiKey] BoldTrail API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    if (!contactId || !note) {
      return { success: false, error: 'Contact ID and note content required' };
    }

    // Try multiple endpoint variations - kvCORE API docs are inconsistent
    const endpointVariations: Array<{
      path: string;
      method: 'POST' | 'PUT';
      body: Record<string, unknown>;
    }> = [
      // Variation 1: action-note with { note: "..." }
      { path: `/contact/${contactId}/action-note`, method: 'POST', body: { note } },
      { path: `/contact/${contactId}/action-note`, method: 'PUT', body: { note } },
      // Variation 2: action-note with { body: "..." }
      { path: `/contact/${contactId}/action-note`, method: 'POST', body: { body: note } },
      // Variation 3: action-note with { content: "..." }
      { path: `/contact/${contactId}/action-note`, method: 'POST', body: { content: note } },
      // Variation 4: /note endpoint
      { path: `/contact/${contactId}/note`, method: 'POST', body: { note } },
      { path: `/contact/${contactId}/note`, method: 'PUT', body: { note } },
      // Variation 5: /notes endpoint (plural)
      { path: `/contact/${contactId}/notes`, method: 'POST', body: { note } },
      { path: `/contact/${contactId}/notes`, method: 'POST', body: { body: note } },
      // Variation 6: /activity endpoint
      { path: `/contact/${contactId}/activity`, method: 'POST', body: { type: 'note', note } },
      { path: `/contact/${contactId}/activity`, method: 'POST', body: { action: 'note', body: note } },
    ];

    for (const variation of endpointVariations) {
      const url = `${this.baseUrl}${variation.path}`;

      try {
        console.error('[crm.boldtrail.addContactNote.trying]', {
          method: variation.method,
          url,
          bodyKeys: Object.keys(variation.body),
        });

        const response = await fetch(url, {
          method: variation.method,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(variation.body),
        });

        const responseText = await response.text();

        // Log full response for debugging
        console.error('[crm.boldtrail.addContactNote.response]', {
          method: variation.method,
          url,
          status: response.status,
          statusText: response.statusText,
          body: responseText.slice(0, 500), // Truncate for logging
        });

        if (response.ok) {
          console.error('[crm.boldtrail.addContactNote.SUCCESS]', {
            method: variation.method,
            path: variation.path,
            bodyKeys: Object.keys(variation.body),
          });
          return { success: true, contactId };
        }

        // Continue to next variation on 404/405
        if (response.status === 404 || response.status === 405) {
          continue;
        }

        // For other errors (401, 403, 500), stop trying
        if (response.status === 401 || response.status === 403) {
          return { success: false, error: `API auth error: ${response.status} - check API token permissions` };
        }
      } catch (error) {
        console.error('[crm.boldtrail.addContactNote.error]', { variation, error });
      }
    }

    // All variations failed
    console.error('[crm.boldtrail.addContactNote.allFailed]', {
      contactId,
      variationsTried: endpointVariations.length,
      message: 'Note endpoint not found - may not be available in public API tier',
    });
    return { success: false, error: 'Failed to add note - endpoint not found in public API' };
  }

  /**
   * Add hashtags/tags to a contact
   * Tries multiple endpoint variations since hashtags may need separate API call
   */
  async addContactHashtags(contactId: string, hashtags: string[]): Promise<ContactResponse> {
    if (!this.apiKey) {
      console.warn('[crm.boldtrail.addContactHashtags.noApiKey] BoldTrail API key not configured');
      return { success: false, error: 'API key not configured' };
    }

    if (!contactId || !hashtags.length) {
      return { success: false, error: 'Contact ID and hashtags required' };
    }

    // The /tags endpoint returned 422 "tags field is required" - try different formats
    const tagsAsString = hashtags.join(','); // comma-separated
    const tagsAsObjects = hashtags.map(t => ({ name: t })); // array of objects with name

    // Try multiple endpoint variations with different body formats
    const endpointVariations: Array<{
      path: string;
      method: 'POST' | 'PUT' | 'PATCH';
      body: Record<string, unknown>;
      description: string;
    }> = [
      // /tags endpoint - try different value formats (422 means endpoint exists, wrong format)
      { path: `/contact/${contactId}/tags`, method: 'PUT', body: { tags: hashtags }, description: 'tags as string array' },
      { path: `/contact/${contactId}/tags`, method: 'PUT', body: { tags: tagsAsString }, description: 'tags as comma string' },
      { path: `/contact/${contactId}/tags`, method: 'PUT', body: { tags: tagsAsObjects }, description: 'tags as objects with name' },
      // Maybe the API wants a different structure entirely
      { path: `/contact/${contactId}/tags`, method: 'PUT', body: hashtags.reduce((acc, t, i) => ({ ...acc, [`tags[${i}]`]: t }), {}), description: 'tags as indexed keys' },
      // Try POST
      { path: `/contact/${contactId}/tags`, method: 'POST', body: { tags: hashtags }, description: 'POST tags array' },
      { path: `/contact/${contactId}/tags`, method: 'POST', body: { tags: tagsAsString }, description: 'POST tags string' },
      // /hashtags endpoint
      { path: `/contact/${contactId}/hashtags`, method: 'PUT', body: { hashtags }, description: '/hashtags PUT' },
      { path: `/contact/${contactId}/hashtags`, method: 'POST', body: { hashtags }, description: '/hashtags POST' },
      // PATCH/PUT contact directly with hashtags in payload
      { path: `/contact/${contactId}`, method: 'PUT', body: { hashtags }, description: 'PUT contact hashtags' },
    ];

    for (const variation of endpointVariations) {
      const url = `${this.baseUrl}${variation.path}`;

      try {
        console.error('[crm.boldtrail.addContactHashtags.trying]', {
          method: variation.method,
          url,
          description: variation.description,
          body: JSON.stringify(variation.body).slice(0, 200),
        });

        const response = await fetch(url, {
          method: variation.method,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(variation.body),
        });

        const responseText = await response.text();

        // Log full response for debugging
        console.error('[crm.boldtrail.addContactHashtags.response]', {
          description: variation.description,
          status: response.status,
          body: responseText.slice(0, 300),
        });

        if (response.ok) {
          console.error('[crm.boldtrail.addContactHashtags.SUCCESS]', {
            description: variation.description,
            method: variation.method,
            path: variation.path,
          });
          return { success: true, contactId };
        }

        // Continue to next variation on 404/405/422 (422 = validation error, try other formats)
        if (response.status === 404 || response.status === 405 || response.status === 422) {
          continue;
        }

        // For auth errors, stop trying
        if (response.status === 401 || response.status === 403) {
          return { success: false, error: `API auth error: ${response.status} - check API token permissions` };
        }
      } catch (error) {
        console.error('[crm.boldtrail.addContactHashtags.error]', { variation, error });
      }
    }

    // All variations failed
    console.error('[crm.boldtrail.addContactHashtags.allFailed]', {
      contactId,
      hashtagCount: hashtags.length,
      variationsTried: endpointVariations.length,
      message: 'Hashtag endpoint not found - must be pre-created in BoldTrail UI under Marketing > Hashtag Management',
    });
    return { success: false, error: 'Failed to add hashtags - endpoint not found in public API' };
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
