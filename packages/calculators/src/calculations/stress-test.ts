/**
 * Mortgage stress test calculation
 * Canadian banks must qualify borrowers at the stress test rate
 */

import type { StressTestInput, StressTestResult } from '../types'
import {
  getStressTestRate,
  calculateMonthlyPayment,
} from './mortgage'
import {
  GDS_MAX,
  DEFAULT_PROPERTY_TAX_RATE,
  DEFAULT_HEATING_MONTHLY,
  DEFAULT_AMORTIZATION_YEARS,
} from '../constants/defaults'

/**
 * Calculate stress test results
 */
export function calculateStressTest(input: StressTestInput): StressTestResult {
  const {
    homePrice,
    downPayment,
    contractRate,
    amortizationYears = DEFAULT_AMORTIZATION_YEARS,
  } = input

  const mortgageAmount = homePrice - downPayment
  const stressTestRate = getStressTestRate(contractRate)

  // Calculate payments at both rates
  const contractPayment = calculateMonthlyPayment(
    mortgageAmount,
    contractRate,
    amortizationYears
  )

  const stressTestPayment = calculateMonthlyPayment(
    mortgageAmount,
    stressTestRate,
    amortizationYears
  )

  const paymentIncrease = stressTestPayment - contractPayment
  const paymentIncreasePercent =
    ((stressTestPayment - contractPayment) / contractPayment) * 100

  // Calculate qualifying income at stress test rate
  // GDS = (P&I + Property Tax + Heating) / Gross Monthly Income <= 39%
  const monthlyPropertyTax = (homePrice * DEFAULT_PROPERTY_TAX_RATE) / 12
  const totalHousingCost =
    stressTestPayment + monthlyPropertyTax + DEFAULT_HEATING_MONTHLY

  // qualifyingIncome = totalHousingCost / GDS_MAX
  const qualifyingMonthlyIncome = totalHousingCost / GDS_MAX
  const qualifyingIncome = Math.round(qualifyingMonthlyIncome * 12)

  // For "passes stress test", we'd need the borrower's income
  // Since we don't have it here, we just show the qualifying income needed
  const passesStressTest = true // Placeholder - would need income input

  return {
    contractRate,
    stressTestRate,
    contractPayment: Math.round(contractPayment),
    stressTestPayment: Math.round(stressTestPayment),
    paymentIncrease: Math.round(paymentIncrease),
    paymentIncreasePercent: Math.round(paymentIncreasePercent * 10) / 10,
    passesStressTest,
    qualifyingIncome,
  }
}
