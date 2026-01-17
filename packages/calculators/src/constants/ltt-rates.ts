/**
 * Land Transfer Tax (LTT) rates for Ontario and Toronto
 *
 * Ontario LTT Brackets (2024):
 * $0 - $55,000: 0.5%
 * $55,001 - $250,000: 1.0%
 * $250,001 - $400,000: 1.5%
 * $400,001 - $2,000,000: 2.0%
 * $2,000,001+: 2.5%
 *
 * Toronto Municipal LTT (same brackets, added on top for Toronto properties)
 */

export interface LTTBracket {
  min: number
  max: number
  rate: number
}

export const ONTARIO_LTT_BRACKETS: LTTBracket[] = [
  { min: 0, max: 55000, rate: 0.005 },
  { min: 55000, max: 250000, rate: 0.01 },
  { min: 250000, max: 400000, rate: 0.015 },
  { min: 400000, max: 2000000, rate: 0.02 },
  { min: 2000000, max: Infinity, rate: 0.025 },
]

// Toronto uses the same brackets
export const TORONTO_LTT_BRACKETS: LTTBracket[] = [
  { min: 0, max: 55000, rate: 0.005 },
  { min: 55000, max: 250000, rate: 0.01 },
  { min: 250000, max: 400000, rate: 0.015 },
  { min: 400000, max: 2000000, rate: 0.02 },
  { min: 2000000, max: Infinity, rate: 0.025 },
]

// First-time home buyer rebates
export const ONTARIO_FIRST_TIME_BUYER_REBATE = 4000
export const TORONTO_FIRST_TIME_BUYER_REBATE = 4475

/**
 * Calculate LTT using marginal rate brackets
 */
export function calculateLTTFromBrackets(
  homePrice: number,
  brackets: LTTBracket[]
): number {
  let tax = 0
  let remainingPrice = homePrice

  for (const bracket of brackets) {
    if (remainingPrice <= 0) break

    const taxableInBracket = Math.min(
      remainingPrice,
      bracket.max - bracket.min
    )
    tax += taxableInBracket * bracket.rate
    remainingPrice -= taxableInBracket
  }

  return Math.round(tax * 100) / 100
}
