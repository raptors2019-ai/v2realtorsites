"use client"

import { useState, useEffect } from 'react'
import { BUDGET_RANGES, TIMELINE_OPTIONS } from '@repo/types'
import { getAllCities } from '@repo/lib'

const STORAGE_KEY = 'newhomeshow_preferences'
const VISITED_KEY = 'newhomeshow_visited'

interface QuestionnairePreferences {
  budgetRange: string
  locations: string[]
  timeline: string
  timestamp: number
}

const cities = getAllCities().map(c => c.name)

export function QuestionnaireModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [budgetRange, setBudgetRange] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [timeline, setTimeline] = useState('')
  const [citySearch, setCitySearch] = useState('')

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  )

  useEffect(() => {
    const hasVisited = localStorage.getItem(VISITED_KEY)
    if (!hasVisited) {
      setIsOpen(true)
    }
  }, [])

  const toggleLocation = (city: string) => {
    setSelectedLocations(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    )
  }

  const handleSave = () => {
    const preferences: QuestionnairePreferences = {
      budgetRange,
      locations: selectedLocations,
      timeline,
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      localStorage.setItem(VISITED_KEY, new Date().toISOString())
      console.log('[questionnaire.save]', { preferences })
    } catch (error) {
      console.error('[questionnaire.save.error]', error)
    }

    setIsOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem(VISITED_KEY, new Date().toISOString())
    setIsOpen(false)
  }

  const canProceed = () => {
    if (step === 1) return budgetRange !== ''
    if (step === 2) return selectedLocations.length > 0
    if (step === 3) return timeline !== ''
    return false
  }

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3)
    } else {
      handleSave()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-secondary rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-secondary dark:text-white">
              {step === 1 && "What's your budget?"}
              {step === 2 && "Where are you looking?"}
              {step === 3 && "When are you looking to buy?"}
            </h2>
            <button
              onClick={handleSkip}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-muted dark:text-gray-400">
            Help us personalize your experience ({step}/3)
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Step 1: Budget */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-2">
              {BUDGET_RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => setBudgetRange(range.value)}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                    budgetRange === range.value
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 text-secondary dark:text-gray-300'
                  }`}
                >
                  <span className="text-base">{range.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div>
              {/* Search */}
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
                  placeholder="Search cities..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-secondary-light rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
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

              {/* Selected count */}
              {selectedLocations.length > 0 && (
                <p className="text-xs text-primary font-medium mb-2">
                  {selectedLocations.length} selected: {selectedLocations.join(', ')}
                </p>
              )}

              {/* Cities grid */}
              <div className="overflow-y-auto pr-1" style={{ maxHeight: '220px' }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredCities.map(city => (
                    <button
                      key={city}
                      onClick={() => toggleLocation(city)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedLocations.includes(city)
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-50 dark:bg-secondary-light border border-gray-200 dark:border-gray-600 text-secondary dark:text-gray-300 hover:border-primary'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                {filteredCities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No cities match &quot;{citySearch}&quot;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Timeline */}
          {step === 3 && (
            <div className="grid grid-cols-1 gap-2">
              {TIMELINE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeline(option.value)}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                    timeline === option.value
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 text-secondary dark:text-gray-300'
                  }`}
                >
                  <span className="text-base">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="text-sm text-text-muted dark:text-gray-400 hover:text-secondary dark:hover:text-white transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="text-sm text-text-muted dark:text-gray-400 hover:text-secondary dark:hover:text-white transition-colors"
              >
                Skip
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              canProceed()
                ? 'bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
