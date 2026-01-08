/**
 * Unit tests for IDXClient OData filter building
 * Tests the advanced filters: keywords, sqft, lot size, days on market
 */

import { IDXClient } from '../idx-client'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Suppress console logs during tests
const originalConsoleLog = console.log
const originalConsoleError = console.error
beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
})
afterAll(() => {
  console.log = originalConsoleLog
  console.error = originalConsoleError
})

beforeEach(() => {
  jest.clearAllMocks()
  // Default successful response
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ value: [], '@odata.count': 0 }),
  })
})

describe('IDXClient', () => {
  describe('configuration', () => {
    it('should report not configured when no API key', () => {
      const client = new IDXClient('')
      expect(client.isConfigured).toBe(false)
    })

    it('should report configured when API key is provided', () => {
      const client = new IDXClient('test-api-key')
      expect(client.isConfigured).toBe(true)
    })
  })

  describe('searchListings - basic filters', () => {
    it('should build city filter using startswith', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ city: 'Toronto' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("startswith(City,'Toronto')"))
    })

    it('should build multiple cities filter with OR condition', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ cities: ['Toronto', 'Mississauga'] })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("startswith(City,'Toronto')"))
      expect(url).toContain(encodeURIComponent("startswith(City,'Mississauga')"))
      expect(url).toContain(encodeURIComponent(' or '))
    })

    it('should build price range filters', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ minPrice: 500000, maxPrice: 1000000 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('ListPrice ge 500000'))
      expect(url).toContain(encodeURIComponent('ListPrice le 1000000'))
    })

    it('should build bedrooms filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ bedrooms: 3 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('BedroomsTotal ge 3'))
    })

    it('should build bathrooms filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ bathrooms: 2 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('BathroomsTotalInteger ge 2'))
    })

    it('should build listing type filter for sale', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ listingType: 'sale' })

      const url = mockFetch.mock.calls[0][0] as string
      // Sale = ListPrice >= 10000
      expect(url).toContain(encodeURIComponent('ListPrice ge 10000'))
    })

    it('should build listing type filter for lease', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ listingType: 'lease' })

      const url = mockFetch.mock.calls[0][0] as string
      // Lease = ListPrice < 10000
      expect(url).toContain(encodeURIComponent('ListPrice lt 10000'))
    })
  })

  describe('searchListings - property type filters', () => {
    it('should map detached to correct PropertySubType', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ propertyType: 'detached' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("PropertySubType eq 'Detached'"))
    })

    it('should map townhouse to Att/Row/Twnhouse', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ propertyType: 'townhouse' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("PropertySubType eq 'Att/Row/Twnhouse'"))
    })

    it('should map condo to Condo Apartment', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ propertyType: 'condo' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("PropertySubType eq 'Condo Apartment'"))
    })

    it('should handle multiple property types with OR', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ propertyTypes: ['detached', 'condo'] })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("PropertySubType eq 'Detached'"))
      expect(url).toContain(encodeURIComponent("PropertySubType eq 'Condo Apartment'"))
      expect(url).toContain(encodeURIComponent(' or '))
    })

    it('should handle residential property class filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ propertyClass: 'residential' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("PropertyType eq 'Residential Freehold'"))
      expect(url).toContain(encodeURIComponent("PropertyType eq 'Residential Condo & Other'"))
    })

    it('should handle commercial property class filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ propertyClass: 'commercial' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("PropertyType eq 'Commercial'"))
    })
  })

  describe('searchListings - advanced filters (keywords)', () => {
    it('should build keywords filter using OData contains function', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ keywords: 'pool' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("contains(PublicRemarks,'pool')"))
    })

    it('should escape single quotes in keywords for OData', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ keywords: "builder's" })

      const url = mockFetch.mock.calls[0][0] as string
      // Single quote should be escaped as '' for OData
      expect(url).toContain(encodeURIComponent("contains(PublicRemarks,'builder''s')"))
    })

    it('should handle multiple words in keywords', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ keywords: 'heated pool' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("contains(PublicRemarks,'heated pool')"))
    })

    it('should handle special characters in keywords', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ keywords: '3-car garage' })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("contains(PublicRemarks,'3-car garage')"))
    })
  })

  describe('searchListings - advanced filters (square footage)', () => {
    it('should build minimum sqft filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ minSqft: 1500 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('LivingArea ge 1500'))
    })

    it('should build maximum sqft filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ maxSqft: 3000 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('LivingArea le 3000'))
    })

    it('should build sqft range filter with both min and max', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ minSqft: 1500, maxSqft: 3000 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('LivingArea ge 1500'))
      expect(url).toContain(encodeURIComponent('LivingArea le 3000'))
    })

    it('should handle zero as minimum sqft', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ minSqft: 0 })

      const url = mockFetch.mock.calls[0][0] as string
      // 0 is falsy, so it should not add a filter
      expect(url).not.toContain('LivingArea ge 0')
    })
  })

  describe('searchListings - advanced filters (lot size)', () => {
    it('should build minimum lot size filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ minLotSize: 5000 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('LotSizeArea ge 5000'))
    })

    it('should build maximum lot size filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ maxLotSize: 20000 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('LotSizeArea le 20000'))
    })

    it('should build lot size range filter', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ minLotSize: 5000, maxLotSize: 20000 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('LotSizeArea ge 5000'))
      expect(url).toContain(encodeURIComponent('LotSizeArea le 20000'))
    })
  })

  describe('searchListings - advanced filters (days on market)', () => {
    it('should build days on market filter for 7 days', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ maxDaysOnMarket: 7 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('DaysOnMarket le 7'))
    })

    it('should build days on market filter for 30 days', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ maxDaysOnMarket: 30 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('DaysOnMarket le 30'))
    })

    it('should build days on market filter for 90 days', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ maxDaysOnMarket: 90 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent('DaysOnMarket le 90'))
    })
  })

  describe('searchListings - combined filters', () => {
    it('should combine multiple advanced filters with AND', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({
        city: 'Toronto',
        keywords: 'pool',
        minSqft: 2000,
        maxDaysOnMarket: 30,
      })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(encodeURIComponent("startswith(City,'Toronto')"))
      expect(url).toContain(encodeURIComponent("contains(PublicRemarks,'pool')"))
      expect(url).toContain(encodeURIComponent('LivingArea ge 2000'))
      expect(url).toContain(encodeURIComponent('DaysOnMarket le 30'))
      // All filters should be connected with 'and'
      expect(url).toContain(encodeURIComponent(' and '))
    })

    it('should handle complex query with all filter types', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({
        cities: ['Toronto', 'Mississauga'],
        listingType: 'sale',
        propertyTypes: ['detached', 'semi-detached'],
        minPrice: 500000,
        maxPrice: 1500000,
        bedrooms: 3,
        bathrooms: 2,
        keywords: 'renovated',
        minSqft: 1500,
        maxSqft: 4000,
        minLotSize: 3000,
        maxDaysOnMarket: 14,
      })

      const url = mockFetch.mock.calls[0][0] as string
      // Verify all filters are included
      expect(url).toContain(encodeURIComponent("startswith(City,'Toronto')"))
      expect(url).toContain(encodeURIComponent("startswith(City,'Mississauga')"))
      expect(url).toContain(encodeURIComponent('ListPrice ge 10000')) // sale filter
      expect(url).toContain(encodeURIComponent("PropertySubType eq 'Detached'"))
      expect(url).toContain(encodeURIComponent("PropertySubType eq 'Semi-Detached'"))
      expect(url).toContain(encodeURIComponent('ListPrice ge 500000'))
      expect(url).toContain(encodeURIComponent('ListPrice le 1500000'))
      expect(url).toContain(encodeURIComponent('BedroomsTotal ge 3'))
      expect(url).toContain(encodeURIComponent('BathroomsTotalInteger ge 2'))
      expect(url).toContain(encodeURIComponent("contains(PublicRemarks,'renovated')"))
      expect(url).toContain(encodeURIComponent('LivingArea ge 1500'))
      expect(url).toContain(encodeURIComponent('LivingArea le 4000'))
      expect(url).toContain(encodeURIComponent('LotSizeArea ge 3000'))
      expect(url).toContain(encodeURIComponent('DaysOnMarket le 14'))
    })
  })

  describe('searchListings - pagination', () => {
    it('should include limit in query', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ limit: 20 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('$top=20')
    })

    it('should include offset in query', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({ offset: 40 })

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('$skip=40')
    })

    it('should default to 50 limit when not specified', async () => {
      const client = new IDXClient('test-key')
      await client.searchListings({})

      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain('$top=50')
    })
  })

  describe('searchListings - error handling', () => {
    it('should return error when API key not configured', async () => {
      const client = new IDXClient('')
      const result = await client.searchListings({})

      expect(result.success).toBe(false)
      expect(result.error).toContain('not configured')
      expect(result.listings).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should handle API error response', async () => {
      // Use fake timers to speed up retry delays
      jest.useFakeTimers()

      // Mock all retry attempts with 500 error (retries 3 times + 1 initial = 4 calls)
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      }
      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)

      const client = new IDXClient('test-key')
      const resultPromise = client.searchListings({ city: 'Toronto' })

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(result.success).toBe(false)
      expect(result.error).toContain('500')
      expect(result.listings).toEqual([])

      jest.useRealTimers()
    })

    it('should handle network errors', async () => {
      // Use fake timers to speed up retry delays
      jest.useFakeTimers()

      // Mock all retry attempts with network error (retries 3 times + 1 initial = 4 calls)
      const networkError = new Error('fetch failed')
      mockFetch
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)

      const client = new IDXClient('test-key')
      const resultPromise = client.searchListings({ city: 'Toronto' })

      // Fast-forward through all retry delays
      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(result.success).toBe(false)
      expect(result.error).toContain('fetch failed')
      expect(result.listings).toEqual([])

      jest.useRealTimers()
    })

    it('should succeed after retry on transient error', async () => {
      // Use fake timers to speed up retry delays
      jest.useFakeTimers()

      // First attempt fails, second succeeds
      const errorResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      }
      const successResponse = {
        ok: true,
        json: () => Promise.resolve({ value: [{ ListingKey: '123' }], '@odata.count': 1 }),
      }
      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(successResponse)

      const client = new IDXClient('test-key')
      const resultPromise = client.searchListings({ city: 'Toronto' })

      // Fast-forward through retry delay
      await jest.runAllTimersAsync()
      const result = await resultPromise

      expect(result.success).toBe(true)
      expect(result.listings).toHaveLength(1)
      expect(mockFetch).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })
  })

  describe('searchListings - response parsing', () => {
    it('should parse successful response with listings', async () => {
      const mockListings = [
        { ListingKey: '123', ListPrice: 500000, City: 'Toronto' },
        { ListingKey: '456', ListPrice: 750000, City: 'Mississauga' },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          value: mockListings,
          '@odata.count': 100,
        }),
      })

      const client = new IDXClient('test-key')
      const result = await client.searchListings({})

      expect(result.success).toBe(true)
      expect(result.listings).toHaveLength(2)
      expect(result.total).toBe(100)
    })

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          value: [],
          '@odata.count': 0,
        }),
      })

      const client = new IDXClient('test-key')
      const result = await client.searchListings({ city: 'NonExistentCity' })

      expect(result.success).toBe(true)
      expect(result.listings).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('getListing', () => {
    it('should return null when API key not configured', async () => {
      const client = new IDXClient('')
      const result = await client.getListing('123')

      expect(result).toBeNull()
    })

    it('should fetch single listing by key', async () => {
      const mockListing = { ListingKey: '123', ListPrice: 500000 }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockListing),
      })

      const client = new IDXClient('test-key')
      const result = await client.getListing('123')

      expect(result).toEqual(mockListing)
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain("Property('123')")
    })

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const client = new IDXClient('test-key')
      const result = await client.getListing('nonexistent')

      expect(result).toBeNull()
    })
  })
})
