/**
 * City matcher utility for fuzzy matching user input to GTA cities
 */

export interface CityMatch {
  slug: string
  name: string
  confidence: 'exact' | 'alias' | 'partial' | 'none'
}

// Canonical GTA cities with their slugs
const GTA_CITIES = [
  { slug: 'toronto', name: 'Toronto' },
  { slug: 'mississauga', name: 'Mississauga' },
  { slug: 'brampton', name: 'Brampton' },
  { slug: 'vaughan', name: 'Vaughan' },
  { slug: 'markham', name: 'Markham' },
  { slug: 'richmond-hill', name: 'Richmond Hill' },
  { slug: 'oakville', name: 'Oakville' },
  { slug: 'milton', name: 'Milton' },
  { slug: 'burlington', name: 'Burlington' },
  { slug: 'hamilton', name: 'Hamilton' },
  { slug: 'caledon', name: 'Caledon' },
  // Durham Region
  { slug: 'ajax', name: 'Ajax' },
  { slug: 'pickering', name: 'Pickering' },
  { slug: 'whitby', name: 'Whitby' },
  { slug: 'oshawa', name: 'Oshawa' },
] as const

// Aliases and common variations that map to canonical cities
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

  // Brampton aliases
  'bramp': 'brampton',
  'bramalea': 'brampton',
  'springdale': 'brampton',
  'castlemore': 'brampton',

  // Vaughan aliases
  'woodbridge': 'vaughan',
  'kleinburg': 'vaughan',
  'maple': 'vaughan',
  'concord': 'vaughan',

  // Markham aliases
  'unionville': 'markham',
  'thornhill': 'markham',
  'markham village': 'markham',

  // Richmond Hill aliases
  'rhill': 'richmond-hill',
  'richmond': 'richmond-hill',
  'oak ridges': 'richmond-hill',

  // Oakville aliases
  'bronte': 'oakville',
  'glen abbey': 'oakville',

  // Toronto neighborhood aliases
  'scarborough': 'toronto',
  'etobicoke': 'toronto',
  'north york': 'toronto',
  'east york': 'toronto',
  'york': 'toronto',

  // Durham region aliases
  'durham': 'oshawa', // Default Durham to Oshawa (largest city)
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
