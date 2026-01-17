/**
 * Calculate required income to afford a home
 * Based on GDS/TDS rules
 */

import type { RequiredIncomeInput, RequiredIncomeResult } from '../types'
import { calculateMonthlyPayment, getStressTestRate } from './mortgage'
import {
  GDS_MAX,
  TDS_MAX,
  DEFAULT_INTEREST_RATE,
  DEFAULT_AMORTIZATION_YEARS,
  DEFAULT_PROPERTY_TAX_RATE,
  DEFAULT_HEATING_MONTHLY,
} from '../constants/defaults'

/**
 * Calculate the required income to qualify for a home
 */
export function calculateRequiredIncome(
  input: RequiredIncomeInput
): RequiredIncomeResult {
  const {
    homePrice,
    downPayment,
    monthlyDebts = 0,
    interestRate = DEFAULT_INTEREST_RATE,
  } = input

  const mortgageAmount = homePrice - downPayment
  const stressTestRate = getStressTestRate(interestRate)

  // Calculate housing costs at stress test rate
  const monthlyPayment = calculateMonthlyPayment(
    mortgageAmount,
    stressTestRate,
    DEFAULT_AMORTIZATION_YEARS
  )
  const monthlyPropertyTax = (homePrice * DEFAULT_PROPERTY_TAX_RATE) / 12
  const monthlyHeating = DEFAULT_HEATING_MONTHLY
  const totalMonthlyHousing = monthlyPayment + monthlyPropertyTax + monthlyHeating

  // Calculate required income based on GDS
  // GDS = Housing Costs / Gross Income <= 39%
  const requiredForGDS = totalMonthlyHousing / GDS_MAX

  // Calculate required income based on TDS
  // TDS = (Housing Costs + Other Debts) / Gross Income <= 44%
  const requiredForTDS = (totalMonthlyHousing + monthlyDebts) / TDS_MAX

  // Required income is the higher of the two
  const requiredMonthlyIncome = Math.max(requiredForGDS, requiredForTDS)
  const requiredAnnualIncome = requiredMonthlyIncome * 12

  // Calculate actual ratios at required income
  const gdsRatio = (totalMonthlyHousing / requiredMonthlyIncome) * 100
  const tdsRatio =
    ((totalMonthlyHousing + monthlyDebts) / requiredMonthlyIncome) * 100

  return {
    requiredAnnualIncome: Math.round(requiredAnnualIncome),
    requiredMonthlyIncome: Math.round(requiredMonthlyIncome),
    monthlyPayment: Math.round(monthlyPayment),
    monthlyPropertyTax: Math.round(monthlyPropertyTax),
    monthlyHeating,
    totalMonthlyHousing: Math.round(totalMonthlyHousing),
    gdsRatio: Math.round(gdsRatio * 10) / 10,
    tdsRatio: Math.round(tdsRatio * 10) / 10,
  }
}
