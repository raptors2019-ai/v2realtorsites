import {
  calculateLandTransferTax,
  calculateOntarioLTT,
  calculateTorontoLTT,
} from '../calculations/land-transfer-tax'
import {
  ONTARIO_FIRST_TIME_BUYER_REBATE,
  TORONTO_FIRST_TIME_BUYER_REBATE,
} from '../constants/ltt-rates'

describe('Land Transfer Tax calculations', () => {
  describe('calculateOntarioLTT', () => {
    it('should calculate correctly for homes under $55K', () => {
      expect(calculateOntarioLTT(50000)).toBe(250) // 0.5% of $50K
    })

    it('should calculate correctly for homes at $250K', () => {
      // 0.5% of first $55K = $275
      // 1.0% of next $195K ($55K-$250K) = $1,950
      // Total = $2,225
      expect(calculateOntarioLTT(250000)).toBe(2225)
    })

    it('should calculate correctly for homes at $400K', () => {
      // 0.5% of first $55K = $275
      // 1.0% of $55K-$250K = $1,950
      // 1.5% of $250K-$400K = $2,250
      // Total = $4,475
      expect(calculateOntarioLTT(400000)).toBe(4475)
    })

    it('should calculate correctly for homes at $2M', () => {
      // 0.5% of first $55K = $275
      // 1.0% of $55K-$250K = $1,950
      // 1.5% of $250K-$400K = $2,250
      // 2.0% of $400K-$2M = $32,000
      // Total = $36,475
      expect(calculateOntarioLTT(2000000)).toBe(36475)
    })

    it('should include 2.5% surtax for homes over $2M', () => {
      // Base tax at $2M = $36,475
      // Plus 2.5% on amount over $2M
      // At $2.5M: $36,475 + (0.025 * $500K) = $36,475 + $12,500 = $48,975
      expect(calculateOntarioLTT(2500000)).toBe(48975)
    })
  })

  describe('calculateTorontoLTT', () => {
    it('should calculate correctly for homes under $55K', () => {
      expect(calculateTorontoLTT(50000)).toBe(250) // 0.5% of $50K
    })

    it('should calculate correctly for homes at $400K', () => {
      // 0.5% of first $55K = $275
      // 1.0% of $55K-$250K = $1,950
      // 1.5% of $250K-$400K = $2,250
      // Total = $4,475
      expect(calculateTorontoLTT(400000)).toBe(4475)
    })

    it('should include 2.0% tier for $400K-$2M', () => {
      // At $500K:
      // 0.5% of first $55K = $275
      // 1.0% of $55K-$250K = $1,950
      // 1.5% of $250K-$400K = $2,250
      // 2.0% of $400K-$500K = $2,000
      // Total = $6,475
      expect(calculateTorontoLTT(500000)).toBe(6475)
    })

    it('should include 2.5% tier for homes over $2M', () => {
      // At $2.5M:
      // 0.5% of first $55K = $275
      // 1.0% of $55K-$250K = $1,950
      // 1.5% of $250K-$400K = $2,250
      // 2.0% of $400K-$2M = $32,000
      // 2.5% of $2M-$2.5M = $12,500
      // Total = $48,975
      expect(calculateTorontoLTT(2500000)).toBe(48975)
    })
  })

  describe('first-time buyer rebates', () => {
    it('should cap Ontario rebate at max value', () => {
      const result = calculateLandTransferTax({
        homePrice: 500000,
        isFirstTimeBuyer: true,
        isTorontoProperty: false,
      })

      expect(result.ontarioRebate).toBe(ONTARIO_FIRST_TIME_BUYER_REBATE)
    })

    it('should cap Toronto rebate at max value', () => {
      const result = calculateLandTransferTax({
        homePrice: 500000,
        isFirstTimeBuyer: true,
        isTorontoProperty: true,
      })

      expect(result.torontoRebate).toBe(TORONTO_FIRST_TIME_BUYER_REBATE)
    })

    it('should return actual LTT if less than max rebate', () => {
      const result = calculateLandTransferTax({
        homePrice: 100000,
        isFirstTimeBuyer: true,
        isTorontoProperty: false,
      })

      // At $100K, Ontario LTT is less than $4,000
      expect(result.ontarioRebate).toBeLessThan(ONTARIO_FIRST_TIME_BUYER_REBATE)
      expect(result.ontarioRebate).toBe(result.ontarioLTT) // Full rebate
    })
  })

  describe('calculateLandTransferTax', () => {
    it('should calculate Ontario-only LTT', () => {
      const result = calculateLandTransferTax({
        homePrice: 500000,
        isFirstTimeBuyer: false,
        isTorontoProperty: false,
      })

      expect(result.ontarioLTT).toBeGreaterThan(0)
      expect(result.torontoLTT).toBe(0)
      expect(result.totalLTT).toBe(result.ontarioLTT)
    })

    it('should calculate combined Ontario + Toronto LTT', () => {
      const result = calculateLandTransferTax({
        homePrice: 500000,
        isFirstTimeBuyer: false,
        isTorontoProperty: true,
      })

      expect(result.ontarioLTT).toBeGreaterThan(0)
      expect(result.torontoLTT).toBeGreaterThan(0)
      expect(result.totalLTT).toBe(result.ontarioLTT + result.torontoLTT)
    })

    it('should apply first-time buyer rebates', () => {
      const withoutRebate = calculateLandTransferTax({
        homePrice: 500000,
        isFirstTimeBuyer: false,
        isTorontoProperty: true,
      })

      const withRebate = calculateLandTransferTax({
        homePrice: 500000,
        isFirstTimeBuyer: true,
        isTorontoProperty: true,
      })

      expect(withRebate.ontarioRebate).toBe(4000)
      expect(withRebate.torontoRebate).toBe(4475)
      expect(withRebate.netLTT).toBeLessThan(withoutRebate.netLTT)
    })

    it('should not have negative netLTT', () => {
      const result = calculateLandTransferTax({
        homePrice: 100000,
        isFirstTimeBuyer: true,
        isTorontoProperty: false,
      })

      expect(result.netLTT).toBeGreaterThanOrEqual(0)
    })
  })
})
