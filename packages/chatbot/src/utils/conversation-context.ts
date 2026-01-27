/**
 * Conversation Context Accumulator
 *
 * Tracks all CRM-relevant data captured during a conversation.
 * Tools return `crmData` which gets accumulated here.
 * When createContact or enrichContact is called, this data is available.
 */

export interface ConversationCrmData {
  // Contact info (set after first capture)
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;

  // Mortgage/affordability data
  mortgageEstimate?: {
    maxHomePrice: number;
    downPayment: number;
    monthlyPayment: number;
    annualIncome: number;
    cmhcPremium?: number;
    downPaymentPercent?: number;
  };

  // Location preferences
  preferredCity?: string;
  preferredNeighborhoods?: string[];

  // Property preferences
  averagePrice?: number;
  averageBeds?: number;
  averageBaths?: number;
  propertyTypes?: string[];

  // Search history
  searches?: Array<{
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    propertyType?: string;
    resultCount: number;
    timestamp: string;
  }>;

  // Properties viewed/discussed
  viewedListings?: Array<{
    listingId: string;
    address: string;
    price: number;
  }>;

  // Intent signals
  timeline?: string;
  preApproved?: boolean;
  firstTimeBuyer?: boolean;
  urgencyFactors?: string[];
  leadType?: 'buyer' | 'seller' | 'investor' | 'general';

  // Engagement tracking
  toolsUsed?: string[];
  topicsDiscussed?: string[];

  // Conversation summary (generated)
  conversationSummary?: string;

  // Timestamps
  firstInteraction?: string;
  lastUpdated?: string;
}

/**
 * Merge new crmData into existing accumulated data
 * Only updates fields that have new, non-empty values
 */
export function mergeConversationData(
  existing: ConversationCrmData,
  incoming: Partial<ConversationCrmData>
): ConversationCrmData {
  const merged = { ...existing };

  // Update timestamp
  merged.lastUpdated = new Date().toISOString();
  if (!merged.firstInteraction) {
    merged.firstInteraction = merged.lastUpdated;
  }

  // Merge simple fields (only if incoming has a value)
  const simpleFields: (keyof ConversationCrmData)[] = [
    'contactId', 'contactName', 'contactPhone', 'contactEmail',
    'preferredCity', 'averagePrice', 'averageBeds', 'averageBaths',
    'timeline', 'preApproved', 'firstTimeBuyer', 'leadType',
  ];

  for (const field of simpleFields) {
    if (incoming[field] !== undefined && incoming[field] !== null && incoming[field] !== '') {
      (merged as Record<string, unknown>)[field] = incoming[field];
    }
  }

  // Merge mortgage estimate (replace entirely if provided)
  if (incoming.mortgageEstimate) {
    merged.mortgageEstimate = incoming.mortgageEstimate;
    // Also update averagePrice from mortgage estimate if not set
    if (!merged.averagePrice && incoming.mortgageEstimate.maxHomePrice) {
      merged.averagePrice = incoming.mortgageEstimate.maxHomePrice;
    }
  }

  // Merge arrays (append and dedupe)
  if (incoming.preferredNeighborhoods?.length) {
    merged.preferredNeighborhoods = [
      ...new Set([...(merged.preferredNeighborhoods || []), ...incoming.preferredNeighborhoods])
    ];
  }

  if (incoming.propertyTypes?.length) {
    merged.propertyTypes = [
      ...new Set([...(merged.propertyTypes || []), ...incoming.propertyTypes])
    ];
  }

  if (incoming.urgencyFactors?.length) {
    merged.urgencyFactors = [
      ...new Set([...(merged.urgencyFactors || []), ...incoming.urgencyFactors])
    ];
  }

  if (incoming.toolsUsed?.length) {
    merged.toolsUsed = [
      ...new Set([...(merged.toolsUsed || []), ...incoming.toolsUsed])
    ];
  }

  if (incoming.topicsDiscussed?.length) {
    merged.topicsDiscussed = [
      ...new Set([...(merged.topicsDiscussed || []), ...incoming.topicsDiscussed])
    ];
  }

  // Append to searches array
  if (incoming.searches?.length) {
    merged.searches = [...(merged.searches || []), ...incoming.searches];
  }

  // Append to viewedListings (dedupe by listingId)
  if (incoming.viewedListings?.length) {
    const existingIds = new Set((merged.viewedListings || []).map(l => l.listingId));
    const newListings = incoming.viewedListings.filter(l => !existingIds.has(l.listingId));
    merged.viewedListings = [...(merged.viewedListings || []), ...newListings];
  }

  return merged;
}

/**
 * Extract crmData from a tool result
 * Different tools return data in different formats
 */
