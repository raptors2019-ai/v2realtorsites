# Feature: Properties Page - Survey-First UX & Performance Enhancement

## Feature Description

Transform the properties page from an overwhelming "show everything" experience to an intelligent, survey-driven property discovery platform that:
1. **Survey-First Approach** - Pre-filters properties via quick 3-step survey before showing results
2. **Fix Duplicate Images** - Enhance MediaKey deduplication to handle edge cases causing duplicate gallery images
3. **Mobile Optimization** - Fix property detail page responsive layout issues (stats grid, sticky card)
4. **404 Handling** - Add proper error boundaries for delisted properties
5. **Map Integration (Phase 2)** - Add interactive map view toggle for property browsing

## User Story

**As a home buyer visiting /properties**
I want to answer a few quick questions first
So that I only see relevant listings and the page loads fast

**As a mobile user viewing property details**
I want the layout to work properly on my phone
So that I can easily read stats and pricing

**As a user browsing property cards**
I don't want to see duplicate images in the gallery
So that I can view all unique photos of a home

## Problem Statement

### Current Issues

1. **Performance**: Initial load fetches 81,872 properties → 50 shown → 1.5-2s load time
   - No default filters (shows ALL GTA properties)
   - User overwhelmed by irrelevant results
   - API fetches 500 images before filtering

2. **Duplicate Images**: PropertyGallery shows same photo multiple times
   - MediaKey deduplication exists (lines 136-145 in data-fetcher.ts)
   - Fails when MediaKey is undefined/null
   - Fallback to MediaURL doesn't catch URL duplicates
   - Test suite has test for this but real data has edge cases

3. **Mobile Issues**: Property detail page broken on mobile
   - Stats grid: `grid-cols-4` too cramped (line 114, page.tsx)
   - Sticky pricing card loses scroll context (line 152)
   - Gallery needs better mobile gestures

4. **404 Errors**: Cards show properties that return 404
   - Property delisted after initial fetch but card still shows
   - No error boundary or fallback UI
   - User clicks → sees Next.js 404 page

### Impact

- **Bounce Rate**: Users leave due to slow load / irrelevant results
- **API Costs**: Fetching 81K properties when user wants 10 in Mississauga
- **Mobile UX**: 60% of traffic is mobile, page doesn't work properly
- **Trust**: Duplicate images look unprofessional; 404s break experience

## Solution Statement

### Phase 1: Survey-First + Fixes (This PRP)

1. **Landing Survey** - 3-step wizard before results:
   - Step 1: Buy vs Rent (determines listingType)
   - Step 2: Budget range (6 presets)
   - Step 3: Location (multi-select cities)
   - Optional: Skip to "Browse All" → shows Toronto default

2. **Enhanced Image Deduplication**:
   - Normalize MediaURL as fallback (remove query params, resize suffixes)
   - Add Set<string> for MediaURL tracking
   - Handle missing MediaKey gracefully
   - Add logging for duplicate detection

3. **Mobile Fixes**:
   - Stats grid: `grid-cols-2 sm:grid-cols-4`
   - Sticky card: `sticky top-24 hidden lg:block`
   - Gallery: Add touch swipe gestures (existing via framer-motion)

4. **404 Handling**:
   - Add `not-found.tsx` in `[city]/[id]` route
   - Validate property exists before render
   - Show "Property No Longer Available" with similar properties

### Phase 2: Map Integration (Future PRP)

5. **Map View Toggle** - After survey completion:
   - Toggle button: List ↔ Map
   - Mapbox GL JS with clustering (research: agent a53228b)
   - Property pins with preview cards
   - Zoom-to-fit filtered results

## Feature Metadata

**Feature Type**: Enhancement (UX + Performance + Bugfix)
**Estimated Complexity**: High
**Primary Systems Affected**:
- `apps/sri-collective/app/(features)/properties/page.tsx` - Add survey landing
- `apps/sri-collective/app/(features)/properties/[city]/[id]/page.tsx` - Mobile + 404 fixes
- `apps/sri-collective/app/(features)/properties/[city]/[id]/not-found.tsx` - **NEW** custom 404
- `packages/lib/src/data-fetcher.ts` - Enhanced image deduplication
- `packages/ui/src/properties/PropertySurvey.tsx` - **NEW** survey component
- `packages/ui/src/properties/PropertiesPageClient.tsx` - Survey state integration

