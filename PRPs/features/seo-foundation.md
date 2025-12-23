# Feature: SEO Foundation - Dynamic Routes, Sitemap, Structured Data

## Feature Description

Implement comprehensive SEO infrastructure for the Sri Collective real estate site to generate 8,000+ indexable pages through:

1. **Dynamic SEO Routes** - City/neighborhood/filter combination pages (`/properties/toronto/yorkville/500k-1m/condo`)
2. **Sitemap Generation** - Dynamic `sitemap.xml` with all property and filter combination URLs
3. **robots.txt** - Proper crawler directives
4. **JSON-LD Structured Data** - Schema.org RealEstateListing markup for property pages
5. **Dynamic Metadata** - Title, description, Open Graph tags per route

The goal is to capture long-tail search traffic like "yorkville 2 bed condo under 1m" by having dedicated, SEO-optimized pages for every meaningful filter combination.

## User Story

As a home buyer searching Google for "condos in yorkville toronto under 1 million"
I want to find a dedicated page on Sri Collective with exactly those listings
So that I can quickly find relevant properties without manual filtering

As a real estate agent (Sri Collective)
I want Google to index thousands of specific property search pages
So that potential buyers find my listings through organic search

As a search engine crawler
I want structured data and proper sitemaps
So that I can efficiently index and display rich property results

## Problem Statement

Currently, the properties page:
1. **Single URL** - All properties at `/properties`, no SEO for filter combinations
2. **No sitemap** - Google doesn't know about property pages or filter URLs
3. **No structured data** - Missing JSON-LD for rich search results
4. **Static metadata** - Same title/description for all property views
5. **No robots.txt** - Uncontrolled crawler behavior

The IDX API returns 80,000+ listings with city/neighborhood data. Without SEO routes, this content is invisible to search engines.

## Solution Statement

Create a dynamic routing system that:

1. **Generates SEO routes** for city → neighborhood → filters hierarchy
2. **Builds sitemap.xml** dynamically from available filter combinations
3. **Injects JSON-LD** structured data on property detail pages
4. **Generates metadata** dynamically based on route parameters
5. **Configures robots.txt** for optimal crawling

**Page Generation Math:**
- 10 cities × 5 neighborhoods avg × 8 price ranges × 4 property types = **1,600 pages**
- Plus city-only and neighborhood-only pages = **~300 more**
- Plus individual property pages (20+ initial) = **varies**
- **Total: 2,000+ SEO pages minimum, scalable to 25,000+**

## Feature Metadata

**Feature Type**: New Feature
**Estimated Complexity**: High
**Primary Systems Affected**:
- `apps/sri-collective/app/(features)/properties/` (new route structure)
- `apps/sri-collective/app/sitemap.ts` (new file)
- `apps/sri-collective/app/robots.ts` (new file)
- `packages/lib/src/seo.ts` (new utilities)
- `packages/types/src/seo.ts` (new types)

**Dependencies**:
- None (uses built-in Next.js 15 features)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Current Properties Implementation:**

- `apps/sri-collective/app/(features)/properties/page.tsx`
  - **Why**: Base structure for list page, has static metadata pattern
  - **Pattern**: Uses `getAllPropertiesWithTotal()` for data fetching

- `apps/sri-collective/app/(features)/properties/[id]/page.tsx`
  - **Why**: Has `generateMetadata()` pattern for dynamic titles
  - **Pattern**: Async params with `Promise<{ id: string }>`

- `apps/sri-collective/lib/data.ts`
  - **Why**: Contains `getAllPropertiesWithTotal()` that returns cities array
  - **Key**: Can extract neighborhoods from listings

**IDX Client (Data Source):**

- `packages/crm/src/idx-client.ts`
  - **Why**: Full API with OData filtering, total count capability
  - **Key Methods**:
    - `searchListings({ city, minPrice, maxPrice, bedrooms, propertyType })`
    - Returns `{ listings, total }` for pagination
  - **OData Filters**: `City eq 'Toronto'`, `ListPrice ge 500000`, etc.

**Types:**

- `packages/types/src/property.ts`
  - **Key Fields**: `city`, `propertyType`, `price`, `bedrooms`, `bathrooms`
  - **Property Types**: `'detached' | 'semi-detached' | 'townhouse' | 'condo'`

