'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  image: string | null
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
  image,
  onClick,
  className,
}: ChatPropertyCardProps) {
  return (
    <Link
      href={`/properties/${id}`}
      onClick={onClick}
      className={cn(
        'block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 border border-stone-100',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-28 bg-stone-100">
        {image ? (
          <Image
            src={image}
            alt={address}
            fill
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        {/* Property type badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[10px] font-medium text-stone-600 capitalize">
          {propertyType.toLowerCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Price */}
        <p className="text-base font-bold text-[#0a1628]">{price}</p>

        {/* Address */}
        <p className="text-xs text-stone-600 truncate mt-0.5">{address}</p>
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

      {/* View all link */}
      {viewAllUrl && listings.length > 0 && (
        <Link
          href={viewAllUrl}
          className="block text-center py-2 text-sm font-medium text-[#c9a962] hover:text-[#b89952] transition-colors"
        >
          View all {listings.length > 3 ? `${listings.length}+` : ''} properties →
        </Link>
      )}
    </div>
  )
}
