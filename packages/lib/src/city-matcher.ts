/**
 * City matcher utility for fuzzy matching user input to GTA cities
 */

export interface CityMatch {
  slug: string
  name: string
  confidence: 'exact' | 'alias' | 'partial' | 'none'
}

// Canonical GTA cities with their slugs (internal - use getAllCities() for external access)
// Complete coverage from Oshawa to Grimsby/Stoney Creek
const GTA_CITIES = [
  // City of Toronto
  { slug: 'toronto', name: 'Toronto' },

  // Peel Region
  { slug: 'mississauga', name: 'Mississauga' },
  { slug: 'brampton', name: 'Brampton' },
  { slug: 'caledon', name: 'Caledon' },

  // York Region
  { slug: 'vaughan', name: 'Vaughan' },
  { slug: 'markham', name: 'Markham' },
  { slug: 'richmond-hill', name: 'Richmond Hill' },
  { slug: 'newmarket', name: 'Newmarket' },
  { slug: 'aurora', name: 'Aurora' },
  { slug: 'whitchurch-stouffville', name: 'Whitchurch-Stouffville' },
  { slug: 'king', name: 'King' },
  { slug: 'east-gwillimbury', name: 'East Gwillimbury' },
  { slug: 'georgina', name: 'Georgina' },

  // Halton Region
  { slug: 'oakville', name: 'Oakville' },
  { slug: 'burlington', name: 'Burlington' },
  { slug: 'milton', name: 'Milton' },
  { slug: 'halton-hills', name: 'Halton Hills' },

  // Durham Region
  { slug: 'pickering', name: 'Pickering' },
  { slug: 'ajax', name: 'Ajax' },
  { slug: 'whitby', name: 'Whitby' },
  { slug: 'oshawa', name: 'Oshawa' },
  { slug: 'clarington', name: 'Clarington' },
  { slug: 'uxbridge', name: 'Uxbridge' },
  { slug: 'scugog', name: 'Scugog' },
  { slug: 'brock', name: 'Brock' },

  // City of Hamilton (amalgamated)
  { slug: 'hamilton', name: 'Hamilton' },
  { slug: 'stoney-creek', name: 'Stoney Creek' },
  { slug: 'ancaster', name: 'Ancaster' },
  { slug: 'dundas', name: 'Dundas' },
  { slug: 'flamborough', name: 'Flamborough' },
  { slug: 'glanbrook', name: 'Glanbrook' },

  // Niagara Region (western edge)
  { slug: 'grimsby', name: 'Grimsby' },
  { slug: 'lincoln', name: 'Lincoln' },
  { slug: 'west-lincoln', name: 'West Lincoln' },
  { slug: 'niagara-on-the-lake', name: 'Niagara-on-the-Lake' },
  { slug: 'st-catharines', name: 'St. Catharines' },
  { slug: 'niagara-falls', name: 'Niagara Falls' },
] as const

// Aliases and common variations that map to canonical cities (internal)
const CITY_ALIASES: Record<string, string> = {
  // Toronto aliases
  'to': 'toronto',
  'tdot': 'toronto',
  'the 6': 'toronto',
  'the six': 'toronto',
  '6ix': 'toronto',
  'downtown': 'toronto',
  'dt': 'toronto',
  'gta': 'toronto', // Default GTA to Toronto

  // Toronto neighborhood aliases (former municipalities)
  'scarborough': 'toronto',
  'etobicoke': 'toronto',
  'north york': 'toronto',
  'east york': 'toronto',
  'york': 'toronto',
  'the beaches': 'toronto',
  'beaches': 'toronto',
  'leslieville': 'toronto',
  'liberty village': 'toronto',
  'king west': 'toronto',
  'queen west': 'toronto',
  'yorkville': 'toronto',
  'rosedale': 'toronto',
  'the annex': 'toronto',
  'high park': 'toronto',
  'parkdale': 'toronto',
  'cabbagetown': 'toronto',
  'riverdale': 'toronto',
  'danforth': 'toronto',
  'greektown': 'toronto',
  'mimico': 'toronto',
  'long branch': 'toronto',
  'leaside': 'toronto',
  'davisville': 'toronto',
  'midtown': 'toronto',
  'forest hill': 'toronto',

  // Mississauga aliases
  'sauga': 'mississauga',
  'miss': 'mississauga',
  'missi': 'mississauga',
  'port credit': 'mississauga',
  'square one': 'mississauga',
  'sq1': 'mississauga',
  'erin mills': 'mississauga',
  'streetsville': 'mississauga',
  'cooksville': 'mississauga',
  'meadowvale': 'mississauga',
  'clarkson': 'mississauga',
  'lorne park': 'mississauga',

  // Brampton aliases
  'bramp': 'brampton',
  'bramalea': 'brampton',
  'springdale': 'brampton',
  'castlemore': 'brampton',
  'heart lake': 'brampton',
  'mount pleasant': 'brampton',

  // Vaughan aliases
  'woodbridge': 'vaughan',
  'kleinburg': 'vaughan',
  'maple': 'vaughan',
  'concord': 'vaughan',
  'thornhill': 'vaughan', // Thornhill spans Vaughan/Markham, default to Vaughan

  // Markham aliases
  'unionville': 'markham',
  'markham village': 'markham',
  'cornell': 'markham',
  'angus glen': 'markham',

  // Richmond Hill aliases
  'rhill': 'richmond-hill',
  'richmond': 'richmond-hill',
  'oak ridges': 'richmond-hill',

  // Oakville aliases
  'bronte': 'oakville',
  'glen abbey': 'oakville',
  'joshua creek': 'oakville',

  // Burlington aliases
  'aldershot': 'burlington',

  // Milton aliases
  'georgetown': 'halton-hills', // Georgetown is in Halton Hills

  // Halton Hills aliases
  'acton': 'halton-hills',

  // Durham region aliases
  'durham': 'oshawa', // Default Durham to Oshawa (largest city)
  'bowmanville': 'clarington',
  'courtice': 'clarington',
  'newcastle': 'clarington',
  'port perry': 'scugog',
  'beaverton': 'brock',

  // York Region aliases
  'stouffville': 'whitchurch-stouffville',
  'queensville': 'east-gwillimbury',
  'holland landing': 'east-gwillimbury',
  'keswick': 'georgina',
  'sutton': 'georgina',
  'nobleton': 'king',
  'king city': 'king',
  'schomberg': 'king',

  // Hamilton area aliases
  'the hammer': 'hamilton',
  'steeltown': 'hamilton',
  'waterdown': 'flamborough',
  'binbrook': 'glanbrook',

  // Niagara aliases
  'notl': 'niagara-on-the-lake',
  'st kitts': 'st-catharines',
  'saint catharines': 'st-catharines',
  'the falls': 'niagara-falls',
  'beamsville': 'lincoln',
  'vineland': 'lincoln',
  'smithville': 'west-lincoln',
}

