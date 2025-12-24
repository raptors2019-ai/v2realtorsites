# Feature: Jest Testing Enhancement - Comprehensive Coverage

## Feature Description

Enhance Jest testing infrastructure to achieve 90%+ coverage across the monorepo with:

1. **Missing Chatbot Tool Tests** - Complete coverage for `property-search.ts` and `capture-preferences.ts`
2. **Lib Package Unit Tests** - Tests for validators, utils, data-fetcher, and SEO utilities
3. **API Route Integration Tests** - Test `/api/chat/route.ts` with mocked dependencies
4. **Snapshot Tests** - Formatted message output validation

## User Story

As a developer on this codebase
I want comprehensive test coverage with clear patterns
So that I can confidently refactor and add features without regressions

As a CI/CD pipeline
I want automated validation gates
So that broken code doesn't reach production

## Problem Statement

Current State:
1. **Chatbot package**: 86.41% coverage - `property-search.ts` (0%) and `capture-preferences.ts` (0%) untested
2. **Lib package**: 0% coverage - No tests for validators, utils, data-fetcher, SEO
3. **API Routes**: No integration tests for `/api/chat/route.ts`
4. **No snapshot tests** for formatted output validation

Risks:
- Regressions in untested tools go undetected
- Data transformation bugs in `convertIDXToProperty` slip through
- API route changes break without warning

## Solution Statement

Implement comprehensive testing in 4 phases:

1. **Phase 1**: Complete chatbot tool coverage (property-search, capture-preferences)
2. **Phase 2**: Add lib package tests (validators, utils, data-fetcher, SEO)
3. **Phase 3**: API route integration tests with mocked streamText
4. **Phase 4**: Snapshot tests for formatted outputs

**Target Coverage**: 90%+ across all packages

## Feature Metadata

**Feature Type**: Testing Enhancement
**Estimated Complexity**: Medium-High
**Primary Systems Affected**:
- `packages/chatbot/src/__tests__/` (new test files)
- `packages/lib/src/__tests__/` (new directory and tests)
- `apps/sri-collective/__tests__/` (new API tests)
- Root `package.json` (test scripts)

**Dependencies**:
- Jest 29+
- ts-jest
- @testing-library/react (for future UI tests)

---

## CONTEXT REFERENCES

### Current Test Infrastructure

**Jest Config (packages/chatbot/jest.config.js):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@repo/crm$': '<rootDir>/../crm/src/index.ts',
    '^@repo/types$': '<rootDir>/../types/src/index.ts',
  },
}
```

**Current Coverage Snapshot (packages/chatbot):**
| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| `mortgage-estimator.ts` | 96% | 87% | 100% | 96% |
| `create-contact.ts` | 99% | 96% | 100% | 100% |
| `neighborhood-info.ts` | 100% | 86% | 100% | 100% |
| `first-time-buyer-faq.ts` | 100% | 100% | 100% | 100% |
| `sell-home.ts` | 100% | 100% | 100% | 100% |
| **`property-search.ts`** | **0%** | **0%** | **0%** | **0%** |
| **`capture-preferences.ts`** | **0%** | **0%** | **0%** | **0%** |

### Files Requiring Tests

**Chatbot Tools (High Priority):**

`packages/chatbot/src/tools/property-search.ts` (83 lines):
- Uses `IDXClient` for search - needs mocking
- Returns formatted listings
- Handles empty results and errors

`packages/chatbot/src/tools/capture-preferences.ts` (78 lines):
- Pure `determineLeadQuality()` function
- Timeline-based scoring
- Urgency factor detection

**Lib Package (Medium Priority):**

`packages/lib/src/validators.ts`:
- `isValidEmail()` - regex validation
- `isValidPhone()` - Canadian phone validation
- `isValidPostalCode()` - Canadian postal code

`packages/lib/src/utils.ts`:
- `formatPrice()` - CAD currency formatting
- `formatDate()` - Date formatting

`packages/lib/src/data-fetcher.ts`:
- `filterProperties()` - Complex filtering logic
- `sortProperties()` - Multiple sort options
- `convertIDXToProperty()` - IDX to Property mapping
- `convertToProperty()` - BoldTrail to Property mapping
- `fetchWithRetry()` - Retry logic with backoff

`packages/lib/src/seo.ts`:
- `getCityBySlug()` - City lookup
- `parseFilterSegments()` - URL segment parsing
- `validateFilters()` - Filter validation
- `generateFilterMetadata()` - SEO metadata generation
- `seoFiltersToIDXParams()` - Filter conversion

### Existing Test Patterns to Follow

**Mocking External Dependencies (from create-contact.test.ts):**
```typescript
// Mock before import
jest.mock('@repo/crm', () => ({
  BoldTrailClient: jest.fn().mockImplementation(() => ({
    createContact: jest.fn().mockResolvedValue({
      success: true,
      contactId: 'test-contact-123',
    }),
  })),
}))