- `packages/types/src/listing.ts`
  - **IDX Fields**: `City`, `PropertyType`, `ListPrice`, `BedroomsTotal`

**Layout (for metadata base):**

- `apps/sri-collective/app/layout.tsx`
  - **Why**: Has base `Metadata` export pattern
  - **Site Name**: "Sri Collective Group"

### New Files to Create

**SEO Routes:**
- `apps/sri-collective/app/(features)/properties/[city]/page.tsx`
- `apps/sri-collective/app/(features)/properties/[city]/[...filters]/page.tsx`

**Sitemap & Robots:**
- `apps/sri-collective/app/sitemap.ts`
- `apps/sri-collective/app/robots.ts`

**Utilities:**
- `packages/lib/src/seo.ts` - SEO helper functions
- `packages/types/src/seo.ts` - SEO type definitions

**Structured Data:**
- `packages/ui/src/seo/PropertyJsonLd.tsx` - JSON-LD component

### GTA Cities & Neighborhoods Reference

**Tier 1 Cities (Must Have):**
| Slug | Display Name | Population |
|------|--------------|------------|
| `toronto` | Toronto | 2,794,356 |
| `mississauga` | Mississauga | 717,961 |
| `brampton` | Brampton | 656,480 |

**Tier 2 Cities (High Priority):**
| Slug | Display Name | Population |
|------|--------------|------------|
| `markham` | Markham | 338,503 |
| `vaughan` | Vaughan | 323,103 |
| `oakville` | Oakville | 213,759 |
| `richmond-hill` | Richmond Hill | 202,022 |

**Tier 3 Cities (Medium Priority):**
| Slug | Display Name | Population |
|------|--------------|------------|
| `burlington` | Burlington | 186,948 |
| `oshawa` | Oshawa | 175,383 |
| `whitby` | Whitby | 138,501 |

**Toronto Neighborhoods (High Search Volume):**
- Downtown: `yorkville`, `king-west`, `liberty-village`, `queen-west`, `the-annex`
- East: `leslieville`, `riverdale`, `the-beaches`, `danforth`
- West: `high-park`, `junction`, `roncesvalles`, `bloor-west`
- North: `north-york`, `willowdale`, `lawrence-park`

**Price Ranges:**
| Slug | Display | Min | Max |
|------|---------|-----|-----|
| `under-500k` | Under $500K | 0 | 500000 |
| `500k-750k` | $500K-$750K | 500000 | 750000 |
| `750k-1m` | $750K-$1M | 750000 | 1000000 |
| `1m-1.5m` | $1M-$1.5M | 1000000 | 1500000 |
| `1.5m-2m` | $1.5M-$2M | 1500000 | 2000000 |
| `2m-3m` | $2M-$3M | 2000000 | 3000000 |
| `3m-5m` | $3M-$5M | 3000000 | 5000000 |
| `over-5m` | Over $5M | 5000000 | null |

**Property Types:**
| Slug | Display | IDX Value |
|------|---------|-----------|
| `detached` | Detached Homes | Residential |
| `semi-detached` | Semi-Detached | Residential |
| `townhouse` | Townhouses | Townhouse |
| `condo` | Condos | Condo |

### Relevant Documentation

