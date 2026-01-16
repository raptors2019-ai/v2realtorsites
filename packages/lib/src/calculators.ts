/**
 * Real Estate Calculator Utilities
 * Comprehensive calculators for Canadian home buyers
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** CMHC insurance premium rates based on down payment percentage */
export const CMHC_RATES = {
  TIER_1: { minDown: 5, maxDown: 9.99, rate: 0.04 },    // 4.00%
  TIER_2: { minDown: 10, maxDown: 14.99, rate: 0.031 }, // 3.10%
  TIER_3: { minDown: 15, maxDown: 19.99, rate: 0.028 }, // 2.80%
  NO_INSURANCE: { minDown: 20, rate: 0 },
} as const

/** Surcharge for 30-year amortization (first-time buyers on new builds) */
export const CMHC_30_YEAR_SURCHARGE = 0.002 // 0.20%

/** Maximum insurable home price in Canada (as of Dec 2024) */
export const MAX_INSURABLE_PRICE = 1_500_000

/** Ontario Land Transfer Tax brackets */
export const ONTARIO_LTT_BRACKETS = [
  { upTo: 55_000, rate: 0.005 },      // 0.5%
  { upTo: 250_000, rate: 0.01 },      // 1.0%
  { upTo: 400_000, rate: 0.015 },     // 1.5%
  { upTo: 2_000_000, rate: 0.02 },    // 2.0%
  { upTo: Infinity, rate: 0.025 },    // 2.5% (over $2M)
] as const

/** Toronto Municipal Land Transfer Tax brackets (mirrors Ontario) */
export const TORONTO_MLTT_BRACKETS = [
  { upTo: 55_000, rate: 0.005 },      // 0.5%
  { upTo: 250_000, rate: 0.01 },      // 1.0%
  { upTo: 400_000, rate: 0.015 },     // 1.5%
  { upTo: 2_000_000, rate: 0.02 },    // 2.0%
  { upTo: Infinity, rate: 0.025 },    // 2.5% (over $2M)
] as const

/** First-time buyer rebates */
export const FIRST_TIME_BUYER_REBATES = {
  ONTARIO_LTT: 4_000,
  TORONTO_MLTT: 4_475,
} as const

/** Estimated closing costs (Ontario) */
export const CLOSING_COSTS = {
  LAWYER_MIN: 1_500,
  LAWYER_MAX: 2_500,
  TITLE_INSURANCE_MIN: 300,
  TITLE_INSURANCE_MAX: 500,
  HOME_INSPECTION_MIN: 400,
  HOME_INSPECTION_MAX: 600,
  APPRAISAL_MIN: 300,
  APPRAISAL_MAX: 500,
  PST_ON_CMHC_RATE: 0.08, // 8% Ontario PST on CMHC premium
} as const

/** Property tax rates by municipality (approximate annual rates) */
export const PROPERTY_TAX_RATES: Record<string, number> = {
  'toronto': 0.0063,        // ~0.63%
  'mississauga': 0.0083,    // ~0.83%
  'brampton': 0.0108,       // ~1.08%
  'vaughan': 0.0073,        // ~0.73%
  'markham': 0.0068,        // ~0.68%
  'richmond-hill': 0.0072,  // ~0.72%
  'oakville': 0.0082,       // ~0.82%
  'burlington': 0.0089,     // ~0.89%
  'hamilton': 0.0134,       // ~1.34%
  'ajax': 0.0108,           // ~1.08%
  'pickering': 0.0098,      // ~0.98%
  'oshawa': 0.0132,         // ~1.32%
  'whitby': 0.0106,         // ~1.06%
  'newmarket': 0.0078,      // ~0.78%
  'aurora': 0.0075,         // ~0.75%
  'default': 0.01,          // 1% fallback
} as const

// ============================================================================
// MORTGAGE CALCULATOR
// ============================================================================

export interface MortgageCalculatorInput {
  homePrice: number
  downPayment: number
  interestRate: number // Annual rate as percentage (e.g., 4.5)
  amortizationYears: number // 25 or 30
  paymentFrequency?: 'monthly' | 'biweekly' | 'accelerated-biweekly'
}

export interface MortgageCalculatorResult {
  mortgageAmount: number
  payment: number
  paymentFrequency: string
  totalPayments: number
  totalInterest: number
  totalCost: number
  downPaymentPercent: number
  cmhcRequired: boolean
  cmhcPremium: number
  totalMortgageWithCMHC: number
}