import { createContactTool } from '../tools/create-contact'
import { BoldTrailClient } from '@repo/crm'
```

**Parametrized Tests (from mortgage-estimator.test.ts):**
```typescript
describe('stress test rate', () => {
  it('should apply stress test floor of 5.25%', async () => {
    const result = await mortgageEstimatorTool.execute({
      annualIncome: 120000,
      downPayment: 100000,
      monthlyDebts: 0,
      currentMortgageRate: 2.5, // Low rate should use floor
    })
    expect(result.estimate.stressTestRate).toBe(5.25)
  })
})
```

**it.each Pattern (from create-contact.test.ts):**
```typescript
const budgetCases = [
  { budget: 400000, expected: 'budget-under-500k' },
  { budget: 600000, expected: 'budget-500k-750k' },
  // ...
]

it.each(budgetCases)('should format $budget as $expected', async ({ budget, expected }) => {
  const result = await createContactTool.execute({ /* ... */ })
  expect(result.hashtags).toContain(expected)
})
```

### Documentation References

**Jest Documentation:**
- [Jest Getting Started](https://jestjs.io/docs/getting-started)
- [Mock Functions](https://jestjs.io/docs/mock-functions)
- [Snapshot Testing](https://jestjs.io/docs/snapshot-testing)
- [Coverage Configuration](https://jestjs.io/docs/configuration#coveragethreshold-object)

**ts-jest:**
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)

**Next.js Testing:**
- [Testing Next.js](https://nextjs.org/docs/app/building-your-application/testing)

---

## IMPLEMENTATION PLAN

### Phase 1: Missing Chatbot Tool Tests

Complete test coverage for the two untested chatbot tools.

**Tasks:**
1. Create `property-search.test.ts` with IDXClient mocking
2. Create `capture-preferences.test.ts` with lead quality tests
3. Run coverage to verify 95%+ chatbot coverage

### Phase 2: Lib Package Tests

Add comprehensive tests for lib package utilities.

**Tasks:**
1. Set up Jest config for lib package
2. Create validator tests (email, phone, postal code)
3. Create utils tests (formatPrice, formatDate)
4. Create data-fetcher tests (filter, sort, convert functions)
5. Create SEO utils tests

### Phase 3: API Route Integration Tests

Test the chat API route with mocked AI SDK.

**Tasks:**
1. Set up test infrastructure for Next.js API routes
2. Create chat route tests with mocked streamText
3. Verify tool invocation through API

### Phase 4: Snapshot Tests

Add snapshot tests for formatted output validation.

**Tasks:**
1. Add snapshot tests for mortgage estimator formatted output
2. Add snapshot tests for neighborhood info messages
3. Configure snapshot update workflow

---

## STEP-BY-STEP TASKS

### CREATE packages/chatbot/src/__tests__/property-search.test.ts
- **IMPLEMENT**: Full test coverage for property search tool
- **CODE**:
```typescript
// Mock IDXClient before importing the tool
jest.mock('@repo/crm', () => ({
  IDXClient: jest.fn().mockImplementation(() => ({
    searchListings: jest.fn(),
  })),
}))

// Mock @repo/lib for formatPrice
jest.mock('@repo/lib', () => ({
  formatPrice: jest.fn((price: number) => `$${price.toLocaleString()}`),
}))