export function extractCrmDataFromToolResult(
  toolName: string,
  result: Record<string, unknown>
): Partial<ConversationCrmData> | null {
  if (!result || !result.success) return null;

  const crmData: Partial<ConversationCrmData> = {
    toolsUsed: [toolName],
  };

  switch (toolName) {
    case 'estimateMortgage': {
      const estimate = result.estimate as Record<string, unknown> | undefined;
      if (estimate) {
        crmData.mortgageEstimate = {
          maxHomePrice: estimate.maxHomePrice as number,
          downPayment: estimate.downPayment as number,
          monthlyPayment: estimate.monthlyPayment as number,
          annualIncome: estimate.annualIncome as number || 0,
          cmhcPremium: estimate.cmhcPremium as number | undefined,
          downPaymentPercent: estimate.downPaymentPercent as number | undefined,
        };
        crmData.topicsDiscussed = ['mortgage-affordability'];
        // Check if CMHC is required (down payment < 20%)
        if (estimate.cmhcPremium && (estimate.cmhcPremium as number) > 0) {
          crmData.topicsDiscussed.push('cmhc-insurance');
        }
      }
      break;
    }

    case 'getNeighborhoodInfo': {
      const city = result.city as string | undefined;
      const neighborhood = result.neighborhood as string | undefined;
      if (city) {
        crmData.preferredCity = city;
        crmData.topicsDiscussed = ['neighborhood-research'];
      }
      if (neighborhood) {
        crmData.preferredNeighborhoods = [neighborhood];
      }
      break;
    }

    case 'searchProperties': {
      const searchParams = result.searchParams as Record<string, unknown> | undefined;
      const listings = result.listings as Array<Record<string, unknown>> | undefined;

      if (searchParams) {
        crmData.searches = [{
          city: searchParams.city as string | undefined,
          minPrice: searchParams.minPrice as number | undefined,
          maxPrice: searchParams.maxPrice as number | undefined,
          bedrooms: searchParams.bedrooms as number | undefined,
          propertyType: searchParams.propertyType as string | undefined,
          resultCount: (result.total as number) || 0,
          timestamp: new Date().toISOString(),
        }];

        // Extract preferences from search
        if (searchParams.city) crmData.preferredCity = searchParams.city as string;
        if (searchParams.maxPrice) crmData.averagePrice = searchParams.maxPrice as number;
        if (searchParams.bedrooms) crmData.averageBeds = searchParams.bedrooms as number;
        if (searchParams.propertyType) crmData.propertyTypes = [searchParams.propertyType as string];
      }

      // Track viewed listings
      if (listings?.length) {
        crmData.viewedListings = listings.map(l => ({
          listingId: l.id as string,
          address: l.address as string,
          price: l.priceNumber as number,
        }));
      }

      crmData.topicsDiscussed = ['property-search'];
      break;
    }

    case 'answerFirstTimeBuyerQuestion': {
      crmData.firstTimeBuyer = true;
      crmData.topicsDiscussed = ['first-time-buyer'];
      break;
    }

    case 'capturePreferences': {
      const prefs = result.preferences as Record<string, unknown> | undefined;
      if (prefs) {
        if (prefs.leadType) crmData.leadType = prefs.leadType as ConversationCrmData['leadType'];
        if (prefs.timeline) crmData.timeline = prefs.timeline as string;
        if (prefs.preApproved) crmData.preApproved = prefs.preApproved as boolean;
        if (prefs.bedrooms) crmData.averageBeds = prefs.bedrooms as number;
        if (prefs.bathrooms) crmData.averageBaths = prefs.bathrooms as number;
        if (prefs.locations) crmData.preferredNeighborhoods = prefs.locations as string[];
        if (prefs.urgencyFactors) crmData.urgencyFactors = prefs.urgencyFactors as string[];

        const budget = prefs.budget as Record<string, unknown> | undefined;
        if (budget?.max) crmData.averagePrice = budget.max as number;
      }
      break;
    }

    case 'createContact': {
      // Store contact ID for future updates
      if (result.contactId) {
        crmData.contactId = result.contactId as string;
      }
      break;
    }

    case 'captureSeller': {
      crmData.leadType = 'seller';
      crmData.topicsDiscussed = ['selling'];
      break;
    }

    default:
      return null;
  }

  return crmData;
}

/**
 * Generate a conversation summary from accumulated data
 */
export function generateConversationSummary(data: ConversationCrmData): string {
  const parts: string[] = [];

  // Lead type and intent
  if (data.leadType === 'seller') {
    parts.push('Interested in selling');
  } else if (data.leadType === 'buyer' || data.mortgageEstimate || data.searches?.length) {
    parts.push('Looking to buy');
  }

  // Property preferences
  if (data.averageBeds || data.propertyTypes?.length) {
    const type = data.propertyTypes?.[0] || 'property';
    const beds = data.averageBeds ? `${data.averageBeds}BR` : '';
    parts.push(`${beds} ${type}`.trim());
  }

  // Location
  if (data.preferredCity) {
    parts.push(`in ${data.preferredCity}`);
  }
  if (data.preferredNeighborhoods?.length) {
    parts.push(`(${data.preferredNeighborhoods.slice(0, 2).join(', ')})`);
  }

  // Budget
  if (data.averagePrice) {
    parts.push(`budget ~$${(data.averagePrice / 1000).toFixed(0)}K`);
  }

  // Key flags
  const flags: string[] = [];
  if (data.firstTimeBuyer) flags.push('first-time buyer');
  if (data.preApproved) flags.push('pre-approved');
  if (data.mortgageEstimate?.cmhcPremium) flags.push('needs CMHC');
  if (data.urgencyFactors?.length) flags.push(data.urgencyFactors[0]);
  if (data.timeline) flags.push(`timeline: ${data.timeline}`);

  if (flags.length) {
    parts.push(`- ${flags.join(', ')}`);
  }

  return parts.join(' ') || 'General inquiry';
}
