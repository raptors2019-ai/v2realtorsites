// Mock the BoldTrailClient before importing the tool
jest.mock('@repo/crm', () => ({
  BoldTrailClient: jest.fn().mockImplementation(() => ({
    createContact: jest.fn().mockResolvedValue({
      success: true,
      contactId: 'test-contact-123',
    }),
  })),
}))

import { createContactTool } from '../tools/create-contact'
import { BoldTrailClient } from '@repo/crm'

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

describe('createContactTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(createContactTool.description).toContain('[PURPOSE]')
      expect(createContactTool.description).toContain('BoldTrail CRM')
      expect(createContactTool.description).toContain('lead scoring')
    })

    it('should mention value-first approach', () => {
      expect(createContactTool.description).toContain('ONLY after providing value')
      expect(createContactTool.description).toContain('Never ask for contact info first')
    })
  })

  describe('lead quality scoring', () => {
    describe('hot leads (score >= 5)', () => {
      it('should score as hot with phone + pre-approved', async () => {
        const result = await createContactTool.execute({
          firstName: 'John',
          email: 'john@example.com',
          cellPhone: '4165551234',
          leadType: 'buyer',
          preApproved: true,
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score as hot with phone + ASAP timeline', async () => {
        const result = await createContactTool.execute({
          firstName: 'Jane',
          email: 'jane@example.com',
          cellPhone: '4165551234',
          leadType: 'buyer',
          timeline: 'asap',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score as hot with phone + 1-3 months timeline + urgency factors', async () => {
        const result = await createContactTool.execute({
          firstName: 'Bob',
          email: 'bob@example.com',
          cellPhone: '4165551234',
          leadType: 'buyer',
          timeline: '1-3-months',
          urgencyFactors: ['relocating'],
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })
    })

    describe('warm leads (score 2-4)', () => {
      it('should score as warm with only phone', async () => {
        const result = await createContactTool.execute({
          firstName: 'Alice',
          email: 'alice@example.com',
          cellPhone: '4165551234',
          leadType: 'buyer',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should score as warm with pre-approved but no phone', async () => {
        const result = await createContactTool.execute({
          firstName: 'Charlie',
          email: 'charlie@example.com',
          leadType: 'buyer',
          preApproved: true,
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should score as warm with 1-3 months timeline', async () => {
        const result = await createContactTool.execute({
          firstName: 'David',
          email: 'david@example.com',
          leadType: 'buyer',
          timeline: '1-3-months',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })
    })

    describe('cold leads (score < 2)', () => {
      it('should score as cold with only email', async () => {
        const result = await createContactTool.execute({
          firstName: 'Eve',
          email: 'eve@example.com',
          leadType: 'buyer',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('cold')
      })

      it('should score as cold with just-exploring timeline', async () => {
        const result = await createContactTool.execute({
          firstName: 'Frank',
          email: 'frank@example.com',
          leadType: 'buyer',
          timeline: 'just-exploring',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('cold')
      })

      it('should score as cold with first-time buyer flag only', async () => {
        const result = await createContactTool.execute({
          firstName: 'Grace',
          email: 'grace@example.com',
          leadType: 'buyer',
          firstTimeBuyer: true,
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('cold')
      })
    })
  })

  describe('hashtag generation', () => {
    it('should always include website source tag', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('website')
    })

    it('should include specific source tag', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        source: 'sri-collective',
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('website')
      expect(result.hashtags).toContain('sri-collective')
    })

    it('should include lead quality tag', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        cellPhone: '4165551234',
        leadType: 'buyer',
        preApproved: true,
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('hot-lead')
    })

    it('should include timeline tag', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        timeline: '1-3-months',
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('timeline-1-3-months')
    })

    it('should include lead type tag', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'seller',
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('seller')
    })

    it('should include qualification tags', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        preApproved: true,
        firstTimeBuyer: true,
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('pre-approved')
      expect(result.hashtags).toContain('first-time-buyer')
    })

    it('should include property type tags', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        propertyTypes: ['Detached', 'Townhouse'],
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('detached')
      expect(result.hashtags).toContain('townhouse')
    })

    it('should include budget tag', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        averagePrice: 900000,
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('budget-750k-1m')
    })

    it('should include location tags', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        preferredCity: 'Richmond Hill',
        preferredNeighborhoods: ['Oak Ridges', 'Mill Pond'],
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('richmond-hill')
      expect(result.hashtags).toContain('oak-ridges')
      expect(result.hashtags).toContain('mill-pond')
    })

    it('should include urgency factor tags', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        urgencyFactors: ['relocating', 'lease ending'],
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('relocating')
      expect(result.hashtags).toContain('lease-ending')
    })

    it('should include mortgage-estimated tag when estimate provided', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        mortgageEstimate: {
          annualIncome: 120000,
          downPayment: 100000,
          maxPrice: 650000,
        },
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('mortgage-estimated')
    })
  })

  describe('budget hashtag formatting', () => {
    const budgetCases = [
      { budget: 400000, expected: 'budget-under-500k' },
      { budget: 600000, expected: 'budget-500k-750k' },
      { budget: 900000, expected: 'budget-750k-1m' },
      { budget: 1200000, expected: 'budget-1m-1.5m' },
      { budget: 1800000, expected: 'budget-1.5m-2m' },
      { budget: 2500000, expected: 'budget-2m-plus' },
    ]

    it.each(budgetCases)('should format $budget as $expected', async ({ budget, expected }) => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        averagePrice: budget,
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain(expected)
    })
  })

  describe('phone validation', () => {
    it('should accept valid 10-digit phone', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        cellPhone: '4165551234',
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
    })

    it('should accept valid 11-digit phone', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        cellPhone: '14165551234',
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
    })

    it('should accept formatted phone numbers', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        cellPhone: '(416) 555-1234',
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
    })

    it('should reject invalid phone numbers', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        cellPhone: '123456',
        leadType: 'buyer',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid phone format')
    })
  })

  describe('thank you message generation', () => {
    it('should mention immediate follow-up for hot leads with phone', async () => {
      const result = await createContactTool.execute({
        firstName: 'John',
        email: 'john@example.com',
        cellPhone: '4165551234',
        leadType: 'buyer',
        preApproved: true,
        timeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('immediate follow-up')
      expect(result.message).toContain('within the hour')
    })

    it('should mention call for leads with phone', async () => {
      const result = await createContactTool.execute({
        firstName: 'Jane',
        email: 'jane@example.com',
        cellPhone: '4165551234',
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('call')
    })

    it('should mention email for leads without phone', async () => {
      const result = await createContactTool.execute({
        firstName: 'Bob',
        email: 'bob@example.com',
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('bob@example.com')
    })
  })

  describe('seller leads', () => {
    it('should handle seller lead type', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'seller',
        propertyAddress: '123 Main St',
        reasonForSelling: 'Downsizing',
        sellerTimeline: 'asap',
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('seller')
      expect(result.hashtags).toContain('seller-timeline-asap')
    })
  })

  describe('mortgage estimate integration', () => {
    it('should use mortgage estimate for budget tag', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        mortgageEstimate: {
          annualIncome: 120000,
          downPayment: 100000,
          maxPrice: 650000,
        },
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('budget-500k-750k')
    })

    it('should prefer explicit averagePrice over mortgage estimate', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
        averagePrice: 1200000,
        mortgageEstimate: {
          annualIncome: 120000,
          downPayment: 100000,
          maxPrice: 650000,
        },
      })

      expect(result.success).toBe(true)
      expect(result.hashtags).toContain('budget-1m-1.5m')
    })
  })

  describe('CRM integration', () => {
    it('should call BoldTrailClient with correct data', async () => {
      const mockCreateContact = jest.fn().mockResolvedValue({
        success: true,
        contactId: 'test-123',
      })
      ;(BoldTrailClient as jest.Mock).mockImplementation(() => ({
        createContact: mockCreateContact,
      }))

      await createContactTool.execute({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        cellPhone: '4165551234',
        leadType: 'buyer',
        averagePrice: 900000,
        preferredCity: 'Toronto',
      })

      expect(mockCreateContact).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '4165551234',
          leadType: 'buyer',
        })
      )
    })

    it('should return contactId on success', async () => {
      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
      expect(result.contactId).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle CRM errors gracefully', async () => {
      ;(BoldTrailClient as jest.Mock).mockImplementation(() => ({
        createContact: jest.fn().mockResolvedValue({
          success: false,
          error: 'CRM Error',
        }),
      }))

      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
      })

      expect(result.success).toBe(false)
      expect(result.message).toBeDefined() // Should still have friendly message
    })

    it('should handle exceptions gracefully', async () => {
      ;(BoldTrailClient as jest.Mock).mockImplementation(() => ({
        createContact: jest.fn().mockRejectedValue(new Error('Network error')),
      }))

      const result = await createContactTool.execute({
        firstName: 'Test',
        email: 'test@example.com',
        leadType: 'buyer',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.message).toBeDefined() // Should still have friendly fallback
    })
  })
})
