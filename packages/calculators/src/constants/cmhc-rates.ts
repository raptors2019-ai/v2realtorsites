/**
 * CMHC (Canada Mortgage and Housing Corporation) insurance rates
 * Required for down payments less than 20%
 *
 * Rates effective as of 2024
 */

export interface CMHCBracket {
  minDownPaymentPercent: number
  maxDownPaymentPercent: number
  rate: number
}

export const CMHC_BRACKETS: CMHCBracket[] = [
  { minDownPaymentPercent: 20, maxDownPaymentPercent: 100, rate: 0 },
  { minDownPaymentPercent: 15, maxDownPaymentPercent: 19.99, rate: 0.028 },
  { minDownPaymentPercent: 10, maxDownPaymentPercent: 14.99, rate: 0.031 },
  { minDownPaymentPercent: 5, maxDownPaymentPercent: 9.99, rate: 0.04 },
]

/**
 * Get CMHC insurance rate based on down payment percentage
 */
export function getCMHCRate(downPaymentPercent: number): number {
  if (downPaymentPercent >= 20) return 0
  if (downPaymentPercent >= 15) return 0.028
  if (downPaymentPercent >= 10) return 0.031
  return 0.04
}

/**
 * Minimum down payment requirements in Canada
 * - 5% for homes up to $500,000
 * - 5% on first $500K + 10% on portion above $500K up to $1M
 * - 20% for homes over $1M (not insurable)
 */
export function getMinimumDownPayment(homePrice: number): number {
  if (homePrice <= 500000) {
    return homePrice * 0.05
  }
  if (homePrice <= 1000000) {
    return 500000 * 0.05 + (homePrice - 500000) * 0.1
  }
  return homePrice * 0.2
}

/**
 * Check if a property is insurable (eligible for CMHC)
 * Properties over $1M require 20% down and are not insurable
 */
export function isInsurable(homePrice: number, downPaymentPercent: number): boolean {
  if (homePrice > 1000000) return false
  if (downPaymentPercent >= 20) return false // Conventional mortgage
  return true
}
