'use client'

import Link from 'next/link'
import { cn } from '../lib/utils'

interface ChatPropertyCardProps {
  id: string
  price: string
  address: string
  city: string
  bedrooms: number
  bathrooms: number
  sqft: number
  propertyType: string
  image?: string | null
  onClick?: () => void
  className?: string
}

export function ChatPropertyCard({
  id,
  price,
  address,
  city,
  bedrooms,
  bathrooms,
  sqft,
  propertyType,
  onClick,
  className,
}: ChatPropertyCardProps) {
  // Build URL with city slug
  const citySlug = city.toLowerCase().replace(/\s+/g, '-')
  const propertyUrl = `/properties/${citySlug}/${id}`

  return (
    <Link
      href={propertyUrl}
      onClick={onClick}
      className={cn(
        'block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 border border-stone-100',
        className
      )}
    >
      {/* Styled placeholder with SC branding - no image loading for fast performance */}
      <div className="relative h-20 bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] flex items-center justify-center">
        {/* Centered SC logo */}
        <div className="w-10 h-10 rounded-full bg-[#c9a962] flex items-center justify-center">
          <span className="text-sm font-bold text-[#0a1628]">SC</span>
        </div>
        {/* House icon - top right */}
        <div className="absolute top-2 right-2">
          <svg className="w-5 h-5 text-[#c9a962]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        {/* Property type badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[10px] font-medium text-stone-600 capitalize">
          {propertyType.toLowerCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Price and View button row */}
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[#0a1628]">{price}</p>
          <span className="px-3 py-1 bg-[#0a1628] text-white text-xs font-medium rounded-full hover:bg-[#1a2d4d] transition-colors">
            View
          </span>
        </div>

        {/* Address */}
        <p className="text-xs text-stone-600 truncate mt-1">{address}</p>
        <p className="text-xs text-stone-500">{city}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
          <span>{bedrooms} bed</span>
          <span>{bathrooms} bath</span>
          {sqft > 0 && <span>{sqft.toLocaleString()} sqft</span>}
        </div>
      </div>
    </Link>
  )
}

interface ChatPropertyListProps {
  listings: ChatPropertyCardProps[]
  viewAllUrl?: string
  total?: number
  onPropertyClick?: (id: string) => void
}

export function ChatPropertyList({ listings, viewAllUrl, onPropertyClick }: ChatPropertyListProps) {
  if (listings.length === 0) return null

  return (
    <div className="space-y-2 mt-2">
      {/* Property cards */}
      <div className="grid gap-2">
        {listings.slice(0, 3).map((listing) => (
          <ChatPropertyCard
            key={listing.id}
            {...listing}
            onClick={() => onPropertyClick?.(listing.id)}
          />
        ))}
      </div>

      {/* View more link */}
      {viewAllUrl && (
        <Link
          href={viewAllUrl}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#c9a962] to-[#d4b978] text-[#0a1628] rounded-xl font-semibold text-sm hover:from-[#d4b978] hover:to-[#c9a962] transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <span>View more properties</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      )}
    </div>
  )
}
