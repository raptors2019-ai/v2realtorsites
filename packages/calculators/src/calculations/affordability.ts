/**
 * Home affordability calculation
 * Calculate max home price based on income (extracted from chatbot)
 */

import type { AffordabilityInput, AffordabilityResult } from '../types'
import { getPaymentFactor, getStressTestRate } from './mortgage'
import { getCMHCRate } from '../constants/cmhc-rates'
import {
  GDS_MAX,
  TDS_MAX,
  DEFAULT_INTEREST_RATE,
  DEFAULT_PROPERTY_TAX_RATE,
  DEFAULT_HEATING_MONTHLY,
  DEFAULT_AMORTIZATION_YEARS,
} from '../constants/defaults'

/**
 * Calculate maximum affordable home price based on income
 */
export function calculateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const {
    annualIncome,
    downPayment,
    monthlyDebts = 0,
    interestRate = DEFAULT_INTEREST_RATE,
  } = input

  const monthlyIncome = annualIncome / 12
  const stressTestRate = getStressTestRate(interestRate)

  // Calculate max housing cost (GDS)
  const maxHousingGDS = monthlyIncome * GDS_MAX

  // Calculate max housing cost (TDS)
  const maxHousingTDS = monthlyIncome * TDS_MAX - monthlyDebts

  // Use the lower of the two
  const maxHousingCost = Math.min(maxHousingGDS, maxHousingTDS)

  // Binary search for max home price
  let low = downPayment
  let high = downPayment + 2000000

  while (high - low > 1000) {
    const mid = (low + high) / 2
    const mortgage = mid - downPayment

    const monthlyTax = (mid * DEFAULT_PROPERTY_TAX_RATE) / 12
    const availableForPI = maxHousingCost - monthlyTax - DEFAULT_HEATING_MONTHLY

    const paymentFactor = getPaymentFactor(stressTestRate, DEFAULT_AMORTIZATION_YEARS)
    const maxMortgageAtPrice = (availableForPI / paymentFactor) * 1000

    if (mortgage <= maxMortgageAtPrice) {
      low = mid
    } else {
      high = mid
    }
  }

  const maxHomePrice = Math.floor(low / 1000) * 1000
  const mortgageAmount = maxHomePrice - downPayment

  // Calculate actual monthly payment at current rate
  const paymentFactor = getPaymentFactor(interestRate, DEFAULT_AMORTIZATION_YEARS)
  const monthlyPayment = (mortgageAmount / 1000) * paymentFactor

  // Calculate CMHC if applicable
  const downPaymentPercent = (downPayment / maxHomePrice) * 100
  const cmhcRate = getCMHCRate(downPaymentPercent)
  const cmhcPremium = mortgageAmount * cmhcRate

  // Calculate property taxes
  const monthlyPropertyTax = (maxHomePrice * DEFAULT_PROPERTY_TAX_RATE) / 12

  return {
    maxHomePrice,
    mortgageAmount,
    monthlyPayment: Math.round(monthlyPayment),
    monthlyPropertyTax: Math.round(monthlyPropertyTax),
    monthlyHeating: DEFAULT_HEATING_MONTHLY,
    totalMonthlyHousing: Math.round(
      monthlyPayment + monthlyPropertyTax + DEFAULT_HEATING_MONTHLY
    ),
    downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
    cmhcPremium: cmhcPremium > 0 ? Math.round(cmhcPremium) : null,
    stressTestRate,
    gdsRatio: Math.round((maxHousingCost / monthlyIncome) * 100),
    tdsRatio: Math.round(
      ((maxHousingCost + monthlyDebts) / monthlyIncome) * 100
    ),
  }
}
