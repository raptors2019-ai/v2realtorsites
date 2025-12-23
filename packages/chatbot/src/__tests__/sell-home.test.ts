import { sellHomeTool } from '../tools/sell-home'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

describe('sellHomeTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(sellHomeTool.description).toContain('[PURPOSE]')
      expect(sellHomeTool.description).toContain('seller lead')
      expect(sellHomeTool.description).toContain('timeline')
    })

    it('should mention urgency detection', () => {
      expect(sellHomeTool.description).toContain('Hot sellers')
    })
  })

  describe('lead quality scoring', () => {
    it('should score ASAP timeline as hot lead', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.leadQuality).toBe('hot')
    })

    it('should score 1-3 months timeline as hot lead', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'condo',
        timeline: '1-3-months',
      })

      expect(result.success).toBe(true)
      expect(result.leadQuality).toBe('hot')
    })

    it('should score 3-6 months timeline as warm lead', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'townhouse',
        timeline: '3-6-months',
      })

      expect(result.success).toBe(true)
      expect(result.leadQuality).toBe('warm')
    })

    it('should score just-exploring timeline as cold lead', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'semi-detached',
        timeline: 'just-exploring',
      })

      expect(result.success).toBe(true)
      expect(result.leadQuality).toBe('cold')
    })
  })

  describe('property types', () => {
    const propertyTypes = ['detached', 'semi-detached', 'townhouse', 'condo'] as const

    it.each(propertyTypes)('should accept %s property type', async (propertyType) => {
      const result = await sellHomeTool.execute({
        propertyType,
        timeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.propertyType).toBe(propertyType)
    })
  })

  describe('optional fields', () => {
    it('should capture property address', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: 'asap',
        propertyAddress: '123 Main St, Toronto',
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.propertyAddress).toBe('123 Main St, Toronto')
    })

    it('should capture bedrooms and bathrooms', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: '1-3-months',
        bedrooms: 4,
        bathrooms: 3,
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.bedrooms).toBe(4)
      expect(result.sellerPreferences.bathrooms).toBe(3)
    })

    it('should capture reason for selling', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'condo',
        timeline: '3-6-months',
        reasonForSelling: 'Relocating for work',
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.reasonForSelling).toBe('Relocating for work')
    })

    it('should capture expected price', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'townhouse',
        timeline: 'asap',
        expectedPrice: 850000,
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.expectedPrice).toBe(850000)
    })

    it('should capture already listed status', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: 'asap',
        alreadyListed: true,
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.alreadyListed).toBe(true)
    })
  })

  describe('message generation', () => {
    it('should generate message for hot lead (ASAP)', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('free market analysis')
      expect(result.message).toContain('consultation')
    })

    it('should generate message for warm lead (3-6 months)', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'condo',
        timeline: '3-6-months',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('maximize')
    })

    it('should generate message for cold lead (exploring)', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'townhouse',
        timeline: 'just-exploring',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('planning early')
    })

    it('should include property description in message', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: 'asap',
        bedrooms: 4,
        bathrooms: 2,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('detached')
      expect(result.message).toContain('4 bed')
      expect(result.message).toContain('2 bath')
    })

    it('should handle relisting message for already listed properties', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: 'asap',
        alreadyListed: true,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('already listed')
      expect(result.message).toContain('relisting')
    })
  })

  describe('next step suggestions', () => {
    it('should suggest immediate contact for hot leads', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.nextStep).toContain('contact info immediately')
    })

    it('should suggest market analysis for warm/cold leads', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'condo',
        timeline: 'just-exploring',
      })

      expect(result.success).toBe(true)
      expect(result.nextStep).toContain('market analysis')
    })
  })

  describe('seller preferences object', () => {
    it('should include all captured data', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        propertyAddress: '456 Oak Ave',
        bedrooms: 5,
        bathrooms: 4,
        timeline: '1-3-months',
        reasonForSelling: 'Downsizing',
        expectedPrice: 1200000,
        alreadyListed: false,
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences).toEqual({
        propertyType: 'detached',
        propertyAddress: '456 Oak Ave',
        bedrooms: 5,
        bathrooms: 4,
        timeline: '1-3-months',
        reasonForSelling: 'Downsizing',
        expectedPrice: 1200000,
        alreadyListed: false,
        leadQuality: 'hot',
        capturedAt: expect.any(String),
      })
    })

    it('should include timestamp', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'condo',
        timeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.capturedAt).toBeDefined()
      // Should be a valid ISO date string
      expect(new Date(result.sellerPreferences.capturedAt).toISOString()).toBe(
        result.sellerPreferences.capturedAt
      )
    })
  })

  describe('CRM data', () => {
    it('should include CRM integration data', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        propertyAddress: '789 Elm St',
        timeline: 'asap',
        reasonForSelling: 'Moving abroad',
      })

      expect(result.success).toBe(true)
      expect(result.crmData).toBeDefined()
      expect(result.crmData.leadType).toBe('seller')
      expect(result.crmData.propertyAddress).toBe('789 Elm St')
      expect(result.crmData.propertyType).toBe('detached')
      expect(result.crmData.reasonForSelling).toBe('Moving abroad')
      expect(result.crmData.sellerTimeline).toBe('asap')
    })

    it('should handle undefined optional fields in CRM data', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'condo',
        timeline: '3-6-months',
      })

      expect(result.success).toBe(true)
      expect(result.crmData.leadType).toBe('seller')
      expect(result.crmData.sellerTimeline).toBe('3-6-months')
    })
  })

  describe('timeline values', () => {
    const timelines = ['asap', '1-3-months', '3-6-months', 'just-exploring'] as const

    it.each(timelines)('should accept %s timeline', async (timeline) => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        timeline,
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.timeline).toBe(timeline)
    })
  })

  describe('edge cases', () => {
    it('should handle minimal required fields', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'condo',
        timeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.sellerPreferences.propertyType).toBe('condo')
      expect(result.sellerPreferences.timeline).toBe('asap')
    })

    it('should handle all fields populated', async () => {
      const result = await sellHomeTool.execute({
        propertyType: 'detached',
        propertyAddress: 'Full Address Here',
        bedrooms: 6,
        bathrooms: 5,
        timeline: 'asap',
        reasonForSelling: 'All reasons',
        expectedPrice: 5000000,
        alreadyListed: true,
      })

      expect(result.success).toBe(true)
      expect(Object.keys(result.sellerPreferences).length).toBeGreaterThan(5)
    })
  })
})