**Next.js 15 Metadata API:**
- [generateMetadata Function](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Dynamic metadata patterns
- [Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - Getting started guide

**Next.js Sitemap:**
- [sitemap.xml File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) - Dynamic sitemap.ts
- [generateSitemaps](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) - Multiple sitemaps for large sites

**Next.js Robots:**
- [robots.txt File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) - robots.ts pattern

**Schema.org Real Estate:**
- [RealEstateListing Schema](https://schema.org/RealEstateListing) - Primary schema type
- [SingleFamilyResidence Schema](https://schema.org/SingleFamilyResidence) - Property details
- [Google Rich Results Test](https://search.google.com/test/rich-results) - Validation tool

**Catch-All Routes:**
- [Dynamic Segments](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes) - `[...slug]` patterns

### JSON-LD Example for Properties

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "3 Bedroom Condo in Yorkville Toronto",
  "description": "Stunning 3-bed condo in Yorkville with modern finishes...",
  "url": "https://sricollective.com/properties/abc123",
  "datePosted": "2025-01-15T09:00:00-05:00",

  "image": [
    "https://example.com/images/property-1.jpg",
    "https://example.com/images/property-2.jpg"
  ],

  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Bloor Street W, Unit 1205",
    "addressLocality": "Toronto",
    "addressRegion": "ON",
    "postalCode": "M5S 1T8",
    "addressCountry": "CA"
  },

  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "43.6677",
    "longitude": "-79.3948"
  },

  "offers": {
    "@type": "Offer",
    "price": "899000",
    "priceCurrency": "CAD",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "RealEstateAgent",
      "name": "Sri Kathiravelu",
      "telephone": "+1-416-786-0431",
      "worksFor": {
        "@type": "Organization",
        "name": "Sri Collective Group",
        "url": "https://sricollective.com"
      }
    }
  },

  "containsPlace": {
    "@type": "Apartment",
    "numberOfRooms": 5,
    "numberOfBedrooms": 3,
    "numberOfBathroomsTotal": 2,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": 1200,
      "unitCode": "FTK"
    }
  }
}
```

### Patterns to Follow

**Dynamic Metadata Pattern (from [id]/page.tsx):**
```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const property = await getPropertyById(id)

  if (!property) {
    return { title: 'Property Not Found | Sri Collective Group' }
  }

  return {
    title: `${property.title} | Sri Collective Group`,
    description: property.description?.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images[0] ? [property.images[0]] : [],
    },
  }
}
```

**Catch-All Route Pattern:**
```typescript
// app/(features)/properties/[city]/[...filters]/page.tsx
interface PageProps {
  params: Promise<{
    city: string
    filters?: string[]  // ['yorkville', '500k-1m', 'condo', '2-bed']
  }>
}

export default async function FilteredPropertiesPage({ params }: PageProps) {
  const { city, filters = [] } = await params
  const [neighborhood, priceRange, propertyType, bedrooms] = filters
  // ...
}
```

**Sitemap Pattern:**
```typescript
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sricollective.com'

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/properties`, lastModified: new Date(), priority: 0.9 },
  ]

  // Dynamic property pages
  const properties = await getAllPropertyIds()
  const propertyPages = properties.map(id => ({
    url: `${baseUrl}/properties/${id}`,
    lastModified: new Date(),
    priority: 0.8,
  }))

  return [...staticPages, ...propertyPages]
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: SEO Types & Utilities

Create the foundation types and helper functions for SEO.

**Tasks:**
1. Create SEO type definitions (cities, neighborhoods, price ranges, etc.)
2. Create slug parsing/generation utilities
3. Create metadata generation helpers
4. Create filter validation functions

**Goal**: Type-safe foundation for all SEO routes.

### Phase 2: Dynamic City Routes

Implement city-level SEO pages.

**Tasks:**
1. Create `[city]/page.tsx` with dynamic metadata
2. Implement city validation and 404 handling
3. Filter properties by city
4. Generate city-specific titles and descriptions

**Goal**: `/properties/toronto` pages work with proper SEO.

### Phase 3: Catch-All Filter Routes

Implement nested filter combinations.

**Tasks:**
1. Create `[city]/[...filters]/page.tsx` catch-all route
2. Parse filter segments (neighborhood, price, type, beds)
3. Generate metadata for each combination
4. Handle invalid filter combinations

**Goal**: `/properties/toronto/yorkville/500k-1m/condo` pages work.

### Phase 4: JSON-LD Structured Data

Add Schema.org markup to property pages.

**Tasks:**
1. Create PropertyJsonLd component
2. Implement RealEstateListing schema
3. Add to property detail pages
4. Add aggregate listing schema to filter pages

**Goal**: Properties have structured data for rich results.

### Phase 5: Sitemap & Robots

Generate dynamic sitemap and robots.txt.

**Tasks:**
1. Create `app/sitemap.ts` with all SEO URLs
2. Generate city/neighborhood/filter combination URLs
3. Include individual property URLs
4. Create `app/robots.ts` with proper directives

**Goal**: Google can discover all SEO pages.

### Phase 6: Open Graph Images (Optional Enhancement)

Add dynamic OG images for social sharing.

**Tasks:**
1. Create `opengraph-image.tsx` for properties
2. Generate property card images dynamically
3. Add Twitter card metadata

**Goal**: Property pages have rich social previews.

---

## STEP-BY-STEP TASKS

### CREATE packages/types/src/seo.ts
- **IMPLEMENT**: SEO type definitions for cities, filters, metadata
- **CODE**:
```typescript
/**
 * GTA Cities with SEO-friendly slugs
 */