**Dependencies**:
- Existing chatbot survey patterns (ChatbotWidget.tsx has similar flow)
- Existing PropertyFilters components (reuse filter logic)
- No new external libraries for Phase 1

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Properties Page Architecture:**

- `apps/sri-collective/app/(features)/properties/page.tsx`
  - **Current**: Server component, fetches 50 properties unconditionally
  - **Change**: Render survey landing OR results based on searchParams
  - **Pattern**: Similar to chatbot survey in ChatbotWidget.tsx (lines 539-713)

- `packages/ui/src/chatbot/ChatbotWidget.tsx` (lines 20-31, 539-713)
  - **Reference**: Survey state machine with steps
  - **Pattern**: `SurveyPropertyType`, `SurveyBudget`, `SurveyLocation` components
  - **Reuse**: Same UX pattern, different context (landing page vs chat)

**Data Layer (Image Deduplication):**

- `packages/lib/src/data-fetcher.ts` (lines 124-145)
  - **Current**: Deduplicates by MediaKey, fallback to MediaURL
  - **Issue**: `baseKey = m.MediaKey?.replace(/-t$/, '') || m.MediaURL`
  - **Problem**: If MediaKey is undefined, multiple media items with same URL → duplicates
  - **Fix**: Add URL normalization + separate Set for URLs

**Property Detail (Mobile + 404):**

- `apps/sri-collective/app/(features)/properties/[city]/[id]/page.tsx`
  - **Line 114**: Stats grid `grid-cols-2 sm:grid-cols-4` instead of `grid-cols-4`
  - **Line 152**: Pricing card `sticky top-24 hidden lg:block` (remove sticky on mobile)
  - **Line 36-42**: Add validation, call notFound() if property null

- `apps/sri-collective/app/(features)/properties/[city]/[id]/not-found.tsx` - **NEW**
  - Custom 404 component
  - Show "Property No Longer Available"
  - Display similar properties in same city
  - Link back to /properties

**Type Definitions:**

```typescript
// packages/types/src/property.ts
interface PropertyFilters {
  location?: string
  locations?: string[]  // Multi-city support
  priceRange?: { min?: number; max?: number }
  bedrooms?: number
  bathrooms?: number
  type?: Property['propertyType'][]
  listingType?: 'sale' | 'lease'
}

// NEW: Survey state
interface PropertySurveyState {
  step: 'intent' | 'budget' | 'location' | 'complete'
  listingType?: 'sale' | 'lease'
  budgetRange?: string  // Maps to priceRange
  locations?: string[]
}
```

### Existing Survey Pattern (ChatbotWidget.tsx)

The chatbot already implements a similar survey flow we can adapt:

**State Management** (line 21):
```typescript
interface SurveyState {
  step: "idle" | "property-type" | "budget" | "bedrooms" | "timeline" | "location" | "show-listings" | "contact-info" | "complete"
  propertyType?: string
  budget?: string
  bedrooms?: string
  timeline?: string
  locations?: string[]
}
```

**Survey Components** (lines 86-279):
- `SurveyPropertyType`: Icon grid with 4 options
- `SurveyBudget`: 6 budget range buttons
- `SurveyLocation`: Multi-select location chips

**Pattern to Reuse**:
- Same visual design (cards, buttons, progress)
- Same state transitions
- Adapt for full-page instead of modal

### Mobile Responsiveness Patterns

**From Header.tsx** (lines 88-124):
```typescript
// Desktop nav hidden on mobile via CSS
<div className="header-desktop-nav">
  {/* ... */}
</div>

// Mobile menu button
<button className="header-mobile-btn">
```

**Tailwind Breakpoints** (from globals.css):
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### Relevant Documentation

