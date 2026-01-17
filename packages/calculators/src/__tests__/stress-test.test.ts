import { calculateStressTest } from '../calculations/stress-test'
import { STRESS_TEST_FLOOR } from '../constants/defaults'

describe('Stress Test calculations', () => {
  it('should use contract rate + 2% when higher than floor', () => {
    const result = calculateStressTest({
      homePrice: 500000,
      downPayment: 100000,
      contractRate: 5.0,
      amortizationYears: 25,
    })

    expect(result.contractRate).toBe(5.0)
    expect(result.stressTestRate).toBe(7.0) // 5.0 + 2.0
  })

  it('should use floor rate when contract + 2% is lower', () => {
    const result = calculateStressTest({
      homePrice: 500000,
      downPayment: 100000,
      contractRate: 2.5,
      amortizationYears: 25,
    })

    expect(result.contractRate).toBe(2.5)
    expect(result.stressTestRate).toBe(STRESS_TEST_FLOOR) // 5.25
  })

  it('should calculate higher payment at stress test rate', () => {
    const result = calculateStressTest({
      homePrice: 500000,
      downPayment: 100000,
      contractRate: 4.5,
      amortizationYears: 25,
    })

    expect(result.stressTestPayment).toBeGreaterThan(result.contractPayment)
    // Payment increase should be positive
    expect(result.paymentIncrease).toBeGreaterThan(0)
    expect(result.paymentIncreasePercent).toBeGreaterThan(0)
  })

  it('should calculate qualifying income based on stress test rate', () => {
    const result = calculateStressTest({
      homePrice: 500000,
      downPayment: 100000,
      contractRate: 4.5,
      amortizationYears: 25,
    })

    // Qualifying income should be based on GDS ratio at stress test rate
    expect(result.qualifyingIncome).toBeGreaterThan(0)
    // Higher stress test rate = higher qualifying income needed
    expect(result.qualifyingIncome).toBeGreaterThan(result.contractPayment * 12)
  })

  it('should handle different amortization periods', () => {
    const result25 = calculateStressTest({
      homePrice: 500000,
      downPayment: 100000,
      contractRate: 5.0,
      amortizationYears: 25,
    })

    const result30 = calculateStressTest({
      homePrice: 500000,
      downPayment: 100000,
      contractRate: 5.0,
      amortizationYears: 30,
    })

    // Longer amortization = lower monthly payment
    expect(result30.contractPayment).toBeLessThan(result25.contractPayment)
    expect(result30.stressTestPayment).toBeLessThan(result25.stressTestPayment)
  })

  it('should calculate payment increase percentage correctly', () => {
    const result = calculateStressTest({
      homePrice: 500000,
      downPayment: 100000,
      contractRate: 4.5,
      amortizationYears: 25,
    })

    // Payment increase percent should be around 20-30% for typical rates
    expect(result.paymentIncreasePercent).toBeGreaterThan(10)
    expect(result.paymentIncreasePercent).toBeLessThan(50)
  })

  it('should account for mortgage amount after down payment', () => {
    const result = calculateStressTest({
      homePrice: 600000,
      downPayment: 120000,
      contractRate: 5.0,
      amortizationYears: 25,
    })

    // Mortgage should be home price minus down payment
    // Payment calculations should be based on $480K mortgage
    expect(result.contractPayment).toBeGreaterThan(2000) // Sanity check
    expect(result.contractPayment).toBeLessThan(4000) // Sanity check
  })
})