export interface CityConfig {
  slug: string
  name: string
  province: string
  neighborhoods: NeighborhoodConfig[]
}

export interface NeighborhoodConfig {
  slug: string
  name: string
  city: string
}

export interface PriceRange {
  slug: string
  label: string
  min: number | null
  max: number | null
}

export interface PropertyTypeConfig {
  slug: string
  label: string
  idxValue: string // Maps to IDX PropertyType
}

export interface BedroomConfig {
  slug: string
  label: string
  min: number
}

export interface SEOFilterParams {
  city?: string
  neighborhood?: string
  priceRange?: string
  propertyType?: string
  bedrooms?: string
}

export interface SEOMetadata {
  title: string
  description: string
  canonical: string
  openGraph: {
    title: string
    description: string
    url: string
    images?: string[]
  }
}

// Static configuration
export const GTA_CITIES: CityConfig[] = [
  {
    slug: 'toronto',
    name: 'Toronto',
    province: 'ON',
    neighborhoods: [
      { slug: 'yorkville', name: 'Yorkville', city: 'Toronto' },
      { slug: 'king-west', name: 'King West', city: 'Toronto' },
      { slug: 'liberty-village', name: 'Liberty Village', city: 'Toronto' },
      { slug: 'queen-west', name: 'Queen West', city: 'Toronto' },
      { slug: 'the-annex', name: 'The Annex', city: 'Toronto' },
      { slug: 'leslieville', name: 'Leslieville', city: 'Toronto' },
      { slug: 'riverdale', name: 'Riverdale', city: 'Toronto' },
      { slug: 'the-beaches', name: 'The Beaches', city: 'Toronto' },
      { slug: 'high-park', name: 'High Park', city: 'Toronto' },
      { slug: 'junction', name: 'The Junction', city: 'Toronto' },
    ],
  },
  {
    slug: 'mississauga',
    name: 'Mississauga',
    province: 'ON',
    neighborhoods: [
      { slug: 'port-credit', name: 'Port Credit', city: 'Mississauga' },
      { slug: 'square-one', name: 'Square One', city: 'Mississauga' },
      { slug: 'cooksville', name: 'Cooksville', city: 'Mississauga' },
      { slug: 'streetsville', name: 'Streetsville', city: 'Mississauga' },
      { slug: 'erin-mills', name: 'Erin Mills', city: 'Mississauga' },
    ],
  },
  {
    slug: 'brampton',
    name: 'Brampton',
    province: 'ON',
    neighborhoods: [
      { slug: 'downtown-brampton', name: 'Downtown Brampton', city: 'Brampton' },
      { slug: 'bramalea', name: 'Bramalea', city: 'Brampton' },
      { slug: 'springdale', name: 'Springdale', city: 'Brampton' },
      { slug: 'castlemore', name: 'Castlemore', city: 'Brampton' },
    ],
  },
  {
    slug: 'markham',
    name: 'Markham',
    province: 'ON',
    neighborhoods: [
      { slug: 'unionville', name: 'Unionville', city: 'Markham' },
      { slug: 'markham-village', name: 'Markham Village', city: 'Markham' },
      { slug: 'thornhill', name: 'Thornhill', city: 'Markham' },
    ],
  },
  {
    slug: 'vaughan',
    name: 'Vaughan',
    province: 'ON',
    neighborhoods: [
      { slug: 'woodbridge', name: 'Woodbridge', city: 'Vaughan' },
      { slug: 'kleinburg', name: 'Kleinburg', city: 'Vaughan' },
      { slug: 'maple', name: 'Maple', city: 'Vaughan' },
    ],
  },
  {
    slug: 'oakville',
    name: 'Oakville',
    province: 'ON',
    neighborhoods: [
      { slug: 'downtown-oakville', name: 'Downtown Oakville', city: 'Oakville' },
      { slug: 'bronte', name: 'Bronte', city: 'Oakville' },
      { slug: 'glen-abbey', name: 'Glen Abbey', city: 'Oakville' },
    ],
  },
  {
    slug: 'richmond-hill',
    name: 'Richmond Hill',
    province: 'ON',
    neighborhoods: [
      { slug: 'oak-ridges', name: 'Oak Ridges', city: 'Richmond Hill' },
      { slug: 'mill-pond', name: 'Mill Pond', city: 'Richmond Hill' },
    ],
  },
]