export function calculateMortgage(input: MortgageCalculatorInput): MortgageCalculatorResult {
  const { homePrice, downPayment, interestRate, amortizationYears, paymentFrequency = 'monthly' } = input

  const mortgageAmount = homePrice - downPayment
  const downPaymentPercent = (downPayment / homePrice) * 100

  // Calculate CMHC if needed
  const cmhcRequired = downPaymentPercent < 20 && homePrice <= MAX_INSURABLE_PRICE
  const cmhcPremium = cmhcRequired ? calculateCMHCPremium(mortgageAmount, downPaymentPercent, amortizationYears) : 0
  const totalMortgageWithCMHC = mortgageAmount + cmhcPremium

  // Calculate payment based on frequency
  const monthlyRate = interestRate / 100 / 12
  const paymentsPerYear = paymentFrequency === 'monthly' ? 12 : 26
  const totalPayments = amortizationYears * paymentsPerYear

  let payment: number
  if (paymentFrequency === 'monthly') {
    payment = calculateMonthlyPayment(totalMortgageWithCMHC, monthlyRate, amortizationYears * 12)
  } else if (paymentFrequency === 'biweekly') {
    // Standard bi-weekly: monthly payment / 2 * 12 / 26
    const monthlyPayment = calculateMonthlyPayment(totalMortgageWithCMHC, monthlyRate, amortizationYears * 12)
    payment = (monthlyPayment * 12) / 26
  } else {
    // Accelerated bi-weekly: monthly payment / 2
    const monthlyPayment = calculateMonthlyPayment(totalMortgageWithCMHC, monthlyRate, amortizationYears * 12)
    payment = monthlyPayment / 2
  }

  const totalCost = payment * totalPayments
  const totalInterest = totalCost - totalMortgageWithCMHC

  return {
    mortgageAmount,
    payment: Math.round(payment * 100) / 100,
    paymentFrequency: paymentFrequency === 'monthly' ? 'Monthly' :
                      paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Accelerated Bi-weekly',
    totalPayments,
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
    cmhcRequired,
    cmhcPremium: Math.round(cmhcPremium),
    totalMortgageWithCMHC: Math.round(totalMortgageWithCMHC),
  }
}

function calculateMonthlyPayment(principal: number, monthlyRate: number, numPayments: number): number {
  if (monthlyRate === 0) return principal / numPayments
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1)
}

// ============================================================================
// CMHC CALCULATOR
// ============================================================================

export interface CMHCCalculatorInput {
  mortgageAmount: number
  downPaymentPercent: number
  amortizationYears?: number
  isFirstTimeBuyer?: boolean
  isNewBuild?: boolean
}

export interface CMHCCalculatorResult {
  premium: number
  premiumRate: number
  pstOnPremium: number // Ontario PST
  totalInsuranceCost: number
  totalMortgageWithInsurance: number
  isRequired: boolean
  tier: string
}

export function calculateCMHCPremium(
  mortgageAmount: number,
  downPaymentPercent: number,
  amortizationYears: number = 25,
  isFirstTimeBuyer: boolean = false,
  isNewBuild: boolean = false
): number {
  if (downPaymentPercent >= 20) return 0

  let rate: number
  if (downPaymentPercent >= 15) {
    rate = CMHC_RATES.TIER_3.rate
  } else if (downPaymentPercent >= 10) {
    rate = CMHC_RATES.TIER_2.rate
  } else {
    rate = CMHC_RATES.TIER_1.rate
  }

  // Add surcharge for 30-year amortization (first-time buyers on new builds)
  if (amortizationYears === 30 && isFirstTimeBuyer && isNewBuild) {
    rate += CMHC_30_YEAR_SURCHARGE
  }

  return mortgageAmount * rate
}

export function calculateCMHC(input: CMHCCalculatorInput): CMHCCalculatorResult {
  const {
    mortgageAmount,
    downPaymentPercent,
    amortizationYears = 25,
    isFirstTimeBuyer = false,
    isNewBuild = false
  } = input

  const isRequired = downPaymentPercent < 20

  if (!isRequired) {
    return {
      premium: 0,
      premiumRate: 0,
      pstOnPremium: 0,
      totalInsuranceCost: 0,
      totalMortgageWithInsurance: mortgageAmount,
      isRequired: false,
      tier: 'Not Required (20%+ down)',
    }
  }

  let rate: number
  let tier: string

  if (downPaymentPercent >= 15) {
    rate = CMHC_RATES.TIER_3.rate
    tier = '15-19.99% down'
  } else if (downPaymentPercent >= 10) {
    rate = CMHC_RATES.TIER_2.rate
    tier = '10-14.99% down'
  } else {
    rate = CMHC_RATES.TIER_1.rate
    tier = '5-9.99% down'
  }

  // Add surcharge for 30-year amortization
  if (amortizationYears === 30 && isFirstTimeBuyer && isNewBuild) {
    rate += CMHC_30_YEAR_SURCHARGE
    tier += ' (30yr surcharge applied)'
  }

  const premium = mortgageAmount * rate
  const pstOnPremium = premium * CLOSING_COSTS.PST_ON_CMHC_RATE

  return {
    premium: Math.round(premium),
    premiumRate: rate * 100,
    pstOnPremium: Math.round(pstOnPremium),
    totalInsuranceCost: Math.round(premium + pstOnPremium),
    totalMortgageWithInsurance: Math.round(mortgageAmount + premium),
    isRequired: true,
    tier,
  }
}

