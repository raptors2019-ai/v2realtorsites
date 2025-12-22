# Feature: Properties Page with BoldTrail Integration

## Feature Description

Implement a complete properties browsing experience for the Sri Collective real estate site, integrating with BoldTrail (kvCORE) API for live MLS listings. The feature includes a properties listing page with filtering/sorting capabilities, individual property detail pages, and graceful fallback to mock data when the API is unavailable.

This leverages the existing BoldTrail MCP server and CRM package (`@repo/crm`) to fetch real property listings, while using the pre-built UI components from `@repo/ui` (PropertyCard, PropertyGrid, PropertyFilters, PropertiesPageClient) to display listings with consistent, luxury styling.

## User Story

As a home buyer visiting Sri Collective's website
I want to browse, filter, and view detailed property listings
So that I can find homes that match my criteria and contact the agent for viewings

## Problem Statement

Currently, the sri-collective app has:
1. A home page with featured properties section (using mock data)
2. Links to `/properties` and `/properties/[id]` that return 404
3. No way for users to browse the full inventory or filter by criteria
4. BoldTrail CRM integration exists but is not wired to a properties page

The challenge: Create a complete properties browsing experience that:
- Fetches live listings from BoldTrail API
- Falls back gracefully to mock data during development
- Uses existing shared UI components
- Follows Vertical Slice Architecture
- Maintains the luxury aesthetic

## Solution Statement

Create a vertical slice feature at `apps/sri-collective/app/(features)/properties/` that:

1. **Server Component Page** (`page.tsx`): Fetches properties from BoldTrail via `@repo/crm`, passes to client components
2. **Dynamic Detail Page** (`[id]/page.tsx`): Shows full property details with image gallery, similar properties
3. **Mock Data Enhancement**: Add 10+ mock properties in `data/properties.json` for development fallback
4. **Loading States**: Implement `loading.tsx` with skeleton UI for streaming
5. **Error Handling**: Graceful degradation with user-friendly error messages

This approach uses existing infrastructure (CRM client, UI components, types) while adding the missing pages following established patterns.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**:
- `apps/sri-collective/app/(features)/properties/` (new vertical slice)
- `apps/sri-collective/data/properties.json` (mock data enhancement)
- `apps/sri-collective/lib/data.ts` (data fetching utilities)

**Dependencies**:
- `@repo/crm` - BoldTrail client for API calls
- `@repo/ui` - PropertyCard, PropertyGrid, PropertyFilters, PropertiesPageClient
- `@repo/types` - Property, PropertyFilters, SortOption types
- `@repo/lib` - filterProperties, sortProperties, formatPrice utilities

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Data Layer (Source patterns):**

- `apps/sri-collective/lib/data.ts` (lines 1-80) - Data fetching with BoldTrail fallback
  - **Why**: Contains getAllProperties(), getFeaturedProperties() patterns to follow
  - **Pattern**: Graceful fallback to mock data when API unavailable

- `packages/crm/src/client.ts` (lines 73-143) - BoldTrailClient.getListings() implementation
  - **Why**: API client with filtering, pagination, Bearer auth
  - **Key**: Uses `https://api.kvcore.com/listings` endpoint

- `packages/crm/src/types.ts` (entire file) - BoldTrailListing, ListingFilters types
  - **Why**: Type definitions for API responses

- `apps/sri-collective/app/api/listings/route.ts` (entire file) - Existing API route
  - **Why**: Pattern for API routes with BoldTrail integration

**UI Components (Ready to use):**

- `packages/ui/src/properties/PropertiesPageClient.tsx` (entire file) - Main page orchestrator
  - **Why**: Handles filter state, calls filterProperties/sortProperties, renders grid
  - **Props**: `{ initialProperties: Property[] }`

- `packages/ui/src/properties/PropertyCard.tsx` (entire file) - Individual listing card
  - **Why**: Displays property with image, price, beds/baths, hover effects
  - **Links to**: `/properties/[id]` detail page

- `packages/ui/src/properties/PropertyGrid.tsx` (entire file) - Responsive grid layout
  - **Why**: 1→2→3→4 column responsive grid with empty state

- `packages/ui/src/properties/PropertyFilters.tsx` (entire file) - Filter/sort controls
  - **Why**: Property type, bedrooms, bathrooms, price range, sort dropdowns