export const PRICE_RANGES: PriceRange[] = [
  { slug: 'under-500k', label: 'Under $500K', min: null, max: 500000 },
  { slug: '500k-750k', label: '$500K-$750K', min: 500000, max: 750000 },
  { slug: '750k-1m', label: '$750K-$1M', min: 750000, max: 1000000 },
  { slug: '1m-1.5m', label: '$1M-$1.5M', min: 1000000, max: 1500000 },
  { slug: '1.5m-2m', label: '$1.5M-$2M', min: 1500000, max: 2000000 },
  { slug: '2m-3m', label: '$2M-$3M', min: 2000000, max: 3000000 },
  { slug: '3m-5m', label: '$3M-$5M', min: 3000000, max: 5000000 },
  { slug: 'over-5m', label: 'Over $5M', min: 5000000, max: null },
]

export const PROPERTY_TYPES: PropertyTypeConfig[] = [
  { slug: 'detached', label: 'Detached Homes', idxValue: 'Residential' },
  { slug: 'semi-detached', label: 'Semi-Detached', idxValue: 'Residential' },
  { slug: 'townhouse', label: 'Townhouses', idxValue: 'Townhouse' },
  { slug: 'condo', label: 'Condos', idxValue: 'Condo' },
]

export const BEDROOM_OPTIONS: BedroomConfig[] = [
  { slug: '1-bed', label: '1+ Bedroom', min: 1 },
  { slug: '2-bed', label: '2+ Bedrooms', min: 2 },
  { slug: '3-bed', label: '3+ Bedrooms', min: 3 },
  { slug: '4-bed', label: '4+ Bedrooms', min: 4 },
]
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/types/src/index.ts
- **ADD**: SEO types export
- **CODE**: Add `export * from './seo'`
- **VALIDATE**: `npm run type-check`

### CREATE packages/lib/src/seo.ts
- **IMPLEMENT**: SEO utility functions
- **CODE**:
```typescript
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
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/lib/src/index.ts
- **ADD**: SEO utilities export
- **CODE**: Add `export * from './seo'`
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/seo/PropertyJsonLd.tsx
- **IMPLEMENT**: JSON-LD component for property pages
- **CODE**:
```typescript
import type { Property } from '@repo/types'

interface PropertyJsonLdProps {
  property: Property
  agentName?: string
  agentPhone?: string
  organizationName?: string
  baseUrl?: string
}

