import {
  filterProperties,
  sortProperties,
  convertIDXToProperty,
  convertToProperty,
  fetchWithRetry,
} from '../data-fetcher'
import type { Property, IDXListing } from '@repo/types'
import type { BoldTrailListing } from '@repo/crm'

// Mock properties for testing
const mockProperties: Property[] = [
  {
    id: '1',
    title: '123 Main St',
    address: '123 Main St',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5V 3A8',
    price: 750000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    propertyType: 'detached',
    status: 'active',
    listingType: 'sale',
    featured: true,
    images: [],
    description: '',
    listingDate: new Date('2024-01-01'),
    mlsNumber: 'MLS001',
  },
  {
    id: '2',
    title: '456 Oak Ave',
    address: '456 Oak Ave',
    city: 'Mississauga',
    province: 'ON',
    postalCode: 'L5B 2C3',
    price: 500000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1000,
    propertyType: 'condo',
    status: 'active',
    listingType: 'sale',
    featured: false,
    images: [],
    description: '',
    listingDate: new Date('2024-02-01'),
    mlsNumber: 'MLS002',
  },
  {
    id: '3',
    title: '789 Elm St',
    address: '789 Elm St',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M4Y 1A1',
    price: 4500, // Lease price
    bedrooms: 1,
    bathrooms: 1,
    sqft: 600,
    propertyType: 'condo',
    status: 'active',
    listingType: 'lease',
    featured: false,
    images: [],
    description: '',
    listingDate: new Date('2024-03-01'),
    mlsNumber: 'MLS003',
  },
]