**Type Definitions:**

- `packages/types/src/property.ts` (entire file) - Property, PropertyFilters, SortOption
  - **Why**: Type definitions for properties

- `packages/types/src/listing.ts` (entire file) - BoldTrailListing, ListingFilters
  - **Why**: API response types

**Utility Functions:**

- `packages/lib/src/data-fetcher.ts` (lines 1-100) - filterProperties, sortProperties, convertToProperty
  - **Why**: Pure functions for client-side filtering/sorting and API conversion

- `packages/lib/src/utils.ts` (entire file) - formatPrice, formatDate, cn
  - **Why**: Formatting utilities for display

**Reference Pages:**

- `apps/sri-collective/app/page.tsx` (entire file) - Home page pattern
  - **Why**: Shows Server Component with data fetching + PropertyCard usage

- `apps/newhomeshow/app/page.tsx` (entire file) - Alternate page pattern
  - **Why**: Different styling approach for comparison

**MCP Server Reference:**

- `boldtrail-mcp-server/src/index.ts` (lines 173-215) - get_listings tool
  - **Why**: Shows BoldTrail API endpoint patterns and parameters

### New Files to Create

**Vertical Slice:**
- `apps/sri-collective/app/(features)/properties/page.tsx` - Main properties listing page (Server Component)
- `apps/sri-collective/app/(features)/properties/loading.tsx` - Loading skeleton UI
- `apps/sri-collective/app/(features)/properties/[id]/page.tsx` - Property detail page (Server Component)
- `apps/sri-collective/app/(features)/properties/[id]/loading.tsx` - Detail page loading skeleton
- `apps/sri-collective/app/(features)/properties/components/PropertyDetailClient.tsx` - Client component for detail interactions

**Mock Data:**
- Update `apps/sri-collective/data/properties.json` - Add 10+ realistic mock properties

### Relevant Documentation

