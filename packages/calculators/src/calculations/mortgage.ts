/**
 * Core mortgage calculation functions
 */

import type { MortgageInput, MortgageResult } from '../types'
import { STRESS_TEST_FLOOR } from '../constants/defaults'

/**
 * Calculate the monthly payment factor per $1000 of mortgage
 * Uses standard amortization formula
 */
export function getPaymentFactor(rate: number, years: number): number {
  const monthlyRate = rate / 100 / 12
  const numPayments = years * 12

  if (monthlyRate === 0) {
    return 1000 / numPayments
  }

  return (
    ((monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)) *
    1000
  )
}

/**
 * Calculate the stress test rate
 * Higher of: contract rate + 2% or floor rate (currently 5.25%)
 */
export function getStressTestRate(contractRate: number): number {
  return Math.max(contractRate + 2, STRESS_TEST_FLOOR)
}

/**
 * Calculate monthly mortgage payment
 */
export function calculateMonthlyPayment(
  mortgageAmount: number,
  interestRate: number,
  amortizationYears: number
): number {
  const paymentFactor = getPaymentFactor(interestRate, amortizationYears)
  return (mortgageAmount / 1000) * paymentFactor
}

/**
 * Calculate full mortgage details
 */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { homePrice, downPayment, interestRate, amortizationYears } = input

  const mortgageAmount = homePrice - downPayment
  const downPaymentPercent = (downPayment / homePrice) * 100
  const monthlyPayment = calculateMonthlyPayment(
    mortgageAmount,
    interestRate,
    amortizationYears
  )
  const totalPayments = amortizationYears * 12
  const totalCost = monthlyPayment * totalPayments
  const totalInterest = totalCost - mortgageAmount

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    mortgageAmount,
    downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
  }
}
