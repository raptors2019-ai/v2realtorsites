# Feature: Properties Page Performance - Pagination & Loading States

## Feature Description

Improve the properties page performance and user experience by:
1. **Reduce Initial Load** - Load 20 properties initially instead of 50 (faster first paint)
2. **"Show More" Pagination** - Add a button to load additional properties incrementally
3. **Loading Spinner** - Visual feedback during async operations (initial load + load more)

## User Story

As a home buyer browsing the properties page
I want the page to load quickly with visible feedback
So that I don't think the site is broken when waiting for listings

As a user scrolling through properties
I want to load more listings when I'm ready
So that I can browse at my own pace without being overwhelmed

## Problem Statement

Currently, the properties page:
1. **Loads 50 properties + media at once** - ~3 API calls, 1500+ media items, 1-2s+ render time
2. **No loading feedback** - Page appears blank/stuck while data loads
3. **All-or-nothing display** - Either shows everything or nothing, no progressive loading
4. **No pagination controls** - Cannot load more properties beyond initial fetch

The IDX API already supports pagination (`$top`, `$skip`, `$count`), but the UI doesn't expose it.

## Solution Statement

1. **Initial load of 20 properties** - Faster first contentful paint
2. **"Show More" button** - Loads next batch of 20, appends to grid
3. **Loading spinner component** - Reusable across properties page and "load more"
4. **Total count display** - "Showing X of Y properties" with progress awareness

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**:
- `packages/ui/src/properties/PropertiesPageClient.tsx` (state + pagination logic)
- `packages/ui/src/properties/PropertyGrid.tsx` (show more button)
- `packages/ui/src/components/Spinner.tsx` (new loading component)
- `apps/sri-collective/lib/data.ts` (pagination params)

**Dependencies**: None (uses existing IDX pagination infrastructure)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Properties Page (to modify):**

- `apps/sri-collective/app/(features)/properties/page.tsx`
  - **Why**: Server component that fetches initial properties
  - **Change**: Pass `limit: 20` instead of default 50

- `packages/ui/src/properties/PropertiesPageClient.tsx`
  - **Why**: Client component managing filter/sort state
  - **Change**: Add pagination state, "load more" handler, loading states

- `packages/ui/src/properties/PropertyGrid.tsx`
  - **Why**: Renders property cards grid
  - **Change**: Add "Show More" button, loading spinner slot

**Data Layer (already supports pagination):**

- `apps/sri-collective/lib/data.ts` - `getAllProperties(filters)`
  - **Key**: Already accepts `IDXSearchParams` with `limit` and `offset`

- `packages/crm/src/idx-client.ts` - `searchListings(params)`
  - **Key**: Uses `$top` (limit), `$skip` (offset), returns `total` count
  - **Response**: `{ success, listings, total, error }`

**Loading States (pattern reference):**

- `apps/sri-collective/app/(features)/properties/loading.tsx`
  - **Pattern**: Skeleton UI with `animate-pulse` for initial page load
  - **Note**: This handles Suspense boundary, not in-page loading

**Motion/Animation (for spinner):**

- `packages/ui/src/motion/variants.ts`
  - **Available**: `iconSpinVariants`, `pulseVariants` for loading animations

### Types (already exist)

```typescript
// packages/types/src/listing.ts
interface IDXSearchParams {
  limit?: number   // Default was 50, will change to 20
  offset?: number  // For pagination
  // ... other filters
}

interface IDXSearchResponse {
  success: boolean
  listings: IDXListing[]
  total: number    // Total available (e.g., 82,000+)
  error?: string
}
```

### Relevant Documentation

