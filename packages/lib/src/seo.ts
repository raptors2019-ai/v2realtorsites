import {
  GTA_CITIES,
  PRICE_RANGES,
  PROPERTY_TYPES,
  BEDROOM_OPTIONS,
  type CityConfig,
  type NeighborhoodConfig,
  type PriceRange,
  type PropertyTypeConfig,
  type BedroomConfig,
  type SEOFilterParams,
  type SEOMetadata,
} from '@repo/types'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sricollective.com'
const SITE_NAME = 'Sri Collective Group'

/**
 * Find city config by slug
 */
export function getCityBySlug(slug: string): CityConfig | undefined {
  return GTA_CITIES.find(c => c.slug === slug.toLowerCase())
}

/**
 * Find neighborhood by slug within a city
 */
export function getNeighborhoodBySlug(
  citySlug: string,
  neighborhoodSlug: string
): NeighborhoodConfig | undefined {
  const city = getCityBySlug(citySlug)
  return city?.neighborhoods.find(n => n.slug === neighborhoodSlug.toLowerCase())
}

/**
 * Find price range by slug
 */
export function getPriceRangeBySlug(slug: string): PriceRange | undefined {
  return PRICE_RANGES.find(p => p.slug === slug.toLowerCase())
}

/**
 * Find property type by slug
 */
export function getPropertyTypeBySlug(slug: string): PropertyTypeConfig | undefined {
  return PROPERTY_TYPES.find(t => t.slug === slug.toLowerCase())
}

/**
 * Find bedroom config by slug
 */
export function getBedroomsBySlug(slug: string): BedroomConfig | undefined {
  return BEDROOM_OPTIONS.find(b => b.slug === slug.toLowerCase())
}

/**
 * Parse filter segments from catch-all route
 * Order: [neighborhood?, priceRange?, propertyType?, bedrooms?]
 */
export function parseFilterSegments(filters: string[] = []): SEOFilterParams {
  const result: SEOFilterParams = {}

  for (const segment of filters) {
    const slug = segment.toLowerCase()

    // Check each type in priority order
    if (PRICE_RANGES.some(p => p.slug === slug)) {
      result.priceRange = slug
    } else if (PROPERTY_TYPES.some(t => t.slug === slug)) {
      result.propertyType = slug
    } else if (BEDROOM_OPTIONS.some(b => b.slug === slug)) {
      result.bedrooms = slug
    } else {
      // Assume it's a neighborhood (validated later with city context)
      result.neighborhood = slug
    }
  }

  return result
}

/**
 * Validate filter params against a city
 */
export function validateFilters(
  citySlug: string,
  filters: SEOFilterParams
): boolean {
  const city = getCityBySlug(citySlug)
  if (!city) return false

  // Validate neighborhood belongs to city
  if (filters.neighborhood) {
    const validNeighborhood = city.neighborhoods.some(
      n => n.slug === filters.neighborhood
    )
    if (!validNeighborhood) return false
  }

  // Validate other filters exist
  if (filters.priceRange && !getPriceRangeBySlug(filters.priceRange)) return false
  if (filters.propertyType && !getPropertyTypeBySlug(filters.propertyType)) return false
  if (filters.bedrooms && !getBedroomsBySlug(filters.bedrooms)) return false

  return true
}

/**
 * Generate SEO metadata for filter combination
 */
