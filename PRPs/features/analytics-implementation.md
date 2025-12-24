# Feature: Analytics Implementation - GA4 Event Tracking & Reporting

## Feature Description

Wire up Google Analytics 4 (GA4) tracking across both real estate sites (Sri Collective and NewHomeShow) to:

1. **Automatic Page View Tracking** - Track client-side navigation in Next.js App Router
2. **Consent Mode v2 Compliance** - Update to latest Google requirements (mandatory since March 2024)
3. **Property Event Tracking** - view_item, view_item_list, select_item for property pages
4. **Lead Generation Tracking** - Form submissions, chatbot interactions, phone/email clicks
5. **Enhanced Real Estate Events** - Filter usage, mortgage calculator, virtual tours

The goal is to provide actionable analytics for monthly client reports and site optimization insights.

## User Story

As a site owner (Sri/Niru):
- I want to see **monthly visitor reports** to justify maintenance fees
- I want to know **which properties get the most views** to guide marketing
- I want to track **lead generation sources** to optimize conversion

As a developer:
- I want **type-safe tracking functions** that follow existing patterns
- I want **automatic page view tracking** without manual calls on every page
- I want **testable analytics code** with proper mocking patterns

## Problem Statement

Current state of `/Users/josh/code/realtor/structure_site/packages/analytics/`:

1. **Functions exist but not wired up** - `trackPropertyView()`, `trackLeadFormSubmit()`, `trackChatbotInteraction()` are defined but never called
2. **Consent Mode v1 only** - Missing `ad_user_data` and `ad_personalization` flags (v2 requirement)
3. **No automatic page view tracking** - Client-side navigation not tracked
4. **No view_item_list event** - Property listing pages don't track impressions
5. **Limited PropertyItem type** - Missing real estate-specific parameters

## Solution Statement

1. **Add PageViewTracker component** with Suspense boundary for App Router
2. **Update Consent Mode to v2** in layouts and CookieConsent component
3. **Enhance real-estate-events.ts** with full property tracking
4. **Wire up tracking calls** in property pages, chatbot, and CTAs
5. **Add comprehensive tests** for analytics functions

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**:
- `packages/analytics/src/` (enhance existing)
- `packages/ui/src/chatbot/ChatbotWidget.tsx` (add tracking)
- `apps/sri-collective/app/(features)/properties/` (add tracking)
- `apps/*/app/layout.tsx` (update consent, add PageViewTracker)

**Dependencies**: None (uses existing GTM/GA4 setup)

---

## CONTEXT REFERENCES

### Existing Analytics Implementation

**Package Structure:**
```
packages/analytics/
├── src/
│   ├── index.ts                    # Exports
│   ├── ga4.ts                      # Core pageview/event functions
│   ├── real-estate-events.ts       # Property-specific events
│   └── components/
│       └── CookieConsent.tsx       # Consent UI
├── package.json
└── tsconfig.json
```

**Current ga4.ts:**
```typescript
'use client'

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID as string, {
      page_path: url,
    })
  }
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}
```

**Current real-estate-events.ts:**
```typescript
'use client'

declare global {
  interface Window {
    gtag: Function
  }
}

export const trackPropertyView = (property: {
  id: string
  price: number
  address: string
  type: string
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'CAD',
      value: property.price,
      items: [{
        item_id: property.id,
        item_name: property.address,
        item_category: property.type,
        price: property.price
      }]
    })
  }
}

export const trackLeadFormSubmit = (formType: 'contact' | 'vip' | 'valuation') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      currency: 'CAD',
      value: 0,
      form_type: formType
    })
  }
}

export const trackChatbotInteraction = (action: 'start' | 'message' | 'lead') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'chatbot_interaction', {
      interaction_type: action
    })
  }
}
```

**Current Layout Consent Mode (v1 - needs update):**
```typescript
// apps/sri-collective/app/layout.tsx
<Script id="consent-mode" strategy="beforeInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'wait_for_update': 500
    });
  `}