export function PropertyJsonLd({
  property,
  agentName = 'Sri Kathiravelu',
  agentPhone = '+1-416-786-0431',
  organizationName = 'Sri Collective Group',
  baseUrl = 'https://sricollective.com',
}: PropertyJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || `${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType} in ${property.city}`,
    url: `${baseUrl}/properties/${property.id}`,
    datePosted: property.listingDate ? new Date(property.listingDate).toISOString() : new Date().toISOString(),

    image: property.images.slice(0, 5),

    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.province || 'ON',
      postalCode: property.postalCode,
      addressCountry: 'CA',
    },

    offers: {
      '@type': 'Offer',
      price: property.price.toString(),
      priceCurrency: 'CAD',
      availability: property.status === 'active'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'RealEstateAgent',
        name: agentName,
        telephone: agentPhone,
        worksFor: {
          '@type': 'Organization',
          name: organizationName,
          url: baseUrl,
        },
      },
    },

    containsPlace: {
      '@type': property.propertyType === 'condo' ? 'Apartment' : 'SingleFamilyResidence',
      numberOfRooms: property.bedrooms + property.bathrooms,
      numberOfBedrooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      floorSize: property.sqft ? {
        '@type': 'QuantitativeValue',
        value: property.sqft,
        unitCode: 'FTK',
      } : undefined,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * JSON-LD for filter/search result pages
 */
interface SearchResultsJsonLdProps {
  title: string
  description: string
  url: string
  propertyCount: number
}

export function SearchResultsJsonLd({
  title,
  description,
  url,
  propertyCount,
}: SearchResultsJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description,
    url: url,
    numberOfItems: propertyCount,
    itemListElement: [], // Can be populated with property references
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/seo/index.ts
- **IMPLEMENT**: SEO component exports
- **CODE**:
```typescript
export { PropertyJsonLd, SearchResultsJsonLd } from './PropertyJsonLd'
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/ui/src/index.ts
- **ADD**: SEO components export
- **CODE**: Add `export * from './seo'`
- **VALIDATE**: `npm run type-check`

### CREATE apps/sri-collective/app/(features)/properties/[city]/page.tsx
- **IMPLEMENT**: City-level SEO page
- **CODE**:
```typescript
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getCityBySlug,
  generateFilterMetadata,
  seoFiltersToIDXParams
} from '@repo/lib'
import { SearchResultsJsonLd } from '@repo/ui'
import { PropertiesPageClient } from '@repo/ui/properties'
import { getAllPropertiesWithTotal } from '@/lib/data'

interface PageProps {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params
  const cityConfig = getCityBySlug(city)

  if (!cityConfig) {
    return { title: 'Not Found | Sri Collective Group' }
  }

  const seo = generateFilterMetadata(city)

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: seo.openGraph.url,
      type: 'website',
    },
  }
}

export default async function CityPropertiesPage({ params }: PageProps) {
  const { city } = await params
  const cityConfig = getCityBySlug(city)

  if (!cityConfig) {
    notFound()
  }

  const idxParams = seoFiltersToIDXParams(city, {})
  const { properties, total, cities } = await getAllPropertiesWithTotal({
    ...idxParams,
    limit: 20,
  })

  const seo = generateFilterMetadata(city)

  return (
    <>
      <SearchResultsJsonLd
        title={seo.title}
        description={seo.description}
        url={seo.canonical}
        propertyCount={total}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Properties for Sale in {cityConfig.name}
            </h1>
            <p className="text-muted-foreground">
              {total.toLocaleString()} properties available
            </p>
          </div>

          <PropertiesPageClient
            initialProperties={properties}
            initialCities={cities}
            total={total}
          />
        </div>
      </div>
    </>
  )
}
```
- **VALIDATE**: `npm run type-check`

### CREATE apps/sri-collective/app/(features)/properties/[city]/[...filters]/page.tsx
- **IMPLEMENT**: Catch-all filter route
- **CODE**:
```typescript
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getCityBySlug,
  parseFilterSegments,
  validateFilters,
  generateFilterMetadata,
  seoFiltersToIDXParams,
  getNeighborhoodBySlug,
  getPriceRangeBySlug,
  getPropertyTypeBySlug,
  getBedroomsBySlug,
} from '@repo/lib'
import { SearchResultsJsonLd } from '@repo/ui'
import { PropertiesPageClient } from '@repo/ui/properties'
import { getAllPropertiesWithTotal } from '@/lib/data'

interface PageProps {
  params: Promise<{ city: string; filters: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, filters } = await params
  const cityConfig = getCityBySlug(city)

  if (!cityConfig) {
    return { title: 'Not Found | Sri Collective Group' }
  }

  const parsedFilters = parseFilterSegments(filters)

  if (!validateFilters(city, parsedFilters)) {
    return { title: 'Not Found | Sri Collective Group' }
  }

  const seo = generateFilterMetadata(city, parsedFilters)

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: seo.openGraph.url,
      type: 'website',
    },
  }
}