export function generateFilterMetadata(
  citySlug: string,
  filters: SEOFilterParams = {}
): SEOMetadata {
  const city = getCityBySlug(citySlug)
  if (!city) {
    return {
      title: `Properties for Sale | ${SITE_NAME}`,
      description: 'Browse properties for sale in the Greater Toronto Area.',
      canonical: `${BASE_URL}/properties`,
      openGraph: {
        title: `Properties for Sale | ${SITE_NAME}`,
        description: 'Browse properties for sale in the Greater Toronto Area.',
        url: `${BASE_URL}/properties`,
      },
    }
  }

  const neighborhood = filters.neighborhood
    ? getNeighborhoodBySlug(citySlug, filters.neighborhood)
    : undefined
  const priceRange = filters.priceRange
    ? getPriceRangeBySlug(filters.priceRange)
    : undefined
  const propertyType = filters.propertyType
    ? getPropertyTypeBySlug(filters.propertyType)
    : undefined
  const bedrooms = filters.bedrooms
    ? getBedroomsBySlug(filters.bedrooms)
    : undefined

  // Build title parts
  const titleParts: string[] = []

  if (bedrooms) titleParts.push(bedrooms.label)
  if (propertyType) titleParts.push(propertyType.label)

  titleParts.push('for Sale')

  if (neighborhood) {
    titleParts.push(`in ${neighborhood.name}`)
  }
  titleParts.push(city.name)

  if (priceRange) {
    titleParts.push(priceRange.label)
  }

  const title = `${titleParts.join(' ')} | ${SITE_NAME}`

  // Build description
  const descParts: string[] = []
  descParts.push('Browse')
  if (bedrooms) descParts.push(bedrooms.label.toLowerCase())
  if (propertyType) descParts.push(propertyType.label.toLowerCase())
  else descParts.push('properties')
  descParts.push('for sale')
  if (neighborhood) {
    descParts.push(`in ${neighborhood.name}, ${city.name}`)
  } else {
    descParts.push(`in ${city.name}`)
  }
  if (priceRange) {
    descParts.push(`priced ${priceRange.label.toLowerCase()}`)
  }
  descParts.push('. Contact Sri Collective Group for viewings.')

  const description = descParts.join(' ')

  // Build canonical URL
  const pathParts = ['properties', citySlug]
  if (filters.neighborhood) pathParts.push(filters.neighborhood)
  if (filters.priceRange) pathParts.push(filters.priceRange)
  if (filters.propertyType) pathParts.push(filters.propertyType)
  if (filters.bedrooms) pathParts.push(filters.bedrooms)

  const canonical = `${BASE_URL}/${pathParts.join('/')}`

  return {
    title,
    description,
    canonical,
    openGraph: {
      title,
      description,
      url: canonical,
    },
  }
}

/**
 * Convert SEO filter params to IDX search params
 */
export function seoFiltersToIDXParams(
  citySlug: string,
  filters: SEOFilterParams
): Record<string, unknown> {
  const city = getCityBySlug(citySlug)
  const params: Record<string, unknown> = {}

  if (city) {
    params.city = city.name
  }

  if (filters.priceRange) {
    const range = getPriceRangeBySlug(filters.priceRange)
    if (range?.min) params.minPrice = range.min
    if (range?.max) params.maxPrice = range.max
  }

  if (filters.propertyType) {
    const type = getPropertyTypeBySlug(filters.propertyType)
    if (type) params.propertyType = type.idxValue
  }

  if (filters.bedrooms) {
    const beds = getBedroomsBySlug(filters.bedrooms)
    if (beds) params.bedrooms = beds.min
  }

  return params
}

/**
 * Generate all possible filter combinations for sitemap
 */
export function generateAllFilterCombinations(): string[] {
  const urls: string[] = []

  for (const city of GTA_CITIES) {
    // City-only page
    urls.push(`/properties/${city.slug}`)

    // City + neighborhood
    for (const neighborhood of city.neighborhoods) {
      urls.push(`/properties/${city.slug}/${neighborhood.slug}`)

      // City + neighborhood + price (most valuable SEO pages)
      for (const price of PRICE_RANGES) {
        urls.push(`/properties/${city.slug}/${neighborhood.slug}/${price.slug}`)

        // City + neighborhood + price + type
        for (const type of PROPERTY_TYPES) {
          urls.push(`/properties/${city.slug}/${neighborhood.slug}/${price.slug}/${type.slug}`)
        }
      }
    }

    // City + price (without neighborhood)
    for (const price of PRICE_RANGES) {
      urls.push(`/properties/${city.slug}/${price.slug}`)

      // City + price + type
      for (const type of PROPERTY_TYPES) {
        urls.push(`/properties/${city.slug}/${price.slug}/${type.slug}`)
      }
    }

    // City + type (without price)
    for (const type of PROPERTY_TYPES) {
      urls.push(`/properties/${city.slug}/${type.slug}`)
    }
  }

  return urls
}

// Re-export config for sitemap use
export { GTA_CITIES, PRICE_RANGES, PROPERTY_TYPES, BEDROOM_OPTIONS }
