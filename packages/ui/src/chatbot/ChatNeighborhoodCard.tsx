'use client'

import { cn } from '../lib/utils'
import { UnlockFormInline } from './UnlockFormInline'
import { useCardUnlock } from './hooks'
import type { NeighborhoodInfo } from './chatbot-store'

interface ChatNeighborhoodCardProps extends NeighborhoodInfo {
  className?: string
  /** Whether to show locked state with blur */
  isLocked?: boolean
  /** Callback when user unlocks with contact info */
  onUnlock?: (contact: { name: string; phone: string; email?: string }) => void
  /** Callback when user skips the unlock form */
  onSkip?: () => void
  /** Number of skips remaining (if 0, skip button is hidden) */
  remainingSkips?: number
  /** Callback when user clicks "Search Properties in {City}" button */
  onSearchProperties?: (city: string, maxPrice?: number) => void
  /** Callback when user clicks on a neighborhood chip */
  onNeighborhoodClick?: (neighborhood: string, city: string) => void
}


export function ChatNeighborhoodCard({
  city,
  avgPrice,
  vibe,
  priceRange: _priceRange,
  neighborhoods,
  transit,
  schools: _schools,
  topSchools,
  recreation,
  attractions,
  searchSuggestion,
  className,
  isLocked = false,
  onUnlock,
  onSkip,
  remainingSkips,
  onSearchProperties,
  onNeighborhoodClick,
}: ChatNeighborhoodCardProps) {
  const { unlocked, isFlipping, handleUnlock, handleSkip, flipStyles } = useCardUnlock({
    isLocked,
    onUnlock,
    onSkip,
  })

  const topNeighborhoods = neighborhoods?.slice(0, 4) || []
  const transitInfo = transit?.local || transit?.ttc || 'Local bus service'
  const commuteTime = transit?.commuteToUnion || 'N/A'
  const goStationsList = transit?.goStations || []
  const recreationList = recreation || []
  const attractionsList = attractions || []

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] rounded-2xl p-5 shadow-lg text-white space-y-4 transition-all duration-300',
        className
      )}
      style={flipStyles}
    >
      {/* Header - Always visible */}
      <div className="text-center pb-3 border-b border-white/10">
        <p className="text-xs text-[#c9a962] font-semibold uppercase tracking-wider mb-1">
          City Guide
        </p>
        <p className="text-2xl font-bold text-white">
          {city}
        </p>
        <p className="text-sm text-white/70 mt-1">{vibe}</p>
      </div>

      {/* Hook stats - Always visible */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs text-white/60 mb-1">Average Home Price</p>
          <p className="text-lg font-bold text-[#c9a962]">{avgPrice}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs text-white/60 mb-1">Commute to Union</p>
          <p className="text-lg font-bold">{commuteTime}</p>
        </div>
      </div>

      {/* Locked state - show teaser with unlock form */}
      {!unlocked && !isFlipping && (
        <UnlockFormInline
          title="Unlock Full City Guide"
          subtitle="See transit details, top schools, neighborhoods, recreation & more"
          buttonText="Unlock Guide"
          onSubmit={handleUnlock}
          onSkip={handleSkip}
          remainingSkips={remainingSkips}
          variant="dark"
          footerText="Get personalized neighborhood recommendations"
        />
      )}

      {/* Unlocked state - show all details */}
      {unlocked && (
        <>
          {/* Transit Section */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8m-8 4h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Transit</p>
            </div>
            <div className="space-y-2 text-sm">
              {goStationsList.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/80">GO Stations</span>
                  <span className="font-medium text-right max-w-[60%]">{goStationsList.slice(0, 3).join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/80">Local Transit</span>
                <span className="font-medium">{transitInfo}</span>
              </div>
            </div>
          </div>

          {/* Schools Section */}
          {(topSchools && topSchools.length > 0) && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Top Schools</p>
              </div>
              <p className="text-sm text-white/90">{topSchools.slice(0, 3).join(', ')}</p>
            </div>
          )}

          {/* Neighborhoods as chips */}
          {topNeighborhoods.length > 0 && (
            <div>
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-2">Popular Neighborhoods</p>
              <div className="flex flex-wrap gap-2">
                {topNeighborhoods.map((n) => (
                  <button
                    key={n.name}
                    onClick={() => onNeighborhoodClick?.(n.name, city)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-medium transition-colors"
                  >
                    {n.name} <span className="text-[#c9a962]">{n.avgPrice}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recreation & Attractions */}
          {(recreationList.length > 0 || attractionsList.length > 0) && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Recreation & Attractions</p>
              </div>
              <p className="text-sm text-white/90">
                {[...recreationList.slice(0, 2), ...attractionsList.slice(0, 2)].join(', ')}
              </p>
            </div>
          )}

          {/* Search Properties CTA */}
          {onSearchProperties && (
            <button
              onClick={() => onSearchProperties(city, searchSuggestion?.maxPrice)}
              className="w-full py-3 bg-[#c9a962] hover:bg-[#d4b872] text-[#0a1628] font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Properties in {city}
            </button>
          )}
        </>
      )}
    </div>
  )
}