**BoldTrail API:**
- [BoldTrail Developer Hub](https://developerhub.boldtrail.com/) - API overview
- [Inside Real Estate API Tokens Guide](https://help.insiderealestate.com/en/articles/4263959-boldtrail-api-tokens) - Authentication setup
  - Token types: Contacts, User, All (V2 API access)
  - Bearer token auth: `Authorization: Bearer {BOLDTRAIL_API_KEY}`

**BoldTrail API Endpoints (from codebase analysis):**
- Base URL: `https://api.kvcore.com`
- `GET /listings?limit=25&status=active&minPrice=X&maxPrice=X&bedrooms=X&city=X`
- `GET /listings/{id}` - Single listing
- `GET /contacts` - Contacts list
- `POST /contacts` - Create contact

**Next.js App Router:**
- [Next.js Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data)
  - Server Components for data fetching
  - Streaming with loading.tsx
  - Parallel data fetching with Promise.all
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
  - `[id]` folder pattern for dynamic segments

### Patterns to Follow

**Server Component Data Fetching (from apps/sri-collective/app/page.tsx):**
```typescript
export default async function PropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div>
      <PropertiesPageClient initialProperties={properties} />
    </div>
  );
}
```

**Data Fetching with Fallback (from apps/sri-collective/lib/data.ts:8-45):**
```typescript
export async function getAllProperties(filters?: ListingFilters): Promise<Property[]> {
  const apiKey = process.env.BOLDTRAIL_API_KEY;

  if (!apiKey) {
    console.log('[DEV] Using mock property data');
    return propertiesData as Property[];
  }

  try {
    const client = new BoldTrailClient(apiKey);
    const response = await client.getListings(filters);

    if (!response.success || !response.data) {
      return propertiesData as Property[];
    }

    return response.data.map(convertToProperty);
  } catch (error) {
    console.log('[DEV] BoldTrail API error, using mock data');
    return propertiesData as Property[];
  }
}
```

**Error Handling Pattern (from packages/crm/src/client.ts):**
```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  // ...
} catch (error) {
  return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
}
```

**Logging Pattern (from CLAUDE.md):**
```typescript
console.log('[properties.page.load]', { count: properties.length });
console.error('[api.boldtrail.failed]', { error, endpoint });
```

**Loading Skeleton Pattern:**
```typescript
// loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-80" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Mock Data Setup

Prepare realistic mock property data for development and API fallback.

**Tasks:**
1. Create 10+ mock properties in properties.json with varied types, prices, locations
2. Ensure all required Property interface fields are populated
3. Include realistic GTA addresses (Toronto, Mississauga, Brampton, Oakville)

**Goal**: Development works without BoldTrail API key configured.

### Phase 2: Properties Listing Page

Create the main properties browsing page with filtering.

**Tasks:**
1. Create page.tsx Server Component that fetches all properties
2. Create loading.tsx with skeleton UI for streaming
3. Wire up PropertiesPageClient from @repo/ui
4. Add page metadata for SEO
5. Style hero section matching site theme

**Goal**: Users can browse and filter all properties at /properties.

### Phase 3: Property Detail Page

Create individual property detail pages with full information.

**Tasks:**
1. Create [id]/page.tsx with dynamic routing
2. Implement getPropertyById() data fetching
3. Create PropertyDetailClient for interactive elements
4. Add image gallery, property details, contact CTA
5. Display similar properties section
6. Create [id]/loading.tsx skeleton

**Goal**: Users can view complete details of any property at /properties/[id].

### Phase 4: Integration & Polish

Final integration and validation.

**Tasks:**
1. Test BoldTrail API integration with real API key
2. Verify fallback behavior works correctly
3. Test all filter combinations
4. Ensure responsive design on mobile
5. Run lint and type-check

**Goal**: Feature is production-ready with comprehensive testing.

---

## STEP-BY-STEP TASKS

### UPDATE apps/sri-collective/data/properties.json
- **IMPLEMENT**: Add 10+ realistic mock properties covering all property types
- **INCLUDE**: detached, semi-detached, townhouse, condo types
- **INCLUDE**: Various prices ($500K-$2M), bedrooms (1-5), locations (Toronto, Mississauga, etc.)
- **INCLUDE**: Realistic images from Unsplash (home/property photos)
- **PATTERN**:
  ```json
  [
    {
      "id": "prop-001",
      "title": "Stunning Modern Detached Home",
      "address": "123 Queen St W",
      "city": "Toronto",
      "province": "ON",
      "postalCode": "M5H 2N2",
      "price": 1250000,
      "bedrooms": 4,
      "bathrooms": 3,
      "sqft": 2800,
      "propertyType": "detached",
      "status": "active",
      "featured": true,
      "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
      "description": "Beautiful 4-bedroom detached home...",
      "listingDate": "2025-01-15T00:00:00Z",
      "mlsNumber": "W1234567"
    }
  ]
  ```
- **GOTCHA**: Ensure listingDate is ISO string format, images are valid URLs
- **VALIDATE**: `node -e "console.log(require('./apps/sri-collective/data/properties.json').length)"`

### CREATE apps/sri-collective/app/(features)/properties/page.tsx
- **IMPLEMENT**: Server Component properties listing page
- **IMPORTS**:
  ```typescript
  import { Metadata } from 'next'
  import { PropertiesPageClient } from '@repo/ui'
  import { getAllProperties } from '@/lib/data'
  ```
- **PATTERN**: Follow apps/sri-collective/app/page.tsx structure
- **INCLUDE**:
  - Hero section with title and description
  - PropertiesPageClient with fetched properties
  - Container layout with proper spacing
- **EXAMPLE**:
  ```typescript
  export const metadata: Metadata = {
    title: 'Browse Properties | Sri Collective Group',
    description: 'Find your perfect home in the Greater Toronto Area',
  }

  export default async function PropertiesPage() {
    const properties = await getAllProperties()

    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-cream to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="accent-line mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
                Browse Properties
              </h1>
              <p className="text-text-secondary max-w-2xl mx-auto">
                Explore our curated selection of homes across the Greater Toronto Area
              </p>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <PropertiesPageClient initialProperties={properties} />
          </div>
        </section>
      </div>
    )
  }
  ```
- **GOTCHA**: Must use async function for Server Component data fetching
- **VALIDATE**: `npm run type-check --filter=sri-collective`

### CREATE apps/sri-collective/app/(features)/properties/loading.tsx
- **IMPLEMENT**: Loading skeleton for properties page
- **PATTERN**: Shimmer animation with property card placeholders
- **EXAMPLE**:
  ```typescript
  export default function Loading() {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Skeleton */}
        <section className="py-16 bg-gradient-to-b from-cream to-white">
          <div className="container mx-auto px-4 text-center">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-12 w-96 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
        </section>

        {/* Filters Skeleton */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="luxury-card rounded-xl p-6 mb-8 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Property Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="luxury-card-premium rounded-xl overflow-hidden animate-pulse">
                  <div className="h-60 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }
  ```
- **VALIDATE**: `npm run lint --filter=sri-collective`

### UPDATE apps/sri-collective/lib/data.ts
- **ADD**: getPropertyById() function for detail page
- **ADD**: getSimilarProperties() enhanced with better matching
- **IMPORTS**: Add any missing imports
- **IMPLEMENT**:
  ```typescript
  /**
   * Get a single property by ID
   * Falls back to mock data if API unavailable
   */
  export async function getPropertyById(id: string): Promise<Property | null> {
    const apiKey = process.env.BOLDTRAIL_API_KEY;

    // Try API first
    if (apiKey) {
      try {
        const client = new BoldTrailClient(apiKey);
        const response = await client.getListing(id);

        if (response.success && response.data) {
          return convertToProperty(response.data);
        }
      } catch (error) {
        console.error('[api.boldtrail.getListing.failed]', { id, error });
      }
    }

    // Fallback to mock data
    const properties = await getAllProperties();
    return properties.find(p => p.id === id) || null;
  }
  ```
- **PATTERN**: Mirror getAllProperties() fallback pattern
- **GOTCHA**: Handle case where property doesn't exist (return null)
- **VALIDATE**: `npm run type-check --filter=sri-collective`

### CREATE apps/sri-collective/app/(features)/properties/[id]/page.tsx
- **IMPLEMENT**: Dynamic property detail page
- **IMPORTS**:
  ```typescript
  import { Metadata } from 'next'
  import { notFound } from 'next/navigation'
  import Image from 'next/image'
  import Link from 'next/link'
  import { getPropertyById, getSimilarProperties } from '@/lib/data'
  import { PropertyCard } from '@repo/ui'
  import { formatPrice } from '@repo/lib'
  ```
- **IMPLEMENT**:
  ```typescript
  interface PageProps {
    params: Promise<{ id: string }>
  }

  export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const property = await getPropertyById(id)

    if (!property) {
      return { title: 'Property Not Found' }
    }

    return {
      title: `${property.title} | Sri Collective Group`,
      description: property.description?.slice(0, 160) || `${property.bedrooms} bed, ${property.bathrooms} bath home in ${property.city}`,
    }
  }

  export default async function PropertyDetailPage({ params }: PageProps) {
    const { id } = await params
    const property = await getPropertyById(id)

    if (!property) {
      notFound()
    }

    const similarProperties = await getSimilarProperties(property, 3)

    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-text-secondary">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-primary">Properties</Link>
            <span>/</span>
            <span className="text-secondary">{property.title}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                <Image
                  src={property.images[0] || '/placeholder.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />
                {property.status === 'active' && (
                  <div className="absolute top-4 left-4 badge-sale">For Sale</div>
                )}
              </div>

              {/* Property Details */}
              <div className="luxury-card-premium rounded-xl p-8">
                <h1 className="text-3xl font-bold text-secondary mb-2">
                  {property.title}
                </h1>
                <p className="text-text-secondary flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}, {property.city}, {property.province} {property.postalCode}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 py-6 border-y border-primary/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{property.bedrooms}</p>
                    <p className="text-sm text-text-secondary">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{property.bathrooms}</p>
                    <p className="text-sm text-text-secondary">Bathrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{property.sqft.toLocaleString()}</p>
                    <p className="text-sm text-text-secondary">Sq Ft</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary capitalize">{property.propertyType}</p>
                    <p className="text-sm text-text-secondary">Type</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-secondary mb-4">About This Property</h2>
                  <p className="text-text-secondary leading-relaxed">
                    {property.description || 'Contact us for more information about this beautiful property.'}
                  </p>
                </div>

                {property.mlsNumber && (
                  <p className="mt-6 text-sm text-text-muted">
                    MLS# {property.mlsNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Pricing & Contact */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="luxury-card-premium rounded-xl p-6 sticky top-24">
                <p className="text-sm text-text-secondary mb-1">Listed Price</p>
                <p className="text-4xl font-bold text-gradient-primary mb-6">
                  {formatPrice(property.price)}
                </p>

                <Link
                  href="/contact"
                  className="btn-primary w-full py-4 rounded-lg text-center font-semibold block mb-4"
                >
                  Schedule a Viewing
                </Link>
                <Link
                  href="/contact"
                  className="btn-outline w-full py-4 rounded-lg text-center font-medium block"
                >
                  Ask a Question
                </Link>

                <div className="mt-6 pt-6 border-t border-primary/20">
                  <p className="text-sm text-text-secondary mb-4">Contact Our Team</p>
                  <a href="tel:+14167860431" className="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    +1 (416) 786-0431
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="py-16 bg-cream">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-secondary mb-8">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarProperties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    )
  }
  ```
- **GOTCHA**: Use `await params` for Next.js 15 async params
- **GOTCHA**: Call notFound() for missing properties, not redirect
- **VALIDATE**: `npm run type-check --filter=sri-collective`

### CREATE apps/sri-collective/app/(features)/properties/[id]/loading.tsx
- **IMPLEMENT**: Loading skeleton for detail page
- **PATTERN**: Match detail page layout with skeleton elements
- **EXAMPLE**:
  ```typescript
  export default function Loading() {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Skeleton */}
        <div className="container mx-auto px-4 py-4">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Skeleton */}
              <div className="aspect-[16/10] rounded-xl bg-gray-200 animate-pulse" />

              {/* Details Skeleton */}
              <div className="luxury-card-premium rounded-xl p-8 animate-pulse">
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-8" />

                <div className="grid grid-cols-4 gap-4 py-6 border-y border-gray-200">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2" />
                      <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="h-6 w-1/4 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-4 w-4/6 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="luxury-card-premium rounded-xl p-6 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-10 w-40 bg-gray-200 rounded mb-6" />
                <div className="h-12 w-full bg-gray-200 rounded mb-4" />
                <div className="h-12 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  ```
- **VALIDATE**: `npm run lint --filter=sri-collective`

### CREATE apps/sri-collective/app/(features)/properties/not-found.tsx
- **IMPLEMENT**: Custom 404 page for properties
- **PATTERN**: User-friendly message with link back to properties list
- **EXAMPLE**:
  ```typescript
  import Link from 'next/link'

  export default function NotFound() {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-secondary mb-4">
            Property Not Found
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            The property you're looking for may have been sold or is no longer available.
          </p>
          <Link
            href="/properties"
            className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium inline-block"
          >
            Browse All Properties
          </Link>
        </div>
      </div>
    )
  }
  ```
- **VALIDATE**: `npm run lint --filter=sri-collective`

### UPDATE apps/sri-collective/app/layout.tsx
- **VERIFY**: Navigation includes /properties link (already configured)
- **VERIFY**: Footer links include properties
- **NO CHANGES NEEDED**: Navigation is already configured in headerConfig
- **VALIDATE**: Check navigation array includes `{ label: 'Properties', href: '/properties' }`

---

## TESTING STRATEGY

### Unit Tests

**Scope**: Data fetching functions
**Framework**: Jest + React Testing Library
**Location**: `apps/sri-collective/lib/__tests__/data.test.ts`

- getAllProperties returns array
- getPropertyById returns property or null
- getSimilarProperties returns filtered array
- Fallback to mock data when API unavailable

### Integration Tests

**Scope**: Page rendering with data
**Location**: `apps/sri-collective/app/(features)/properties/__tests__/`

- PropertiesPage renders with mock data
- PropertyDetailPage renders property details
- PropertyDetailPage calls notFound() for invalid ID
- Filters update displayed properties

### Edge Cases

- Empty properties array (show empty state)
- API timeout (fallback to mock data)
- Invalid property ID (404 page)
- Properties with missing optional fields (images, description)
- Very long property descriptions (truncation)
- Price formatting for millions ($1,250,000)
- Mobile responsive layout

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# From structure_site root
npm run lint
```
**Expected**: No ESLint errors, all files pass

```bash
# Type check all packages
npm run type-check
```
**Expected**: No TypeScript errors, all types resolve

### Level 2: Build Verification

```bash
# Build the sri-collective app
npm run build --filter=sri-collective
```
**Expected**: Build completes without errors

### Level 3: Development Testing

```bash
# Start dev server
npm run dev --filter=sri-collective
```
**Expected**: Server starts on http://localhost:3001

### Level 4: Manual Validation

**Properties List Page:**
1. Navigate to http://localhost:3001/properties
2. Verify page loads with property cards
3. Test property type filter (detached, condo, etc.)
4. Test bedroom filter
5. Test price range filter
6. Test sort options (price high/low, latest)
7. Verify "Clear Filters" button works
8. Verify results count updates
9. Test on mobile viewport

**Property Detail Page:**
1. Click on any property card
2. Verify navigation to /properties/[id]
3. Check breadcrumb navigation
4. Verify image displays
5. Check property details (beds, baths, sqft, type)
6. Verify price formatting
7. Test "Schedule a Viewing" link goes to /contact
8. Check similar properties section
9. Test back navigation

**Edge Cases:**
1. Navigate to /properties/invalid-id - should show 404
2. Refresh properties page - should maintain state
3. Direct link to /properties/prop-001 - should work

### Level 5: BoldTrail API Integration (Optional)

**With API key configured:**
```bash
# Add to .env.local
BOLDTRAIL_API_KEY=your_key_here
```

1. Restart dev server
2. Navigate to /properties
3. Verify real listings appear (if API returns data)
4. Check console for API success logs

---

## ACCEPTANCE CRITERIA

- [ ] Properties page loads at /properties with all mock properties
- [ ] Filter by property type works correctly
- [ ] Filter by bedrooms (minimum) works
- [ ] Filter by price range works
- [ ] Sort by latest/price-asc/price-desc/featured works
- [ ] Clear filters resets all filters
- [ ] Results count updates dynamically
- [ ] Property cards link to detail pages
- [ ] Property detail page shows all information
- [ ] Similar properties section appears
- [ ] Breadcrumb navigation works
- [ ] 404 page appears for invalid property IDs
- [ ] Loading skeletons appear during navigation
- [ ] Page is responsive on mobile
- [ ] All validation commands pass with zero errors
- [ ] No TypeScript any types
- [ ] API fallback works when BOLDTRAIL_API_KEY not set

---

## COMPLETION CHECKLIST

- [ ] Mock data populated with 10+ properties
- [ ] Properties page created with Server Component data fetching
- [ ] Loading skeleton implemented
- [ ] Detail page created with dynamic routing
- [ ] getPropertyById() added to data.ts
- [ ] 404 page created for missing properties
- [ ] All validation commands executed successfully
- [ ] Manual testing confirms feature works
- [ ] Mobile responsive design verified
- [ ] BoldTrail fallback verified

---

## NOTES

### Design Decisions

**Why use route group (features) for properties?**
- Follows Vertical Slice Architecture from CLAUDE.md
- Keeps feature self-contained with all related files
- Enables future feature additions without cluttering app root

**Why Server Components for data fetching?**
- Better performance (no client-side fetching waterfall)
- SEO benefits (content rendered on server)
- Simpler mental model (fetch then render)
- Follows Next.js 15 best practices

**Why client-side filtering instead of API filtering?**
- BoldTrail API may have rate limits
- Reduces API calls (fetch once, filter client-side)
- Instant filtering response
- Works with mock data fallback
- PropertiesPageClient already handles this pattern

**Why separate loading.tsx files?**
- Enables streaming (show loading state while data fetches)
- Better perceived performance
- Automatic integration with Next.js Suspense

### Trade-offs

**Mock Data Size (10+ properties)**
- **Pro**: Good development experience
- **Pro**: Tests all filter combinations
- **Con**: Larger bundle if not code-split
- **Decision**: Acceptable trade-off for DX

**Client-side vs Server-side Pagination**
- **Pro of client-side**: Works with mock data, instant response
- **Con of client-side**: All data loaded initially
- **Decision**: Start with client-side, add server pagination if needed for large datasets

### BoldTrail API Notes

**API Base URL**: `https://api.kvcore.com`
**Authentication**: Bearer token via `BOLDTRAIL_API_KEY`
**Key Endpoints**:
- `GET /listings?limit=25&status=active` - List properties
- `GET /listings/{id}` - Single property

**Token Management**:
- Max 3 tokens per account
- Tokens valid for 1 year
- Token types: Contacts, User, All (V2)

**Response Format**: Returns `{ data: [...] }` or `{ listings: [...] }`

---

<!-- EOF -->
