import { calculateRequiredIncome } from '../calculations/required-income'
import { GDS_MAX, TDS_MAX } from '../constants/defaults'

describe('Required Income calculations', () => {
  it('should calculate required income for a given home price', () => {
    const result = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 100000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    expect(result.requiredAnnualIncome).toBeGreaterThan(0)
    expect(result.gdsRatio).toBeLessThanOrEqual(GDS_MAX * 100 + 0.1)
    expect(result.tdsRatio).toBeLessThanOrEqual(TDS_MAX * 100 + 0.1)
  })

  it('should require higher income with monthly debts', () => {
    const withoutDebts = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 100000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    const withDebts = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 100000,
      interestRate: 5.0,
      monthlyDebts: 500,
    })

    expect(withDebts.requiredAnnualIncome).toBeGreaterThan(withoutDebts.requiredAnnualIncome)
  })

  it('should calculate housing costs breakdown', () => {
    const result = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 100000,
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

  it('should calculate GDS at approximately max allowed', () => {
    const result = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 100000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    // With no debts, GDS should be the constraint (around 39%)
    expect(result.gdsRatio).toBeCloseTo(39, 0)
  })

  it('should handle different down payment amounts', () => {
    const smallDown = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 50000, // 10%
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    const largeDown = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 150000, // 30%
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    // Smaller down payment = higher mortgage = higher required income
    expect(smallDown.requiredAnnualIncome).toBeGreaterThan(largeDown.requiredAnnualIncome)
  })

  it('should return monthly and annual income values that are consistent', () => {
    const result = calculateRequiredIncome({
      homePrice: 500000,
      downPayment: 100000,
      interestRate: 5.0,
      monthlyDebts: 0,
    })

    // Due to rounding, values may differ slightly
    const annualFromMonthly = result.requiredMonthlyIncome * 12
    expect(result.requiredAnnualIncome).toBeCloseTo(annualFromMonthly, -1)
  })
})
