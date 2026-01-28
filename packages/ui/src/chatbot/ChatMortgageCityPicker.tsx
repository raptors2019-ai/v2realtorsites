'use client'

import { cn } from '../lib/utils'

// Top 10 GTA cities with their slugs
const GTA_CITIES = [
  { name: 'Toronto', slug: 'toronto' },
  { name: 'Mississauga', slug: 'mississauga' },
  { name: 'Brampton', slug: 'brampton' },
  { name: 'Vaughan', slug: 'vaughan' },
  { name: 'Markham', slug: 'markham' },
  { name: 'Richmond Hill', slug: 'richmond-hill' },
  { name: 'Oakville', slug: 'oakville' },
  { name: 'Burlington', slug: 'burlington' },
  { name: 'Milton', slug: 'milton' },
  { name: 'Hamilton', slug: 'hamilton' },
] as const

interface ChatMortgageCityPickerProps {
  /** Maximum home price from mortgage calculation */
  maxPrice: number
  /** Callback when user selects a specific city */
  onCitySelect: (citySlug: string, cityName: string, maxPrice: number) => void
  /** Callback when user clicks "Search All GTA" */
  onSearchAll: (maxPrice: number) => void
  /** Optional class name for container */
  className?: string
}

export function ChatMortgageCityPicker({
  maxPrice,
  onCitySelect,
  onSearchAll,
  className,
}: ChatMortgageCityPickerProps) {
  return (
    <div className={cn('space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      <div className="text-center">
        <p className="text-xs text-white/70 font-medium">Where do you want to search?</p>
      </div>

      {/* City chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {GTA_CITIES.map((city, index) => (
          <button
            key={city.slug}
            onClick={() => onCitySelect(city.slug, city.name, maxPrice)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white hover:border-[#c9a962] hover:bg-white/20 transition-all duration-200 animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Search All GTA button */}
      <button
        onClick={() => onSearchAll(maxPrice)}
        className="w-full py-3 bg-[#c9a962] hover:bg-[#d4b872] text-[#0a1628] font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search All GTA
      </button>
    </div>
  )
}
