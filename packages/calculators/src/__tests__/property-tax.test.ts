import {
  calculatePropertyTax,
  comparePropertyTaxes,
} from '../calculations/property-tax'
import { getGTACities, getPropertyTaxRate } from '../constants/property-tax-rates'

describe('Property Tax calculations', () => {
  describe('getGTACities', () => {
    it('should return list of GTA cities', () => {
      const cities = getGTACities()

      expect(cities.length).toBeGreaterThan(0)
      expect(cities.some(c => c.city === 'toronto')).toBe(true)
      expect(cities.some(c => c.city === 'mississauga')).toBe(true)

      // Each city should have required properties
      cities.forEach(city => {
        expect(city.city).toBeDefined()
        expect(city.displayName).toBeDefined()
        expect(city.rate).toBeGreaterThan(0)
      })
    })
  })

  describe('getPropertyTaxRate', () => {
    it('should return correct rate for known cities', () => {
      const torontoRate = getPropertyTaxRate('toronto')
      expect(torontoRate).toBeGreaterThan(0)
      expect(torontoRate).toBeLessThan(0.02) // Should be around 0.6-0.7%
    })

    it('should return default rate for unknown cities', () => {
      const unknownRate = getPropertyTaxRate('unknown-city' as any)
      expect(unknownRate).toBeGreaterThan(0)
    })
  })

  describe('calculatePropertyTax', () => {
    it('should calculate annual and monthly property tax', () => {
      const result = calculatePropertyTax({
        homePrice: 500000,
        city: 'toronto',
      })

      expect(result.annualTax).toBeGreaterThan(0)
      expect(result.monthlyTax).toBe(Math.round(result.annualTax / 12))
      expect(result.city).toBe('Toronto')
      expect(result.taxRate).toBeGreaterThan(0)
    })

    it('should vary by city', () => {
      const toronto = calculatePropertyTax({
        homePrice: 500000,
        city: 'toronto',
      })

      const markham = calculatePropertyTax({
        homePrice: 500000,
        city: 'markham',
      })

      // Different cities have different rates
      if (toronto.taxRate !== markham.taxRate) {
        expect(toronto.annualTax).not.toBe(markham.annualTax)
      }
    })

    it('should scale with home price', () => {
      const price500k = calculatePropertyTax({
        homePrice: 500000,
        city: 'toronto',
      })

      const price1m = calculatePropertyTax({
        homePrice: 1000000,
        city: 'toronto',
      })

      expect(price1m.annualTax).toBe(price500k.annualTax * 2)
    })
  })

  describe('comparePropertyTaxes', () => {
    it('should return all GTA cities sorted by tax amount', () => {
      const comparison = comparePropertyTaxes(500000)
      const cities = getGTACities()

      expect(comparison.length).toBe(cities.length)

      // Should be sorted by annual tax (lowest first)
      for (let i = 1; i < comparison.length; i++) {
        expect(comparison[i].annualTax).toBeGreaterThanOrEqual(comparison[i - 1].annualTax)
      }
    })

    it('should include rate and monthly values', () => {
      const comparison = comparePropertyTaxes(600000)

      comparison.forEach(item => {
        expect(item.city).toBeDefined()
        expect(item.annualTax).toBeGreaterThan(0)
        expect(item.monthlyTax).toBe(Math.round(item.annualTax / 12))
        expect(item.rate).toBeGreaterThan(0)
      })
    })

    it('should scale with home price', () => {
      const comparison500k = comparePropertyTaxes(500000)
      const comparison1m = comparePropertyTaxes(1000000)

      // Each city's tax should double
      comparison500k.forEach((item) => {
        const corresponding = comparison1m.find(c => c.city === item.city)
        expect(corresponding?.annualTax).toBe(item.annualTax * 2)
      })
    })
  })
})
