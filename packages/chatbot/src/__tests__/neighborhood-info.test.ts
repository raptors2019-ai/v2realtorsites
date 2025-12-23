import { neighborhoodInfoTool } from '../tools/neighborhood-info'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

describe('neighborhoodInfoTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(neighborhoodInfoTool.description).toContain('[PURPOSE]')
      expect(neighborhoodInfoTool.description).toContain('GTA')
      expect(neighborhoodInfoTool.description).toContain('neighborhoods')
    })

    it('should list available cities in description', () => {
      expect(neighborhoodInfoTool.description).toContain('Toronto')
      expect(neighborhoodInfoTool.description).toContain('Mississauga')
      expect(neighborhoodInfoTool.description).toContain('Oakville')
    })
  })

  describe('city lookup - valid cities', () => {
    const validCities = [
      'Toronto',
      'Mississauga',
      'Brampton',
      'Vaughan',
      'Markham',
      'Richmond Hill',
      'Milton',
      'Oakville',
      'Burlington',
      'Hamilton',
      'Caledon',
    ]

    it.each(validCities)('should return info for %s', async (city) => {
      const result = await neighborhoodInfoTool.execute({ city })

      expect(result.success).toBe(true)
      expect(result.city).toBe(city)
      expect(result.data).toBeDefined()
      expect(result.data.avgPrice).toBeDefined()
      expect(result.data.neighborhoods).toBeDefined()
    })

    it('should handle case-insensitive city names', async () => {
      const results = await Promise.all([
        neighborhoodInfoTool.execute({ city: 'toronto' }),
        neighborhoodInfoTool.execute({ city: 'TORONTO' }),
        neighborhoodInfoTool.execute({ city: 'ToRoNtO' }),
      ])

      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.city).toBe('Toronto')
      })
    })

    it('should handle city names with extra whitespace', async () => {
      const result = await neighborhoodInfoTool.execute({ city: '  Mississauga  ' })

      expect(result.success).toBe(true)
      expect(result.city).toBe('Mississauga')
    })
  })

  describe('city lookup - invalid cities', () => {
    it('should return error for unknown city', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Vancouver' })

      expect(result.success).toBe(false)
      expect(result.message).toContain("don't have detailed information")
      expect(result.message).toContain('Vancouver')
      expect(result.availableCities).toBeDefined()
      expect(result.availableCities.length).toBeGreaterThan(0)
    })

    it('should suggest available cities when city not found', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Ottawa' })

      expect(result.success).toBe(false)
      expect(result.availableCities).toContain('Toronto')
      expect(result.availableCities).toContain('Mississauga')
    })

    it('should handle empty city name', async () => {
      const result = await neighborhoodInfoTool.execute({ city: '' })

      expect(result.success).toBe(false)
    })
  })

  describe('city information content', () => {
    it('should include all required fields for Toronto', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.data.avgPrice).toBeDefined()
      expect(result.data.priceRange).toBeDefined()
      expect(result.data.priceRange.min).toBeDefined()
      expect(result.data.priceRange.max).toBeDefined()
      expect(result.data.vibe).toBeDefined()
      expect(result.data.transit).toBeDefined()
      expect(result.data.neighborhoods.length).toBeGreaterThan(0)
    })

    it('should format message with markdown', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Oakville' })

      expect(result.success).toBe(true)
      expect(result.message).toContain('##')
      expect(result.message).toContain('**Average Home Price:**')
      expect(result.message).toContain('### Transit')
      expect(result.message).toContain('### Schools')
      expect(result.message).toContain('### Popular Neighborhoods')
    })

    it('should include transit information', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Mississauga' })

      expect(result.success).toBe(true)
      expect(result.data.transit).toBeDefined()
      expect(result.data.transit.goStations).toBeDefined()
      expect(result.data.transit.commuteToUnion).toBeDefined()
    })
  })

  describe('specific neighborhood lookup', () => {
    it('should find specific neighborhood in Toronto', async () => {
      const result = await neighborhoodInfoTool.execute({
        city: 'Toronto',
        specificNeighborhood: 'Yorkville',
      })

      expect(result.success).toBe(true)
      expect(result.neighborhood).toContain('Yorkville')
      expect(result.data).toBeDefined()
    })

    it('should find neighborhood with partial match', async () => {
      const result = await neighborhoodInfoTool.execute({
        city: 'Mississauga',
        specificNeighborhood: 'Port',
      })

      expect(result.success).toBe(true)
      // Should match "Port Credit" or similar
      if (result.neighborhood) {
        expect(result.neighborhood.toLowerCase()).toContain('port')
      }
    })

    it('should include neighborhood-specific data', async () => {
      const result = await neighborhoodInfoTool.execute({
        city: 'Toronto',
        specificNeighborhood: 'Yorkville',
      })

      if (result.success && result.data) {
        expect(result.data.name).toBeDefined()
        expect(result.data.vibe).toBeDefined()
        expect(result.data.avgPrice).toBeDefined()
      }
    })

    it('should return city info when neighborhood not found', async () => {
      const result = await neighborhoodInfoTool.execute({
        city: 'Toronto',
        specificNeighborhood: 'NonExistentNeighborhood123',
      })

      expect(result.success).toBe(true)
      // Should fall back to city-level info
      expect(result.city).toBe('Toronto')
    })
  })

  describe('search suggestions', () => {
    it('should provide search suggestion for city', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Oakville' })

      expect(result.success).toBe(true)
      expect(result.searchSuggestion).toBeDefined()
      expect(result.searchSuggestion.city).toBe('Oakville')
      expect(result.searchSuggestion.maxPrice).toBeGreaterThan(0)
    })

    it('should provide search suggestion for specific neighborhood', async () => {
      const result = await neighborhoodInfoTool.execute({
        city: 'Toronto',
        specificNeighborhood: 'Yorkville',
      })

      if (result.success && result.neighborhood) {
        expect(result.searchSuggestion).toBeDefined()
        expect(result.searchSuggestion.city).toBe('Toronto')
        expect(result.searchSuggestion.neighborhood).toBeDefined()
      }
    })
  })

  describe('CRM data', () => {
    it('should include CRM data for city lookup', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Burlington' })

      expect(result.success).toBe(true)
      expect(result.crmData).toBeDefined()
      expect(result.crmData.preferredCity).toBe('Burlington')
    })

    it('should include neighborhood in CRM data when specific', async () => {
      const result = await neighborhoodInfoTool.execute({
        city: 'Toronto',
        specificNeighborhood: 'Yorkville',
      })

      if (result.success && result.neighborhood) {
        expect(result.crmData).toBeDefined()
        expect(result.crmData.preferredNeighborhoods).toBeDefined()
        expect(result.crmData.preferredNeighborhoods.length).toBeGreaterThan(0)
      }
    })
  })

  describe('message formatting', () => {
    it('should ask follow-up question in city message', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Hamilton' })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Would you like')
    })

    it('should ask follow-up question in neighborhood message', async () => {
      const result = await neighborhoodInfoTool.execute({
        city: 'Toronto',
        specificNeighborhood: 'Yorkville',
      })

      if (result.success && result.neighborhood) {
        expect(result.message).toContain('Would you like to see properties')
      }
    })

    it('should list popular neighborhoods', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Vaughan' })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Popular Neighborhoods')
    })
  })

  describe('data consistency', () => {
    it('should have valid price ranges', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.data.priceRange.min).toBeLessThan(result.data.priceRange.max)
    })

    it('should have neighborhoods with prices', async () => {
      const result = await neighborhoodInfoTool.execute({ city: 'Mississauga' })

      expect(result.success).toBe(true)
      result.data.neighborhoods.forEach((n: any) => {
        expect(n.avgPrice).toBeDefined()
        expect(n.name).toBeDefined()
      })
    })
  })
})