import { propertySearchTool } from '../tools/property-search'
import { IDXClient } from '@repo/crm'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe('propertySearchTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(propertySearchTool.description).toContain('Search for properties')
      expect(propertySearchTool.description).toContain('BEFORE asking for contact')
    })

    it('should have required parameters schema', () => {
      expect(propertySearchTool.parameters).toBeDefined()
    })
  })

  describe('successful searches', () => {
    it('should return formatted listings when found', async () => {
      const mockListings = [
        {
          ListingKey: 'abc123',
          ListPrice: 750000,
          UnparsedAddress: '123 Main St',
          City: 'Toronto',
          BedroomsTotal: 3,
          BathroomsTotalInteger: 2,
          LivingArea: 1500,
          PropertyType: 'Residential',
          Media: [{ MediaURL: 'https://example.com/img.jpg' }],
          PublicRemarks: 'Beautiful home',
        },
      ]

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: mockListings,
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        maxPrice: 800000,
        bedrooms: 3,
      })

      expect(result.success).toBe(true)
      expect(result.listings).toHaveLength(1)
      expect(result.listings[0].id).toBe('abc123')
      expect(result.listings[0].address).toBe('123 Main St')
      expect(result.total).toBe(1)
    })

    it('should limit results to 5 listings', async () => {
      const mockListings = Array(10).fill(null).map((_, i) => ({
        ListingKey: `listing-${i}`,
        ListPrice: 500000 + i * 10000,
        UnparsedAddress: `${i} Test St`,
        City: 'Toronto',
        BedroomsTotal: 3,
        BathroomsTotalInteger: 2,
        PropertyType: 'Residential',
        Media: [],
      }))

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: mockListings.slice(0, 5), // API returns limit=5
          total: 10,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.listings.length).toBeLessThanOrEqual(5)
    })

    it('should pass search params to IDXClient', async () => {
      const mockSearchListings = jest.fn().mockResolvedValue({
        success: true,
        listings: [],
        total: 0,
      })

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: mockSearchListings,
      }))

      await propertySearchTool.execute({
        city: 'Mississauga',
        minPrice: 500000,
        maxPrice: 800000,
        bedrooms: 4,
        bathrooms: 2,
        propertyType: 'Condo',
      })

      expect(mockSearchListings).toHaveBeenCalledWith({
        city: 'Mississauga',
        minPrice: 500000,
        maxPrice: 800000,
        bedrooms: 4,
        bathrooms: 2,
        propertyType: 'Condo',
        limit: 5,
      })
    })
  })

  describe('empty results', () => {
    it('should handle no matching properties', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [],
          total: 0,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        minPrice: 10000000, // Very high price
      })

      expect(result.success).toBe(false)
      expect(result.message).toContain("couldn't find any properties")
      expect(result.listings).toEqual([])
    })

    it('should handle API failure', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: false,
          listings: [],
          total: 0,
          error: 'API Error',
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(false)
      expect(result.message).toContain("couldn't find any properties")
    })
  })

  describe('error handling', () => {
    it('should handle exceptions gracefully', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockRejectedValue(new Error('Network error')),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(false)
      expect(result.message).toContain('having trouble')
      expect(result.error).toBe('Network error')
    })
  })

  describe('listing formatting', () => {
    it('should format listing with all fields', async () => {
      const mockListing = {
        ListingKey: 'test-123',
        ListPrice: 899000,
        UnparsedAddress: '456 Oak Ave, Unit 501',
        City: 'Toronto',
        BedroomsTotal: 2,
        BathroomsTotalInteger: 2,
        LivingArea: 1000,
        PropertyType: 'Condo',
        Media: [
          { MediaURL: 'https://example.com/main.jpg' },
          { MediaURL: 'https://example.com/second.jpg' },
        ],
        PublicRemarks: 'Stunning corner unit with panoramic views of the city skyline and lake.',
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      const listing = result.listings[0]
      expect(listing.id).toBe('test-123')
      expect(listing.priceNumber).toBe(899000)
      expect(listing.address).toBe('456 Oak Ave, Unit 501')
      expect(listing.city).toBe('Toronto')
      expect(listing.bedrooms).toBe(2)
      expect(listing.bathrooms).toBe(2)
      expect(listing.sqft).toBe(1000)
      expect(listing.propertyType).toBe('Condo')
      expect(listing.image).toBe('https://example.com/main.jpg')
      expect(listing.description).toHaveLength(100) // Truncated
      expect(listing.url).toBe('/properties/test-123')
    })

    it('should handle missing media', async () => {
      const mockListing = {
        ListingKey: 'no-media',
        ListPrice: 500000,
        UnparsedAddress: '789 No Photo St',
        City: 'Toronto',
        BedroomsTotal: 1,
        BathroomsTotalInteger: 1,
        PropertyType: 'Condo',
        Media: null,
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.listings[0].image).toBeNull()
    })

    it('should handle missing sqft', async () => {
      const mockListing = {
        ListingKey: 'no-sqft',
        ListPrice: 500000,
        UnparsedAddress: '100 Unknown Size St',
        City: 'Toronto',
        BedroomsTotal: 2,
        BathroomsTotalInteger: 1,
        PropertyType: 'Residential',
        LivingArea: null,
      }

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [mockListing],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.success).toBe(true)
      expect(result.listings[0].sqft).toBe(0)
    })
  })

  describe('message formatting', () => {
    it('should use singular for one result', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [{ ListingKey: 'one', ListPrice: 500000, City: 'Toronto', BedroomsTotal: 2, BathroomsTotalInteger: 1 }],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.message).toContain('1 property')
    })

    it('should use plural for multiple results', async () => {
      const listings = Array(3).fill(null).map((_, i) => ({
        ListingKey: `prop-${i}`,
        ListPrice: 500000,
        City: 'Toronto',
        BedroomsTotal: 2,
        BathroomsTotalInteger: 1,
      }))

      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings,
          total: 15,
        }),
      }))

      const result = await propertySearchTool.execute({ city: 'Toronto' })

      expect(result.message).toContain('15 properties')
      expect(result.message).toContain('top 3')
    })
  })

  describe('viewAllUrl generation', () => {
    it('should generate correct viewAllUrl with filters', async () => {
      ;(IDXClient as jest.Mock).mockImplementation(() => ({
        searchListings: jest.fn().mockResolvedValue({
          success: true,
          listings: [{ ListingKey: 'test', ListPrice: 500000, City: 'Toronto', BedroomsTotal: 2, BathroomsTotalInteger: 1 }],
          total: 1,
        }),
      }))

      const result = await propertySearchTool.execute({
        city: 'Toronto',
        minPrice: 500000,
        maxPrice: 800000,
        bedrooms: 3,
      })

      expect(result.viewAllUrl).toContain('city=Toronto')
      expect(result.viewAllUrl).toContain('minPrice=500000')
      expect(result.viewAllUrl).toContain('maxPrice=800000')
      expect(result.viewAllUrl).toContain('bedrooms=3')
    })
  })
})
```
- **VALIDATE**: `npm run test --workspace=@repo/chatbot`

### CREATE packages/chatbot/src/__tests__/capture-preferences.test.ts
- **IMPLEMENT**: Full test coverage for capture preferences tool
- **CODE**:
```typescript
import { capturePreferencesTool } from '../tools/capture-preferences'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

