'use client'

import { useMemo } from 'react'
import type { UserPreferences, ViewedProperty } from '../chatbot-store'

export interface StoredContext {
  contact?: {
    name?: string
    phone?: string | null
    email?: string | null
  }
  preferences?: {
    budget?: { min?: number; max?: number }
    propertyType?: string
    bedrooms?: number
    locations?: string[]
    timeline?: string
  }
  viewedProperties?: Array<{
    listingId: string
    address: string
    price: number
  }>
  lastVisit?: string
}

interface UseStoredContextOptions {
  isHydrated: boolean
  preferences: UserPreferences
  viewedProperties: ViewedProperty[]
  phone: string | null
  email: string | null
}

export function useStoredContext({
  isHydrated,
  preferences,
  viewedProperties,
  phone,
  email,
}: UseStoredContextOptions): StoredContext | null {
  return useMemo((): StoredContext | null => {
    if (!isHydrated) return null

    const hasContactInfo = preferences.firstName && phone
    const hasPreferences = preferences.propertyType || preferences.budget || preferences.locations?.length

    if (!hasContactInfo && !hasPreferences && viewedProperties.length === 0) {
      return null
    }

    return {
      contact: hasContactInfo ? {
        name: preferences.firstName,
        phone,
        email,
      } : undefined,
      preferences: hasPreferences ? {
        budget: preferences.budget,
        propertyType: preferences.propertyType,
        bedrooms: preferences.bedrooms,
        locations: preferences.locations,
        timeline: preferences.timeline,
      } : undefined,
      viewedProperties: viewedProperties.slice(-5).map(p => ({
        listingId: p.listingId,
        address: p.address,
        price: p.price,
      })),
      lastVisit: preferences.capturedAt,
    }
  }, [isHydrated, preferences, viewedProperties, phone, email])
}