</Script>
```

### Files Requiring Tracking Integration

**HIGH PRIORITY:**

| File | Events to Add |
|------|---------------|
| `apps/sri-collective/app/(features)/properties/[city]/[id]/page.tsx` | `view_item` on mount |
| `packages/ui/src/properties/PropertiesPageClient.tsx` | `view_item_list`, filter tracking |
| `packages/ui/src/chatbot/ChatbotWidget.tsx` | `chatbot_interaction` (start/message/lead) |
| `packages/ui/src/properties/PropertyCard.tsx` | `select_item` on click |

**MEDIUM PRIORITY:**

| File | Events to Add |
|------|---------------|
| `packages/ui/src/components/layout/Footer.tsx` | `phone_click`, `email_click` |
| `apps/sri-collective/app/page.tsx` | CTA button clicks |
| `apps/newhomeshow/app/page.tsx` | CTA button clicks |

### Environment Variables (Already Set)

```bash
# Sri Collective
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# NewHomeShow
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## EXTERNAL RESEARCH FINDINGS

### Consent Mode v2 Requirements (Mandatory March 2024)

**Must add these flags:**
```typescript
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',        // NEW - Required for v2
  'ad_personalization': 'denied',   // NEW - Required for v2
  'functionality_storage': 'granted',
  'personalization_storage': 'granted',
  'security_storage': 'granted',
  'wait_for_update': 500
});
```

**CookieConsent must update all four flags:**
```typescript
const updateConsent = (granted: boolean) => {
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
  })
}
```

**Documentation:**
- https://www.simoahava.com/analytics/consent-mode-v2-google-tags/
- https://www.napkyn.com/blog/how-to-enable-implement-consent-mode-in-ga4-2024-update

### Page View Tracking in App Router

**Problem:** Next.js App Router client-side navigation doesn't trigger GTM's automatic pageview.

**Solution:** Create PageViewTracker component:

```typescript
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [pathname, searchParams])

  return null
}
```

**CRITICAL:** Must wrap in Suspense boundary:
```typescript
<Suspense fallback={null}>
  <PageViewTracker />
</Suspense>
```

**Documentation:**
- https://javascript.plainenglish.io/google-analytics-event-tracking-in-next-js-15-app-router-in-2024-0493b521c000

### GA4 Ecommerce Events for Real Estate

**view_item_list** (Property Listings):
```typescript
gtag('event', 'view_item_list', {
  item_list_id: 'search_results',
  item_list_name: 'Toronto Condos',
  items: properties.slice(0, 200).map((p, i) => ({
    item_id: p.mlsNumber,
    item_name: p.address,
    item_category: p.propertyType,
    item_category2: p.listingType,  // For Sale / For Lease
    item_category3: p.city,
    price: p.price,
    index: i
  }))
})
```

**view_item** (Property Detail):
```typescript
gtag('event', 'view_item', {
  currency: 'CAD',
  value: property.price,
  items: [{
    item_id: property.mlsNumber,
    item_name: property.address,
    item_category: property.propertyType,
    item_category2: property.listingType,
    item_category3: property.city,
    price: property.price,
    // Custom params (configure as dimensions in GA4)
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    square_feet: property.squareFeet
  }]
})
```

**select_item** (Click on Property Card):
```typescript
gtag('event', 'select_item', {
  item_list_id: 'search_results',
  items: [{
    item_id: property.mlsNumber,
    item_name: property.address,
    price: property.price,
    index: position
  }]
})
```

**Documentation:**
- https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- https://contempothemes.com/ga4-setup-for-real-estate-websites-step-by-step-guide/

### Event Naming Rules

| Rule | Example |
|------|---------|
| Start with letter | `property_view` OK, `1_click` BAD |
| Snake_case lowercase | `generate_lead` OK, `generateLead` BAD |
| Max 40 characters | Keep names short |
| No reserved prefixes | Avoid `ga_`, `firebase_`, `google_` |
| Alphanumeric + underscore only | No hyphens or spaces |

**Documentation:**
- https://knowandconnect.com/ga4-event-naming-rules/

---

## IMPLEMENTATION BLUEPRINT

### Phase 1: Update Consent Mode to v2

