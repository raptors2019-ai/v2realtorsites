/**
 * Property tax rates for GTA municipalities (2024/2025 estimates)
 *
 * Note: These are approximate residential rates and may vary.
 * Actual rates depend on municipal budgets and are set annually.
 */

import type { GTACity } from '../types'

export interface PropertyTaxRate {
  city: GTACity
  displayName: string
  rate: number // As decimal (e.g., 0.0063 = 0.63%)
  year: number
}

export const GTA_PROPERTY_TAX_RATES: Record<GTACity, PropertyTaxRate> = {
  toronto: {
    city: 'toronto',
    displayName: 'Toronto',
    rate: 0.0063,
    year: 2025,
  },
  mississauga: {
    city: 'mississauga',
    displayName: 'Mississauga',
    rate: 0.0082,
    year: 2025,
  },
  brampton: {
    city: 'brampton',
    displayName: 'Brampton',
    rate: 0.0105,
    year: 2025,
  },
  vaughan: {
    city: 'vaughan',
    displayName: 'Vaughan',
    rate: 0.0076,
    year: 2025,
  },
  markham: {
    city: 'markham',
    displayName: 'Markham',
    rate: 0.0071,
    year: 2025,
  },
  'richmond-hill': {
    city: 'richmond-hill',
    displayName: 'Richmond Hill',
    rate: 0.0073,
    year: 2025,
  },
  oakville: {
    city: 'oakville',
    displayName: 'Oakville',
    rate: 0.0089,
    year: 2025,
  },
  burlington: {
    city: 'burlington',
    displayName: 'Burlington',
    rate: 0.0092,
    year: 2025,
  },
  milton: {
    city: 'milton',
    displayName: 'Milton',
    rate: 0.0088,
    year: 2025,
  },
  ajax: {
    city: 'ajax',
    displayName: 'Ajax',
    rate: 0.0112,
    year: 2025,
  },
  pickering: {
    city: 'pickering',
    displayName: 'Pickering',
    rate: 0.0108,
    year: 2025,
  },
  oshawa: {
    city: 'oshawa',
    displayName: 'Oshawa',
    rate: 0.0142,
    year: 2025,
  },
  whitby: {
    city: 'whitby',
    displayName: 'Whitby',
    rate: 0.0115,
    year: 2025,
  },
  newmarket: {
    city: 'newmarket',
    displayName: 'Newmarket',
    rate: 0.0085,
    year: 2025,
  },
  aurora: {
    city: 'aurora',
    displayName: 'Aurora',
    rate: 0.0078,
    year: 2025,
  },
  caledon: {
    city: 'caledon',
    displayName: 'Caledon',
    rate: 0.0095,
    year: 2025,
  },
}

/**
 * Get property tax rate for a city
 */
export function getPropertyTaxRate(city: GTACity): number {
  return GTA_PROPERTY_TAX_RATES[city]?.rate ?? 0.012 // Default 1.2%
}

/**
 * Get all cities for dropdown
 */
export function getGTACities(): PropertyTaxRate[] {
  return Object.values(GTA_PROPERTY_TAX_RATES).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  )
}