// ============================================================================
// LAND TRANSFER TAX CALCULATOR
// ============================================================================

export interface LandTransferTaxInput {
  homePrice: number
  isFirstTimeBuyer: boolean
  isInToronto: boolean
}

export interface LandTransferTaxResult {
  provincialLTT: number
  municipalLTT: number
  totalLTT: number
  provincialRebate: number
  municipalRebate: number
  totalRebate: number
  netLTT: number
}

function calculateTaxFromBrackets(
  price: number,
  brackets: readonly { upTo: number; rate: number }[]
): number {
  let tax = 0
  let previousBracket = 0

  for (const bracket of brackets) {
    if (price <= previousBracket) break

    const taxableAmount = Math.min(price, bracket.upTo) - previousBracket
    tax += taxableAmount * bracket.rate
    previousBracket = bracket.upTo
  }

  return tax
}

export function calculateLandTransferTax(input: LandTransferTaxInput): LandTransferTaxResult {
  const { homePrice, isFirstTimeBuyer, isInToronto } = input

  // Calculate provincial LTT
  const provincialLTT = calculateTaxFromBrackets(homePrice, ONTARIO_LTT_BRACKETS)

  // Calculate Toronto MLTT if applicable
  const municipalLTT = isInToronto
    ? calculateTaxFromBrackets(homePrice, TORONTO_MLTT_BRACKETS)
    : 0

  const totalLTT = provincialLTT + municipalLTT

  // Calculate rebates for first-time buyers
  let provincialRebate = 0
  let municipalRebate = 0

  if (isFirstTimeBuyer) {
    provincialRebate = Math.min(provincialLTT, FIRST_TIME_BUYER_REBATES.ONTARIO_LTT)
    if (isInToronto) {
      municipalRebate = Math.min(municipalLTT, FIRST_TIME_BUYER_REBATES.TORONTO_MLTT)
    }
  }

  const totalRebate = provincialRebate + municipalRebate
  const netLTT = totalLTT - totalRebate

  return {
    provincialLTT: Math.round(provincialLTT),
    municipalLTT: Math.round(municipalLTT),
    totalLTT: Math.round(totalLTT),
    provincialRebate: Math.round(provincialRebate),
    municipalRebate: Math.round(municipalRebate),
    totalRebate: Math.round(totalRebate),
    netLTT: Math.round(netLTT),
  }
}

// ============================================================================
// CLOSING COSTS CALCULATOR
// ============================================================================

export interface ClosingCostsInput {
  homePrice: number
  downPayment: number
  isFirstTimeBuyer: boolean
  isInToronto: boolean
  includeHomeInspection?: boolean
}

export interface ClosingCostsResult {
  landTransferTax: LandTransferTaxResult
  legalFees: { min: number; max: number; avg: number }
  titleInsurance: { min: number; max: number; avg: number }
  homeInspection: { min: number; max: number; avg: number } | null
  appraisal: { min: number; max: number; avg: number }
  cmhc: CMHCCalculatorResult | null
  pstOnCMHC: number
  totalMin: number
  totalMax: number
  totalAvg: number
}