describe('capturePreferencesTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(capturePreferencesTool.description).toContain('Capture buyer or seller preferences')
      expect(capturePreferencesTool.description).toContain('property requirements')
    })

    it('should have required parameters schema', () => {
      expect(capturePreferencesTool.parameters).toBeDefined()
    })
  })

  describe('lead quality scoring', () => {
    describe('hot leads', () => {
      it('should score immediate timeline as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'immediate',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score 3-months timeline as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: '3-months',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score urgency factors as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          urgencyFactors: ['relocating for work'],
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })

      it('should score multiple urgency factors as hot', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          urgencyFactors: ['lease ending', 'job relocation'],
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('hot')
      })
    })

    describe('warm leads', () => {
      it('should score pre-approved as warm', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          preApproved: true,
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should score 6-months timeline as warm', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: '6-months',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should score 12-months timeline as warm', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: '12-months',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })

      it('should default to warm when no signals', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          bedrooms: 3,
          locations: ['Toronto'],
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('warm')
      })
    })

    describe('cold leads', () => {
      it('should score just-browsing timeline as cold', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'just-browsing',
        })

        expect(result.success).toBe(true)
        expect(result.leadQuality).toBe('cold')
      })
    })

    describe('scoring priority', () => {
      it('should prioritize timeline over pre-approved', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'immediate',
          preApproved: false,
        })

        expect(result.leadQuality).toBe('hot')
      })

      it('should prioritize urgency over just-browsing', async () => {
        const result = await capturePreferencesTool.execute({
          leadType: 'buyer',
          timeline: 'just-browsing',
          urgencyFactors: ['relocating'],
        })

        // Hot because urgency factors are checked before timeline='just-browsing'
        expect(result.leadQuality).toBe('hot')
      })
    })
  })

  describe('buyer preferences', () => {
    it('should capture budget range', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        budget: { min: 500000, max: 800000 },
      })

      expect(result.success).toBe(true)
      expect(result.preferences.budget).toEqual({ min: 500000, max: 800000 })
    })

    it('should capture property preferences', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        propertyType: 'detached',
        bedrooms: 4,
        bathrooms: 3,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.propertyType).toBe('detached')
      expect(result.preferences.bedrooms).toBe(4)
      expect(result.preferences.bathrooms).toBe(3)
    })

    it('should capture location preferences', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        locations: ['Toronto', 'Mississauga', 'Oakville'],
      })

      expect(result.success).toBe(true)
      expect(result.preferences.locations).toEqual(['Toronto', 'Mississauga', 'Oakville'])
    })
  })

  describe('seller preferences', () => {
    it('should capture seller property details', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'seller',
        propertyAddress: '123 Main St, Toronto',
        reasonForSelling: 'Downsizing',
        expectedPrice: 950000,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.propertyAddress).toBe('123 Main St, Toronto')
      expect(result.preferences.reasonForSelling).toBe('Downsizing')
      expect(result.preferences.expectedPrice).toBe(950000)
    })
  })

  describe('lead types', () => {
    const leadTypes = ['buyer', 'seller', 'investor', 'general'] as const

    it.each(leadTypes)('should accept %s lead type', async (leadType) => {
      const result = await capturePreferencesTool.execute({
        leadType,
      })

      expect(result.success).toBe(true)
      expect(result.preferences.leadType).toBe(leadType)
    })
  })

  describe('output structure', () => {
    it('should return success with message', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
      })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Preferences captured successfully')
    })

    it('should include preferences in response', async () => {
      const input = {
        leadType: 'buyer' as const,
        budget: { min: 500000, max: 800000 },
        bedrooms: 3,
        locations: ['Toronto'],
      }

      const result = await capturePreferencesTool.execute(input)

      expect(result.preferences).toMatchObject(input)
    })

    it('should include nextStep guidance', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
      })

      expect(result.nextStep).toContain('listings')
      expect(result.nextStep).toContain('contact info')
    })
  })

  describe('edge cases', () => {
    it('should handle empty urgency factors array', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        urgencyFactors: [],
      })

      expect(result.success).toBe(true)
      // Empty array should not trigger hot lead status
      expect(result.leadQuality).toBe('warm')
    })

    it('should handle undefined optional fields', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        // All optional fields undefined
      })

      expect(result.success).toBe(true)
      expect(result.preferences.leadType).toBe('buyer')
    })

    it('should handle complex preferences combination', async () => {
      const result = await capturePreferencesTool.execute({
        leadType: 'buyer',
        budget: { min: 700000, max: 1200000, range: '$700K-$1.2M' },
        propertyType: 'townhouse',
        bedrooms: 3,
        bathrooms: 2,
        locations: ['Richmond Hill', 'Markham'],
        timeline: '3-months',
        preApproved: true,
        urgencyFactors: ['growing family'],
      })

      expect(result.success).toBe(true)
      expect(result.leadQuality).toBe('hot') // 3-months timeline
      expect(result.preferences.locations).toHaveLength(2)
    })
  })
})
```
- **VALIDATE**: `npm run test --workspace=@repo/chatbot -- --coverage`

### CREATE packages/lib/jest.config.js
- **IMPLEMENT**: Jest configuration for lib package
- **CODE**:
```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/session.ts', // Server-only, requires Next.js runtime
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@repo/types$': '<rootDir>/../types/src/index.ts',
    '^@repo/crm$': '<rootDir>/../crm/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
    }],
  },
}
```
- **VALIDATE**: File created

### UPDATE packages/lib/package.json
- **ADD**: Test scripts
- **CODE**: Add to scripts:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```
- **ADD**: Dev dependencies:
```json
"devDependencies": {
  "@types/jest": "^29.5.14",
  "jest": "^29.7.0",
  "ts-jest": "^29.2.5"
}
```
- **VALIDATE**: `npm install`

