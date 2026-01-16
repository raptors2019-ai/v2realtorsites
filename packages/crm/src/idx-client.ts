import type { IDXListing, IDXSearchParams, IDXSearchResponse, IDXMedia } from '@repo/types'
import { LEASE_PRICE_THRESHOLD } from '@repo/lib'

/**
 * Retry configuration for API calls
 */
interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

/**
 * Check if an error is retryable (network errors, timeouts, 5xx server errors)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    // Network errors
    if (message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('etimedout') ||
        message.includes('fetch failed') ||
        message.includes('network') ||
        message.includes('socket')) {
      return true
    }
  }
  return false
}

/**
 * Check if HTTP status code is retryable (5xx server errors, 429 rate limit)
 */
function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * 0.3 * exponentialDelay // Add up to 30% jitter
  return Math.min(exponentialDelay + jitter, config.maxDelayMs)
}

/**
 * Property type mapping from frontend values to TRREB/Ampre API PropertySubType values
 * These are the actual values observed in production from the IDX API
 */
const PROPERTY_SUBTYPE_MAP: Record<string, string> = {
  // Lowercase keys for case-insensitive matching
  'detached': 'Detached',
  'semi-detached': 'Semi-Detached',
  'townhouse': 'Att/Row/Twnhouse',
  'condo': 'Condo Apartment',
  // Also support capitalized versions from chatbot tool
  'Detached': 'Detached',
  'Semi-Detached': 'Semi-Detached',
  'Townhouse': 'Att/Row/Twnhouse',
  'Condo': 'Condo Apartment',
  // Legacy values (backwards compatibility)
  'Residential': 'Detached', // Default residential to detached
}

/**
 * IDX API Client for MLS property search via TRREB/Ampre
 * Uses OData API at query.ampre.ca
 */
