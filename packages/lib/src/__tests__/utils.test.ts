import { formatPrice, formatDate, cn } from '../utils'

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
})
