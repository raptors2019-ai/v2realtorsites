import {
  calculateMortgage,
  calculateMonthlyPayment,
  getPaymentFactor,
  getStressTestRate,
} from '../calculations/mortgage'

describe('mortgage calculations', () => {
  describe('getPaymentFactor', () => {
    it('should calculate correct payment factor per $1000 for standard rate and term', () => {
      const factor = getPaymentFactor(5, 25)
      // At 5% over 25 years, factor per $1000 should be approximately $5.85
      expect(factor).toBeCloseTo(5.85, 1)
    })

    it('should handle 0% interest rate', () => {
      const factor = getPaymentFactor(0, 25)
      // At 0%, factor is simply 1000 / (years * 12) = 1000/300 ≈ 3.33
      expect(factor).toBeCloseTo(1000 / 300, 1)
    })

    it('should handle different amortization periods', () => {
      const factor15 = getPaymentFactor(5, 15)
      const factor30 = getPaymentFactor(5, 30)
      // Shorter term = higher payment factor
      expect(factor15).toBeGreaterThan(factor30)
    })
  })

  describe('getStressTestRate', () => {
    it('should return contract rate + 2% when higher than floor', () => {
      const rate = getStressTestRate(4.5)
      expect(rate).toBe(6.5)
    })

    it('should return floor rate when contract + 2% is lower', () => {
      const rate = getStressTestRate(2.0)
      expect(rate).toBe(5.25) // Floor rate
    })

    it('should return floor rate at boundary', () => {
      const rate = getStressTestRate(3.25)
      expect(rate).toBe(5.25) // 3.25 + 2 = 5.25, equals floor
    })
  })

  describe('calculateMonthlyPayment', () => {
    it('should calculate correct monthly payment', () => {
      const payment = calculateMonthlyPayment(400000, 5, 25)
      // $400K at 5% over 25 years ≈ $2,338/month
      expect(payment).toBeCloseTo(2338, -1)
    })

    it('should handle different loan amounts', () => {
      const payment1 = calculateMonthlyPayment(200000, 5, 25)
      const payment2 = calculateMonthlyPayment(400000, 5, 25)
      // Double the loan = double the payment
      expect(payment2).toBeCloseTo(payment1 * 2, 0)
    })
  })

  describe('calculateMortgage', () => {
    it('should calculate full mortgage details', () => {
      const result = calculateMortgage({
        homePrice: 500000,
        downPayment: 100000,
        interestRate: 5,
        amortizationYears: 25,
      })

      expect(result.mortgageAmount).toBe(400000)
      expect(result.downPaymentPercent).toBe(20)
      expect(result.monthlyPayment).toBeCloseTo(2338, -1)
      expect(result.totalInterest).toBeGreaterThan(0)
      expect(result.totalCost).toBe(result.mortgageAmount + result.totalInterest)
    })

    it('should calculate correct down payment percentage', () => {
      const result = calculateMortgage({
        homePrice: 500000,
        downPayment: 50000,
        interestRate: 5,
        amortizationYears: 25,
      })

      expect(result.downPaymentPercent).toBe(10)
      expect(result.mortgageAmount).toBe(450000)
    })

    it('should calculate higher payment for shorter amortization', () => {
      const result25 = calculateMortgage({
        homePrice: 500000,
        downPayment: 100000,
        interestRate: 5,
        amortizationYears: 25,
      })

      const result15 = calculateMortgage({
        homePrice: 500000,
        downPayment: 100000,
        interestRate: 5,
        amortizationYears: 15,
      })

      // Shorter term = higher monthly payment
      expect(result15.monthlyPayment).toBeGreaterThan(result25.monthlyPayment)
      // But lower total interest
      expect(result15.totalInterest).toBeLessThan(result25.totalInterest)
    })
  })
})