### CREATE packages/lib/src/__tests__/validators.test.ts
- **IMPLEMENT**: Validator function tests
- **CODE**:
```typescript
import { isValidEmail, isValidPhone, isValidPostalCode } from '../validators'

describe('validators', () => {
  describe('isValidEmail', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'first.last@subdomain.example.com',
      'email123@test.io',
    ]

    const invalidEmails = [
      '',
      'invalid',
      'no@domain',
      '@nodomain.com',
      'spaces in@email.com',
      'missing@.com',
      'double@@at.com',
    ]

    it.each(validEmails)('should return true for valid email: %s', (email) => {
      expect(isValidEmail(email)).toBe(true)
    })

    it.each(invalidEmails)('should return false for invalid email: %s', (email) => {
      expect(isValidEmail(email)).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    const validPhones = [
      '4165551234',
      '416-555-1234',
      '(416) 555-1234',
      '416.555.1234',
      '1-416-555-1234',
      '+1-416-555-1234',
      '14165551234',
    ]

    const invalidPhones = [
      '',
      '123',
      '12345',
      '123456789', // 9 digits
      '12345678901234', // Too many digits
      'abc-def-ghij',
      '416-555-123', // 9 digits
    ]

    it.each(validPhones)('should return true for valid phone: %s', (phone) => {
      expect(isValidPhone(phone)).toBe(true)
    })

    it.each(invalidPhones)('should return false for invalid phone: %s', (phone) => {
      expect(isValidPhone(phone)).toBe(false)
    })
  })

  describe('isValidPostalCode', () => {
    const validPostalCodes = [
      'M5V 3A8',
      'M5V3A8',
      'm5v 3a8',
      'M5V-3A8',
      'L4C 9T2',
      'K1A 0B1',
    ]

    const invalidPostalCodes = [
      '',
      '12345',
      'ABCDEF',
      'M5V 38', // Missing letter
      '5M5V 3A8', // Starts with number
      'M5V 3A88', // Extra digit
    ]

    it.each(validPostalCodes)('should return true for valid postal code: %s', (code) => {
      expect(isValidPostalCode(code)).toBe(true)
    })

    it.each(invalidPostalCodes)('should return false for invalid postal code: %s', (code) => {
      expect(isValidPostalCode(code)).toBe(false)
    })
  })
})
```
- **VALIDATE**: `npm run test --workspace=@repo/lib`

### CREATE packages/lib/src/__tests__/utils.test.ts
- **IMPLEMENT**: Utility function tests
- **CODE**:
```typescript
import { formatPrice, formatDate, cn } from '../utils'

describe('utils', () => {
  describe('formatPrice', () => {
    it('should format price in CAD with no decimals', () => {
      expect(formatPrice(500000)).toBe('$500,000')
    })

    it('should format large prices with commas', () => {
      expect(formatPrice(1500000)).toBe('$1,500,000')
    })

    it('should format zero', () => {
      expect(formatPrice(0)).toBe('$0')
    })

    it('should format small prices', () => {
      expect(formatPrice(999)).toBe('$999')
    })

    it('should round decimal prices', () => {
      expect(formatPrice(500000.99)).toBe('$500,001')
    })

    it('should accept custom currency', () => {
      const result = formatPrice(100, 'USD')
      expect(result).toContain('100')
    })
  })

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toContain('January')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format date string', () => {
      const result = formatDate('2024-12-25')
      expect(result).toContain('December')
      expect(result).toContain('25')
      expect(result).toContain('2024')
    })

    it('should format ISO date string', () => {
      const result = formatDate('2024-06-01T12:00:00Z')
      expect(result).toContain('June')
      expect(result).toContain('2024')
    })
  })

  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base active')
    })

    it('should handle false conditionals', () => {
      const isActive = false
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base')
    })

    it('should merge Tailwind conflicting classes', () => {
      // tailwind-merge should keep the last padding class
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })

    it('should handle undefined values', () => {
      const result = cn('foo', undefined, 'bar')
      expect(result).toBe('foo bar')
    })

    it('should handle arrays', () => {
      const result = cn(['foo', 'bar'], 'baz')
      expect(result).toBe('foo bar baz')
    })
  })
})
```
- **VALIDATE**: `npm run test --workspace=@repo/lib`

