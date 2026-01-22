/**
 * Analytics types for GA4 e-commerce style tracking
 */

/**
 * Property item for GA4 events (view_item, view_item_list, select_item)
 * Follows GA4 e-commerce item structure with real estate extensions
 */
export interface PropertyItem {
  /** Property/MLS ID */
  item_id: string
  /** Full address or title */
  item_name: string
  /** Property type (condo, detached, townhouse, semi-detached) */
  item_category?: string
  /** Listing type (For Sale, For Lease) */
  item_category2?: string
  /** City */
  item_category3?: string
  /** Builder name (for new construction) */
  item_brand?: string
  /** Listing price */
  price: number
  /** Position in list (0-based) */
  index?: number
  /** Always 1 for real estate */
  quantity?: number
  // Custom parameters (configure as dimensions in GA4)
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  listing_status?: 'active' | 'pending' | 'sold'
}

/**
 * Property list information for view_item_list event
 */
export interface PropertyListInfo {
  /** List identifier (e.g., 'search_results', 'featured', 'similar') */
  list_id: string
  /** Human-readable list name (e.g., 'Toronto Condos') */
  list_name: string
}

/**
 * Form types for lead generation tracking
 */
export type FormType = 'contact' | 'vip' | 'valuation' | 'showing_request' | 'chatbot'

/**
 * Chatbot interaction types
 */
export type ChatbotAction = 'start' | 'message' | 'lead' | 'survey_start' | 'survey_complete' | 'contact_start' | 'property_search'

/**
 * Filter parameters for search tracking
 */
export interface PropertySearchFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string
  listingType?: 'sale' | 'lease'
}

/**
 * Social platform types for share tracking
 */
export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'copy_link'

/**
 * Content types that can be shared
 */
export type ShareContentType = 'property' | 'listing_page' | 'article' | 'homepage'

/**
 * Form names for form tracking
 */
export type FormName = 'contact' | 'chatbot_survey' | 'property_inquiry' | 'newsletter'
