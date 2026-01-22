import { formatPrice, formatPriceCompact, formatDate, cn, parseNumber, formatCurrency } from '../utils'

describe('utils', () => {
  describe('formatPrice', () => {
    it('should format price in CAD with no decimals', () => {
      expect(formatPrice(500000)).toBe('$500,000')
    })

    it('should format large prices with commas', () => {
      expect(formatPrice(1500000)).toBe('$1,500,000')
    })

    it('should format zero', () => {
      expect(formatPrice(0)).toBe('$0')
    })

    it('should format small prices', () => {
      expect(formatPrice(999)).toBe('$999')
    })

    it('should round decimal prices', () => {
      expect(formatPrice(500000.99)).toBe('$500,001')
    })

    it('should accept custom currency', () => {
      const result = formatPrice(100, 'USD')
      expect(result).toContain('100')
    })
  })

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(date)
      expect(result).toContain('January')
      expect(result).toContain('2024')
    })

    it('should format date string', () => {
      const result = formatDate('2024-12-25T12:00:00Z')
      expect(result).toContain('December')
      expect(result).toContain('2024')
    })

    it('should format ISO date string', () => {
      const result = formatDate('2024-06-01T12:00:00Z')
      expect(result).toContain('June')
      expect(result).toContain('2024')
    })
  })

  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base active')
    })

    it('should handle false conditionals', () => {
      const isActive = false
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base')
    })

    it('should merge Tailwind conflicting classes', () => {
      // tailwind-merge should keep the last padding class
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })

    it('should handle undefined values', () => {
      const result = cn('foo', undefined, 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle arrays', () => {
      const result = cn(['foo', 'bar'], 'baz')
      expect(result).toBe('foo bar baz')
    })
  })

  describe('parseNumber', () => {
    describe('plain numbers', () => {
      it('should parse integer strings', () => {
        expect(parseNumber('100000')).toBe(100000)
      })

      it('should parse decimal strings', () => {
        expect(parseNumber('123.45')).toBe(123.45)
      })

      it('should return 0 for empty string', () => {
        expect(parseNumber('')).toBe(0)
      })

      it('should return 0 for invalid input', () => {
        expect(parseNumber('abc')).toBe(0)
      })

      it('should return 0 for whitespace only', () => {
        expect(parseNumber('   ')).toBe(0)
      })
    })

    describe('currency formatted values', () => {
      it('should parse values with $ prefix', () => {
        expect(parseNumber('$100000')).toBe(100000)
      })

      it('should parse values with commas', () => {
        expect(parseNumber('1,500,000')).toBe(1500000)
      })

      it('should parse values with $ and commas', () => {
        expect(parseNumber('$1,500,000')).toBe(1500000)
      })

      it('should handle spaces around value', () => {
        expect(parseNumber('  $500,000  ')).toBe(500000)
      })
    })

    describe('K suffix (thousands)', () => {
      it('should parse lowercase k suffix', () => {
        expect(parseNumber('100k')).toBe(100000)
      })

      it('should parse uppercase K suffix', () => {
        expect(parseNumber('100K')).toBe(100000)
      })

      it('should parse decimal with k suffix', () => {
        expect(parseNumber('1.5k')).toBe(1500)
      })

      it('should parse $ prefix with k suffix', () => {
        expect(parseNumber('$500k')).toBe(500000)
      })

      it('should handle 0k', () => {
        expect(parseNumber('0k')).toBe(0)
      })
    })

    describe('M suffix (millions)', () => {
      it('should parse lowercase m suffix', () => {
        expect(parseNumber('1m')).toBe(1000000)
      })

      it('should parse uppercase M suffix', () => {
        expect(parseNumber('1M')).toBe(1000000)
      })

      it('should parse decimal with m suffix', () => {
        expect(parseNumber('1.5m')).toBe(1500000)
      })

      it('should parse $ prefix with m suffix', () => {
        expect(parseNumber('$2.5M')).toBe(2500000)
      })

      it('should handle small million values', () => {
        expect(parseNumber('0.5m')).toBe(500000)
      })
    })

    describe('edge cases', () => {
      it('should handle negative numbers', () => {
        expect(parseNumber('-500')).toBe(-500)
      })

      it('should handle very large numbers', () => {
        expect(parseNumber('999999999')).toBe(999999999)
      })

      it('should handle leading zeros', () => {
        expect(parseNumber('00100')).toBe(100)
      })
    })
  })

  describe('formatCurrency', () => {
    describe('basic formatting', () => {
      it('should format whole numbers with no decimals by default', () => {
        expect(formatCurrency(500000)).toBe('$500,000')
      })

      it('should format with comma separators', () => {
        expect(formatCurrency(1500000)).toBe('$1,500,000')
      })

      it('should format zero', () => {
        expect(formatCurrency(0)).toBe('$0')
      })

      it('should format small numbers', () => {
        expect(formatCurrency(99)).toBe('$99')
      })

      it('should round decimal values by default', () => {
        expect(formatCurrency(500000.99)).toBe('$500,001')
      })

      it('should round down when appropriate', () => {
        expect(formatCurrency(500000.49)).toBe('$500,000')
      })
    })

    describe('with decimal options', () => {
      it('should format with 2 decimal places', () => {
        expect(formatCurrency(1234.56, { decimals: 2 })).toBe('$1,234.56')
      })

      it('should pad with zeros when needed', () => {
        expect(formatCurrency(1234, { decimals: 2 })).toBe('$1,234.00')
      })

      it('should format with 0 decimals explicitly', () => {
        expect(formatCurrency(1234.99, { decimals: 0 })).toBe('$1,235')
      })
    })

    describe('edge cases', () => {
      it('should handle negative numbers', () => {
        expect(formatCurrency(-500)).toBe('-$500')
      })

      it('should handle very large numbers', () => {
        expect(formatCurrency(999999999)).toBe('$999,999,999')
      })

      it('should handle very small decimals', () => {
        expect(formatCurrency(0.99, { decimals: 2 })).toBe('$0.99')
      })
    })
  })

  describe('formatPriceCompact', () => {
    describe('millions', () => {
      it('should format 1 million as $1.0M', () => {
        expect(formatPriceCompact(1000000)).toBe('$1.0M')
      })

      it('should format 1.5 million as $1.5M', () => {
        expect(formatPriceCompact(1500000)).toBe('$1.5M')
      })

      it('should format 2.75 million as $2.8M', () => {
        expect(formatPriceCompact(2750000)).toBe('$2.8M')
      })
    })

    describe('thousands', () => {
      it('should format 500k as $500K', () => {
        expect(formatPriceCompact(500000)).toBe('$500K')
      })

      it('should format 1000 as $1K', () => {
        expect(formatPriceCompact(1000)).toBe('$1K')
      })

      it('should format 999k as $999K', () => {
        expect(formatPriceCompact(999000)).toBe('$999K')
      })
    })

    describe('small values', () => {
      it('should format values under 1000 without suffix', () => {
        expect(formatPriceCompact(500)).toBe('$500')
      })

      it('should format zero', () => {
        expect(formatPriceCompact(0)).toBe('$0')
      })
    })
  })
})
