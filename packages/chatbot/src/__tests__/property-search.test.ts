// Mock IDXClient before importing the tool
jest.mock('@repo/crm', () => ({
  IDXClient: jest.fn().mockImplementation(() => ({
    searchListings: jest.fn(),
  })),
}))

// Mock @repo/lib for formatPrice
jest.mock('@repo/lib', () => ({
  formatPrice: jest.fn((price: number) => `$${price.toLocaleString()}`),
}))

import { propertySearchTool } from '../tools/property-search'
import { IDXClient } from '@repo/crm'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('propertySearchTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(propertySearchTool.description).toContain('Search for properties')
      expect(propertySearchTool.description).toContain('BEFORE asking for contact')
    })

    it('should have required parameters schema', () => {
      expect(propertySearchTool.parameters).toBeDefined()
    })
  })

  describe('successful searches', () => {
    it('should return formatted listings when found', async () => {
      const mockListings = [
        {
          ListingKey: 'abc123',
          ListPrice: 750000,
          UnparsedAddress: '123 Main St',
          City: 'Toronto',
          BedroomsTotal: 3,
          BathroomsTotalInteger: 2,
          LivingArea: 1500,
          PropertyType: 'Residential',
          Media: [{ MediaURL: 'https://example.com/img.jpg' }],
          PublicRemarks: 'Beautiful home',
        },
      ]

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: mockListings,
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        maxPrice: 800000,
        bedrooms: 3,
      })

      expect(result.success).toBe(true)
      expect(result.listings).toHaveLength(1)
      expect(result.listings[0].id).toBe('abc123')
      expect(result.listings[0].address).toBe('123 Main St')
      expect(result.total).toBe(1)
    })

    it('should limit results to 5 listings', async () => {
      const mockListings = Array(5).fill(null).map((_, i) => ({
        ListingKey: `listing-${i}`,
        ListPrice: 500000 + i * 10000,
        UnparsedAddress: `${i} Test St`,
        City: 'Toronto',
        BedroomsTotal: 3,
        BathroomsTotalInteger: 2,
        PropertyType: 'Residential',
        Media: [],
      }))

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: mockListings,
          total: 10,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.listings.length).toBeLessThanOrEqual(5)
    })

    it('should pass search params to IDXClient', async () => {
      const mockSearchListings = jest.fn().mockResolvedValue({
        success: true,
        listings: [],
        total: 0,
      })

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: mockSearchListings,
      }))

      await propertySearchTool.execute({
        city: 'Mississauga',
        minPrice: 500000,
        maxPrice: 800000,
        bedrooms: 4,
        bathrooms: 2,
        propertyType: 'Condo',
      })

      expect(mockSearchListings).toHaveBeenCalledWith({
        city: 'Mississauga',
        minPrice: 500000,
        maxPrice: 800000,
        bedrooms: 4,
        bathrooms: 2,
        propertyType: 'Condo',
        limit: 5,
      })
    })
  })

  describe('empty results', () => {
    it('should handle no matching properties', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [],
          total: 0,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        minPrice: 10000000, // Very high price
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain("couldn't find any properties")
      expect(result.listings).toEqual([])
    })

    it('should handle API failure', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: false,
          listings: [],
          total: 0,
          error: 'API Error',
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(false)
      expect(result.message).toContain("couldn't find any properties")
    })
  })

  describe('error handling', () => {
    it('should handle exceptions gracefully', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockRejectedValue(new Error('Network error')),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('having trouble')
      expect(result.error).toBe('Network error')
    })
  })

  describe('listing formatting', () => {
    it('should format listing with all fields', async () => {
      const mockListing = {
        ListingKey: 'test-123',
        ListPrice: 899000,
        UnparsedAddress: '456 Oak Ave, Unit 501',
        City: 'Toronto',
        BedroomsTotal: 2,
        BathroomsTotalInteger: 2,
        LivingArea: 1000,
        PropertyType: 'Condo',
        Media: [
          { MediaURL: 'https://example.com/main.jpg' },
          { MediaURL: 'https://example.com/second.jpg' },
        ],
        PublicRemarks: 'Stunning corner unit with panoramic views of the city skyline and lake. This is a much longer description that should be truncated.',
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      const listing = result.listings[0]
      expect(listing.id).toBe('test-123')
      expect(listing.priceNumber).toBe(899000)
      expect(listing.address).toBe('456 Oak Ave, Unit 501')
      expect(listing.city).toBe('Toronto')
      expect(listing.bedrooms).toBe(2)
      expect(listing.bathrooms).toBe(2)
      expect(listing.sqft).toBe(1000)
      expect(listing.propertyType).toBe('Condo')
      expect(listing.image).toBe('https://example.com/main.jpg')
      expect(listing.description.length).toBeLessThanOrEqual(100)
      expect(listing.url).toBe('/properties/test-123')
    })

    it('should handle missing media', async () => {
      const mockListing = {
        ListingKey: 'no-media',
        ListPrice: 500000,
        UnparsedAddress: '789 No Photo St',
        City: 'Toronto',
        BedroomsTotal: 1,
        BathroomsTotalInteger: 1,
        PropertyType: 'Condo',
        Media: null,
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.listings[0].image).toBeNull()
    })

    it('should handle empty media array', async () => {
      const mockListing = {
        ListingKey: 'empty-media',
        ListPrice: 500000,
        UnparsedAddress: '789 No Photo St',
        City: 'Toronto',
        BedroomsTotal: 1,
        BathroomsTotalInteger: 1,
        PropertyType: 'Condo',
        Media: [],
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      // Empty array with optional chaining returns null due to || null fallback
      expect(result.listings[0].image).toBeNull()
    })

    it('should handle missing sqft', async () => {
      const mockListing = {
        ListingKey: 'no-sqft',
        ListPrice: 500000,
        UnparsedAddress: '100 Unknown Size St',
        City: 'Toronto',
        BedroomsTotal: 2,
        BathroomsTotalInteger: 1,
        PropertyType: 'Residential',
        LivingArea: null,
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.listings[0].sqft).toBe(0)
    })

    it('should handle missing public remarks', async () => {
      const mockListing = {
        ListingKey: 'no-remarks',
        ListPrice: 500000,
        UnparsedAddress: '100 Silent St',
        City: 'Toronto',
        BedroomsTotal: 2,
        BathroomsTotalInteger: 1,
        PropertyType: 'Residential',
        PublicRemarks: null,
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.listings[0].description).toBe('')
    })
  })

  describe('message formatting', () => {
    it('should use singular for one result', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [{ ListingKey: 'one', ListPrice: 500000, City: 'Toronto', BedroomsTotal: 2, BathroomsTotalInteger: 1 }],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.message).toContain('1 property')
    })

    it('should use plural for multiple results', async () => {
      const listings = Array(3).fill(null).map((_, i) => ({
        ListingKey: `prop-${i}`,
        ListPrice: 500000,
        City: 'Toronto',
        BedroomsTotal: 2,
        BathroomsTotalInteger: 1,
      }))

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings,
          total: 15,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.message).toContain('15 properties')
      expect(result.message).toContain('top 3')
    })
  })

  describe('viewAllUrl generation', () => {
    it('should generate correct viewAllUrl with filters', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [{ ListingKey: 'test', ListPrice: 500000, City: 'Toronto', BedroomsTotal: 2, BathroomsTotalInteger: 1 }],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        minPrice: 500000,
        maxPrice: 800000,
        bedrooms: 3,
      })

      expect(result.viewAllUrl).toContain('city=Toronto')
      expect(result.viewAllUrl).toContain('minPrice=500000')
      expect(result.viewAllUrl).toContain('maxPrice=800000')
      expect(result.viewAllUrl).toContain('bedrooms=3')
    })

    it('should handle missing optional params in viewAllUrl', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [{ ListingKey: 'test', ListPrice: 500000, City: 'Toronto', BedroomsTotal: 2, BathroomsTotalInteger: 1 }],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({})

      expect(result.viewAllUrl).toBeDefined()
      expect(result.viewAllUrl).toContain('/properties?')
    })
  })

  describe('searchParams in response', () => {
    it('should include searchParams in successful response', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [{ ListingKey: 'test', ListPrice: 500000, City: 'Toronto', BedroomsTotal: 2, BathroomsTotalInteger: 1 }],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        minPrice: 500000,
        bedrooms: 3,
      })

      expect(result.searchParams).toEqual({
        city: 'Toronto',
        minPrice: 500000,
        maxPrice: undefined,
        bedrooms: 3,
        bathrooms: undefined,
        propertyType: undefined,
      })
    })

    it('should include searchParams in failed response', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: false,
          listings: [],
          total: 0,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        maxPrice: 100000,
      })

      expect(result.searchParams).toEqual({
        city: 'Toronto',
        minPrice: undefined,
        maxPrice: 100000,
        bedrooms: undefined,
        bathrooms: undefined,
        propertyType: undefined,
      })
    })
  })
})