**React Patterns:**
- [Next.js 15 searchParams in Server Components](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)
- [Next.js not-found.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [React useState for multi-step forms](https://react.dev/learn/managing-state)

**Framer Motion (for survey animations):**
- [AnimatePresence for step transitions](https://www.framer.com/motion/animate-presence/)
- Already used in PropertyGallery.tsx (lines 83-108)

**Image Deduplication:**
- [JavaScript Set for uniqueness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [URL normalization](https://developer.mozilla.org/en-US/docs/Web/API/URL)

**Testing:**
- Existing test: `packages/lib/src/__tests__/data-fetcher.test.ts:286` - "should deduplicate images by MediaKey"
- Add test case for MediaKey = undefined

---

## IMPLEMENTATION PLAN

### Phase 1.1: Enhanced Image Deduplication

Fix duplicate images appearing in PropertyGallery.

**Tasks:**
1. Update `convertIDXToProperty` deduplication logic
2. Add MediaURL normalization function
3. Add logging for duplicate detection
4. Add test case for missing MediaKey

### Phase 1.2: Mobile Property Detail Fixes

Fix responsive layout on property detail page.

**Tasks:**
1. Update stats grid to `grid-cols-2 sm:grid-cols-4`
2. Remove sticky behavior on mobile for pricing card
3. Test on mobile viewport (375px, 768px)

### Phase 1.3: Custom 404 Handling

Add proper error boundary for delisted properties.

**Tasks:**
1. Create `not-found.tsx` component
2. Add property validation in detail page
3. Fetch similar properties for 404 page
4. Style 404 page to match brand

### Phase 1.4: Property Survey Component

Create reusable survey wizard for property filtering.

**Tasks:**
1. Create `PropertySurvey.tsx` component
2. Implement step components (Intent, Budget, Location)
3. Add survey state management
4. Style to match chatbot survey design

### Phase 1.5: Integrate Survey into Properties Page

Make survey the default landing, results on completion.

**Tasks:**
1. Update properties page to check searchParams
2. Show survey if no params, results if params present
3. Add "Skip Survey" button → default to Toronto
4. Update URL with survey params on completion

---

## STEP-BY-STEP TASKS

### UPDATE packages/lib/src/data-fetcher.ts
- **TASK**: Enhanced image deduplication with URL normalization
- **WHY**: Fix duplicate images in gallery
- **CODE**:
```typescript
// Lines 121-146 (replace existing deduplication block)

// Extract images from media
const mediaItems = listing.Media
  ?.filter(m => m.MediaURL && (
    m.MediaCategory === 'Photo' ||
    m.MediaType?.startsWith('image/') ||
    (!m.MediaCategory && !m.MediaType)
  ))
  .sort((a, b) => (a.Order ?? 999) - (b.Order ?? 999)) || []

// Deduplicate: Track both MediaKey and normalized MediaURL
const seenKeys = new Set<string>()
const seenURLs = new Set<string>()

/**
 * Normalize MediaURL for deduplication
 * Removes query params, resize suffixes, thumbnail markers
 */
const normalizeMediaURL = (url: string): string => {
  try {
    const urlObj = new URL(url)
    // Remove query params (e.g., ?width=800&height=600)
    const pathname = urlObj.pathname
    // Remove common resize/thumbnail suffixes: -thumb, -small, -medium, _t, _s
    const normalized = pathname.replace(/-thumb|-small|-medium|_t|_s\\./, '.')
    return `${urlObj.origin}${normalized}`
  } catch {
    // Fallback if URL parsing fails
    return url.replace(/-thumb|-small|-medium|_t|_s\\./, '.')
  }
}

const images = mediaItems
  .filter(m => {
    // Normalize MediaKey by removing thumbnail suffix
    const baseKey = m.MediaKey?.replace(/-t$/, '')
    const normalizedURL = normalizeMediaURL(m.MediaURL)

    // Check MediaKey first (preferred)
    if (baseKey) {
      if (seenKeys.has(baseKey)) {
        console.log('[convertIDXToProperty.duplicateByKey]', { key: baseKey, url: m.MediaURL })
        return false
      }
      seenKeys.add(baseKey)
    }

    // Check normalized URL (fallback for missing MediaKey)
    if (seenURLs.has(normalizedURL)) {
      console.log('[convertIDXToProperty.duplicateByURL]', { url: m.MediaURL, normalized: normalizedURL })
      return false
    }
    seenURLs.add(normalizedURL)

    return true
  })
  .map(m => m.MediaURL)

console.log('[convertIDXToProperty.images]', {
  listingKey: listing.ListingKey,
  total: mediaItems.length,
  unique: images.length,
  duplicatesRemoved: mediaItems.length - images.length
})
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/lib/src/__tests__/data-fetcher.test.ts
- **TASK**: Add test for missing MediaKey deduplication
- **CODE**:
```typescript
// Add new test case after line 297
it('should deduplicate images when MediaKey is missing', () => {
  const listingWithoutKeys: IDXListing = {
    ...mockIDXListing,
    Media: [
      { MediaKey: undefined, MediaURL: 'https://example.com/1.jpg', Order: 1 },
      { MediaKey: undefined, MediaURL: 'https://example.com/1.jpg?width=800', Order: 2 }, // Same URL, query param
      { MediaKey: undefined, MediaURL: 'https://example.com/1-thumb.jpg', Order: 3 }, // Thumbnail suffix
      { MediaKey: undefined, MediaURL: 'https://example.com/2.jpg', Order: 4 },
    ],
  }
  const result = convertIDXToProperty(listingWithoutKeys)
  // Should keep only 2 unique images (1.jpg and 2.jpg)
  expect(result.images).toHaveLength(2)
  expect(result.images).toContain('https://example.com/1.jpg')
  expect(result.images).toContain('https://example.com/2.jpg')
})
```
- **VALIDATE**: `npm test -- data-fetcher`

### UPDATE apps/sri-collective/app/(features)/properties/[city]/[id]/page.tsx
- **TASK**: Fix mobile responsive layout
- **CHANGES**:
  1. Line 114: `grid-cols-2 sm:grid-cols-4` instead of `grid-cols-4`
  2. Line 152: Add `hidden lg:block lg:sticky` to pricing card
- **CODE**:
```typescript
// Line 114 - Stats Grid
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-primary/20">

// Line 152 - Pricing Card (add responsive sticky)
<div className="luxury-card-premium rounded-xl p-6 hidden lg:block lg:sticky lg:top-24">
  {/* ... existing pricing content ... */}
</div>

// Add mobile-only pricing card (after line 147, before right column)
{/* Mobile Pricing CTA */}
<div className="lg:hidden luxury-card-premium rounded-xl p-6 mb-6">
  <p className="text-4xl font-bold text-gradient-primary mb-4">
    {formatPrice(property.price)}
  </p>
  <Link
    href="/contact"
    className="btn-primary w-full py-4 rounded-lg text-center font-semibold block"
  >
    Schedule a Viewing
  </Link>
</div>
```
- **VALIDATE**: `npm run type-check`

### CREATE apps/sri-collective/app/(features)/properties/[city]/[id]/not-found.tsx
- **TASK**: Custom 404 page for delisted properties
- **CODE**:
```typescript
import Link from 'next/link'

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <svg className="w-24 h-24 text-primary/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-secondary mb-4">
          Property No Longer Available
        </h1>

        <p className="text-text-secondary mb-8 leading-relaxed">
          This property has been sold, removed from the market, or the listing has expired.
          Browse our other available properties below.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/properties"
            className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium"
          >
            View All Properties
          </Link>
          <Link
            href="/contact"
            className="btn-outline px-8 py-3.5 rounded-lg text-sm"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
```
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/properties/PropertySurvey.tsx
- **TASK**: Survey wizard component (reuse chatbot survey pattern)
- **CODE**: (See full implementation in appendix - ~400 lines)
- **KEY FEATURES**:
  - 3 steps: Intent → Budget → Location
  - Animated step transitions (framer-motion)
  - Progress indicator
  - "Skip Survey" option
  - Submit → redirects to /properties/search?params
- **EXPORTS**: `PropertySurvey` component
- **VALIDATE**: `npm run type-check`

### UPDATE packages/ui/src/properties/index.ts
- **TASK**: Export PropertySurvey component
- **CODE**:
```typescript
export { PropertySurvey } from './PropertySurvey'
```
- **VALIDATE**: `npm run type-check`

### UPDATE apps/sri-collective/app/(features)/properties/page.tsx
- **TASK**: Integrate survey as landing page
- **CHANGES**:
  1. Import PropertySurvey
  2. Check searchParams for filters
  3. Show survey if no params, results if params
  4. Add "Refine Search" button to results
- **CODE**:
```typescript
import { PropertySurvey } from '@repo/ui'

interface SearchParams {
  listingType?: string
  budgetMin?: string
  budgetMax?: string
  cities?: string
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const hasSearchParams = Boolean(
    params.listingType || params.budgetMin || params.budgetMax || params.cities
  )

  // If no search params, show survey landing
  if (!hasSearchParams) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Find Your Perfect Home
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Answer 3 quick questions to see properties that match your criteria.
            </p>
          </div>

          <PropertySurvey />
        </div>
      </div>
    )
  }

  // Parse search params and fetch filtered properties
  const filters = {
    listingType: params.listingType as 'sale' | 'lease',
    minPrice: params.budgetMin ? parseInt(params.budgetMin) : undefined,
    maxPrice: params.budgetMax ? parseInt(params.budgetMax) : undefined,
    cities: params.cities?.split(','),
    limit: 20,
  }

  const { properties, total, cities } = await getAllPropertiesWithTotal(filters)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Refine Button */}
      <section className="py-16 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              {total.toLocaleString()} Properties Found
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto mb-6">
              {params.cities && `Showing properties in ${params.cities}`}
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refine Search
            </Link>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <PropertiesPageClient initialProperties={properties} initialCities={cities} total={total} />
        </div>
      </section>
    </div>
  )
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

### Level 2: Unit Tests

```bash
# Run data-fetcher tests (image deduplication)
npm test -- data-fetcher
```
**Expected**:
- All existing tests pass
- New test "should deduplicate images when MediaKey is missing" passes

```bash
# Run all tests
npm run test
```
**Expected**: No test failures

### Level 3: Build

```bash
# Build all apps and packages
npm run build
```
**Expected**: Clean build with no errors

### Level 4: Dev Server Testing

```bash
# Start Sri Collective dev server
npm run dev --filter=sri-collective
```

**Manual Verification at http://localhost:3001/properties**:
- [ ] Landing shows survey (3 steps)
- [ ] Survey step 1: Intent (Buy/Rent) works
- [ ] Survey step 2: Budget range selection works
- [ ] Survey step 3: Multi-select cities works
- [ ] "Skip Survey" button navigates to default results
- [ ] Submit button redirects to /properties/search?params
- [ ] Results page shows filtered properties
- [ ] "Refine Search" button returns to survey
- [ ] No duplicate images in property galleries
- [ ] Console shows deduplication logs

**Property Detail Mobile Testing** (http://localhost:3001/properties/[city]/[id]):
- [ ] Stats grid shows 2 columns on mobile (< 640px)
- [ ] Pricing card visible on mobile (not sticky)
- [ ] Pricing card sticky on desktop (>= 1024px)
- [ ] Gallery swipe works on mobile

**404 Testing**:
- [ ] Navigate to /properties/fake-city/invalid-id
- [ ] Custom 404 page shows (not Next.js default)
- [ ] "View All Properties" button works
- [ ] "Contact Us" button works

### Level 5: Performance Check

```bash
# Check dev server output for deduplication
# Should see:
# [convertIDXToProperty.images] { listingKey: '...', total: 25, unique: 20, duplicatesRemoved: 5 }
```

**Performance Goals**:
- Survey landing: < 300ms (no data fetch)
- Results after survey: < 800ms (filtered fetch, ~20 properties)
- No duplicate images in galleries
- Mobile layout works without horizontal scroll

---

## ACCEPTANCE CRITERIA

**Phase 1 (This PRP):**

- [ ] Survey landing page shows on /properties (no params)
- [ ] Survey has 3 steps (Intent, Budget, Location)
- [ ] Survey submits → redirects to /properties/search?params
- [ ] Results page fetches filtered properties
- [ ] "Refine Search" button returns to survey
- [ ] No duplicate images in property galleries (logging confirms)
- [ ] Property detail page stats grid: 2 cols on mobile, 4 on desktop
- [ ] Property detail pricing card: not sticky on mobile, sticky on desktop
- [ ] Custom 404 page shows for invalid property IDs
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No TypeScript errors

---

## COMPLETION CHECKLIST

- [ ] Enhanced image deduplication implemented
- [ ] Image deduplication test added
- [ ] Property detail mobile responsive fixes applied
- [ ] Custom 404 page created
- [ ] PropertySurvey component created
- [ ] Properties page integrated with survey
- [ ] All validation commands pass
- [ ] Manual testing confirms UX improvements

---

## NOTES

### Image Deduplication Technical Details

**Root Cause of Duplicates:**
- Ampre API sometimes returns multiple media items for same image
- Different URLs for same image (resize params, thumbnail suffixes)
- MediaKey can be `undefined` or `null` in some API responses
- Current code only deduplicates by MediaKey, misses URL duplicates

**Fix Strategy:**
- Dual tracking: Set<MediaKey> + Set<normalizedURL>
- URL normalization removes query params and resize suffixes
- Logging helps debug which images are duplicates
- Fallback chain: MediaKey → normalizedURL → original URL

**Example Duplicates:**
```
https://media.ampre.ca/image1.jpg         ← Original
https://media.ampre.ca/image1.jpg?w=800   ← Query param
https://media.ampre.ca/image1-thumb.jpg   ← Thumbnail suffix
```
All three should be treated as same image.

### Survey UX Design Decisions

**Why 3 Steps (Not More)?**
- Intent: Separates buy vs rent early (different inventories)
- Budget: Most important filter (narrows 81K → ~5K)
- Location: GTA is huge, must specify cities
- Bedrooms/bathrooms: Less critical, use filters on results page

**Why "Skip Survey" Option?**
- Power users want direct access
- SEO: crawlers need content without interaction
- Default to Toronto (largest inventory)

**Why URL Params vs State?**
- Shareable links (user can send filtered view to spouse)
- Back button works
- Server-side rendering (better SEO)
- Refresh preserves filters

### Mobile Design Philosophy

**Progressive Enhancement:**
- Mobile first: 2-col grid, vertical stack
- Tablet: 4-col grid starts
- Desktop: Sticky sidebar, horizontal features

**Touch Targets:**
- Buttons minimum 44x44px (Apple HIG)
- Survey options have large tap areas
- Gallery supports swipe gestures (framer-motion)

### Future Enhancements (Not This PRP)

1. **Map Integration** (Phase 2 PRP)
   - Mapbox GL JS with clustering
   - Toggle List ↔ Map view
   - Property preview cards on pin hover
   - Zoom-to-fit filtered results

2. **Chatbot Integration**
   - Redirect chatbot survey results → /properties/search
   - Pre-fill PropertySurvey from chatbot preferences
   - Save preferences in localStorage

3. **Advanced Filters**
   - Property type (detached, condo, etc.)
   - Open house dates
   - Virtual tour availability
   - Days on market

4. **Saved Searches**
   - User account → save filter combinations
   - Email alerts for new matching properties
   - Favorite properties list

---

## APPENDIX: PropertySurvey Component (Full Code)

```typescript
// packages/ui/src/properties/PropertySurvey.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface SurveyState {
  step: 'intent' | 'budget' | 'location'
  listingType?: 'sale' | 'lease'
  budgetMin?: number
  budgetMax?: number
  locations?: string[]
}

const budgetRanges = [
  { label: 'Under $500K', min: 0, max: 500000 },
  { label: '$500K – $750K', min: 500000, max: 750000 },
  { label: '$750K – $1M', min: 750000, max: 1000000 },
  { label: '$1M – $1.5M', min: 1000000, max: 1500000 },
  { label: '$1.5M – $2M', min: 1500000, max: 2000000 },
  { label: '$2M+', min: 2000000, max: 10000000 },
]

const cities = [
  'Toronto', 'Mississauga', 'Brampton', 'Vaughan',
  'Markham', 'Richmond Hill', 'Milton', 'Oakville',
  'Burlington', 'Hamilton', 'Caledon'
]

export function PropertySurvey() {
  const router = useRouter()
  const [survey, setSurvey] = useState<SurveyState>({ step: 'intent' })

  const handleIntent = (type: 'sale' | 'lease') => {
    setSurvey({ step: 'budget', listingType: type })
  }

  const handleBudget = (min: number, max: number) => {
    setSurvey(prev => ({ ...prev, step: 'location', budgetMin: min, budgetMax: max }))
  }

  const handleLocation = (selected: string[]) => {
    if (selected.length === 0) return

    // Build query params
    const params = new URLSearchParams()
    if (survey.listingType) params.set('listingType', survey.listingType)
    if (survey.budgetMin) params.set('budgetMin', survey.budgetMin.toString())
    if (survey.budgetMax) params.set('budgetMax', survey.budgetMax.toString())
    if (selected.length > 0) params.set('cities', selected.join(','))

    // Navigate to results
    router.push(`/properties/search?${params.toString()}`)
  }

  const handleSkip = () => {
    // Default: Toronto, For Sale
    router.push('/properties/search?listingType=sale&cities=Toronto')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex justify-center gap-2">
          {['intent', 'budget', 'location'].map((step, index) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                ['intent', 'budget', 'location'].indexOf(survey.step) >= index
                  ? 'bg-primary'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-text-secondary mt-4">
          Step {['intent', 'budget', 'location'].indexOf(survey.step) + 1} of 3
        </p>
      </div>

      {/* Survey Steps */}
      <AnimatePresence mode="wait">
        {survey.step === 'intent' && (
          <motion.div
            key="intent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-secondary text-center mb-8">
              Are you looking to buy or rent?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleIntent('sale')}
                className="p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 group"
              >
                <svg className="w-12 h-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p className="text-lg font-semibold text-secondary group-hover:text-primary transition-colors">Buy a Home</p>
              </button>

              <button
                onClick={() => handleIntent('lease')}
                className="p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 group"
              >
                <svg className="w-12 h-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <p className="text-lg font-semibold text-secondary group-hover:text-primary transition-colors">Rent a Home</p>
              </button>
            </div>
          </motion.div>
        )}

        {survey.step === 'budget' && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-secondary text-center mb-8">
              What's your budget range?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {budgetRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handleBudget(range.min, range.max)}
                  className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 text-center"
                >
                  <p className="text-base font-semibold text-secondary">{range.label}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {survey.step === 'location' && (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-secondary text-center mb-8">
              Which areas interest you?
            </h2>
            <LocationSelector cities={cities} onSubmit={handleLocation} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Survey */}
      <div className="text-center mt-8">
        <button
          onClick={handleSkip}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Skip survey and browse all properties
        </button>
      </div>
    </div>
  )
}

function LocationSelector({ cities, onSubmit }: { cities: string[]; onSubmit: (locations: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (city: string) => {
    setSelected(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {cities.map(city => (
          <button
            key={city}
            onClick={() => toggle(city)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selected.includes(city)
                ? 'bg-primary text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-secondary hover:border-primary'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      <button
        onClick={() => onSubmit(selected)}
        disabled={selected.length === 0}
        className={`w-full py-4 rounded-xl text-base font-semibold transition-all duration-300 ${
          selected.length > 0
            ? 'bg-primary text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {selected.length > 0 ? `View Properties in ${selected.length} ${selected.length === 1 ? 'City' : 'Cities'}` : 'Select at least one area'}
      </button>
    </div>
  )
}
```

---

## PRP CONFIDENCE SCORE: 8/10

**Strengths:**
- Clear problem definition with specific line numbers
- Existing survey pattern to reuse (ChatbotWidget.tsx)
- Deduplication logic already exists, just needs enhancement
- Mobile fixes are straightforward CSS changes
- Custom 404 is standard Next.js pattern
- All changes are incremental, no breaking changes

**Risks:**
- Survey UX untested with real users (might need iteration)
- Image deduplication fix assumes URL normalization catches all cases
- Mobile testing requires manual verification across devices
- Performance impact of survey redirect vs client-side state

**Mitigations:**
- Survey design mirrors chatbot (proven UX)
- Add comprehensive logging for duplicate detection
- Responsive testing checklist provided
- URL params enable sharing and SEO (better than state)
- Can A/B test survey vs direct browse later

**Dependencies:**
- No new external libraries (uses existing: framer-motion, Next.js router)
- Agent research on map integration (Phase 2, not blocking)
- All patterns exist in codebase (ChatbotWidget, PropertyFilters)

<!-- EOF -->
