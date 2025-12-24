'use client'

import { useEffect } from 'react'
import { trackPropertyView } from '../real-estate-events'

interface PropertyDetailTrackerProps {
  property: {
    id: string
    price: number
    address: string
    propertyType: string
    city?: string
    listingType?: string
    bedrooms?: number
    bathrooms?: number
    sqft?: number
  }
}

/**
 * Client component that tracks property detail page views.
 * Place this inside a property detail page to track view_item events.
 *
 * @example
 * ```tsx
 * <PropertyDetailTracker property={{
 *   id: property.id,
 *   price: property.price,
 *   address: property.address,
 *   propertyType: property.propertyType,
 *   city: property.city,
 *   bedrooms: property.bedrooms,
 *   bathrooms: property.bathrooms,
 *   sqft: property.sqft,
 * }} />
 * ```
 */
export function PropertyDetailTracker({ property }: PropertyDetailTrackerProps) {
  useEffect(() => {
    trackPropertyView({
      id: property.id,
      price: property.price,
      address: property.address,
      type: property.propertyType,
      city: property.city,
      listingType: property.listingType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.sqft,
    })
  }, [property.id, property.price, property.address, property.propertyType, property.city, property.listingType, property.bedrooms, property.bathrooms, property.sqft])

  return null
}
