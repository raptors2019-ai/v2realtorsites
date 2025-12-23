import { firstTimeBuyerFAQTool } from '../tools/first-time-buyer-faq'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

describe('firstTimeBuyerFAQTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(firstTimeBuyerFAQTool.description).toContain('[PURPOSE]')
      expect(firstTimeBuyerFAQTool.description).toContain('first-time buyer')
      expect(firstTimeBuyerFAQTool.description).toContain('Ontario')
    })

    it('should mention key topics in description', () => {
      expect(firstTimeBuyerFAQTool.description).toContain('closing costs')
      expect(firstTimeBuyerFAQTool.description).toContain('FHSA')
      expect(firstTimeBuyerFAQTool.description).toContain('HBP')
    })
  })

  describe('home buying process', () => {
    it('should answer process questions with explicit topic', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What is the home buying process?',
        topic: 'home-buying-process',
      })

      expect(result.success).toBe(true)
      expect(result.topic).toBe('home-buying-process')
      expect(result.message).toBeDefined()
    })

    it('should match process questions via keywords', async () => {
      const questions = [
        'How do I start buying a home?',
        'What are the steps to buy a house?',
        'What is the buying process?',
      ]

      for (const question of questions) {
        const result = await firstTimeBuyerFAQTool.execute({ question })
        expect(result.success).toBe(true)
        expect(result.topic).toBe('home-buying-process')
      }
    })

    it('should include numbered steps', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'How do I buy a home?',
        topic: 'home-buying-process',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('1.')
      expect(result.message).toContain('2.')
    })
  })

  describe('closing costs', () => {
    it('should answer closing cost questions', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What are the closing costs when buying a home?',
        topic: 'closing-costs',
      })

      expect(result.success).toBe(true)
      expect(result.topic).toBe('closing-costs')
    })

    it('should match closing cost keywords', async () => {
      const questions = [
        'How much are the fees?',
        'What additional costs should I budget for?',
        'What expenses are there besides down payment?',
      ]

      for (const question of questions) {
        const result = await firstTimeBuyerFAQTool.execute({ question })
        expect(result.success).toBe(true)
        expect(result.topic).toBe('closing-costs')
      }
    })

    it('should include cost breakdown', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What are closing costs?',
        topic: 'closing-costs',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Cost Breakdown')
    })
  })

  describe('first-time buyer incentives', () => {
    it('should answer incentive questions', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What rebates can I get as a first-time buyer?',
        topic: 'first-time-buyer-incentives',
      })

      expect(result.success).toBe(true)
      expect(result.topic).toBe('first-time-buyer-incentives')
    })

    it('should match incentive keywords', async () => {
      const questions = [
        'What incentives are available for first time buyers?',
        'Tell me about FHSA',
        'How does the HBP work?',
        'Are there any grants for first time buyers?',
      ]

      for (const question of questions) {
        const result = await firstTimeBuyerFAQTool.execute({ question })
        expect(result.success).toBe(true)
        expect(result.topic).toBe('first-time-buyer-incentives')
      }
    })

    it('should include program details', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What rebates are there?',
        topic: 'first-time-buyer-incentives',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Available Programs')
    })

    it('should mention total potential savings', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What can I save as first time buyer?',
        topic: 'first-time-buyer-incentives',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Total Potential Savings')
    })
  })

  describe('pre-approval', () => {
    it('should answer pre-approval questions', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What is pre-approval?',
        topic: 'pre-approval',
      })

      expect(result.success).toBe(true)
      expect(result.topic).toBe('pre-approval')
    })

    it('should match pre-approval keywords', async () => {
      const questions = [
        'How do I get pre-approved?',
        'What is mortgage approval?',
        'Should I get preapproval first?',
      ]

      for (const question of questions) {
        const result = await firstTimeBuyerFAQTool.execute({ question })
        expect(result.success).toBe(true)
        expect(result.topic).toBe('pre-approval')
      }
    })

    it('should include benefits of pre-approval', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'Why should I get pre-approved?',
        topic: 'pre-approval',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Benefits')
    })
  })

  describe('down payment', () => {
    it('should answer down payment questions', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'How much do I need for a down payment?',
        topic: 'down-payment',
      })

      expect(result.success).toBe(true)
      expect(result.topic).toBe('down-payment')
    })

    it('should match down payment keywords', async () => {
      const questions = [
        'What is the minimum down payment?',
        'How much should I save for a deposit?',
        'How much down payment do I need?',
      ]

      for (const question of questions) {
        const result = await firstTimeBuyerFAQTool.execute({ question })
        expect(result.success).toBe(true)
        expect(result.topic).toBe('down-payment')
      }
    })

    it('should include requirements', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What down payment do I need?',
        topic: 'down-payment',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('Requirements')
    })
  })

  describe('unmatched questions', () => {
    it('should suggest handoff for unknown questions', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What color should I paint my house?',
      })

      expect(result.success).toBe(false)
      expect(result.handoffSuggested).toBe(true)
      expect(result.fallbackAction).toBe('handoff-to-agent')
    })

    it('should provide helpful message for unknown questions', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'How do I negotiate?',
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain('speaking with')
      expect(result.message).toContain('agent')
    })

    it('should handle general topic parameter', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'Random question',
        topic: 'general',
      })

      // Should try to match or fall back
      expect(result).toBeDefined()
    })
  })

  describe('output formatting', () => {
    it('should include markdown headers', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'How do I buy a home?',
        topic: 'home-buying-process',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('##')
    })

    it('should include disclaimer', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What are closing costs?',
        topic: 'closing-costs',
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('general guidance')
      expect(result.message).toContain('personalized advice')
    })

    it('should provide related topics', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'How do I buy a home?',
        topic: 'home-buying-process',
      })

      expect(result.success).toBe(true)
      expect(result.relatedTopics).toBeDefined()
      expect(result.relatedTopics.length).toBeGreaterThan(0)
      expect(result.relatedTopics).not.toContain('home-buying-process')
    })
  })

  describe('CRM data', () => {
    it('should mark as first-time buyer', async () => {
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What rebates can I get?',
        topic: 'first-time-buyer-incentives',
      })

      expect(result.success).toBe(true)
      expect(result.crmData).toBeDefined()
      expect(result.crmData.firstTimeBuyer).toBe(true)
    })

    it('should include CRM data for all successful responses', async () => {
      const topics = [
        'home-buying-process',
        'closing-costs',
        'first-time-buyer-incentives',
        'pre-approval',
        'down-payment',
      ] as const

      for (const topic of topics) {
        const result = await firstTimeBuyerFAQTool.execute({
          question: 'Test question',
          topic,
        })

        expect(result.success).toBe(true)
        expect(result.crmData).toBeDefined()
        expect(result.crmData.firstTimeBuyer).toBe(true)
      }
    })
  })

  describe('keyword matching algorithm', () => {
    it('should match multiple keywords for better accuracy', async () => {
      // "first time buyer incentives" contains multiple keywords
      const result = await firstTimeBuyerFAQTool.execute({
        question: 'What first time buyer incentives and programs are available?',
      })

      expect(result.success).toBe(true)
      expect(result.topic).toBe('first-time-buyer-incentives')
    })

    it('should be case insensitive', async () => {
      const results = await Promise.all([
        firstTimeBuyerFAQTool.execute({ question: 'WHAT ARE CLOSING COSTS?' }),
        firstTimeBuyerFAQTool.execute({ question: 'what are Closing Costs?' }),
        firstTimeBuyerFAQTool.execute({ question: 'What Are CLOSING costs?' }),
      ])

      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.topic).toBe('closing-costs')
      })
    })
  })
})
