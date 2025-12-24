import {
  getCityBySlug,
  getNeighborhoodBySlug,
  getPriceRangeBySlug,
  getPropertyTypeBySlug,
  getBedroomsBySlug,
  parseFilterSegments,
  validateFilters,
  generateFilterMetadata,
  seoFiltersToIDXParams,
  generateAllFilterCombinations,
} from '../seo'

describe('seo utilities', () => {
  describe('getCityBySlug', () => {
    it('should find city by slug', () => {
      const city = getCityBySlug('toronto')
      expect(city).toBeDefined()
      expect(city?.name).toBe('Toronto')
    })

    it('should be case insensitive', () => {
      expect(getCityBySlug('TORONTO')?.name).toBe('Toronto')
      expect(getCityBySlug('Toronto')?.name).toBe('Toronto')
    })

    it('should return undefined for unknown city', () => {
      expect(getCityBySlug('vancouver')).toBeUndefined()
    })

    it('should have neighborhoods for cities', () => {
      const city = getCityBySlug('toronto')
      expect(city?.neighborhoods.length).toBeGreaterThan(0)
    })

    it('should find mississauga', () => {
      const city = getCityBySlug('mississauga')
      expect(city?.name).toBe('Mississauga')
    })
  })

  describe('getNeighborhoodBySlug', () => {
    it('should find neighborhood in city', () => {
      const neighborhood = getNeighborhoodBySlug('toronto', 'yorkville')
      expect(neighborhood).toBeDefined()
      expect(neighborhood?.name).toBe('Yorkville')
    })

    it('should return undefined for wrong city', () => {
      // Port Credit is in Mississauga, not Toronto
      expect(getNeighborhoodBySlug('toronto', 'port-credit')).toBeUndefined()
    })

    it('should be case insensitive', () => {
      expect(getNeighborhoodBySlug('TORONTO', 'YORKVILLE')?.name).toBe('Yorkville')
    })

    it('should find port-credit in mississauga', () => {
      const neighborhood = getNeighborhoodBySlug('mississauga', 'port-credit')
      expect(neighborhood?.name).toBe('Port Credit')
    })

    it('should return undefined for invalid city', () => {
      expect(getNeighborhoodBySlug('invalid-city', 'yorkville')).toBeUndefined()
    })
  })

  describe('getPriceRangeBySlug', () => {
    it('should find price range', () => {
      const range = getPriceRangeBySlug('500k-750k')
      expect(range).toBeDefined()
      expect(range?.min).toBe(500000)
      expect(range?.max).toBe(750000)
    })

    it('should handle under range', () => {
      const range = getPriceRangeBySlug('under-500k')
      expect(range?.min).toBeNull()
      expect(range?.max).toBe(500000)
    })

    it('should handle over range', () => {
      const range = getPriceRangeBySlug('over-5m')
      expect(range?.min).toBe(5000000)
      expect(range?.max).toBeNull()
    })

    it('should return undefined for invalid range', () => {
      expect(getPriceRangeBySlug('invalid-range')).toBeUndefined()
    })
  })

  describe('getPropertyTypeBySlug', () => {
    it('should find property type', () => {
      expect(getPropertyTypeBySlug('condo')?.label).toBe('Condos')
      expect(getPropertyTypeBySlug('detached')?.label).toBe('Detached Homes')
      expect(getPropertyTypeBySlug('townhouse')?.label).toBe('Townhouses')
    })

    it('should have IDX value mapping', () => {
      expect(getPropertyTypeBySlug('condo')?.idxValue).toBe('Condo')
    })

    it('should return undefined for invalid type', () => {
      expect(getPropertyTypeBySlug('mansion')).toBeUndefined()
    })
  })

  describe('getBedroomsBySlug', () => {
    it('should find bedroom config', () => {
      expect(getBedroomsBySlug('2-bed')?.min).toBe(2)
      expect(getBedroomsBySlug('4-bed')?.min).toBe(4)
    })

    it('should return undefined for invalid bedroom slug', () => {
      expect(getBedroomsBySlug('10-bed')).toBeUndefined()
    })
  })

  describe('parseFilterSegments', () => {
    it('should parse empty filters', () => {
      expect(parseFilterSegments([])).toEqual({})
    })

    it('should parse undefined filters', () => {
      expect(parseFilterSegments(undefined)).toEqual({})
    })

    it('should parse price range', () => {
      const result = parseFilterSegments(['500k-750k'])
      expect(result.priceRange).toBe('500k-750k')
    })

    it('should parse property type', () => {
      const result = parseFilterSegments(['condo'])
      expect(result.propertyType).toBe('condo')
    })

    it('should parse bedrooms', () => {
      const result = parseFilterSegments(['3-bed'])
      expect(result.bedrooms).toBe('3-bed')
    })

    it('should parse multiple segments', () => {
      const result = parseFilterSegments(['yorkville', '500k-750k', 'condo', '2-bed'])
      expect(result.neighborhood).toBe('yorkville')
      expect(result.priceRange).toBe('500k-750k')
      expect(result.propertyType).toBe('condo')
      expect(result.bedrooms).toBe('2-bed')
    })

    it('should be case insensitive', () => {
      const result = parseFilterSegments(['YORKVILLE', '500K-750K', 'CONDO'])
      expect(result.neighborhood).toBe('yorkville')
      expect(result.priceRange).toBe('500k-750k')
      expect(result.propertyType).toBe('condo')
    })

    it('should handle neighborhood-only segment', () => {
      const result = parseFilterSegments(['yorkville'])
      expect(result.neighborhood).toBe('yorkville')
    })
  })

  describe('validateFilters', () => {
    it('should validate valid city', () => {
      expect(validateFilters('toronto', {})).toBe(true)
    })

    it('should reject invalid city', () => {
      expect(validateFilters('invalid-city', {})).toBe(false)
    })

    it('should validate neighborhood belongs to city', () => {
      expect(validateFilters('toronto', { neighborhood: 'yorkville' })).toBe(true)
      expect(validateFilters('toronto', { neighborhood: 'port-credit' })).toBe(false)
    })

    it('should validate price range', () => {
      expect(validateFilters('toronto', { priceRange: '500k-750k' })).toBe(true)
      expect(validateFilters('toronto', { priceRange: 'invalid' })).toBe(false)
    })

    it('should validate property type', () => {
      expect(validateFilters('toronto', { propertyType: 'condo' })).toBe(true)
      expect(validateFilters('toronto', { propertyType: 'mansion' })).toBe(false)
    })

    it('should validate bedrooms', () => {
      expect(validateFilters('toronto', { bedrooms: '3-bed' })).toBe(true)
      expect(validateFilters('toronto', { bedrooms: '10-bed' })).toBe(false)
    })

    it('should validate complex filter combinations', () => {
      expect(validateFilters('toronto', {
        neighborhood: 'yorkville',
        priceRange: '1m-1.5m',
        propertyType: 'condo',
        bedrooms: '2-bed',
      })).toBe(true)
    })
  })

  describe('generateFilterMetadata', () => {
    it('should generate metadata for city', () => {
      const meta = generateFilterMetadata('toronto')
      expect(meta.title).toContain('Toronto')
      expect(meta.title).toContain('Sri Collective Group')
      expect(meta.description).toContain('Toronto')
      expect(meta.canonical).toContain('/properties/toronto')
    })

    it('should generate metadata for invalid city', () => {
      const meta = generateFilterMetadata('invalid')
      expect(meta.title).toContain('Properties for Sale')
    })

    it('should include neighborhood in title', () => {
      const meta = generateFilterMetadata('toronto', { neighborhood: 'yorkville' })
      expect(meta.title).toContain('Yorkville')
    })

    it('should include price range in title', () => {
      const meta = generateFilterMetadata('toronto', { priceRange: '1m-1.5m' })
      expect(meta.title).toContain('$1M-$1.5M')
    })

    it('should include property type in title', () => {
      const meta = generateFilterMetadata('toronto', { propertyType: 'condo' })
      expect(meta.title).toContain('Condos')
    })

    it('should include bedrooms in title', () => {
      const meta = generateFilterMetadata('toronto', { bedrooms: '3-bed' })
      expect(meta.title).toContain('3+ Bedrooms')
    })

    it('should build correct canonical URL', () => {
      const meta = generateFilterMetadata('toronto', {
        neighborhood: 'yorkville',
        priceRange: '1m-1.5m',
        propertyType: 'condo',
      })
      expect(meta.canonical).toContain('/properties/toronto/yorkville/1m-1.5m/condo')
    })

    it('should include openGraph data', () => {
      const meta = generateFilterMetadata('toronto')
      expect(meta.openGraph.title).toBe(meta.title)
      expect(meta.openGraph.description).toBe(meta.description)
      expect(meta.openGraph.url).toBe(meta.canonical)
    })

    it('should generate description mentioning contact', () => {
      const meta = generateFilterMetadata('toronto')
      expect(meta.description).toContain('Sri Collective Group')
    })
  })

  describe('seoFiltersToIDXParams', () => {
    it('should convert city slug to city name', () => {
      const params = seoFiltersToIDXParams('toronto', {})
      expect(params.city).toBe('Toronto')
    })

    it('should convert price range to min/max', () => {
      const params = seoFiltersToIDXParams('toronto', { priceRange: '500k-750k' })
      expect(params.minPrice).toBe(500000)
      expect(params.maxPrice).toBe(750000)
    })

    it('should handle under price range', () => {
      const params = seoFiltersToIDXParams('toronto', { priceRange: 'under-500k' })
      expect(params.minPrice).toBeUndefined()
      expect(params.maxPrice).toBe(500000)
    })

    it('should handle over price range', () => {
      const params = seoFiltersToIDXParams('toronto', { priceRange: 'over-5m' })
      expect(params.minPrice).toBe(5000000)
      expect(params.maxPrice).toBeUndefined()
    })

    it('should convert property type to IDX value', () => {
      const params = seoFiltersToIDXParams('toronto', { propertyType: 'condo' })
      expect(params.propertyType).toBe('Condo')
    })

    it('should convert bedrooms to minimum', () => {
      const params = seoFiltersToIDXParams('toronto', { bedrooms: '3-bed' })
      expect(params.bedrooms).toBe(3)
    })

    it('should handle invalid city', () => {
      const params = seoFiltersToIDXParams('invalid', {})
      expect(params.city).toBeUndefined()
    })
  })

  describe('generateAllFilterCombinations', () => {
    it('should generate URLs for all cities', () => {
      const urls = generateAllFilterCombinations()
      expect(urls).toContain('/properties/toronto')
      expect(urls).toContain('/properties/mississauga')
      expect(urls).toContain('/properties/brampton')
    })

    it('should generate city + neighborhood URLs', () => {
      const urls = generateAllFilterCombinations()
      expect(urls).toContain('/properties/toronto/yorkville')
    })

    it('should generate city + price URLs', () => {
      const urls = generateAllFilterCombinations()
      expect(urls).toContain('/properties/toronto/500k-750k')
    })

    it('should generate city + type URLs', () => {
      const urls = generateAllFilterCombinations()
      expect(urls).toContain('/properties/toronto/condo')
    })

    it('should generate nested combination URLs', () => {
      const urls = generateAllFilterCombinations()
      expect(urls).toContain('/properties/toronto/yorkville/500k-750k')
      expect(urls).toContain('/properties/toronto/yorkville/500k-750k/condo')
    })

    it('should generate many URLs', () => {
      const urls = generateAllFilterCombinations()
      // Should have at least a few hundred combinations
      expect(urls.length).toBeGreaterThan(100)
    })

    it('should not have duplicate URLs', () => {
      const urls = generateAllFilterCombinations()
      const uniqueUrls = new Set(urls)
      expect(uniqueUrls.size).toBe(urls.length)
    })
  })
})
