/**
 * CMHC (Mortgage Default Insurance) calculations
 */

import type { CMHCInput, CMHCResult } from '../types'
import { getCMHCRate, isInsurable } from '../constants/cmhc-rates'
import { PST_RATE } from '../constants/defaults'

/**
 * Calculate CMHC insurance premium and related costs
 */
export function calculateCMHC(input: CMHCInput): CMHCResult {
  const { homePrice, downPayment } = input

  const mortgageAmount = homePrice - downPayment
  const downPaymentPercent = (downPayment / homePrice) * 100

  // Check if CMHC is required
  const isRequired = isInsurable(homePrice, downPaymentPercent)

  if (!isRequired || downPaymentPercent >= 20) {
    return {
      premium: 0,
      premiumRate: 0,
      pstOnPremium: 0,
      totalWithPST: 0,
      isRequired: false,
      mortgageAmount,
    }
  }

  const premiumRate = getCMHCRate(downPaymentPercent)
  const premium = Math.round(mortgageAmount * premiumRate)
  const pstOnPremium = Math.round(premium * PST_RATE)
  const totalWithPST = premium + pstOnPremium

  return {
    premium,
    premiumRate,
    pstOnPremium,
    totalWithPST,
    isRequired: true,
    mortgageAmount,
  }
}

/**
 * Get CMHC rate description for display
 */
export function getCMHCRateDescription(downPaymentPercent: number): string {
  if (downPaymentPercent >= 20) return 'Not required (20%+ down)'
  if (downPaymentPercent >= 15) return '2.8% of mortgage'
  if (downPaymentPercent >= 10) return '3.1% of mortgage'
  return '4.0% of mortgage'
}
