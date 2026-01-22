import { renderHook } from '@testing-library/react'
import { useStoredContext } from '../../chatbot/hooks/useStoredContext'
import type { UserPreferences, ViewedProperty } from '../../chatbot/chatbot-store'

describe('useStoredContext', () => {
  const defaultPreferences: UserPreferences = {}
  const emptyViewedProperties: ViewedProperty[] = []

  describe('when not hydrated', () => {
    it('should return null', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: false,
          preferences: { firstName: 'John' },
          viewedProperties: [],
          phone: '555-1234',
          email: 'john@example.com',
        })
      )

      expect(result.current).toBeNull()
    })
  })

  describe('when hydrated but no meaningful data', () => {
    it('should return null with empty preferences and no viewed properties', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: {},
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current).toBeNull()
    })

    it('should return null when only firstName without phone', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { firstName: 'John' },
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current).toBeNull()
    })
  })

  describe('contact information', () => {
    it('should include contact when firstName and phone exist', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { firstName: 'John' },
          viewedProperties: [],
          phone: '555-1234',
          email: null,
        })
      )

      expect(result.current?.contact).toEqual({
        name: 'John',
        phone: '555-1234',
        email: null,
      })
    })

    it('should include email in contact when provided', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { firstName: 'Jane' },
          viewedProperties: [],
          phone: '555-5678',
          email: 'jane@example.com',
        })
      )

      expect(result.current?.contact).toEqual({
        name: 'Jane',
        phone: '555-5678',
        email: 'jane@example.com',
      })
    })

    it('should not include contact when phone is missing', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { firstName: 'John', propertyType: 'detached' },
          viewedProperties: [],
          phone: null,
          email: 'john@example.com',
        })
      )

      expect(result.current?.contact).toBeUndefined()
    })
  })

  describe('preferences', () => {
    it('should include preferences when propertyType exists', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { propertyType: 'condo' },
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current?.preferences?.propertyType).toBe('condo')
    })

    it('should include preferences when budget exists', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { budget: { min: 500000, max: 800000 } },
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current?.preferences?.budget).toEqual({ min: 500000, max: 800000 })
    })

    it('should include preferences when locations exist', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { locations: ['Toronto', 'Mississauga'] },
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current?.preferences?.locations).toEqual(['Toronto', 'Mississauga'])
    })

    it('should include all preference fields', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: {
            propertyType: 'townhouse',
            budget: { min: 600000, max: 900000 },
            bedrooms: 3,
            locations: ['Oakville'],
            timeline: '3-6-months',
          },
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current?.preferences).toEqual({
        propertyType: 'townhouse',
        budget: { min: 600000, max: 900000 },
        bedrooms: 3,
        locations: ['Oakville'],
        timeline: '3-6-months',
      })
    })

    it('should not include preferences when array locations is empty', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { locations: [] },
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current).toBeNull()
    })
  })

  describe('viewed properties', () => {
    it('should include viewed properties when present', () => {
      const viewedProperties: ViewedProperty[] = [
        { listingId: '123', address: '123 Main St', price: 500000, viewedAt: new Date().toISOString() },
      ]

      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: {},
          viewedProperties,
          phone: null,
          email: null,
        })
      )

      expect(result.current?.viewedProperties).toEqual([
        { listingId: '123', address: '123 Main St', price: 500000 },
      ])
    })

    it('should only include last 5 viewed properties', () => {
      const viewedProperties: ViewedProperty[] = Array.from({ length: 10 }, (_, i) => ({
        listingId: `${i}`,
        address: `${i} Main St`,
        price: 500000 + i * 1000,
        viewedAt: new Date().toISOString(),
      }))

      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: {},
          viewedProperties,
          phone: null,
          email: null,
        })
      )

      expect(result.current?.viewedProperties).toHaveLength(5)
      expect(result.current?.viewedProperties?.[0].listingId).toBe('5')
      expect(result.current?.viewedProperties?.[4].listingId).toBe('9')
    })

    it('should strip viewedAt from viewedProperties', () => {
      const viewedProperties: ViewedProperty[] = [
        { listingId: '123', address: '123 Main St', price: 500000, viewedAt: '2024-01-01T12:00:00Z' },
      ]

      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: {},
          viewedProperties,
          phone: null,
          email: null,
        })
      )

      expect(result.current?.viewedProperties?.[0]).not.toHaveProperty('viewedAt')
    })
  })

  describe('lastVisit', () => {
    it('should include lastVisit from capturedAt', () => {
      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: { capturedAt: '2024-01-15T10:30:00Z', propertyType: 'condo' },
          viewedProperties: [],
          phone: null,
          email: null,
        })
      )

      expect(result.current?.lastVisit).toBe('2024-01-15T10:30:00Z')
    })
  })

  describe('combined data', () => {
    it('should return full context with all data types', () => {
      const viewedProperties: ViewedProperty[] = [
        { listingId: '456', address: '456 Oak Ave', price: 750000, viewedAt: '2024-01-10' },
      ]

      const { result } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences: {
            firstName: 'Alice',
            propertyType: 'detached',
            budget: { min: 700000, max: 1000000 },
            capturedAt: '2024-01-15',
          },
          viewedProperties,
          phone: '416-555-0000',
          email: 'alice@example.com',
        })
      )

      expect(result.current).toEqual({
        contact: {
          name: 'Alice',
          phone: '416-555-0000',
          email: 'alice@example.com',
        },
        preferences: {
          budget: { min: 700000, max: 1000000 },
          propertyType: 'detached',
          bedrooms: undefined,
          locations: undefined,
          timeline: undefined,
        },
        viewedProperties: [
          { listingId: '456', address: '456 Oak Ave', price: 750000 },
        ],
        lastVisit: '2024-01-15',
      })
    })
  })

  describe('memoization', () => {
    it('should return same reference when inputs unchanged', () => {
      const preferences = { propertyType: 'condo' }
      const viewedProperties: ViewedProperty[] = []

      const { result, rerender } = renderHook(() =>
        useStoredContext({
          isHydrated: true,
          preferences,
          viewedProperties,
          phone: null,
          email: null,
        })
      )

      const firstResult = result.current

      rerender()

      expect(result.current).toBe(firstResult)
    })
  })
})