**File:** `apps/sri-collective/app/layout.tsx` and `apps/newhomeshow/app/layout.tsx`

```typescript
// Update the consent-mode script
<Script id="consent-mode" strategy="beforeInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'functionality_storage': 'granted',
      'personalization_storage': 'granted',
      'security_storage': 'granted',
      'wait_for_update': 500
    });
  `}
</Script>
```

**File:** `packages/analytics/src/components/CookieConsent.tsx`

Update `updateConsent` function to include v2 flags.

### Phase 2: Add PageViewTracker Component

**New File:** `packages/analytics/src/components/PageViewTracker.tsx`

```typescript
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [pathname, searchParams])

  return null
}
```

**Update:** `packages/analytics/src/index.ts` to export PageViewTracker

**Update:** Both app layouts to include:
```typescript
import { Suspense } from 'react'
import { PageViewTracker } from '@repo/analytics'

// In body:
<Suspense fallback={null}>
  <PageViewTracker />
</Suspense>
```

### Phase 3: Enhance Analytics Types & Functions

**New File:** `packages/analytics/src/types.ts`

```typescript
export interface PropertyItem {
  item_id: string
  item_name: string
  item_category?: string      // Property type
  item_category2?: string     // For Sale / For Lease
  item_category3?: string     // City
  item_brand?: string         // Builder (for new construction)
  price: number
  index?: number
  // Custom parameters
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  listing_status?: 'active' | 'pending' | 'sold'
}

export interface PropertyListInfo {
  list_id: string
  list_name: string
}

export type FormType = 'contact' | 'vip' | 'valuation' | 'showing_request' | 'chatbot'
```

**Update:** `packages/analytics/src/real-estate-events.ts`

Add new functions:
- `trackPropertyListView(properties: PropertyItem[], listInfo: PropertyListInfo)`
- `trackPropertySelect(property: PropertyItem, listInfo: PropertyListInfo)`
- `trackPropertySearch(filters: object)`
- `trackPhoneClick(phoneNumber: string)`
- `trackEmailClick(email: string)`
- `trackCtaClick(ctaName: string, location: string)`

### Phase 4: Wire Up Property Pages

**File:** `apps/sri-collective/app/(features)/properties/[city]/[id]/page.tsx`

Add client component wrapper or useEffect to call `trackPropertyView()` on mount.

**File:** `packages/ui/src/properties/PropertiesPageClient.tsx`

Add `trackPropertyListView()` call when properties load/change.

**File:** `packages/ui/src/properties/PropertyCard.tsx`

Add `onClick` handler to track `select_item` event.

### Phase 5: Wire Up Chatbot

**File:** `packages/ui/src/chatbot/ChatbotWidget.tsx`

Add tracking calls:
- `toggleOpen()` → `trackChatbotInteraction('start')`
- `sendMessage()` → `trackChatbotInteraction('message')`
- `handleContactSubmit()` → `trackLeadFormSubmit('chatbot')`

### Phase 6: Add Tests

**New File:** `packages/analytics/src/__tests__/real-estate-events.test.ts`

Test all tracking functions with mocked `window.gtag`.

---

## IMPLEMENTATION TASKS

```
[CONSENT] Update Consent Mode to v2 in both app layouts - add ad_user_data, ad_personalization flags
[CONSENT] Update CookieConsent component updateConsent function with v2 flags
[PAGEVIEW] Create PageViewTracker component with usePathname, useSearchParams, Suspense
[PAGEVIEW] Export PageViewTracker from packages/analytics/src/index.ts
[PAGEVIEW] Add PageViewTracker to sri-collective layout.tsx with Suspense boundary
[PAGEVIEW] Add PageViewTracker to newhomeshow layout.tsx with Suspense boundary
[TYPES] Create packages/analytics/src/types.ts with PropertyItem, PropertyListInfo, FormType
[EVENTS] Add trackPropertyListView function to real-estate-events.ts
[EVENTS] Add trackPropertySelect function to real-estate-events.ts
[EVENTS] Add trackPropertySearch function to real-estate-events.ts
[EVENTS] Add trackPhoneClick and trackEmailClick functions
[EVENTS] Add trackCtaClick function for CTA button tracking
[EVENTS] Update index.ts exports with new functions and types
[WIRE] Create PropertyDetailTracker client component for property detail pages
[WIRE] Add view_item tracking to property detail page via PropertyDetailTracker
[WIRE] Add view_item_list tracking to PropertiesPageClient on properties load
[WIRE] Add select_item tracking to PropertyCard onClick
[WIRE] Add chatbot_interaction tracking to ChatbotWidget toggleOpen
[WIRE] Add chatbot_interaction tracking to ChatbotWidget sendMessage
[WIRE] Add generate_lead tracking to ChatbotWidget handleContactSubmit
[TEST] Create packages/analytics/jest.config.js following lib package pattern
[TEST] Create __tests__/real-estate-events.test.ts with gtag mocking
[TEST] Test trackPropertyView, trackPropertyListView, trackPropertySelect
[TEST] Test trackLeadFormSubmit, trackChatbotInteraction
[TEST] Test trackPhoneClick, trackEmailClick, trackCtaClick
[VALIDATE] Run npm run type-check to verify TypeScript
[VALIDATE] Run npm run lint to verify code style
[VALIDATE] Run npm run test to verify all tests pass
[VALIDATE] Run npm run build to verify production build
```

---

## VALIDATION GATES

```bash
# Type checking (must pass)
npm run type-check