### CREATE packages/lib/src/__tests__/data-fetcher.test.ts
- **IMPLEMENT**: Data fetcher function tests
- **CODE**:
```typescript
import {
  filterProperties,
  sortProperties,
  convertIDXToProperty,
  convertToProperty,
} from '../data-fetcher'
import type { Property, IDXListing } from '@repo/types'
import type { BoldTrailListing } from '@repo/crm'

// Mock properties for testing
const mockProperties: Property[] = [
  {
    id: '1',
    title: '123 Main St',
    address: '123 Main St',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5V 3A8',
    price: 750000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    propertyType: 'detached',
    status: 'active',
    listingType: 'sale',
    featured: true,
    images: [],
    description: '',
    listingDate: new Date('2024-01-01'),
    mlsNumber: 'MLS001',
  },
  {
    id: '2',
    title: '456 Oak Ave',
    address: '456 Oak Ave',
    city: 'Mississauga',
    province: 'ON',
    postalCode: 'L5B 2C3',
    price: 500000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1000,
    propertyType: 'condo',
    status: 'active',
    listingType: 'sale',
    featured: false,
    images: [],
    description: '',
    listingDate: new Date('2024-02-01'),
    mlsNumber: 'MLS002',
  },
  {
    id: '3',
    title: '789 Elm St',
    address: '789 Elm St',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M4Y 1A1',
    price: 4500, // Lease price
    bedrooms: 1,
    bathrooms: 1,
    sqft: 600,
    propertyType: 'condo',
    status: 'active',
    listingType: 'lease',
    featured: false,
    images: [],
    description: '',
    listingDate: new Date('2024-03-01'),
    mlsNumber: 'MLS003',
  },
]

describe('data-fetcher', () => {
  describe('filterProperties', () => {
    it('should return all properties with empty filters', () => {
      const result = filterProperties(mockProperties, {})
      expect(result).toHaveLength(3)
    })

    it('should filter by property type', () => {
      const result = filterProperties(mockProperties, {
        type: ['condo'],
      })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.propertyType === 'condo')).toBe(true)
    })

    it('should filter by multiple property types', () => {
      const result = filterProperties(mockProperties, {
        type: ['condo', 'detached'],
      })
      expect(result).toHaveLength(3)
    })

    it('should filter by price range (min only)', () => {
      const result = filterProperties(mockProperties, {
        priceRange: { min: 500000 },
      })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.price >= 500000)).toBe(true)
    })

    it('should filter by price range (max only)', () => {
      const result = filterProperties(mockProperties, {
        priceRange: { max: 600000 },
      })
      expect(result).toHaveLength(2)
    })

    it('should filter by price range (min and max)', () => {
      const result = filterProperties(mockProperties, {
        priceRange: { min: 400000, max: 600000 },
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('should filter by minimum bedrooms', () => {
      const result = filterProperties(mockProperties, {
        bedrooms: 2,
      })
      expect(result).toHaveLength(2)
      expect(result.every(p => p.bedrooms >= 2)).toBe(true)
    })

    it('should filter by minimum bathrooms', () => {
      const result = filterProperties(mockProperties, {
        bathrooms: 2,
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('should filter by location (case insensitive)', () => {
      const result = filterProperties(mockProperties, {
        location: 'toronto',
      })
      expect(result).toHaveLength(2)
    })

    it('should filter by partial location match', () => {
      const result = filterProperties(mockProperties, {
        location: 'Miss',
      })
      expect(result).toHaveLength(1)
      expect(result[0].city).toBe('Mississauga')
    })

    it('should filter by listing type', () => {
      const result = filterProperties(mockProperties, {
        listingType: 'lease',
      })
      expect(result).toHaveLength(1)
      expect(result[0].listingType).toBe('lease')
    })

    it('should combine multiple filters', () => {
      const result = filterProperties(mockProperties, {
        type: ['condo'],
        priceRange: { min: 1000 },
        location: 'Toronto',
        listingType: 'lease',
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })
  })

  describe('sortProperties', () => {
    it('should sort by latest (newest first)', () => {
      const result = sortProperties(mockProperties, 'latest')
      expect(result[0].id).toBe('3') // March 2024
      expect(result[2].id).toBe('1') // January 2024
    })

    it('should sort by price ascending', () => {
      const result = sortProperties(mockProperties, 'price-asc')
      expect(result[0].price).toBe(4500)
      expect(result[2].price).toBe(750000)
    })

    it('should sort by price descending', () => {
      const result = sortProperties(mockProperties, 'price-desc')
      expect(result[0].price).toBe(750000)
      expect(result[2].price).toBe(4500)
    })

    it('should sort by featured first', () => {
      const result = sortProperties(mockProperties, 'featured')
      expect(result[0].featured).toBe(true)
    })

    it('should handle unknown sort option gracefully', () => {
      const result = sortProperties(mockProperties, 'unknown' as any)
      expect(result).toHaveLength(3)
    })

    it('should not mutate original array', () => {
      const original = [...mockProperties]
      sortProperties(mockProperties, 'price-asc')
      expect(mockProperties[0].id).toBe(original[0].id)
    })
  })

  describe('convertIDXToProperty', () => {
    const mockIDXListing: IDXListing = {
      ListingKey: 'idx-123',
      ListingId: 'MLS12345',
      ListPrice: 899000,
      UnparsedAddress: '100 Front St W, Unit 4501',
      City: 'Toronto',
      StateOrProvince: 'Ontario',
      PostalCode: 'M5J 1E3',
      BedroomsTotal: 2,
      BathroomsTotalInteger: 2,
      LivingArea: 1200,
      PropertyType: 'Condo',
      StandardStatus: 'Active',
      ModificationTimestamp: '2024-06-15T10:00:00Z',
      PublicRemarks: 'Stunning waterfront condo with lake views.',
      Media: [
        { MediaKey: 'img1', MediaURL: 'https://example.com/1.jpg', Order: 1, MediaCategory: 'Photo' },
        { MediaKey: 'img2', MediaURL: 'https://example.com/2.jpg', Order: 2, MediaCategory: 'Photo' },
      ],
    }

    it('should convert IDX listing to Property', () => {
      const result = convertIDXToProperty(mockIDXListing)

      expect(result.id).toBe('idx-123')
      expect(result.title).toBe('100 Front St W, Unit 4501')
      expect(result.city).toBe('Toronto')
      expect(result.price).toBe(899000)
      expect(result.bedrooms).toBe(2)
      expect(result.bathrooms).toBe(2)
      expect(result.sqft).toBe(1200)
      expect(result.mlsNumber).toBe('MLS12345')
    })

    it('should map property types correctly', () => {
      expect(convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Residential' }).propertyType).toBe('detached')
      expect(convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Condo' }).propertyType).toBe('condo')
      expect(convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Townhouse' }).propertyType).toBe('townhouse')
    })

    it('should default to detached for unknown property types', () => {
      const result = convertIDXToProperty({ ...mockIDXListing, PropertyType: 'Unknown' })
      expect(result.propertyType).toBe('detached')
    })

    it('should map status correctly', () => {
      expect(convertIDXToProperty({ ...mockIDXListing, StandardStatus: 'Active' }).status).toBe('active')
      expect(convertIDXToProperty({ ...mockIDXListing, StandardStatus: 'Pending' }).status).toBe('pending')
      expect(convertIDXToProperty({ ...mockIDXListing, StandardStatus: 'Sold' }).status).toBe('sold')
    })

    it('should determine listing type based on price threshold', () => {
      // Sale (>= $10,000)
      expect(convertIDXToProperty({ ...mockIDXListing, ListPrice: 500000 }).listingType).toBe('sale')

      // Lease (< $10,000)
      expect(convertIDXToProperty({ ...mockIDXListing, ListPrice: 3500 }).listingType).toBe('lease')
    })

    it('should extract images from Media', () => {
      const result = convertIDXToProperty(mockIDXListing)
      expect(result.images).toHaveLength(2)
      expect(result.images[0]).toBe('https://example.com/1.jpg')
    })

    it('should handle missing Media', () => {
      const result = convertIDXToProperty({ ...mockIDXListing, Media: undefined })
      expect(result.images).toEqual([])
    })

    it('should deduplicate images by MediaKey', () => {
      const listingWithDupes: IDXListing = {
        ...mockIDXListing,
        Media: [
          { MediaKey: 'img1', MediaURL: 'https://example.com/1.jpg', Order: 1 },
          { MediaKey: 'img1-t', MediaURL: 'https://example.com/1-thumb.jpg', Order: 2 }, // Thumbnail
          { MediaKey: 'img2', MediaURL: 'https://example.com/2.jpg', Order: 3 },
        ],
      }
      const result = convertIDXToProperty(listingWithDupes)
      expect(result.images).toHaveLength(2)
    })

    it('should handle LivingAreaRange fallback', () => {
      const listingWithRange = {
        ...mockIDXListing,
        LivingArea: null,
        LivingAreaRange: '1000-1499',
      } as any

      const result = convertIDXToProperty(listingWithRange)
      expect(result.sqft).toBe(1250) // Midpoint of 1000-1499
    })
  })

  describe('convertToProperty (BoldTrail)', () => {
    const mockBoldTrailListing: BoldTrailListing = {
      id: 'bt-456',
      address: '200 King St W',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5H 1K4',
      price: 650000,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 800,
      propertyType: 'condo',
      status: 'active',
      photos: ['https://example.com/photo1.jpg'],
      description: 'Modern downtown condo',
      listingDate: '2024-05-01',
      mlsNumber: 'BT123',
    }

    it('should convert BoldTrail listing to Property', () => {
      const result = convertToProperty(mockBoldTrailListing)

      expect(result.id).toBe('bt-456')
      expect(result.address).toBe('200 King St W')
      expect(result.city).toBe('Toronto')
      expect(result.price).toBe(650000)
      expect(result.images).toEqual(['https://example.com/photo1.jpg'])
    })

    it('should determine listing type based on price', () => {
      expect(convertToProperty({ ...mockBoldTrailListing, price: 500000 }).listingType).toBe('sale')
      expect(convertToProperty({ ...mockBoldTrailListing, price: 2500 }).listingType).toBe('lease')
    })

    it('should map property types correctly', () => {
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'detached' }).propertyType).toBe('detached')
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'semi-detached' }).propertyType).toBe('semi-detached')
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'townhouse' }).propertyType).toBe('townhouse')
      expect(convertToProperty({ ...mockBoldTrailListing, propertyType: 'condo' }).propertyType).toBe('condo')
    })

    it('should handle missing sqft', () => {
      const result = convertToProperty({ ...mockBoldTrailListing, sqft: undefined })
      expect(result.sqft).toBe(0)
    })
  })
})
```
- **VALIDATE**: `npm run test --workspace=@repo/lib`

