/**
 * Land Transfer Tax calculations for Ontario and Toronto
 */

import type { LandTransferTaxInput, LandTransferTaxResult } from '../types'
import {
  ONTARIO_LTT_BRACKETS,
  TORONTO_LTT_BRACKETS,
  ONTARIO_FIRST_TIME_BUYER_REBATE,
  TORONTO_FIRST_TIME_BUYER_REBATE,
  calculateLTTFromBrackets,
} from '../constants/ltt-rates'

/**
 * Calculate Ontario Land Transfer Tax
 */
export function calculateOntarioLTT(homePrice: number): number {
  return calculateLTTFromBrackets(homePrice, ONTARIO_LTT_BRACKETS)
}

/**
 * Calculate Toronto Municipal Land Transfer Tax
 */
export function calculateTorontoLTT(homePrice: number): number {
  return calculateLTTFromBrackets(homePrice, TORONTO_LTT_BRACKETS)
}

/**
 * Calculate complete Land Transfer Tax with rebates
 */
export function calculateLandTransferTax(
  input: LandTransferTaxInput
): LandTransferTaxResult {
  const { homePrice, isFirstTimeBuyer, isTorontoProperty } = input

  const ontarioLTT = calculateOntarioLTT(homePrice)
  const torontoLTT = isTorontoProperty ? calculateTorontoLTT(homePrice) : 0
  const totalLTT = ontarioLTT + torontoLTT

  // Calculate rebates for first-time buyers
  let ontarioRebate = 0
  let torontoRebate = 0

  if (isFirstTimeBuyer) {
    // Ontario rebate: max $4,000 (full rebate on homes up to $368,333)
    ontarioRebate = Math.min(ontarioLTT, ONTARIO_FIRST_TIME_BUYER_REBATE)

    // Toronto rebate: max $4,475 (full rebate on homes up to $400,000)
    if (isTorontoProperty) {
      torontoRebate = Math.min(torontoLTT, TORONTO_FIRST_TIME_BUYER_REBATE)
    }
  }

  const totalRebate = ontarioRebate + torontoRebate
  const netLTT = totalLTT - totalRebate

  return {
    ontarioLTT: Math.round(ontarioLTT),
    torontoLTT: Math.round(torontoLTT),
    totalLTT: Math.round(totalLTT),
    ontarioRebate: Math.round(ontarioRebate),
    torontoRebate: Math.round(torontoRebate),
    totalRebate: Math.round(totalRebate),
    netLTT: Math.round(netLTT),
  }
}

/**
 * Get LTT breakdown for display
 */
export function getLTTBreakdown(
  homePrice: number,
  isTorontoProperty: boolean
): { bracket: string; amount: number }[] {
  const brackets = [
    { range: '$0 - $55,000', rate: 0.005 },
    { range: '$55,001 - $250,000', rate: 0.01 },
    { range: '$250,001 - $400,000', rate: 0.015 },
    { range: '$400,001 - $2,000,000', rate: 0.02 },
    { range: '$2,000,001+', rate: 0.025 },
  ]

  const breakdown: { bracket: string; amount: number }[] = []
  let remainingPrice = homePrice
  const limits = [55000, 250000, 400000, 2000000, Infinity]
  let prevLimit = 0

  for (let i = 0; i < brackets.length; i++) {
    if (remainingPrice <= 0) break

    const taxableInBracket = Math.min(remainingPrice, limits[i] - prevLimit)
    const amount = taxableInBracket * brackets[i].rate
    const multiplier = isTorontoProperty ? 2 : 1

    if (amount > 0) {
      breakdown.push({
        bracket: brackets[i].range,
        amount: Math.round(amount * multiplier),
      })
    }

    remainingPrice -= taxableInBracket
    prevLimit = limits[i]
  }

  return breakdown
}
