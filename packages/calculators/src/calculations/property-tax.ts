/**
 * Property tax calculations for GTA municipalities
 */

import type { PropertyTaxInput, PropertyTaxResult, GTACity } from '../types'
import {
  GTA_PROPERTY_TAX_RATES,
  getPropertyTaxRate,
} from '../constants/property-tax-rates'

/**
 * Calculate property tax for a home
 */
export function calculatePropertyTax(input: PropertyTaxInput): PropertyTaxResult {
  const { homePrice, city } = input

  const normalizedCity = city.toLowerCase().replace(/\s+/g, '-') as GTACity
  const taxRate = getPropertyTaxRate(normalizedCity)
  const cityInfo = GTA_PROPERTY_TAX_RATES[normalizedCity]

  const annualTax = Math.round(homePrice * taxRate)
  const monthlyTax = Math.round(annualTax / 12)

  return {
    annualTax,
    monthlyTax,
    taxRate,
    city: cityInfo?.displayName ?? city,
  }
}

/**
 * Compare property taxes across cities
 */
export function comparePropertyTaxes(
  homePrice: number
): { city: string; annualTax: number; monthlyTax: number; rate: number }[] {
  return Object.values(GTA_PROPERTY_TAX_RATES)
    .map((cityInfo) => ({
      city: cityInfo.displayName,
      annualTax: Math.round(homePrice * cityInfo.rate),
      monthlyTax: Math.round((homePrice * cityInfo.rate) / 12),
      rate: cityInfo.rate,
    }))
    .sort((a, b) => a.annualTax - b.annualTax)
}