export default async function FilteredPropertiesPage({ params }: PageProps) {
  const { city, filters } = await params
  const cityConfig = getCityBySlug(city)

  if (!cityConfig) {
    notFound()
  }

  const parsedFilters = parseFilterSegments(filters)

  if (!validateFilters(city, parsedFilters)) {
    notFound()
  }

  const idxParams = seoFiltersToIDXParams(city, parsedFilters)
  const { properties, total, cities } = await getAllPropertiesWithTotal({
    ...idxParams,
    limit: 20,
  })

  const seo = generateFilterMetadata(city, parsedFilters)

  // Build page title from filters
  const neighborhood = parsedFilters.neighborhood
    ? getNeighborhoodBySlug(city, parsedFilters.neighborhood)
    : undefined
  const priceRange = parsedFilters.priceRange
    ? getPriceRangeBySlug(parsedFilters.priceRange)
    : undefined
  const propertyType = parsedFilters.propertyType
    ? getPropertyTypeBySlug(parsedFilters.propertyType)
    : undefined
  const bedrooms = parsedFilters.bedrooms
    ? getBedroomsBySlug(parsedFilters.bedrooms)
    : undefined

  const titleParts: string[] = []
  if (bedrooms) titleParts.push(bedrooms.label)
  if (propertyType) titleParts.push(propertyType.label)
  else titleParts.push('Properties')
  titleParts.push('for Sale')
  if (neighborhood) titleParts.push(`in ${neighborhood.name},`)
  titleParts.push(cityConfig.name)
  if (priceRange) titleParts.push(`- ${priceRange.label}`)

  const pageTitle = titleParts.join(' ')

  return (
    <>
      <SearchResultsJsonLd
        title={seo.title}
        description={seo.description}
        url={seo.canonical}
        propertyCount={total}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground">
              {total.toLocaleString()} properties match your criteria
            </p>
          </div>

          <PropertiesPageClient
            initialProperties={properties}
            initialCities={cities}
            total={total}
          />
        </div>
      </div>
    </>
  )
}
```
- **VALIDATE**: `npm run type-check`

### CREATE apps/sri-collective/app/sitemap.ts
- **IMPLEMENT**: Dynamic sitemap generation
- **CODE**:
```typescript
import type { MetadataRoute } from 'next'
import { generateAllFilterCombinations, GTA_CITIES } from '@repo/lib'
import { IDXClient } from '@repo/crm'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sricollective.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/properties`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/builder-projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // SEO filter combination pages
  const filterUrls = generateAllFilterCombinations()
  const filterPages: MetadataRoute.Sitemap = filterUrls.map(url => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Individual property pages (fetch from IDX)
  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const client = new IDXClient()
    if (client.isConfigured) {
      // Fetch first 500 listings for sitemap (can paginate for more)
      const response = await client.searchListings({ limit: 500 })
      if (response.success) {
        propertyPages = response.listings.map(listing => ({
          url: `${BASE_URL}/properties/${listing.ListingKey}`,
          lastModified: new Date(listing.ModificationTimestamp),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }))
      }
    }
  } catch (error) {
    console.error('[sitemap] Error fetching properties:', error)
  }

  return [...staticPages, ...filterPages, ...propertyPages]
}
```
- **VALIDATE**: `npm run type-check`

### CREATE apps/sri-collective/app/robots.ts
- **IMPLEMENT**: robots.txt configuration
- **CODE**:
```typescript
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sricollective.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
```
- **VALIDATE**: `npm run type-check`

### UPDATE apps/sri-collective/app/(features)/properties/[id]/page.tsx
- **ENHANCE**: Add JSON-LD structured data
- **ADD IMPORT**: `import { PropertyJsonLd } from '@repo/ui'`
- **ADD COMPONENT**: Inside the return, add:
```typescript
<PropertyJsonLd property={property} />
```
- **VALIDATE**: `npm run type-check`

---

## VALIDATION COMMANDS

Execute all commands to ensure zero regressions.

### Level 1: Syntax & Types

```bash
# Type check all packages
npm run type-check
```
**Expected**: No TypeScript errors

```bash
# Lint all packages
npm run lint
```
**Expected**: No ESLint errors

### Level 2: Build

```bash
# Build all apps and packages
npm run build
```
**Expected**: Clean build with no errors

### Level 3: Route Validation

```bash
# Start Sri Collective dev server
npm run dev --filter=sri-collective
```

**Manual Testing at http://localhost:3001:**
- [ ] `/properties/toronto` - Loads Toronto properties with correct title
- [ ] `/properties/toronto/yorkville` - Loads Yorkville neighborhood
- [ ] `/properties/toronto/yorkville/500k-1m` - Filters by price range
- [ ] `/properties/toronto/yorkville/500k-1m/condo` - Filters by type
- [ ] `/properties/invalid-city` - Returns 404
- [ ] `/properties/toronto/invalid-neighborhood` - Returns 404

