/**
 * Types for real estate calculators
 */

export interface MortgageInput {
  homePrice: number
  downPayment: number
  interestRate: number
  amortizationYears: number
}

export interface MortgageResult {
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  mortgageAmount: number
  downPaymentPercent: number
}

export interface AffordabilityInput {
  annualIncome: number
  downPayment: number
  monthlyDebts?: number
  interestRate?: number
}

export interface AffordabilityResult {
  maxHomePrice: number
  mortgageAmount: number
  monthlyPayment: number
  monthlyPropertyTax: number
  monthlyHeating: number
  totalMonthlyHousing: number
  downPaymentPercent: number
  cmhcPremium: number | null
  stressTestRate: number
  gdsRatio: number
  tdsRatio: number
}

export interface LandTransferTaxInput {
  homePrice: number
  isFirstTimeBuyer: boolean
  isTorontoProperty: boolean
}

export interface LandTransferTaxResult {
  ontarioLTT: number
  torontoLTT: number
  totalLTT: number
  ontarioRebate: number
  torontoRebate: number
  totalRebate: number
  netLTT: number
}

export interface CMHCInput {
  homePrice: number
  downPayment: number
}

export interface CMHCResult {
  premium: number
  premiumRate: number
  pstOnPremium: number
  totalWithPST: number
  isRequired: boolean
  mortgageAmount: number
}

export interface ClosingCostsInput {
  homePrice: number
  downPayment: number
  isFirstTimeBuyer: boolean
  isTorontoProperty: boolean
}

export interface ClosingCostsResult {
  landTransferTax: LandTransferTaxResult
  cmhc: CMHCResult
  legalFees: number
  titleInsurance: number
  homeInspection: number
  appraisal: number
  adjustments: number
  totalClosingCosts: number
  cashNeeded: number
}

export interface RequiredIncomeInput {
  homePrice: number
  downPayment: number
  monthlyDebts?: number
  interestRate?: number
}

export interface RequiredIncomeResult {
  requiredAnnualIncome: number
  requiredMonthlyIncome: number
  monthlyPayment: number
  monthlyPropertyTax: number
  monthlyHeating: number
  totalMonthlyHousing: number
  gdsRatio: number
  tdsRatio: number
}

export interface StressTestInput {
  homePrice: number
  downPayment: number
  contractRate: number
  amortizationYears?: number
}

export interface StressTestResult {
  contractRate: number
  stressTestRate: number
  contractPayment: number
  stressTestPayment: number
  paymentIncrease: number
  paymentIncreasePercent: number
  passesStressTest: boolean
  qualifyingIncome: number
}

export interface PropertyTaxInput {
  homePrice: number
  city: string
}

export interface PropertyTaxResult {
  annualTax: number
  monthlyTax: number
  taxRate: number
  city: string
}

export type GTACity =
  | 'toronto'
  | 'mississauga'
  | 'brampton'
  | 'vaughan'
  | 'markham'
  | 'richmond-hill'
  | 'oakville'
  | 'burlington'
  | 'milton'
  | 'ajax'
  | 'pickering'
  | 'oshawa'
  | 'whitby'
  | 'newmarket'
  | 'aurora'
  | 'caledon'
