/**
 * Closing costs calculation
 * Combines LTT, CMHC, and other closing costs
 */

import type { ClosingCostsInput, ClosingCostsResult } from '../types'
import { calculateLandTransferTax } from './land-transfer-tax'
import { calculateCMHC } from './cmhc'
import {
  LEGAL_FEES,
  TITLE_INSURANCE,
  HOME_INSPECTION,
  APPRAISAL_FEE,
  ADJUSTMENTS_RATE,
} from '../constants/defaults'

/**
 * Calculate all closing costs
 */
export function calculateClosingCosts(
  input: ClosingCostsInput
): ClosingCostsResult {
  const { homePrice, downPayment, isFirstTimeBuyer, isTorontoProperty } = input

  // Calculate LTT
  const landTransferTax = calculateLandTransferTax({
    homePrice,
    isFirstTimeBuyer,
    isTorontoProperty,
  })

  // Calculate CMHC
  const cmhc = calculateCMHC({
    homePrice,
    downPayment,
  })

  // Fixed closing costs
  const legalFees = LEGAL_FEES
  const titleInsurance = TITLE_INSURANCE
  const homeInspection = HOME_INSPECTION
  const appraisal = APPRAISAL_FEE

  // Adjustments (property tax, utilities prepaid by seller)
  const adjustments = Math.round(homePrice * ADJUSTMENTS_RATE)

  // Total closing costs (excluding down payment)
  // Note: CMHC premium is usually added to mortgage, but PST is paid upfront
  const totalClosingCosts =
    landTransferTax.netLTT +
    cmhc.pstOnPremium + // PST on CMHC is paid at closing
    legalFees +
    titleInsurance +
    homeInspection +
    appraisal +
    adjustments

  // Total cash needed at closing
  const cashNeeded = downPayment + totalClosingCosts

  return {
    landTransferTax,
    cmhc,
    legalFees,
    titleInsurance,
    homeInspection,
    appraisal,
    adjustments,
    totalClosingCosts: Math.round(totalClosingCosts),
    cashNeeded: Math.round(cashNeeded),
  }
}

/**
 * Get closing costs summary for display
 */
export function getClosingCostsSummary(
  result: ClosingCostsResult
): { label: string; amount: number; isSubtotal?: boolean }[] {
  const items: { label: string; amount: number; isSubtotal?: boolean }[] = [
    { label: 'Land Transfer Tax (net)', amount: result.landTransferTax.netLTT },
  ]

  if (result.cmhc.isRequired) {
    items.push({
      label: 'CMHC PST (premium added to mortgage)',
      amount: result.cmhc.pstOnPremium,
    })
  }

  items.push(
    { label: 'Legal Fees', amount: result.legalFees },
    { label: 'Title Insurance', amount: result.titleInsurance },
    { label: 'Home Inspection', amount: result.homeInspection },
    { label: 'Appraisal', amount: result.appraisal },
    { label: 'Adjustments (est.)', amount: result.adjustments },
    {
      label: 'Total Closing Costs',
      amount: result.totalClosingCosts,
      isSubtotal: true,
    }
  )

  return items
}