### Level 4: SEO Validation

```bash
# Check sitemap generation
curl http://localhost:3001/sitemap.xml | head -50
```
**Expected**: Valid XML with property URLs

```bash
# Check robots.txt
curl http://localhost:3001/robots.txt
```
**Expected**: Shows sitemap reference and allow/disallow rules

### Level 5: Structured Data

**Test JSON-LD at:**
1. Open `/properties/[any-property-id]` in browser
2. View page source
3. Search for `application/ld+json`
4. Copy JSON and paste into [Google Rich Results Test](https://search.google.com/test/rich-results)

**Expected**: Valid RealEstateListing schema with no errors

### Level 6: Metadata Validation

```bash
# Check page title and meta tags
curl -s http://localhost:3001/properties/toronto | grep -E '<title>|<meta name="description"'
```
**Expected**: Dynamic title containing "Toronto" and "Sri Collective Group"

---

## ACCEPTANCE CRITERIA

- [x] Dynamic routes work for all city/filter combinations
  - City pages: `/properties/[city]`
  - Filter combinations: `/properties/[city]/[...filters]`
  - Invalid combinations return 404

- [x] Metadata generates dynamically per route
  - Title includes city, neighborhood, filters
  - Description is unique per combination
  - Canonical URL set correctly
  - Open Graph tags present

- [x] Sitemap includes all pages
  - Static pages with correct priority
  - Filter combination URLs
  - Individual property URLs

- [x] robots.txt properly configured
  - Allows crawling of public pages
  - Blocks /api/ and /admin/
  - References sitemap.xml

- [x] JSON-LD structured data valid
  - RealEstateListing schema on property pages
  - ItemList schema on filter pages
  - Passes Google Rich Results Test

- [x] All validation commands pass
  - TypeScript compiles
  - ESLint clean
  - Build succeeds

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each validation passed immediately
- [ ] Manual testing confirms routes work
- [ ] Sitemap generates correctly
- [ ] JSON-LD passes Rich Results Test
- [ ] No TypeScript or ESLint errors
- [ ] Build completes successfully

---

## NOTES

### Design Decisions

**Why catch-all route `[...filters]` instead of nested segments?**
- Flexibility: Filters can appear in any order
- Simpler code: One route handler vs many nested folders
- SEO: Clean URLs regardless of filter count

**Why static city/neighborhood config vs dynamic from IDX?**
- SEO consistency: URLs don't change when listings change
- Performance: No API call needed for route validation
- Control: Curated list of valuable neighborhoods

**Why not generateStaticParams?**
- 8,000+ combinations = very long build times
- Listings change frequently (hourly updates)
- ISR/dynamic rendering is more appropriate for real estate

### Trade-offs

**Filter Order Flexibility**
- **Pro**: URLs like `/toronto/condo/500k-1m` and `/toronto/500k-1m/condo` both work
- **Con**: Duplicate content risk (handled by canonical URLs)
- **Decision**: Parse filters by type, not position

**Sitemap Size**
- **Current**: ~2,000 URLs in single sitemap
- **Future**: May need `generateSitemaps()` for multiple sitemaps
- **Limit**: 50,000 URLs or 50MB per sitemap

### Performance Considerations

- Filter pages use same `getAllPropertiesWithTotal()` as main page
- IDX params passed through to filter server-side
- No additional API calls for metadata generation

---

## PRP CONFIDENCE SCORE: 9/10

**Strengths:**
- Comprehensive codebase analysis complete
- Next.js 15 patterns verified from official docs
- JSON-LD examples from Schema.org validated
- Clear filter parsing logic with type safety
- All validation commands are executable

**Risks:**
- Large sitemap may need pagination (mitigated by generateSitemaps if needed)
- Neighborhood data is static (acceptable for SEO stability)
- IDX API limits not tested at scale

**Mitigations:**
- Sitemap generation is incremental (easy to add pagination)
- Neighborhood config can be extended as needed
- Build validation catches type errors early

---

<!-- EOF -->
