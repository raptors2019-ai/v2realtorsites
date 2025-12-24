import { capturePreferencesTool } from '../tools/capture-preferences'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

describe('capturePreferencesTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(capturePreferencesTool.description).toContain('Capture buyer or seller preferences')
      expect(capturePreferencesTool.description).toContain('property requirements')
    })

    it('should have required parameters schema', () => {
      expect(capturePreferencesTool.parameters).toBeDefined()
    })
  })

  describe('lead quality scoring', () => {
    describe('hot leads', () => {
      it('should score immediate timeline as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'immediate',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score 3-months timeline as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: '3-months',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score urgency factors as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          urgencyFactors: ['relocating for work'],
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score multiple urgency factors as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          urgencyFactors: ['lease ending', 'job relocation'],
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })
    })

    describe('warm leads', () => {
      it('should score pre-approved as warm', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          preApproved: true,
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should score 6-months timeline as warm', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: '6-months',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should score 12-months timeline as warm', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: '12-months',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should default to warm when no signals', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          bedrooms: 3,
          locations: ['Toronto'],
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })
    })

    describe('cold leads', () => {
      it('should score just-browsing timeline as cold', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'just-browsing',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('cold')
      })
    })

    describe('scoring priority', () => {
      it('should prioritize timeline over pre-approved', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'immediate',
          preApproved: false,
        })

        expect(result.leadQuality).toBe('hot')
      })

      it('should prioritize urgency over just-browsing timeline', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'just-browsing',
          urgencyFactors: ['relocating'],
        })

        // Urgency factors are checked BEFORE just-browsing timeline in the code
        // So urgency factors win and return 'hot'
        expect(result.leadQuality).toBe('hot')
      })

      it('should prioritize hot timeline over just-browsing with urgency', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'immediate',
          urgencyFactors: ['relocating'],
        })

        expect(result.leadQuality).toBe('hot')
      })
    })
  })

  describe('buyer preferences', () => {
    it('should capture budget range', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        budget: { min: 500000, max: 800000 },
      })

      expect(result.success).toBe(true)
      expect(result.preferences.budget).toEqual({ min: 500000, max: 800000 })
    })

    it('should capture budget with range label', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        budget: { min: 500000, max: 800000, range: '$500K-$800K' },
      })

      expect(result.success).toBe(true)
      expect(result.preferences.budget?.range).toBe('$500K-$800K')
    })

    it('should capture property preferences', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        propertyType: 'detached',
        bedrooms: 4,
        bathrooms: 3,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.propertyType).toBe('detached')
      expect(result.preferences.bedrooms).toBe(4)
      expect(result.preferences.bathrooms).toBe(3)
    })

    it('should capture location preferences', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        locations: ['Toronto', 'Mississauga', 'Oakville'],
      })

      expect(result.success).toBe(true)
      expect(result.preferences.locations).toEqual(['Toronto', 'Mississauga', 'Oakville'])
    })

    it('should capture pre-approval status', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        preApproved: true,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.preApproved).toBe(true)
    })
  })

  describe('seller preferences', () => {
    it('should capture seller property details', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'seller',
        propertyAddress: '123 Main St, Toronto',
        reasonForSelling: 'Downsizing',
        expectedPrice: 950000,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.propertyAddress).toBe('123 Main St, Toronto')
      expect(result.preferences.reasonForSelling).toBe('Downsizing')
      expect(result.preferences.expectedPrice).toBe(950000)
    })

    it('should capture seller with timeline', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'seller',
        propertyAddress: '456 Oak Ave',
        timeline: '3-months',
      })

      expect(result.success).toBe(true)
      expect(result.preferences.leadType).toBe('seller')
      expect(result.leadQuality).toBe('hot')
    })
  })

  describe('lead types', () => {
    const leadTypes = ['buyer', 'seller', 'investor', 'general'] as const

    it.each(leadTypes)('should accept %s lead type', async (leadType) => {
      const result = await capturePreferencesTool.execute({
        leadType,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.leadType).toBe(leadType)
    })
  })

  describe('property types', () => {
    const propertyTypes = ['detached', 'semi-detached', 'townhouse', 'condo'] as const

    it.each(propertyTypes)('should accept %s property type', async (propertyType) => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        propertyType,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.propertyType).toBe(propertyType)
    })
  })

  describe('timeline options', () => {
    const timelineOptions = [
      { timeline: 'immediate', expectedQuality: 'hot' },
      { timeline: '3-months', expectedQuality: 'hot' },
      { timeline: '6-months', expectedQuality: 'warm' },
      { timeline: '12-months', expectedQuality: 'warm' },
      { timeline: 'just-browsing', expectedQuality: 'cold' },
    ] as const

    it.each(timelineOptions)('should handle timeline $timeline as $expectedQuality', async ({ timeline, expectedQuality }) => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        timeline,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.timeline).toBe(timeline)
      expect(result.leadQuality).toBe(expectedQuality)
    })
  })

  describe('output structure', () => {
    it('should return success with message', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Preferences captured successfully')
    })

    it('should include preferences in response', async () => {
      const input = {
        leadType: 'buyer' as const,
        budget: { min: 500000, max: 800000 },
        bedrooms: 3,
        locations: ['Toronto'],
      }

      const result = await capturePreferencesTool.execute(input)

      expect(result.preferences.leadType).toBe(input.leadType)
      expect(result.preferences.budget).toEqual(input.budget)
      expect(result.preferences.bedrooms).toBe(input.bedrooms)
      expect(result.preferences.locations).toEqual(input.locations)
    })

    it('should include nextStep guidance', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
      })

      expect(result.nextStep).toContain('listings')
      expect(result.nextStep).toContain('contact info')
    })

    it('should include leadQuality in response', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
      })

      expect(result.leadQuality).toBeDefined()
      expect(['hot', 'warm', 'cold']).toContain(result.leadQuality)
    })
  })

  describe('edge cases', () => {
    it('should handle empty urgency factors array', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        urgencyFactors: [],
      })

      expect(result.success).toBe(true)
      // Empty array should not trigger hot lead status
      expect(result.leadQuality).toBe('warm')
    })

    it('should handle undefined optional fields', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        // All optional fields undefined
      })

      expect(result.success).toBe(true)
      expect(result.preferences.leadType).toBe('buyer')
    })

    it('should handle complex preferences combination', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        budget: { min: 700000, max: 1200000, range: '$700K-$1.2M' },
        propertyType: 'townhouse',
        bedrooms: 3,
        bathrooms: 2,
        locations: ['Richmond Hill', 'Markham'],
        timeline: '3-months',
        preApproved: true,
        urgencyFactors: ['growing family'],
      })

      expect(result.success).toBe(true)
      expect(result.leadQuality).toBe('hot') // 3-months timeline
      expect(result.preferences.locations).toHaveLength(2)
    })

    it('should handle investor lead type with urgency', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'investor',
        budget: { min: 1000000, max: 2000000 },
        urgencyFactors: ['tax deadline', 'market timing'],
      })

      expect(result.success).toBe(true)
      expect(result.preferences.leadType).toBe('investor')
      expect(result.leadQuality).toBe('hot')
    })

    it('should handle general lead type', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'general',
      })

      expect(result.success).toBe(true)
      expect(result.preferences.leadType).toBe('general')
      expect(result.leadQuality).toBe('warm')
    })
  })

  describe('bedroom and bathroom bounds', () => {
    it('should capture valid bedroom count', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        bedrooms: 5,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.bedrooms).toBe(5)
    })

    it('should capture valid bathroom count', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        bathrooms: 3,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.bathrooms).toBe(3)
    })
  })
})
