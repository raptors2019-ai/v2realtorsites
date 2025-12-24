'use client'

import type { PropertyItem, PropertyListInfo, FormType, ChatbotAction, PropertySearchFilters } from './types'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Safe wrapper for gtag calls - never throws errors that break UI
 */
const safeTrack = (eventName: string, params: Record<string, unknown>) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[analytics.${eventName}] Failed:`, error)
    }
  }
}

/**
 * Track individual property detail page view (view_item event)
 */
export const trackPropertyView = (property: {
  id: string
  price: number
  address: string
  type: string
  city?: string
  listingType?: string
  bedrooms?: number
  bathrooms?: number
  sqft?: number
}) => {
  safeTrack('view_item', {
    currency: 'CAD',
    value: property.price,
    items: [{
      item_id: property.id,
      item_name: property.address,
      item_category: property.type,
      item_category2: property.listingType || 'For Sale',
      item_category3: property.city,
      price: property.price,
      quantity: 1,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_feet: property.sqft,
    }]
  })
}

/**
 * Track property listing page view (view_item_list event)
 * Call when properties grid loads or updates
 */
export const trackPropertyListView = (
  properties: PropertyItem[],
  listInfo: PropertyListInfo
) => {
  // GA4 limits items array to 200
  const items = properties.slice(0, 200)

  safeTrack('view_item_list', {
    item_list_id: listInfo.list_id,
    item_list_name: listInfo.list_name,
    items: items.map((p, index) => ({
      ...p,
      index: p.index ?? index,
      quantity: 1,
    }))
  })
}

/**
 * Track when user selects/clicks a property from a list (select_item event)
 */
export const trackPropertySelect = (
  property: PropertyItem,
  listInfo?: PropertyListInfo
) => {
  safeTrack('select_item', {
    item_list_id: listInfo?.list_id || 'property_list',
    item_list_name: listInfo?.list_name || 'Properties',
    items: [{
      ...property,
      quantity: 1,
    }]
  })
}

/**
 * Track property search/filter usage
 */
export const trackPropertySearch = (
  searchTerm: string,
  filters?: PropertySearchFilters
) => {
  safeTrack('search', {
    search_term: searchTerm,
    ...filters,
  })
}

/**
 * Track lead form submissions
 */
export const trackLeadFormSubmit = (
  formType: FormType,
  property?: PropertyItem
) => {
  const params: Record<string, unknown> = {
    currency: 'CAD',
    value: property?.price || 0,
    form_type: formType,
  }

  if (property) {
    params.items = [{
      ...property,
      quantity: 1,
    }]
  }

  safeTrack('generate_lead', params)
}

/**
 * Track chatbot interactions
 */
export const trackChatbotInteraction = (action: ChatbotAction) => {
  safeTrack('chatbot_interaction', {
    interaction_type: action,
  })
}

/**
 * Track phone number clicks (click-to-call)
 */
export const trackPhoneClick = (phoneNumber: string, context?: string) => {
  safeTrack('phone_click', {
    phone_number: phoneNumber,
    click_context: context || 'general',
  })
}

/**
 * Track email link clicks
 */
export const trackEmailClick = (email: string, context?: string) => {
  safeTrack('email_click', {
    email_address: email,
    click_context: context || 'general',
  })
}

/**
 * Track CTA button clicks
 */
export const trackCtaClick = (ctaName: string, location: string) => {
  safeTrack('cta_click', {
    cta_name: ctaName,
    cta_location: location,
  })
}

/**
 * Track property filter changes
 */
export const trackFilterChange = (filters: PropertySearchFilters) => {
  safeTrack('filter_properties', {
    ...filters,
  })
}