# Linting (must pass)
npm run lint

# Unit tests (must pass with 80% coverage on analytics package)
npm run test

# Build (must succeed for both apps)
npm run build

# Manual verification steps:
# 1. Run dev server: npm run dev
# 2. Open browser DevTools Network tab
# 3. Navigate to /properties - verify page_view and view_item_list events
# 4. Click property card - verify select_item event
# 5. View property detail - verify view_item event
# 6. Open chatbot - verify chatbot_interaction event
# 7. Check GA4 DebugView for event data
```

---

## ERROR HANDLING

All tracking functions should:
1. Check `typeof window !== 'undefined'` before accessing window
2. Check `window.gtag` exists before calling
3. Never throw errors that break the UI
4. Log errors to console in development only

```typescript
const safeTrack = (eventName: string, params: object) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params)
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[analytics.${eventName}] Failed:`, error)
    }
  }
}
```

---

## TESTING PATTERNS

**Mock Setup (from codebase patterns):**
```typescript
// Mock gtag before tests
const mockGtag = jest.fn()
const originalWindow = global.window

beforeAll(() => {
  global.window = {
    ...originalWindow,
    gtag: mockGtag,
  } as any
})

afterAll(() => {
  global.window = originalWindow
})

beforeEach(() => {
  mockGtag.mockClear()
})
```

**Test Example:**
```typescript
describe('trackPropertyView', () => {
  it('should call gtag with view_item event', () => {
    trackPropertyView({
      id: 'MLS123',
      price: 500000,
      address: '123 Main St',
      type: 'condo'
    })

    expect(mockGtag).toHaveBeenCalledWith('event', 'view_item', {
      currency: 'CAD',
      value: 500000,
      items: [{
        item_id: 'MLS123',
        item_name: '123 Main St',
        item_category: 'condo',
        price: 500000
      }]
    })
  })

  it('should not throw if gtag is undefined', () => {
    global.window.gtag = undefined

    expect(() => {
      trackPropertyView({ id: 'MLS123', price: 500000, address: '123 Main St', type: 'condo' })
    }).not.toThrow()
  })
})
```

---

## QUALITY CHECKLIST

- [x] All necessary context included (existing code, patterns, research)
- [x] Validation gates are executable by AI (npm commands)
- [x] References existing patterns (jest config, component structure)
- [x] Clear implementation path (phased tasks)
- [x] Error handling documented
- [x] Testing patterns included

## CONFIDENCE SCORE

**8/10** - High confidence for one-pass implementation because:
- Existing analytics infrastructure is solid
- Clear patterns from codebase research
- Well-documented GA4 best practices
- Straightforward wiring of existing functions
- Minor risk: Chatbot widget complexity may need iteration
