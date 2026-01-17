import { calculateCMHC, getCMHCRateDescription } from '../calculations/cmhc'
import { getCMHCRate, getMinimumDownPayment } from '../constants/cmhc-rates'

describe('CMHC calculations', () => {
  describe('getCMHCRate', () => {
    it('should return 4% for 5-9.99% down payment', () => {
      expect(getCMHCRate(5)).toBe(0.04)
      expect(getCMHCRate(9.99)).toBe(0.04)
    })

    it('should return 3.1% for 10-14.99% down payment', () => {
      expect(getCMHCRate(10)).toBe(0.031)
      expect(getCMHCRate(14.99)).toBe(0.031)
    })

    it('should return 2.8% for 15-19.99% down payment', () => {
      expect(getCMHCRate(15)).toBe(0.028)
      expect(getCMHCRate(19.99)).toBe(0.028)
    })

    it('should return 0 for 20%+ down payment', () => {
      expect(getCMHCRate(20)).toBe(0)
      expect(getCMHCRate(50)).toBe(0)
    })
  })

  describe('getCMHCRateDescription', () => {
    it('should describe rate tiers correctly', () => {
      expect(getCMHCRateDescription(7)).toContain('4.0%')
      expect(getCMHCRateDescription(12)).toContain('3.1%')
      expect(getCMHCRateDescription(17)).toContain('2.8%')
      expect(getCMHCRateDescription(25).toLowerCase()).toContain('not required')
    })
  })

  describe('getMinimumDownPayment', () => {
    it('should return 5% for homes under $500K', () => {
      expect(getMinimumDownPayment(400000)).toBe(20000)
      expect(getMinimumDownPayment(500000)).toBe(25000)
    })

    it('should return 5% on first $500K + 10% on remainder for $500K-$1M', () => {
      // $750K: 5% of $500K + 10% of $250K = $25K + $25K = $50K
      expect(getMinimumDownPayment(750000)).toBe(50000)
      // $1M: 5% of $500K + 10% of $500K = $25K + $50K = $75K
      expect(getMinimumDownPayment(1000000)).toBe(75000)
    })

    it('should return 20% for homes over $1M', () => {
      expect(getMinimumDownPayment(1500000)).toBe(300000)
      expect(getMinimumDownPayment(2000000)).toBe(400000)
    })
  })

  describe('calculateCMHC', () => {
    it('should calculate premium for 10% down payment', () => {
      const result = calculateCMHC({
        homePrice: 500000,
        downPayment: 50000,
      })

      expect(result.isRequired).toBe(true)
      expect(result.mortgageAmount).toBe(450000)
      expect(result.premiumRate).toBe(0.031)
      expect(result.premium).toBe(13950) // 450000 * 0.031
      expect(result.pstOnPremium).toBe(1116) // 13950 * 0.08
      expect(result.totalWithPST).toBe(15066) // 13950 + 1116
    })

    it('should not require CMHC for 20%+ down', () => {
      const result = calculateCMHC({
        homePrice: 500000,
        downPayment: 100000,
      })

      expect(result.isRequired).toBe(false)
      expect(result.premium).toBe(0)
      expect(result.pstOnPremium).toBe(0)
    })

    it('should calculate for 5% down payment', () => {
      const result = calculateCMHC({
        homePrice: 400000,
        downPayment: 20000,
      })

      expect(result.isRequired).toBe(true)
      expect(result.premiumRate).toBe(0.04)
      expect(result.premium).toBe(15200) // 380000 * 0.04
    })

    it('should handle edge case at 15% down', () => {
      const result = calculateCMHC({
        homePrice: 500000,
        downPayment: 75000,
      })

      expect(result.isRequired).toBe(true)
      expect(result.premiumRate).toBe(0.028)
    })
  })
})
