'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '../lib/utils'
import { matchCity } from '@repo/lib'

// High-population GTA cities to show as chips (100k+ population)
// Full city list available via search using matchCity()
const TOP_GTA_CITIES = [
  { name: 'Toronto', slug: 'toronto' },
  { name: 'Mississauga', slug: 'mississauga' },
  { name: 'Brampton', slug: 'brampton' },
  { name: 'Hamilton', slug: 'hamilton' },
  { name: 'Vaughan', slug: 'vaughan' },
  { name: 'Markham', slug: 'markham' },
  { name: 'Oakville', slug: 'oakville' },
  { name: 'Burlington', slug: 'burlington' },
  { name: 'Richmond Hill', slug: 'richmond-hill' },
  { name: 'Oshawa', slug: 'oshawa' },
] as const

interface ChatNeighborhoodCityPickerProps {
  /** Callback when user selects a valid city */
  onCitySelect: (cityName: string) => void
  /** Optional class name for container */
  className?: string
}

export function ChatNeighborhoodCityPicker({
  onCitySelect,
  className,
}: ChatNeighborhoodCityPickerProps) {
  const [searchValue, setSearchValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCityClick = (cityName: string) => {
    setError(null)
    onCitySelect(cityName)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = searchValue.trim()
    if (!trimmed) return

    // Validate using city matcher
    const match = matchCity(trimmed)

    if (match.confidence === 'none') {
      setError(`"${trimmed}" isn't in our GTA coverage area. Try one of the cities above or type another GTA city.`)
      return
    }

    setError(null)
    onCitySelect(match.name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className={cn('space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      {/* City chips */}
      <div className="flex flex-wrap gap-2">
        {TOP_GTA_CITIES.map((city, index) => (
          <button
            key={city.slug}
            onClick={() => handleCityClick(city.name)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white hover:border-[#c9a962] hover:bg-white/20 transition-all duration-200 animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Or type a city name..."
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm',
              'bg-white/10 border text-white placeholder:text-white/50',
              'focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50',
              'transition-colors',
              error ? 'border-red-400/50' : 'border-white/20 focus:border-[#c9a962]/50'
            )}
          />
          <button
            type="submit"
            disabled={!searchValue.trim()}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              searchValue.trim()
                ? 'bg-[#c9a962] hover:bg-[#d4b872] text-[#0a1628]'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}