### CREATE packages/lib/src/__tests__/seo.test.ts
- **IMPLEMENT**: SEO utility function tests
- **CODE**:
```typescript
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
  })

  describe('getBedroomsBySlug', () => {
    it('should find bedroom config', () => {
      expect(getBedroomsBySlug('2-bed')?.min).toBe(2)
      expect(getBedroomsBySlug('4-bed')?.min).toBe(4)
    })
  })

  describe('parseFilterSegments', () => {
    it('should parse empty filters', () => {
      expect(parseFilterSegments([])).toEqual({})
    })

    it('should parse neighborhood', () => {
      const result = parseFilterSegments(['yorkville'])
      expect(result.neighborhood).toBe('yorkville')
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
      expect(meta.canonical).toBe('https://sricollective.com/properties')
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
      expect(meta.canonical).toBe('https://sricollective.com/properties/toronto/yorkville/1m-1.5m/condo')
    })

    it('should include openGraph data', () => {
      const meta = generateFilterMetadata('toronto')
      expect(meta.openGraph.title).toBe(meta.title)
      expect(meta.openGraph.description).toBe(meta.description)
      expect(meta.openGraph.url).toBe(meta.canonical)
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

    it('should convert property type to IDX value', () => {
      const params = seoFiltersToIDXParams('toronto', { propertyType: 'condo' })
      expect(params.propertyType).toBe('Condo')
    })

    it('should convert bedrooms to minimum', () => {
      const params = seoFiltersToIDXParams('toronto', { bedrooms: '3-bed' })
      expect(params.bedrooms).toBe(3)
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
  })
})
```
- **VALIDATE**: `npm run test --workspace=@repo/lib -- --coverage`