export function calculateClosingCosts(input: ClosingCostsInput): ClosingCostsResult {
  const { homePrice, downPayment, isFirstTimeBuyer, isInToronto, includeHomeInspection = true } = input

  // Land Transfer Tax
  const landTransferTax = calculateLandTransferTax({ homePrice, isFirstTimeBuyer, isInToronto })

  // Legal fees
  const legalFees = {
    min: CLOSING_COSTS.LAWYER_MIN,
    max: CLOSING_COSTS.LAWYER_MAX,
    avg: Math.round((CLOSING_COSTS.LAWYER_MIN + CLOSING_COSTS.LAWYER_MAX) / 2),
  }

  // Title insurance
  const titleInsurance = {
    min: CLOSING_COSTS.TITLE_INSURANCE_MIN,
    max: CLOSING_COSTS.TITLE_INSURANCE_MAX,
    avg: Math.round((CLOSING_COSTS.TITLE_INSURANCE_MIN + CLOSING_COSTS.TITLE_INSURANCE_MAX) / 2),
  }

  // Home inspection (optional)
  const homeInspection = includeHomeInspection ? {
    min: CLOSING_COSTS.HOME_INSPECTION_MIN,
    max: CLOSING_COSTS.HOME_INSPECTION_MAX,
    avg: Math.round((CLOSING_COSTS.HOME_INSPECTION_MIN + CLOSING_COSTS.HOME_INSPECTION_MAX) / 2),
  } : null

  // Appraisal
  const appraisal = {
    min: CLOSING_COSTS.APPRAISAL_MIN,
    max: CLOSING_COSTS.APPRAISAL_MAX,
    avg: Math.round((CLOSING_COSTS.APPRAISAL_MIN + CLOSING_COSTS.APPRAISAL_MAX) / 2),
  }

  // CMHC if applicable
  const downPaymentPercent = (downPayment / homePrice) * 100
  const mortgageAmount = homePrice - downPayment
  const cmhc = downPaymentPercent < 20 && homePrice <= MAX_INSURABLE_PRICE
    ? calculateCMHC({ mortgageAmount, downPaymentPercent })
    : null

  const pstOnCMHC = cmhc ? cmhc.pstOnPremium : 0

  // Calculate totals
  const fixedCostsMin = legalFees.min + titleInsurance.min + appraisal.min +
                        (homeInspection?.min || 0) + pstOnCMHC
  const fixedCostsMax = legalFees.max + titleInsurance.max + appraisal.max +
                        (homeInspection?.max || 0) + pstOnCMHC
  const fixedCostsAvg = legalFees.avg + titleInsurance.avg + appraisal.avg +
                        (homeInspection?.avg || 0) + pstOnCMHC

  return {
    landTransferTax,
    legalFees,
    titleInsurance,
    homeInspection,
    appraisal,
    cmhc,
    pstOnCMHC,
    totalMin: landTransferTax.netLTT + fixedCostsMin,
    totalMax: landTransferTax.netLTT + fixedCostsMax,
    totalAvg: landTransferTax.netLTT + fixedCostsAvg,
  }
}

// ============================================================================
// PROPERTY TAX CALCULATOR
// ============================================================================

export interface PropertyTaxInput {
  homePrice: number
  municipality?: string
  customRate?: number // Override rate
}

export interface PropertyTaxResult {
  annualTax: number
  monthlyTax: number
  taxRate: number
  municipality: string
}

export function calculatePropertyTax(input: PropertyTaxInput): PropertyTaxResult {
  const { homePrice, municipality = 'default', customRate } = input

  const normalizedMunicipality = municipality.toLowerCase().replace(/\s+/g, '-')
  const taxRate = customRate || PROPERTY_TAX_RATES[normalizedMunicipality] || PROPERTY_TAX_RATES['default']

  const annualTax = homePrice * taxRate
  const monthlyTax = annualTax / 12

  return {
    annualTax: Math.round(annualTax),
    monthlyTax: Math.round(monthlyTax),
    taxRate: taxRate * 100, // Return as percentage
    municipality: municipality || 'Default',
  }
}

// ============================================================================
// AFFORDABILITY CALCULATOR (combines everything)
// ============================================================================

export interface AffordabilityInput {
  homePrice: number
  downPayment: number
  interestRate: number
  amortizationYears: number
  municipality?: string
  isFirstTimeBuyer: boolean
  isInToronto: boolean
}

export interface AffordabilityResult {
  mortgage: MortgageCalculatorResult
  propertyTax: PropertyTaxResult
  closingCosts: ClosingCostsResult
  monthlyPayment: number
  totalMonthlyHousingCost: number
  totalCashNeeded: number
}

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const {
    homePrice,
    downPayment,
    interestRate,
    amortizationYears,
    municipality,
    isFirstTimeBuyer,
    isInToronto
  } = input

  const mortgage = calculateMortgage({
    homePrice,
    downPayment,
    interestRate,
    amortizationYears,
  })

  const propertyTax = calculatePropertyTax({ homePrice, municipality })

  const closingCosts = calculateClosingCosts({
    homePrice,
    downPayment,
    isFirstTimeBuyer,
    isInToronto,
  })

  const totalMonthlyHousingCost = mortgage.payment + propertyTax.monthlyTax
  const totalCashNeeded = downPayment + closingCosts.totalAvg

  return {
    mortgage,
    propertyTax,
    closingCosts,
    monthlyPayment: mortgage.payment,
    totalMonthlyHousingCost: Math.round(totalMonthlyHousingCost),
    totalCashNeeded: Math.round(totalCashNeeded),
  }
}