export class IDXClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.IDX_API_KEY || ''
    // TRREB/Ampre OData API endpoint
    this.baseUrl = baseUrl || process.env.IDX_API_URL || 'https://query.ampre.ca/odata'
  }

  /**
   * Check if API is configured
   */
  get isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Fetch with automatic retry and exponential backoff
   * Handles network errors (ECONNRESET, etc.) and 5xx server errors
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<Response> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options)

        // If response is OK or a non-retryable error (4xx), return it
        if (response.ok || !isRetryableStatus(response.status)) {
          return response
        }

        // Retryable HTTP error (5xx, 429)
        if (attempt < config.maxRetries) {
          const delay = calculateBackoff(attempt, config)
          console.log(`[idx.client.retry] HTTP ${response.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${config.maxRetries})`)
          await sleep(delay)
          continue
        }

        // Max retries reached
        return response
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Check if error is retryable
        if (isRetryableError(error) && attempt < config.maxRetries) {
          const delay = calculateBackoff(attempt, config)
          console.log(`[idx.client.retry] ${lastError.message}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${config.maxRetries})`)
          await sleep(delay)
          continue
        }

        // Non-retryable error or max retries reached
        throw lastError
      }
    }

    // Should not reach here, but throw last error if it does
    throw lastError || new Error('Unknown fetch error')
  }

  /**
   * Build OData filter string from search params
   */
  private buildFilter(params: IDXSearchParams): string {
    const filters: string[] = []

    // Listing type filter (sale vs lease based on price threshold)
    if (params.listingType === 'sale') {
      filters.push(`ListPrice ge ${LEASE_PRICE_THRESHOLD}`)
    } else if (params.listingType === 'lease') {
      filters.push(`ListPrice lt ${LEASE_PRICE_THRESHOLD}`)
    }

    // Support multiple cities with OR condition
    // Use startswith for city matching since IDX API uses zone codes (e.g., "Toronto C01", "Toronto W02")
    if (params.cities && params.cities.length > 0) {
      const cityFilters = params.cities.map(city => `startswith(City,'${city}')`).join(' or ')
      filters.push(`(${cityFilters})`)
    } else if (params.city) {
      filters.push(`startswith(City,'${params.city}')`)
    }

    if (params.minPrice) {
      filters.push(`ListPrice ge ${params.minPrice}`)
    }
    if (params.maxPrice) {
      filters.push(`ListPrice le ${params.maxPrice}`)
    }
    if (params.bedrooms) {
      filters.push(`BedroomsTotal ge ${params.bedrooms}`)
    }
    if (params.bathrooms) {
      filters.push(`BathroomsTotalInteger ge ${params.bathrooms}`)
    }

    // Property class filter (residential vs commercial)
    if (params.propertyClass === 'residential') {
      // Residential includes: Residential Freehold and Residential Condo & Other
      filters.push(`(PropertyType eq 'Residential Freehold' or PropertyType eq 'Residential Condo & Other')`)
    } else if (params.propertyClass === 'commercial') {
      // Commercial
      filters.push(`PropertyType eq 'Commercial'`)
    }

    // Property type filter - support multiple types with OR condition
    // Uses PropertySubType field consistently for specific dwelling types
    if (params.propertyTypes && params.propertyTypes.length > 0) {
      const typeFilters = params.propertyTypes
        .filter(t => t && t !== 'all')
        .map(type => {
          const mappedType = PROPERTY_SUBTYPE_MAP[type] || PROPERTY_SUBTYPE_MAP[type.toLowerCase()] || type
          return `PropertySubType eq '${mappedType}'`
        })
      if (typeFilters.length > 0) {
        filters.push(`(${typeFilters.join(' or ')})`)
      }
    } else if (params.propertyType && params.propertyType !== 'all') {
      // Single property type - also use PropertySubType for consistency
      const mappedType = PROPERTY_SUBTYPE_MAP[params.propertyType] || PROPERTY_SUBTYPE_MAP[params.propertyType.toLowerCase()] || params.propertyType
      filters.push(`PropertySubType eq '${mappedType}'`)
    }
    if (params.status && params.status !== 'all') {
      filters.push(`StandardStatus eq '${params.status}'`)
    } else {
      filters.push(`StandardStatus eq 'Active'`) // Default to active
    }

    // Advanced filters

    // Keywords search in PublicRemarks using OData contains function
    if (params.keywords) {
      // Escape single quotes in search term for OData
      const escapedKeywords = params.keywords.replace(/'/g, "''")
      filters.push(`contains(PublicRemarks,'${escapedKeywords}')`)
    }

    // Square footage (LivingArea) range
    if (params.minSqft) {
      filters.push(`LivingArea ge ${params.minSqft}`)
    }
    if (params.maxSqft) {
      filters.push(`LivingArea le ${params.maxSqft}`)
    }

    // Lot size (LotSizeArea) range
    if (params.minLotSize) {
      filters.push(`LotSizeArea ge ${params.minLotSize}`)
    }
    if (params.maxLotSize) {
      filters.push(`LotSizeArea le ${params.maxLotSize}`)
    }

    // Days on market filter
    if (params.maxDaysOnMarket) {
      filters.push(`DaysOnMarket le ${params.maxDaysOnMarket}`)
    }

    return filters.join(' and ')
  }

  /**
   * Search listings from IDX API (TRREB/Ampre)
   * Returns empty array with error if API is not configured or fails
   * NO MOCK DATA - we want real data only
   */
  async searchListings(params: IDXSearchParams = {}): Promise<IDXSearchResponse> {
    if (!this.apiKey) {
      console.error('[idx.client.error] IDX_API_KEY not configured')
      return {
        success: false,
        listings: [],
        total: 0,
        error: 'IDX API key not configured. Please check your environment variables.',
      }
    }

    try {
      const filter = this.buildFilter(params)
      const queryParts: string[] = []

      if (filter) queryParts.push(`$filter=${encodeURIComponent(filter)}`)
      queryParts.push(`$top=${params.limit || 50}`)
      if (params.offset) queryParts.push(`$skip=${params.offset}`)
      queryParts.push('$orderby=ModificationTimestamp desc')
      queryParts.push('$count=true')

      const url = `${this.baseUrl}/Property?${queryParts.join('&')}`

      console.log('[idx.client.searchListings] Requesting:', url)

      const response = await this.fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[idx.client.searchListings.failed]', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })

        return {
          success: false,
          listings: [],
          total: 0,
          error: `IDX API error: ${response.status} ${response.statusText}`,
        }
      }

      const data = await response.json() as { value: IDXListing[]; '@odata.count'?: number }

      // Debug: Log unique cities from results
      if (data.value && data.value.length > 0) {
        const cities = new Set(data.value.map(l => l.City).filter(Boolean))
        console.log('[idx.client.searchListings.cities]', Array.from(cities).slice(0, 10))
      }

      console.log('[idx.client.searchListings.success]', {
        count: data.value?.length || 0,
        total: data['@odata.count'],
      })

      return {
        success: true,
        listings: data.value || [],
        total: data['@odata.count'] || data.value?.length || 0,
      }
    } catch (error) {
      console.error('[idx.client.searchListings.error]', error)
      return {
        success: false,
        listings: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Failed to connect to IDX API',
      }
    }
  }

  /**
   * Fetch media for multiple listings in a single API call
   * Returns a map of ListingKey -> Media array for easy lookup
   */
  async fetchMediaForListings(listingKeys: string[]): Promise<Map<string, IDXMedia[]>> {
    const mediaMap = new Map<string, IDXMedia[]>()

    if (!this.apiKey || listingKeys.length === 0) {
      return mediaMap
    }

    try {
      // Build filter for multiple listing keys
      // OData doesn't support 'in' operator universally, so we use 'or' conditions
      // Limit to batches to avoid URL length issues
      const batchSize = 20
      const batches: string[][] = []

      for (let i = 0; i < listingKeys.length; i += batchSize) {
        batches.push(listingKeys.slice(i, i + batchSize))
      }

      for (const batch of batches) {
        const keyFilters = batch.map(key => `ResourceRecordKey eq '${key}'`).join(' or ')
        const filter = `ResourceName eq 'Property' and (${keyFilters})`

        const queryParts = [
          `$filter=${encodeURIComponent(filter)}`,
          '$orderby=Order',
          '$top=500', // Get up to 500 media items per batch
        ]

        const url = `${this.baseUrl}/Media?${queryParts.join('&')}`

        console.log('[idx.client.fetchMedia] Requesting media for', batch.length, 'listings')

        const response = await this.fetchWithRetry(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[idx.client.fetchMedia.failed]', {
            status: response.status,
            error: errorText,
          })
          continue // Continue with other batches
        }

        const data = await response.json() as { value: IDXMedia[] }

        // Group media by ResourceRecordKey (ListingKey)
        for (const media of data.value || []) {
          const key = media.ResourceRecordKey
          if (key) {
            const existing = mediaMap.get(key) || []
            existing.push(media)
            mediaMap.set(key, existing)
          }
        }
      }

      console.log('[idx.client.fetchMedia.success]', {
        listingsWithMedia: mediaMap.size,
        totalMedia: Array.from(mediaMap.values()).reduce((sum, arr) => sum + arr.length, 0),
      })

      return mediaMap
    } catch (error) {
      console.error('[idx.client.fetchMedia.error]', error)
      return mediaMap
    }
  }

  /**
   * Get single listing by ID
   * Returns null if not found or API fails
   */
  async getListing(listingKey: string): Promise<IDXListing | null> {
    if (!this.apiKey) {
      console.error('[idx.client.error] IDX_API_KEY not configured')
      return null
    }

    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}/Property('${listingKey}')`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error('[idx.client.getListing.failed]', {
          status: response.status,
          listingKey,
        })
        return null
      }

      return await response.json() as IDXListing
    } catch (error) {
      console.error('[idx.client.getListing.error]', error)
      return null
    }
  }
}

// Export singleton instance
export const idxClient = new IDXClient()
