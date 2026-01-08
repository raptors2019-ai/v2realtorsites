import { matchCity, getAllCities, suggestCities } from '../city-matcher'

describe('city-matcher', () => {
  describe('matchCity', () => {
    describe('exact matches', () => {
      it('should match exact city name (case insensitive)', () => {
        expect(matchCity('Toronto')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'exact' })
        expect(matchCity('toronto')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'exact' })
        expect(matchCity('TORONTO')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'exact' })
      })

      it('should match by slug', () => {
        expect(matchCity('richmond-hill')).toEqual({ slug: 'richmond-hill', name: 'Richmond Hill', confidence: 'exact' })
      })

      it('should match Mississauga', () => {
        expect(matchCity('Mississauga')).toEqual({ slug: 'mississauga', name: 'Mississauga', confidence: 'exact' })
      })

      it('should match all GTA cities', () => {
        const cities = [
          'Toronto', 'Mississauga', 'Brampton', 'Vaughan', 'Markham', 'Richmond Hill',
          'Oakville', 'Milton', 'Burlington', 'Hamilton', 'Caledon',
          'Ajax', 'Pickering', 'Whitby', 'Oshawa'
        ]
        for (const city of cities) {
          const result = matchCity(city)
          expect(result.confidence).toBe('exact')
          expect(result.name.toLowerCase()).toBe(city.toLowerCase())
        }
      })
    })

    describe('alias matches', () => {
      it('should match Toronto aliases', () => {
        expect(matchCity('TO')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'alias' })
        expect(matchCity('tdot')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'alias' })
        expect(matchCity('the 6')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'alias' })
        expect(matchCity('6ix')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'alias' })
        expect(matchCity('downtown')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'alias' })
      })

      it('should match Mississauga aliases', () => {
        expect(matchCity('sauga')).toEqual({ slug: 'mississauga', name: 'Mississauga', confidence: 'alias' })
        expect(matchCity('miss')).toEqual({ slug: 'mississauga', name: 'Mississauga', confidence: 'alias' })
        expect(matchCity('port credit')).toEqual({ slug: 'mississauga', name: 'Mississauga', confidence: 'alias' })
        expect(matchCity('square one')).toEqual({ slug: 'mississauga', name: 'Mississauga', confidence: 'alias' })
        expect(matchCity('sq1')).toEqual({ slug: 'mississauga', name: 'Mississauga', confidence: 'alias' })
      })

      it('should match Brampton aliases', () => {
        expect(matchCity('bramp')).toEqual({ slug: 'brampton', name: 'Brampton', confidence: 'alias' })
        expect(matchCity('bramalea')).toEqual({ slug: 'brampton', name: 'Brampton', confidence: 'alias' })
      })

      it('should match Vaughan aliases (neighborhoods)', () => {
        expect(matchCity('woodbridge')).toEqual({ slug: 'vaughan', name: 'Vaughan', confidence: 'alias' })
        expect(matchCity('kleinburg')).toEqual({ slug: 'vaughan', name: 'Vaughan', confidence: 'alias' })
        expect(matchCity('maple')).toEqual({ slug: 'vaughan', name: 'Vaughan', confidence: 'alias' })
      })

      it('should match Markham aliases', () => {
        expect(matchCity('unionville')).toEqual({ slug: 'markham', name: 'Markham', confidence: 'alias' })
        expect(matchCity('thornhill')).toEqual({ slug: 'markham', name: 'Markham', confidence: 'alias' })
      })

      it('should match Richmond Hill aliases', () => {
        expect(matchCity('richmond')).toEqual({ slug: 'richmond-hill', name: 'Richmond Hill', confidence: 'alias' })
        expect(matchCity('rhill')).toEqual({ slug: 'richmond-hill', name: 'Richmond Hill', confidence: 'alias' })
      })
    })

    describe('partial matches', () => {
      it('should find partial match for typos', () => {
        const result = matchCity('Toront')
        expect(result.slug).toBe('toronto')
        expect(result.confidence).toBe('partial')
      })

      it('should find partial match for misspellings', () => {
        const result = matchCity('Missisauga') // missing an 's'
        expect(result.slug).toBe('mississauga')
        expect(result.confidence).toBe('partial')
      })
    })

    describe('no matches', () => {
      it('should return none confidence for unknown cities', () => {
        expect(matchCity('Los Angeles')).toEqual({ slug: '', name: '', confidence: 'none' })
        expect(matchCity('Vancouver')).toEqual({ slug: '', name: '', confidence: 'none' })
        expect(matchCity('xyz123')).toEqual({ slug: '', name: '', confidence: 'none' })
      })

      it('should return none confidence for empty input', () => {
        expect(matchCity('')).toEqual({ slug: '', name: '', confidence: 'none' })
        expect(matchCity('   ')).toEqual({ slug: '', name: '', confidence: 'none' })
      })
    })

    describe('edge cases', () => {
      it('should handle extra whitespace', () => {
        expect(matchCity('  Toronto  ')).toEqual({ slug: 'toronto', name: 'Toronto', confidence: 'exact' })
        expect(matchCity('Richmond   Hill')).toEqual({ slug: 'richmond-hill', name: 'Richmond Hill', confidence: 'exact' })
      })
    })
  })

  describe('getAllCities', () => {
    it('should return all GTA cities', () => {
      const cities = getAllCities()
      expect(cities).toHaveLength(15)
      expect(cities.map(c => c.name)).toContain('Toronto')
      expect(cities.map(c => c.name)).toContain('Mississauga')
      expect(cities.map(c => c.name)).toContain('Brampton')
      // Durham cities
      expect(cities.map(c => c.name)).toContain('Ajax')
      expect(cities.map(c => c.name)).toContain('Oshawa')
    })

    it('should return cities with slugs', () => {
      const cities = getAllCities()
      for (const city of cities) {
        expect(city.slug).toBeTruthy()
        expect(city.name).toBeTruthy()
      }
    })
  })

  describe('suggestCities', () => {
    it('should suggest cities based on partial input', () => {
      const suggestions = suggestCities('tor')
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].name).toBe('Toronto')
    })

    it('should limit suggestions', () => {
      const suggestions = suggestCities('a', 2)
      expect(suggestions.length).toBeLessThanOrEqual(2)
    })

    it('should return empty array for no matches', () => {
      const suggestions = suggestCities('xyz123')
      expect(suggestions).toEqual([])
    })

    it('should return empty array for empty input', () => {
      const suggestions = suggestCities('')
      expect(suggestions).toEqual([])
    })
  })
})
