/**
 * Bank of Canada Valet API integration for mortgage rates
 * @see https://www.bankofcanada.ca/valet/docs
 */

// Series codes for different rate types
export const BOC_SERIES = {
  CONVENTIONAL_5_YEAR: 'V121764',
  CONVENTIONAL_3_YEAR: 'V121763',
  CONVENTIONAL_1_YEAR: 'V121769',
  PRIME_RATE: 'V121796',
} as const

export type BocSeriesCode = (typeof BOC_SERIES)[keyof typeof BOC_SERIES]

interface BocObservation {
  d: string // date in YYYY-MM-DD format
  [key: string]: { v: string } | string
}

interface BocApiResponse {
  terms: {
    url: string
  }
  seriesDetail: {
    [key: string]: {
      label: string
      description: string
    }
  }
  observations: BocObservation[]
}

export interface MortgageRates {
  fiveYear: number
  threeYear: number
  oneYear: number
  primeRate: number
  asOf: string
  source: 'bank-of-canada'
  nextUpdateExpected: string
}

// In-memory cache - invalidates after next Wednesday
let cachedRates: MortgageRates | null = null
let cacheLastWednesday: string | null = null

/**
 * Get the most recent Wednesday (BoC update day) at or before a given date
 */
function getLastWednesday(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0) // Normalize to noon to avoid timezone issues
  const dayOfWeek = d.getDay()
  // Wednesday is 3, so calculate days to subtract
  const daysToSubtract = dayOfWeek >= 3 ? dayOfWeek - 3 : dayOfWeek + 4
  d.setDate(d.getDate() - daysToSubtract)
  return d
}

/**
 * Get the next Wednesday after a given date
 */
function getNextWednesday(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  const dayOfWeek = d.getDay()
  // Calculate days until next Wednesday
  const daysToAdd = dayOfWeek <= 3 ? 3 - dayOfWeek : 10 - dayOfWeek
  // If it's Wednesday, get next Wednesday
  if (daysToAdd === 0) {
    d.setDate(d.getDate() + 7)
  } else {
    d.setDate(d.getDate() + daysToAdd)
  }
  return d
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Check if the cache should be invalidated (a new Wednesday has passed)
 */
function shouldRefreshCache(): boolean {
  if (!cachedRates || !cacheLastWednesday) return true

  const currentLastWednesday = formatDateISO(getLastWednesday())
  return currentLastWednesday !== cacheLastWednesday
}

/**
 * Fetches the latest mortgage rates from Bank of Canada Valet API
 * Caches results until the next Wednesday (BoC weekly update day)
 */
export async function getMortgageRates(): Promise<MortgageRates | null> {
  // Return cached rates if we haven't passed a new Wednesday
  if (!shouldRefreshCache() && cachedRates) {
    return cachedRates
  }

  try {
    const seriesCodes = Object.values(BOC_SERIES).join(',')
    const url = `https://www.bankofcanada.ca/valet/observations/${seriesCodes}/json?recent=1`

    const response = await fetch(url)

    if (!response.ok) {
      console.error('[lib.boc.getMortgageRates] API error:', response.status)
      return cachedRates // Return stale cache if available
    }

    const data: BocApiResponse = await response.json()

    if (!data.observations || data.observations.length === 0) {
      console.error('[lib.boc.getMortgageRates] No observations in response')
      return cachedRates
    }

    const latest = data.observations[0]
    const nextWednesday = getNextWednesday()

    const rates: MortgageRates = {
      fiveYear: parseFloat((latest[BOC_SERIES.CONVENTIONAL_5_YEAR] as { v: string })?.v) || 6.09,
      threeYear: parseFloat((latest[BOC_SERIES.CONVENTIONAL_3_YEAR] as { v: string })?.v) || 5.89,
      oneYear: parseFloat((latest[BOC_SERIES.CONVENTIONAL_1_YEAR] as { v: string })?.v) || 6.79,
      primeRate: parseFloat((latest[BOC_SERIES.PRIME_RATE] as { v: string })?.v) || 5.45,
      asOf: latest.d,
      source: 'bank-of-canada',
      nextUpdateExpected: formatDateISO(nextWednesday),
    }

    // Update cache with the Wednesday we fetched on
    cachedRates = rates
    cacheLastWednesday = formatDateISO(getLastWednesday())

    console.log('[lib.boc.getMortgageRates] Fetched rates:', rates)
    return rates
  } catch (error) {
    console.error('[lib.boc.getMortgageRates] Fetch failed:', error)
    return cachedRates // Return stale cache on error
  }
}

/**
 * Get the default interest rate to use in calculators
 * Prefers live rate, falls back to hardcoded default
 */
export async function getDefaultInterestRate(): Promise<{
  rate: number
  isLive: boolean
  asOf: string | null
}> {
  const rates = await getMortgageRates()

  if (rates) {
    return {
      rate: rates.fiveYear,
      isLive: true,
      asOf: rates.asOf,
    }
  }

  // Fallback to hardcoded default
  return {
    rate: 4.5,
    isLive: false,
    asOf: null,
  }
}

/**
 * Format a date string from YYYY-MM-DD to a readable format
 */
export function formatRateDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00') // Add time to avoid timezone issues
  return date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