### UPDATE root package.json
- **ADD**: Test script for lib package
- **EDIT**: Ensure turbo.json test task includes lib
- **VALIDATE**: `npm run test`

### UPDATE packages/chatbot/jest.config.js
- **INCREASE**: Coverage thresholds to 90%+
- **CODE**: Change coverageThreshold to:
```javascript
coverageThreshold: {
  global: {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90,
  },
},
```
- **VALIDATE**: `npm run test --workspace=@repo/chatbot -- --coverage`

---

## VALIDATION COMMANDS

Execute all commands to ensure zero regressions.

### Level 1: Syntax & Types

```bash
# Type check all packages
npm run type-check
```
**Expected**: No TypeScript errors

### Level 2: Chatbot Tests

```bash
# Run chatbot tests with coverage
npm run test --workspace=@repo/chatbot -- --coverage
```
**Expected**: 90%+ coverage, all tests pass

### Level 3: Lib Tests

```bash
# Run lib tests with coverage
npm run test --workspace=@repo/lib -- --coverage
```
**Expected**: 80%+ coverage, all tests pass

### Level 4: All Tests

```bash
# Run all tests across monorepo
npm run test
```
**Expected**: All test suites pass

### Level 5: Build Validation

```bash
# Ensure build still works
npm run build
```
**Expected**: Clean build with no errors

### Level 6: Coverage Summary

```bash
# Generate full coverage report
npm run test -- --coverage --coverageReporters=text-summary
```
**Expected**: Overall coverage > 85%

---

## ACCEPTANCE CRITERIA

- [ ] `property-search.test.ts` complete with 90%+ coverage
- [ ] `capture-preferences.test.ts` complete with 90%+ coverage
- [ ] `@repo/lib` tests added for validators, utils, data-fetcher, SEO
- [ ] All existing tests continue to pass
- [ ] Overall chatbot coverage > 90%
- [ ] Overall lib coverage > 80%
- [ ] `npm run test` passes at root level
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors

---

## COMPLETION CHECKLIST

- [ ] Phase 1: Chatbot tool tests completed
- [ ] Phase 2: Lib package tests completed
- [ ] All validation commands pass
- [ ] Coverage thresholds met
- [ ] Build succeeds
- [ ] Code review approved

---

## NOTES

### Design Decisions

**Why mock at module level vs function level?**
- Module-level mocking (`jest.mock()`) provides clean isolation
- Allows testing edge cases without complex setup
- Follows existing patterns in codebase

**Why separate test files per module?**
- Easier to run specific tests during development
- Clear organization matching source structure
- Parallel test execution

**Why not test API routes yet?**
- Requires additional setup (MSW or custom mocking)
- Chat route uses streaming which is complex to test
- Can be added in future iteration

### Test Data Strategy

- Use minimal mock data that covers the test case
- Avoid overly complex fixtures
- Prefer inline data over external files

### Trade-offs

**Coverage vs Maintenance**
- 90% target balances thoroughness with practicality
- Some edge cases may not be worth testing
- Focus on business logic over implementation details

---

## PRP CONFIDENCE SCORE: 9/10

**Strengths:**
- Comprehensive analysis of existing test patterns
- Clear step-by-step implementation tasks
- Follows established codebase conventions
- All validation commands are executable
- Realistic coverage targets

**Risks:**
- Some edge cases in data-fetcher may need adjustment
- SEO test may need mock for GTA_CITIES import
- Coverage percentages depend on actual implementation

**Mitigations:**
- Each test file can be adjusted independently
- Validation commands catch issues early
- Incremental approach allows course correction

---

<!-- EOF -->