describe('data-fetcher', () => {
  describe('filterProperties', () => {
    it('should return all properties with empty filters', () => {
      const result = filterProperties(mockProperties, {})
      expect(result).toHaveLength(3)
    })

    it('should filter by property type', () => {
      const result = filterProperties(mockProperties, {
        type: ['condo'],
      })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.propertyType === 'condo')).toBe(true)
    })

    it('should filter by multiple property types', () => {
      const result = filterProperties(mockProperties, {
        type: ['condo', 'detached'],
      })
      expect(result).toHaveLength(3)
    })

    it('should filter by price range (min only)', () => {
      const result = filterProperties(mockProperties, {
        priceRange: { min: 500000 },
      })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.price >= 500000)).toBe(true)
    })

    it('should filter by price range (max only)', () => {
      const result = filterProperties(mockProperties, {
        priceRange: { max: 600000 },
      })
      expect(result).toHaveLength(2)
    })

    it('should filter by price range (min and max)', () => {
      const result = filterProperties(mockProperties, {
        priceRange: { min: 400000, max: 600000 },
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('should filter by bedrooms (array)', () => {
      const result = filterProperties(mockProperties, {
        bedrooms: [2, 3],
      })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.bedrooms === 2 || p.bedrooms === 3)).toBe(true)
    })

    it('should filter by bathrooms (array)', () => {
      const result = filterProperties(mockProperties, {
        bathrooms: [2],
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by location (case insensitive)', () => {
      const result = filterProperties(mockProperties, {
        location: 'toronto',
      })
      expect(result).toHaveLength(2)
    })

    it('should filter by partial location match', () => {
      const result = filterProperties(mockProperties, {
        location: 'Miss',
      })
      expect(result).toHaveLength(1)
      expect(result[0].city).toBe('Mississauga')
    })

    it('should filter by listing type (array)', () => {
      const result = filterProperties(mockProperties, {
        listingType: ['lease'],
      })
      expect(result).toHaveLength(1)
      expect(result[0].listingType).toBe('lease')
    })

    it('should combine multiple filters', () => {
      const result = filterProperties(mockProperties, {
        type: ['condo'],
        priceRange: { min: 1000 },
        location: 'Toronto',
        listingType: ['lease'],
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })

    it('should handle empty type array', () => {
      const result = filterProperties(mockProperties, {
        type: [],
      })
      // Empty array should not filter
      expect(result).toHaveLength(3)
    })
  })

  describe('sortProperties', () => {
    it('should sort by latest (newest first)', () => {
      const result = sortProperties(mockProperties, 'latest')
      expect(result[0].id).toBe('3') // March 2024
      expect(result[2].id).toBe('1') // January 2024
    })

    it('should sort by price ascending', () => {
      const result = sortProperties(mockProperties, 'price-asc')
      expect(result[0].price).toBe(4500)
      expect(result[2].price).toBe(750000)
    })

    it('should sort by price descending', () => {
      const result = sortProperties(mockProperties, 'price-desc')
      expect(result[0].price).toBe(750000)
      expect(result[2].price).toBe(4500)
    })

    it('should sort by featured first', () => {
      const result = sortProperties(mockProperties, 'featured')
      expect(result[0].featured).toBe(true)
    })

    it('should handle unknown sort option gracefully', () => {
      const result = sortProperties(mockProperties, 'unknown' as any)
      expect(result).toHaveLength(3)
    })

    it('should not mutate original array', () => {
      const original = [...mockProperties]
      sortProperties(mockProperties, 'price-asc')
      expect(mockProperties[0].id).toBe(original[0].id)
    })
  })

  describe('convertIDXToProperty', () => {
    const mockIDXListing: IDXListing = {
      ListingKey: 'idx-123',
      ListingId: 'MLS12345',
      ListPrice: 899000,
      UnparsedAddress: '100 Front St W, Unit 4501',
      City: 'Toronto',
      StateOrProvince: 'Ontario',
      PostalCode: 'M5J 1E3',
      BedroomsTotal: 2,
      BathroomsTotalInteger: 2,
      LivingArea: 1200,
      PropertyType: 'Condo',
      StandardStatus: 'Active',
      ModificationTimestamp: '2024-06-15T10:00:00Z',
      PublicRemarks: 'Stunning waterfront condo with lake views.',
      Media: [
        { MediaKey: 'img1', MediaURL: 'https://example.com/1.jpg', Order: 1, MediaCategory: 'Photo' },
        { MediaKey: 'img2', MediaURL: 'https://example.com/2.jpg', Order: 2, MediaCategory: 'Photo' },
      ],
    }

    it('should convert IDX listing to Property', () => {
      const result = convertIDXToProperty(mockIDXListing)

      expect(result.id).toBe('idx-123')
      expect(result.title).toBe('100 Front St W, Unit 4501')
      expect(result.city).toBe('Toronto')
      expect(result.price).toBe(899000)
      expect(result.bedrooms).toBe(2)
      expect(result.bathrooms).toBe(2)
      expect(result.sqft).toBe(1200)
      expect(result.mlsNumber).toBe('MLS12345')
    })

    it('should map property types correctly', () => {
      expect(convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Residential' }).propertyType).toBe('detached')
      expect(convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Condo' }).propertyType).toBe('condo')
      expect(convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Townhouse' }).propertyType).toBe('townhouse')
    })

    it('should default to detached for unknown property types', () => {
      const result = convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Unknown' as any })
      expect(result.propertyType).toBe('detached')
    })

    it('should map status correctly', () => {
      expect(convertIDXToProperty({ ...mockIDXListing, StandardStatus: 'Active' }).status).toBe('active')
      expect(convertIDXToProperty({ ...mockIDXListing, StandardStatus: 'Pending' }).status).toBe('pending')
      expect(convertIDXToProperty({ ...mockIDXListing, StandardStatus: 'Sold' }).status).toBe('sold')
    })

    it('should determine listing type based on price threshold', () => {
      // Sale (>= $10,000)
      expect(convertIDXToProperty({ ...mockIDXListing, ListPrice: 500000 }).listingType).toBe('sale')

      // Lease (< $10,000)
      expect(convertIDXToProperty({ ...mockIDXListing, ListPrice: 3500 }).listingType).toBe('lease')
    })

    it('should extract images from Media', () => {
      const result = convertIDXToProperty(mockIDXListing)
      expect(result.images).toHaveLength(2)
      expect(result.images[0]).toBe('https://example.com/1.jpg')
    })

    it('should handle missing Media', () => {
      const result = convertIDXToProperty({ ...mockIDXListing, Media: undefined })
      expect(result.images).toEqual([])
    })

    it('should deduplicate images by MediaKey', () => {
      const listingWithDupes: IDXListing = {
        ...mockIDXListing,
        Media: [
          { MediaKey: 'img1', MediaURL: 'https://example.com/1.jpg', Order: 1 },
          { MediaKey: 'img1-t', MediaURL: 'https://example.com/1-thumb.jpg', Order: 2 }, // Thumbnail
          { MediaKey: 'img2', MediaURL: 'https://example.com/2.jpg', Order: 3 },
        ],
      }
      const result = convertIDXToProperty(listingWithDupes)
      expect(result.images).toHaveLength(2)
    })

    it('should deduplicate images when MediaKey is missing', () => {
      const listingWithoutKeys: IDXListing = {
        ...mockIDXListing,
        Media: [
          // Ampre CDN format: same image ID (ABC123) with different resize params
          { MediaKey: undefined, MediaURL: 'https://trreb-image.ampre.ca/ABC123/rs:fit:800:600/image.jpg', Order: 1 },
          { MediaKey: undefined, MediaURL: 'https://trreb-image.ampre.ca/ABC123/rs:fit:240:240/image.jpg', Order: 2 }, // Duplicate (smaller)
          { MediaKey: undefined, MediaURL: 'https://trreb-image.ampre.ca/ABC123/rs:fit:1200:900/image.jpg', Order: 3 }, // Duplicate (larger)
          { MediaKey: undefined, MediaURL: 'https://trreb-image.ampre.ca/XYZ789/rs:fit:800:600/image2.jpg', Order: 4 }, // Different image
        ],
      }
      const result = convertIDXToProperty(listingWithoutKeys)
      // Should keep only 2 unique images (ABC123 and XYZ789)
      // Should prefer larger size (1200:900) for ABC123
      expect(result.images).toHaveLength(2)
      expect(result.images[0]).toContain('ABC123')
      expect(result.images[0]).toContain('rs:fit:1200:900')
      expect(result.images[1]).toContain('XYZ789')
    })

    it('should handle LivingAreaRange fallback', () => {
      const listingWithRange = {
        ...mockIDXListing,
        LivingArea: undefined,
        BuildingAreaTotal: undefined,
        AboveGradeFinishedArea: undefined,
        LivingAreaRange: '1000-1499',
      } as any

      const result = convertIDXToProperty(listingWithRange)
      expect(result.sqft).toBe(1250) // Midpoint of 1000-1499
    })

    it('should use fallback ListingKey for mlsNumber', () => {
      const listingWithoutId = {
        ...mockIDXListing,
        ListingId: undefined,
      }
      const result = convertIDXToProperty(listingWithoutId)
      expect(result.mlsNumber).toBe('idx-123')
    })

    it('should handle missing PublicRemarks', () => {
      const result = convertIDXToProperty({ ...mockIDXListing, PublicRemarks: undefined })
      expect(result.description).toBe('')
    })

    it('should use BuildingAreaTotal as sqft fallback', () => {
      const listing = {
        ...mockIDXListing,
        LivingArea: undefined,
        BuildingAreaTotal: 1500,
      }
      const result = convertIDXToProperty(listing)
      expect(result.sqft).toBe(1500)
    })
  })

  describe('convertToProperty (BoldTrail)', () => {
    const mockBoldTrailListing: BoldTrailListing = {
      id: 'bt-456',
      address: '200 King St W',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5H 1K4',
      price: 650000,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 800,
      propertyType: 'condo',
      status: 'active',
      photos: ['https://example.com/photo1.jpg'],
      description: 'Modern downtown condo',
      listingDate: '2024-05-01',
      mlsNumber: 'BT123',
    }

    it('should convert BoldTrail listing to Property', () => {
      const result = convertToProperty(mockBoldTrailListing)

      expect(result.id).toBe('bt-456')
      expect(result.address).toBe('200 King St W')
      expect(result.city).toBe('Toronto')
      expect(result.price).toBe(650000)
      expect(result.images).toEqual(['https://example.com/photo1.jpg'])
    })

    it('should determine listing type based on price', () => {
      expect(convertToProperty({ ...mockBoldTrailListing, price: 500000 }).listingType).toBe('sale')
      expect(convertToProperty({ ...mockBoldTrailListing, price: 2500 }).listingType).toBe('lease')
    })

    it('should map property types correctly', () => {
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'detached' }).propertyType).toBe('detached')
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'semi-detached' }).propertyType).toBe('semi-detached')
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'townhouse' }).propertyType).toBe('townhouse')
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'condo' }).propertyType).toBe('condo')
    })

    it('should handle missing sqft', () => {
      const result = convertToProperty({ ...mockBoldTrailListing, sqft: undefined })
      expect(result.sqft).toBe(0)
    })

    it('should handle missing description', () => {
      const result = convertToProperty({ ...mockBoldTrailListing, description: undefined })
      expect(result.description).toBe('')
    })
  })

  describe('fetchWithRetry', () => {
    // Mock fetch globally
    const mockFetch = jest.fn()
    const originalFetch = global.fetch

    beforeAll(() => {
      global.fetch = mockFetch
    })

    afterAll(() => {
      global.fetch = originalFetch
    })

    beforeEach(() => {
      mockFetch.mockClear()
    })

    it('should return response on successful fetch', async () => {
      const mockResponse = { ok: true, status: 200, json: () => Promise.resolve({ data: 'test' }) }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchWithRetry('https://example.com/api')

      expect(result).toBe(mockResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should pass options to fetch', async () => {
      const mockResponse = { ok: true, status: 200 }
      mockFetch.mockResolvedValueOnce(mockResponse)

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      }

      await fetchWithRetry('https://example.com/api', options)

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', options)
    })

    it('should throw on non-ok response with single retry', async () => {
      const mockResponse = { ok: false, status: 500, statusText: 'Internal Server Error' }
      mockFetch.mockResolvedValue(mockResponse)

      // Use maxRetries=1 to avoid timeout issues
      await expect(fetchWithRetry('https://example.com/api', undefined, 1))
        .rejects.toThrow('HTTP 500: Internal Server Error')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should throw on network error with single retry', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(fetchWithRetry('https://example.com/api', undefined, 1))
        .rejects.toThrow('Network error')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should retry and succeed on second attempt', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, status: 200 })

      // Use a short timeout for test by mocking setTimeout
      jest.useFakeTimers()

      const fetchPromise = fetchWithRetry('https://example.com/api', undefined, 2)

      // Advance timer for first retry delay (1 second)
      await jest.advanceTimersByTimeAsync(1000)

      const result = await fetchPromise

      jest.useRealTimers()

      expect(result.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})
