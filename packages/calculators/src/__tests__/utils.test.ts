import { formatCurrency, formatPercent } from '../index'

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers with $ and commas', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
      expect(formatCurrency(1000000)).toBe('$1,000,000')
      expect(formatCurrency(500000)).toBe('$500,000')
    })

    it('should handle decimals by rounding', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235')
      expect(formatCurrency(1234.4)).toBe('$1,234')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000')
    })

    it('should handle small values', () => {
      expect(formatCurrency(50)).toBe('$50')
      expect(formatCurrency(1)).toBe('$1')
    })
  })

  describe('formatPercent', () => {
    it('should format percentages with % symbol (default 1 decimal)', () => {
      expect(formatPercent(5)).toBe('5.0%')
      expect(formatPercent(10.5)).toBe('10.5%')
    })

    it('should handle custom decimal places', () => {
      expect(formatPercent(5.123, 1)).toBe('5.1%')
      expect(formatPercent(5.123, 3)).toBe('5.123%')
      expect(formatPercent(5, 0)).toBe('5%')
      expect(formatPercent(5, 2)).toBe('5.00%')
    })

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('0.0%')
    })

    it('should handle large percentages', () => {
      expect(formatPercent(100)).toBe('100.0%')
      expect(formatPercent(150.5)).toBe('150.5%')
    })

    it('should handle small percentages', () => {
      expect(formatPercent(0.5)).toBe('0.5%')
      expect(formatPercent(0.05, 2)).toBe('0.05%')
    })
  })
})
