"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllCities } from '@repo/lib'

interface SurveyState {
  listingType: 'sale' | 'lease'
  budgetRange: '0-500k' | '500k-1m' | '1m-2m' | '2m+'
  locations: string[]
}

// Get city names from shared city-matcher
const cities = getAllCities().map(c => c.name)

const STORAGE_KEY = 'propertyPreferences'

export function PropertySurvey() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isResetting = searchParams.get('reset') === 'true'

  // Set defaults: sale and 500k-1M (most common range)
  const [survey, setSurvey] = useState<SurveyState>({
    listingType: 'sale',
    budgetRange: '500k-1m',
    locations: []
  })
  const [citySearch, setCitySearch] = useState('')

  // Filter cities based on search input
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  )

  // Check for existing preferences on mount
  useEffect(() => {
    // Check if preferences exist in sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY)

    if (stored) {
      try {
        const preferences = JSON.parse(stored)

        // If user is resetting, load their previous selections but allow editing
        if (isResetting) {
          // Pre-populate the survey with their previous choices
          // Try new format first (with filters), fallback to old format (just survey)
          if (preferences.survey) {
            setSurvey(preferences.survey)
          } else if (preferences.filters) {
            // Convert filters back to survey format
            const surveyFromFilters = {
              listingType: preferences.filters.listingType?.[0] || 'sale',
              budgetRange: (() => {
                const max = preferences.filters.priceRange?.max || 1000000;
                if (max <= 500000) return '0-500k';
                if (max <= 1000000) return '500k-1m';
                if (max <= 2000000) return '1m-2m';
                return '2m+';
              })(),
              locations: preferences.filters.locations || [],
            };
            setSurvey(surveyFromFilters as SurveyState);
          }
          return // Don't auto-redirect, let them edit
        }

        // Auto-redirect to properties page with stored preferences
        router.push(preferences.url)
      } catch (error) {
        console.error('[survey.load.error]', error)
        sessionStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [router, isResetting])

  const toggleLocation = (city: string) => {
    setSurvey(prev => ({
      ...prev,
      locations: prev.locations.includes(city)
        ? prev.locations.filter(c => c !== city)
        : [...prev.locations, city]
    }))
  }

  const handleSubmit = () => {
    // Build query params
    const params = new URLSearchParams()
    params.set('listingType', survey.listingType)
    params.set('propertyClass', 'residential') // Default to residential

    // Map budget ranges to min/max prices
    switch (survey.budgetRange) {
      case '0-500k':
        params.set('budgetMin', '0')
        params.set('budgetMax', '500000')
        break
      case '500k-1m':
        params.set('budgetMin', '500000')
        params.set('budgetMax', '1000000')
        break
      case '1m-2m':
        params.set('budgetMin', '1000000')
        params.set('budgetMax', '2000000')
        break
      case '2m+':
        params.set('budgetMin', '2000000')
        params.set('budgetMax', '100000000')
        break
    }

    if (survey.locations.length > 0) params.set('cities', survey.locations.join(','))

    const url = `/properties?${params.toString()}`

    // Save preferences to sessionStorage
    try {
      const preferences = {
        survey,
        url,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      console.log('[survey.save]', { preferences })
    } catch (error) {
      console.error('[survey.save.error]', error)
    }

    // Navigate to results
    router.push(url)
  }

  // Only require city selection - defaults are set for listing type and budget
  const isValid = survey.locations.length > 0

  // Determine button text
  const getButtonText = () => {
    if (survey.locations.length === 0) return 'Please choose a city'
    return 'View Properties'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* Questions 1 & 2: Side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Question 1: Buy or Rent */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
            <h3 className="text-base font-semibold text-secondary mb-3">Are you looking to buy or rent?</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSurvey(prev => ({ ...prev, listingType: 'sale', budgetRange: '500k-1m' }))}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  survey.listingType === 'sale'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <svg className="w-6 h-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm">Buy</span>
              </button>

              <button
                onClick={() => setSurvey(prev => ({ ...prev, listingType: 'lease', budgetRange: '0-500k' }))}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  survey.listingType === 'lease'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <svg className="w-6 h-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-sm">Rent</span>
              </button>
            </div>
          </div>

          {/* Question 2: Budget */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
            <h3 className="text-base font-semibold text-secondary mb-1">What's your budget?</h3>
            <p className="text-xs text-gray-500 mb-3">Just a starting point</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSurvey(prev => ({ ...prev, budgetRange: '0-500k' }))}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  survey.budgetRange === '0-500k'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <span className="text-sm">$0-500K</span>
              </button>

              <button
                onClick={() => setSurvey(prev => ({ ...prev, budgetRange: '500k-1m' }))}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  survey.budgetRange === '500k-1m'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <span className="text-sm">$500K-1M</span>
              </button>

              <button
                onClick={() => setSurvey(prev => ({ ...prev, budgetRange: '1m-2m' }))}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  survey.budgetRange === '1m-2m'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <span className="text-sm">$1M-2M</span>
              </button>

              <button
                onClick={() => setSurvey(prev => ({ ...prev, budgetRange: '2m+' }))}
                className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                  survey.budgetRange === '2m+'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <span className="text-sm">$2M+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Question 3: Location */}
        <div className="bg-white rounded-xl border-2 border-gray-100 p-5">
          <h3 className="text-base font-semibold text-secondary mb-3">Which areas interest you? (Select one or more)</h3>

          {/* Search input */}
          <div className="relative mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Filter cities..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
            {citySearch && (
              <button
                onClick={() => setCitySearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Selected cities count */}
          {survey.locations.length > 0 && (
            <p className="text-xs text-primary font-medium mb-2">
              {survey.locations.length} selected: {survey.locations.join(', ')}
            </p>
          )}

          {/* Scrollable cities grid */}
          <div
            className="overflow-y-auto pr-2"
            style={{ maxHeight: '180px' }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {filteredCities.map(city => (
                <button
                  key={city}
                  onClick={() => toggleLocation(city)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    survey.locations.includes(city)
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white border-2 border-gray-200 text-secondary hover:border-primary'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
            {filteredCities.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No cities match "{citySearch}"
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-300 ${
            isValid
              ? 'bg-primary text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}
