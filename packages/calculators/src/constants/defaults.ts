/**
 * Default values for mortgage and affordability calculations
 */

// GDS/TDS limits (Bank of Canada guidelines)
export const GDS_MAX = 0.39 // Gross Debt Service - max 39% of income
export const TDS_MAX = 0.44 // Total Debt Service - max 44% of income

// Stress test floor rate (as of 2024)
export const STRESS_TEST_FLOOR = 5.25

// Default assumptions
export const DEFAULT_INTEREST_RATE = 4.5
export const DEFAULT_AMORTIZATION_YEARS = 25
export const DEFAULT_PROPERTY_TAX_RATE = 0.012 // 1.2% annually (conservative estimate)
export const DEFAULT_HEATING_MONTHLY = 150

// Closing costs defaults
export const LEGAL_FEES = 2000
export const TITLE_INSURANCE = 350
export const HOME_INSPECTION = 550
export const APPRAISAL_FEE = 400
export const ADJUSTMENTS_RATE = 0.01 // 1% of home price

// PST on CMHC (Ontario)
export const PST_RATE = 0.08
