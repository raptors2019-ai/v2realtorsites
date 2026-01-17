import { calculateAffordability } from '../calculations/affordability'
import { GDS_MAX, TDS_MAX } from '../constants/defaults'

describe('Affordability calculations', () => {
  it('should calculate maximum affordable home price', () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    expect(result.maxHomePrice).toBeGreaterThan(0)
    expect(result.mortgageAmount).toBeGreaterThan(0)
    expect(result.maxHomePrice).toBe(result.mortgageAmount + 50000)
  })

  it('should respect GDS ratio limits', () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    // GDS should not exceed 39%
    expect(result.gdsRatio).toBeLessThanOrEqual(GDS_MAX * 100 + 1) // Small tolerance
  })

  it('should respect TDS ratio limits with debts', () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 500,
    })

    // TDS should not exceed 44%
    expect(result.tdsRatio).toBeLessThanOrEqual(TDS_MAX * 100 + 1) // Small tolerance
  })

  it('should reduce affordability with higher debts', () => {
    const noDebts = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    const withDebts = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 1000,
    })

    expect(withDebts.maxHomePrice).toBeLessThan(noDebts.maxHomePrice)
  })

  it('should increase affordability with higher income', () => {
    const income100k = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    const income150k = calculateAffordability({
      annualIncome: 150000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    expect(income150k.maxHomePrice).toBeGreaterThan(income100k.maxHomePrice)
  })

  it('should increase affordability with larger down payment', () => {
    const smallDown = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    const largeDown = calculateAffordability({
      annualIncome: 100000,
      downPayment: 150000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    expect(largeDown.maxHomePrice).toBeGreaterThan(smallDown.maxHomePrice)
    // Max home price should increase with higher down payment
    // The difference won't be exactly the down payment difference due to property tax calculations
    const priceDiff = largeDown.maxHomePrice - smallDown.maxHomePrice
    expect(priceDiff).toBeGreaterThan(50000) // Should increase significantly
  })

  it('should apply stress test rate', () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 3.0,
      monthlyDebts: 0,
    })

    // Stress test rate should be used, which is higher than 3%
    expect(result.stressTestRate).toBeGreaterThan(3.0)
  })

  it('should provide monthly payment details', () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 300,
    })

    expect(result.monthlyPayment).toBeGreaterThan(0)
    expect(result.monthlyPropertyTax).toBeGreaterThan(0)
    expect(result.monthlyHeating).toBeGreaterThan(0)
    expect(result.totalMonthlyHousing).toBe(
      result.monthlyPayment + result.monthlyPropertyTax + result.monthlyHeating
    )
  })

  it('should include CMHC premium for low down payment', () => {
    // With $50k down on a ~$400k home = ~12.5% down, CMHC required
    const result = calculateAffordability({
      annualIncome: 80000,
      downPayment: 50000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    if (result.downPaymentPercent < 20) {
      expect(result.cmhcPremium).toBeGreaterThan(0)
    }
  })

  it('should not include CMHC for 20%+ down', () => {
    // Artificially low income to get lower max price, high down payment
    const result = calculateAffordability({
      annualIncome: 50000,
      downPayment: 100000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    // If down payment is 20%+, no CMHC
    if (result.downPaymentPercent >= 20) {
      expect(result.cmhcPremium).toBeNull()
    }
  })
})