/**
 * Normalize input for matching (lowercase, trim, remove extra spaces)
 */
function normalize(input: string): string {
  return input.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Calculate simple similarity score between two strings
 */
function similarity(a: string, b: string): number {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()

  if (aLower === bLower) return 1
  if (aLower.startsWith(bLower) || bLower.startsWith(aLower)) return 0.8
  if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.6

  // Levenshtein-like scoring for typos
  const maxLen = Math.max(aLower.length, bLower.length)
  let matches = 0
  for (let i = 0; i < Math.min(aLower.length, bLower.length); i++) {
    if (aLower[i] === bLower[i]) matches++
  }
  return matches / maxLen
}

/**
 * Match user input to a GTA city
 * Returns the best match with confidence level
 */
export function matchCity(input: string): CityMatch {
  const normalized = normalize(input)

  if (!normalized) {
    return { slug: '', name: '', confidence: 'none' }
  }

  // 1. Check for exact city name match
  for (const city of GTA_CITIES) {
    if (normalize(city.name) === normalized || city.slug === normalized) {
      return { slug: city.slug, name: city.name, confidence: 'exact' }
    }
  }

  // 2. Check aliases
  if (CITY_ALIASES[normalized]) {
    const slug = CITY_ALIASES[normalized]
    const city = GTA_CITIES.find(c => c.slug === slug)
    if (city) {
      return { slug: city.slug, name: city.name, confidence: 'alias' }
    }
  }

  // 3. Partial match - find best similarity
  let bestMatch: CityMatch = { slug: '', name: '', confidence: 'none' }
  let bestScore = 0

  for (const city of GTA_CITIES) {
    const score = Math.max(
      similarity(normalized, city.name),
      similarity(normalized, city.slug)
    )
    if (score > bestScore && score >= 0.5) {
      bestScore = score
      bestMatch = { slug: city.slug, name: city.name, confidence: 'partial' }
    }
  }

  // 4. Check partial alias matches
  for (const [alias, slug] of Object.entries(CITY_ALIASES)) {
    const score = similarity(normalized, alias)
    if (score > bestScore && score >= 0.5) {
      const city = GTA_CITIES.find(c => c.slug === slug)
      if (city) {
        bestScore = score
        bestMatch = { slug: city.slug, name: city.name, confidence: 'partial' }
      }
    }
  }

  return bestMatch
}

/**
 * Get all GTA cities for display
 */
export function getAllCities(): Array<{ slug: string; name: string }> {
  return [...GTA_CITIES]
}

/**
 * Get suggested cities based on partial input (for autocomplete if needed later)
 */
export function suggestCities(input: string, limit = 3): Array<{ slug: string; name: string }> {
  const normalized = normalize(input)
  if (!normalized) return []

  const scored = GTA_CITIES.map(city => ({
    city,
    score: Math.max(similarity(normalized, city.name), similarity(normalized, city.slug))
  }))

  return scored
    .filter(s => s.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({ slug: s.city.slug, name: s.city.name }))
}