**React Patterns:**
- [React useState for pagination](https://react.dev/reference/react/useState)
- [Framer Motion animations](https://www.framer.com/motion/)

**Tailwind Loading States:**
- [Tailwind animate-spin](https://tailwindcss.com/docs/animation#spin)

---

## IMPLEMENTATION PLAN

### Phase 1: Loading Spinner Component

Create a reusable spinner component with size variants.

**Tasks:**
1. Create `Spinner.tsx` component in packages/ui
2. Support size variants: sm, md, lg
3. Use Tailwind `animate-spin` for simplicity
4. Export from packages/ui/src/components

### Phase 2: Update Initial Load

Reduce initial property fetch from 50 to 20.

**Tasks:**
1. Update `getAllProperties` call with `{ limit: 20 }`
2. Pass `total` count to client component
3. Update results text: "Showing X of Y properties"

### Phase 3: Pagination State & Handler

Add client-side pagination with "Show More" button.

**Tasks:**
1. Add state: `displayedProperties`, `offset`, `isLoadingMore`, `hasMore`
2. Create `loadMore` async handler
3. Fetch next 20 properties, append to array
4. Update `hasMore` based on total vs displayed

### Phase 4: UI Integration

Add loading states and "Show More" button to grid.

**Tasks:**
1. Show spinner during initial load (if needed)
2. Add "Show More" button below PropertyGrid
3. Show spinner inside button while loading more
4. Disable button while loading
5. Hide button when all properties loaded

---

## STEP-BY-STEP TASKS

### CREATE packages/ui/src/components/Spinner.tsx
- **IMPLEMENT**: Reusable loading spinner
- **CODE**:
```typescript
import { cn } from '@repo/lib'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-stone-300 border-t-primary',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/ui/src/components/index.ts
- **ADD**: Spinner export
- **CODE**: Add `export { Spinner } from './Spinner'`
- **VALIDATE**: `npm run type-check`

### UPDATE apps/sri-collective/app/(features)/properties/page.tsx
- **MODIFY**: Fetch initial 20 properties, pass total
- **CHANGE**:
```typescript
// Before
const properties = await getAllProperties()

// After
const response = await getAllPropertiesWithTotal({ limit: 20 })
// Pass both initialProperties and total to client
```
- **VALIDATE**: `npm run type-check`

### UPDATE apps/sri-collective/lib/data.ts
- **ADD**: New function that returns total count
- **CODE**:
```typescript
/**
 * Get properties with total count for pagination
 */
export async function getAllPropertiesWithTotal(
  filters?: IDXSearchParams
): Promise<{ properties: Property[]; total: number }> {
  const client = new IDXClient();

  if (!client.isConfigured) {
    console.error('[data.getAllPropertiesWithTotal] IDX_API_KEY not configured');
    return { properties: [], total: 0 };
  }

  try {
    const response = await client.searchListings(filters || { limit: 20 });

    if (!response.success) {
      console.error('[data.getAllPropertiesWithTotal] IDX API error:', response.error);
      return { properties: [], total: 0 };
    }

    const listings = response.listings;
    if (listings.length === 0) {
      return { properties: [], total: 0 };
    }

    // Fetch media for listings
    const listingKeys = listings.map(l => l.ListingKey);
    const mediaMap = await client.fetchMediaForListings(listingKeys);

    const listingsWithMedia = listings.map(listing => ({
      ...listing,
      Media: mediaMap.get(listing.ListingKey) || [],
    }));

    const properties = listingsWithMedia.map(convertIDXToProperty);
    console.log('[IDX] Loaded', properties.length, 'of', response.total, 'properties');

    return { properties, total: response.total };
  } catch (error) {
    console.error('[data.getAllPropertiesWithTotal] Failed:', error);
    return { properties: [], total: 0 };
  }
}
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/ui/src/properties/PropertiesPageClient.tsx
- **MODIFY**: Add pagination state and load more functionality
- **KEY CHANGES**:
  - Add props: `total: number`
  - Add state: `properties`, `offset`, `isLoadingMore`, `hasMore`
  - Add `handleLoadMore` async function
  - Pass loading state to PropertyGrid
- **CODE SNIPPET**:
```typescript
interface PropertiesPageClientProps {
  initialProperties: Property[]
  total: number
}

export function PropertiesPageClient({ initialProperties, total }: PropertiesPageClientProps) {
  const [properties, setProperties] = useState(initialProperties)
  const [offset, setOffset] = useState(initialProperties.length)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialProperties.length < total)

  // ... existing filter/sort state ...

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      const response = await fetch(
        `/api/properties?limit=20&offset=${offset}`
      )
      const data = await response.json()

      if (data.properties?.length) {
        setProperties(prev => [...prev, ...data.properties])
        setOffset(prev => prev + data.properties.length)
        setHasMore(offset + data.properties.length < total)
      }
    } catch (error) {
      console.error('[properties.loadMore.error]', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Apply filters/sort to all loaded properties
  const filteredProperties = filterProperties(properties, filters)
  const sortedProperties = sortProperties(filteredProperties, sortBy)

  return (
    // ... existing JSX ...
    <PropertyGrid
      properties={sortedProperties}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={handleLoadMore}
    />
  )
}
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/ui/src/properties/PropertyGrid.tsx
- **MODIFY**: Add "Show More" button with loading state
- **KEY CHANGES**:
  - Add props: `hasMore`, `isLoadingMore`, `onLoadMore`
  - Render button after grid
  - Show spinner in button while loading
- **CODE SNIPPET**:
```typescript
interface PropertyGridProps {
  properties: Property[]
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export function PropertyGrid({
  properties,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore
}: PropertyGridProps) {
  // ... existing grid code ...

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property, index) => (
          <PropertyCard key={property.id} property={property} index={index} />
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoadingMore ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Loading...
              </>
            ) : (
              'Show More Properties'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
```
- **VALIDATE**: `npm run type-check`

### CREATE apps/sri-collective/app/api/properties/route.ts
- **IMPLEMENT**: API endpoint for loading more properties
- **CODE**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { IDXClient } from '@repo/crm'
import { convertIDXToProperty } from '@repo/lib'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const city = searchParams.get('city') || undefined
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined

  try {
    const client = new IDXClient()

    if (!client.isConfigured) {
      return NextResponse.json(
        { success: false, error: 'IDX not configured', properties: [], total: 0 },
        { status: 500 }
      )
    }

    const response = await client.searchListings({
      limit,
      offset,
      city,
      minPrice,
      maxPrice,
      bedrooms,
    })

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error, properties: [], total: 0 },
        { status: 500 }
      )
    }

    // Fetch media for these listings
    const listingKeys = response.listings.map(l => l.ListingKey)
    const mediaMap = await client.fetchMediaForListings(listingKeys)

    const listingsWithMedia = response.listings.map(listing => ({
      ...listing,
      Media: mediaMap.get(listing.ListingKey) || [],
    }))

    const properties = listingsWithMedia.map(convertIDXToProperty)

    console.log('[api.properties] Returning', properties.length, 'properties, offset:', offset)

    return NextResponse.json({
      success: true,
      properties,
      total: response.total,
      offset: offset + properties.length,
    })
  } catch (error) {
    console.error('[api.properties.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties', properties: [], total: 0 },
      { status: 500 }
    )
  }
}
```
- **VALIDATE**: `npm run type-check`

---

## VALIDATION COMMANDS

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

### Level 3: Dev Server Testing

```bash
# Start Sri Collective dev server
npm run dev --filter=sri-collective
```

**Manual Verification at http://localhost:3001/properties**:
- [ ] Page loads with ~20 properties initially (not 50)
- [ ] "Showing X of Y properties" displays correctly
- [ ] "Show More Properties" button visible below grid
- [ ] Clicking button shows spinner, then loads more properties
- [ ] Properties append to grid (don't replace)
- [ ] Button disappears when all properties loaded
- [ ] Filters still work on all loaded properties
- [ ] Sort still works on all loaded properties
- [ ] No console errors

### Level 4: Performance Check

```bash
# Check dev server output for API timing
# Should see:
# [IDX] Loaded 20 of 82000+ properties
# [idx.client.fetchMedia] Requesting media for 20 listings
```

**Performance Goals**:
- Initial load: < 800ms (vs 1.5s+ with 50 properties)
- Load more: < 600ms per batch
- Media requests: 1 batch (20 listings) instead of 3 batches (50 listings)

---

## ACCEPTANCE CRITERIA

- [x] Initial load fetches 20 properties (not 50)
- [x] "Showing X of Y properties" shows actual totals
- [x] "Show More" button appears when more properties available
- [x] Clicking "Show More" loads next 20 properties
- [x] Spinner displays during load more operation
- [x] Properties append to existing grid (no flicker/replace)
- [x] Button hidden when all properties loaded
- [x] Filters apply to all loaded properties
- [x] Sort applies to all loaded properties
- [x] No hydration errors
- [x] No TypeScript errors
- [x] Build passes

---

## COMPLETION CHECKLIST

- [ ] Spinner component created and exported
- [ ] getAllPropertiesWithTotal function added
- [ ] Properties page fetches 20 initially
- [ ] PropertiesPageClient has pagination state
- [ ] PropertyGrid has "Show More" button
- [ ] API endpoint for loading more created
- [ ] All validation commands pass
- [ ] Manual testing confirms UX improvements

---

## NOTES

### Performance Impact

**Before (50 properties)**:
- 1 Property API call
- 3 Media API batches (20 + 20 + 10)
- ~1500 media items
- Load time: 1.5-2s+

**After (20 properties)**:
- 1 Property API call
- 1 Media API batch (20)
- ~600 media items
- Load time: < 800ms

### UX Considerations

**Why "Show More" vs Infinite Scroll?**
- User control over data loading
- Better for mobile data usage
- Clearer mental model of how much is loaded
- Easier to implement without intersection observer

**Why 20 properties?**
- 4 columns x 5 rows = nice grid fit on desktop
- Still substantial content on first load
- Reduces media fetch from 3 batches to 1 batch
- ~60% reduction in initial load time

### Future Enhancements

1. **Infinite scroll option** - Add intersection observer for auto-load
2. **Filter persistence in URL** - Share filtered views
3. **Skeleton loading** - Show card skeletons while loading more
4. **Cache loaded properties** - Avoid refetch on filter clear

---

## PRP CONFIDENCE SCORE: 9/10

**Strengths:**
- Pagination infrastructure already exists in IDX client
- Clear component boundaries
- Simple state management (useState)
- Reusable Spinner component
- Well-defined API endpoint

**Risks:**
- Filter state interaction with pagination (handled: filters apply to all loaded)
- Edge cases when API returns less than requested (handled: check total)

**Mitigations:**
- Incremental implementation phases
- Each phase independently testable
- Fallback: can revert to 50 if issues

<!-- EOF -->
