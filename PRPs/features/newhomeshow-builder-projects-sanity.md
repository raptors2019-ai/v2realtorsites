# Feature: NewHomeShow Builder Projects with Sanity CMS

## Feature Description

Implement a CMS-powered builder projects section for the NewHomeShow app, integrating Sanity CMS for content management. The feature includes project listing pages with status badges and pricing, individual project detail pages, multi-step registration survey forms, and specialized pages for Quick Closings, Assignments, Promotions, and Connect with Sales.

This leverages Sanity CMS v3 for visual content editing with GROQ queries, the existing `@repo/ui` components as templates (PropertyCard, PropertySurvey), and BoldTrail CRM integration for lead capture. The initial project is Seatonville in Pickering, with architecture designed for 5+ future projects.

## User Story

As a home buyer interested in pre-construction homes
I want to browse builder projects, see pricing and status, and register my interest
So that I can be contacted by sales representatives about new developments

As a real estate administrator
I want to manage builder projects through a visual CMS
So that I can add/update projects without developer assistance

## Problem Statement

Currently, the newhomeshow app has:
1. A basic home page with generic content
2. No builder projects section
3. No CMS integration for content management
4. No registration flow for capturing leads
5. No specialized pages (Quick Closings, Assignments, etc.)

The challenge: Create a complete builder projects experience that:
- Displays projects from Sanity CMS with visual editing
- Shows status badges (Now Selling, Coming Soon, Sold Out)
- Displays starting prices and product types
- Captures leads through multi-step registration forms
- Syncs registrations to BoldTrail CRM
- Supports 5+ projects without code changes
- Follows Vertical Slice Architecture

## Solution Statement

Create a vertical slice feature at `apps/newhomeshow/app/(features)/builder-projects/` that:

1. **Sanity CMS Package** (`packages/sanity`): Shared Sanity client, schemas, and GROQ queries
2. **Project Listing Page** (`page.tsx`): Grid of project cards fetched from Sanity CMS
3. **Project Detail Pages** (`[slug]/page.tsx`): Full project information with image gallery
4. **Registration Survey** (`[slug]/register/page.tsx`): Multi-step form for lead capture
5. **Specialized Pages**: Quick Closings, Assignments, Promotions, Connect with Sales
6. **UI Components**: ProjectCard, ProjectGrid, RegistrationSurvey in `@repo/ui`
7. **CRM Integration**: Lead capture synced to BoldTrail with quality scoring

This approach uses existing patterns (PropertyCard, PropertySurvey) while adding CMS capabilities for content management.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**:
- `packages/sanity/` (new package - Sanity client, schemas, queries)
- `packages/ui/src/projects/` (new - ProjectCard, ProjectGrid, RegistrationSurvey)
- `packages/types/src/project.ts` (extend BuilderProject interface)
- `apps/newhomeshow/app/(features)/builder-projects/` (new vertical slice)
- `apps/newhomeshow/app/api/register/` (new - registration API)

**Dependencies**:
- `next-sanity` - Sanity CMS client for Next.js
- `@sanity/image-url` - Image URL builder
- `@repo/ui` - PropertyCard, PropertySurvey as templates
- `@repo/types` - BuilderProject type (exists, needs extension)
- `@repo/crm` - BoldTrail client for lead capture
- `@repo/chatbot` - Lead quality scoring patterns

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Type Definitions (Source):**

- `packages/types/src/property.ts` (lines 26-40) - Existing BuilderProject interface
  - **Why**: Base type to extend with CMS-specific fields
  - **Key fields**: id, slug, name, status, city, startingPrice, propertyTypes
  ```typescript
  export interface BuilderProject {
    id: string
    slug: string
    name: string
    developer: string
    status: 'coming-soon' | 'selling' | 'sold-out'
    address: string
    city: string
    startingPrice: number
    closingDate: string
    propertyTypes: Property['propertyType'][]
    images: string[]
    features: string[]
    description: string
  }
  ```

**UI Components (Templates):**

- `packages/ui/src/properties/PropertyCard.tsx` (entire file) - Template for ProjectCard
  - **Why**: Card layout, badge system, hover effects, analytics integration
  - **Pattern**: Status badges (badge-sale, badge-pending), Framer Motion animations

- `packages/ui/src/properties/PropertySurvey.tsx` (entire file) - Template for RegistrationSurvey
  - **Why**: Multi-step form pattern, sessionStorage persistence, validation
  - **Pattern**: Step-by-step questions, progress indicator, results handling

- `packages/ui/src/properties/PropertyGrid.tsx` (entire file) - Template for ProjectGrid
  - **Why**: Responsive grid layout with empty state
  - **Pattern**: 1→2→3→4 column responsive grid

**Data Fetching Patterns:**

- `apps/sri-collective/lib/data.ts` (lines 8-45) - Data fetching with fallback
  - **Why**: Pattern for API calls with graceful degradation
  - **Pattern**: Try API first, fallback to mock data

- `apps/sri-collective/app/api/contact/route.ts` (entire file) - Lead capture API
  - **Why**: Pattern for API route with BoldTrail integration
  - **Pattern**: Edge Runtime, structured logging, error handling

**Lead Capture Patterns:**

- `packages/chatbot/src/tools/create-contact.ts` (lines 100-200) - Lead quality scoring
  - **Why**: Algorithm for scoring lead quality (hot/warm/cold)
  - **Pattern**: Hashtag system for CRM organization

**Navigation:**

- `apps/newhomeshow/app/layout.tsx` (lines 15-25) - Header config
  - **Why**: Where to add new navigation tabs
  - **Pattern**: HeaderConfig with navigation array

### New Files to Create

**Sanity Package:**
- `packages/sanity/package.json` - Package configuration
- `packages/sanity/src/client.ts` - Sanity client instance
- `packages/sanity/src/schemas/builderProject.ts` - Project schema
- `packages/sanity/src/schemas/productType.ts` - Product type schema
- `packages/sanity/src/schemas/index.ts` - Schema exports
- `packages/sanity/src/queries/projects.ts` - GROQ queries
- `packages/sanity/src/image.ts` - Image URL builder
- `packages/sanity/src/index.ts` - Package exports

**UI Components:**
- `packages/ui/src/projects/ProjectCard.tsx` - Project card component
- `packages/ui/src/projects/ProjectGrid.tsx` - Project grid layout
- `packages/ui/src/projects/RegistrationSurvey.tsx` - Multi-step registration form
- `packages/ui/src/projects/index.ts` - Exports

**Types:**
- `packages/types/src/project.ts` - Extended project types for CMS

**Vertical Slice:**
- `apps/newhomeshow/app/(features)/builder-projects/page.tsx` - Projects listing
- `apps/newhomeshow/app/(features)/builder-projects/loading.tsx` - Loading skeleton
- `apps/newhomeshow/app/(features)/builder-projects/[slug]/page.tsx` - Project detail
- `apps/newhomeshow/app/(features)/builder-projects/[slug]/loading.tsx` - Detail loading
- `apps/newhomeshow/app/(features)/builder-projects/[slug]/register/page.tsx` - Registration

**Specialized Pages:**
- `apps/newhomeshow/app/(features)/quick-closings/page.tsx` - Quick closing inventory
- `apps/newhomeshow/app/(features)/assignments/page.tsx` - Assignment listings
- `apps/newhomeshow/app/(features)/promotions/page.tsx` - Current promotions
- `apps/newhomeshow/app/(features)/connect-with-sales/page.tsx` - Sales contact page

**API Routes:**
- `apps/newhomeshow/app/api/register/route.ts` - Registration endpoint
- `apps/newhomeshow/app/api/revalidate/route.ts` - Sanity webhook revalidation

**Data:**
- `apps/newhomeshow/lib/projects.ts` - Project data fetching functions
- `apps/newhomeshow/data/mock-projects.json` - Mock data for development

### Relevant Documentation

**Sanity CMS:**
- [next-sanity Documentation](https://github.com/sanity-io/next-sanity)
- [Sanity Schema Types](https://www.sanity.io/docs/schema-types)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Sanity TypeGen](https://www.sanity.io/docs/sanity-typegen)
- [Webhook Integration](https://www.sanity.io/docs/webhooks)

**Internal Reference:**
- `PRPs/ai_docs/sanity-nextjs-integration.md` - Sanity integration patterns

### Patterns to Follow

**Server Component Data Fetching:**
```typescript
// apps/newhomeshow/app/(features)/builder-projects/page.tsx
import { getAllProjects } from '@/lib/projects'

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <div>
      <ProjectGrid projects={projects} />
    </div>
  )
}
```

**Sanity GROQ Query Pattern:**
```typescript
// packages/sanity/src/queries/projects.ts
import { groq } from 'next-sanity'

export const allProjectsQuery = groq`
  *[_type == "builderProject"] | order(status asc, name asc) {
    _id,
    name,
    "slug": slug.current,
    status,
    intersection,
    city,
    startingPrice,
    "featuredImage": featuredImage.asset->url,
    productTypes[]-> {
      name,
      priceRange { min, max }
    }
  }
`
```

**Multi-Step Survey Pattern (from PropertySurvey):**
```typescript
const [step, setStep] = useState(1)
const [answers, setAnswers] = useState<SurveyAnswers>({})

const handleNext = (answer: string) => {
  setAnswers(prev => ({ ...prev, [currentQuestion.key]: answer }))
  if (step < totalSteps) {
    setStep(step + 1)
  } else {
    handleSubmit()
  }
}
```

**Lead Quality Scoring (from create-contact.ts):**
```typescript
function calculateLeadQuality(data: RegistrationData): 'hot' | 'warm' | 'cold' {
  let score = 0

  if (data.timeline === 'immediately' || data.timeline === '1-3-months') score += 3
  if (data.budget && data.budget >= 800000) score += 2
  if (data.phone) score += 1

  if (score >= 4) return 'hot'
  if (score >= 2) return 'warm'
  return 'cold'
}
```

**Logging Pattern:**
```typescript
console.log('[api.register.success]', {
  project: slug,
  leadQuality,
  crmId: contact.id
})
```

---

## IMPLEMENTATION PLAN

### Phase 1: Sanity CMS Package Setup

Create shared Sanity package with client, schemas, and queries.

**Tasks:**
1. Create `packages/sanity/` directory structure
2. Set up Sanity client with environment configuration
3. Define builderProject schema with all required fields
4. Define productType schema for townhomes, detached, etc.
5. Create GROQ queries for listing and detail pages
6. Add image URL builder utility
7. Export package from `@repo/sanity`
8. Add Sanity environment variables to newhomeshow

**Goal**: Sanity package is importable as `@repo/sanity` with typed queries.

### Phase 2: Extended Types & UI Components

Extend BuilderProject type and create UI components.

**Tasks:**
1. Create `packages/types/src/project.ts` with extended types
2. Create `ProjectCard` component based on PropertyCard template
3. Create `ProjectGrid` component with responsive layout
4. Create `RegistrationSurvey` multi-step form component
5. Add status badge variants (Now Selling, Coming Soon, Sold Out)
6. Export new components from `@repo/ui`

**Goal**: UI components ready for use in vertical slice pages.

### Phase 3: Builder Projects Vertical Slice

Create the main projects listing and detail pages.

**Tasks:**
1. Create projects listing page at `/builder-projects`
2. Create project detail page at `/builder-projects/[slug]`
3. Add loading skeletons for both pages
4. Implement data fetching with Sanity client
5. Add mock data fallback for development
6. Create image gallery component for detail page
7. Add SEO metadata for all pages

**Goal**: Users can browse projects and view details.

### Phase 4: Registration Survey & CRM Integration

Implement lead capture flow.

**Tasks:**
1. Create registration page at `/builder-projects/[slug]/register`
2. Implement multi-step survey (name, email, phone, budget, timeline)
3. Create `/api/register` endpoint
4. Integrate with BoldTrail CRM for lead creation
5. Implement lead quality scoring
6. Add success/error states
7. Add analytics tracking for conversions

**Goal**: Registrations captured and synced to CRM.

### Phase 5: Specialized Pages & Navigation

Add Quick Closings, Assignments, Promotions, Connect with Sales pages.

**Tasks:**
1. Create Quick Closings page with filtered projects
2. Create Assignments page (placeholder for future data)
3. Create Promotions page with current offers
4. Create Connect with Sales page with contact form
5. Update navigation in layout.tsx
6. Add header navigation links

**Goal**: All navigation tabs functional with appropriate content.

### Phase 6: Sanity Webhook & Revalidation

Set up content revalidation when CMS updates.

**Tasks:**
1. Create `/api/revalidate` webhook endpoint
2. Configure Sanity webhook to trigger on changes
3. Implement tag-based revalidation
4. Test content update flow

**Goal**: CMS changes reflect on site within seconds.

---

## STEP-BY-STEP TASKS

### CREATE packages/sanity/package.json
- **IMPLEMENT**: Package configuration for Sanity CMS
- **PATTERN**:
  ```json
  {
    "name": "@repo/sanity",
    "version": "0.1.0",
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "./queries": {
        "types": "./dist/queries/index.d.ts",
        "default": "./dist/queries/index.js"
      }
    },
    "scripts": {
      "build": "tsc",
      "dev": "tsc --watch"
    },
    "dependencies": {
      "next-sanity": "^9.0.0",
      "@sanity/image-url": "^1.0.0"
    },
    "devDependencies": {
      "typescript": "^5.7.0"
    }
  }
  ```
- **VALIDATE**: `npm install` from root

### CREATE packages/sanity/src/client.ts
- **IMPLEMENT**: Sanity client instance
- **PATTERN**:
  ```typescript
  import { createClient } from 'next-sanity'

  export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: process.env.NODE_ENV === 'production',
  })
  ```
- **VALIDATE**: `npm run type-check`

### CREATE packages/sanity/src/schemas/builderProject.ts
- **IMPLEMENT**: Sanity schema for builder projects
- **INCLUDE**: All fields from extended BuilderProject type
- **FIELDS**:
  - name (string, required)
  - slug (slug, required)
  - status (string selection: coming-soon, selling, sold-out)
  - intersection (string)
  - city (string)
  - startingPrice (number)
  - featuredImage (image with hotspot)
  - gallery (array of images)
  - productTypes (array of references to productType)
  - features (array of strings)
  - description (text)
  - closingDate (date)
- **PATTERN**: Follow defineType/defineField pattern from Sanity v3
- **VALIDATE**: Schema compiles without errors

### CREATE packages/sanity/src/schemas/productType.ts
- **IMPLEMENT**: Sanity schema for product types (Townhomes, Detached, etc.)
- **FIELDS**:
  - name (string, required)
  - priceRange (object with min/max)
  - sqftRange (object with min/max)
  - features (array of strings)
- **VALIDATE**: Schema compiles without errors

### CREATE packages/sanity/src/queries/projects.ts
- **IMPLEMENT**: GROQ queries for projects
- **QUERIES**:
  - `allProjectsQuery` - All projects with essential fields
  - `projectBySlugQuery` - Single project with full details
  - `projectsByStatusQuery` - Filter by status
  - `quickClosingsQuery` - Projects with quick closing dates
- **PATTERN**: Use groq template literal from next-sanity
- **VALIDATE**: `npm run type-check`

### CREATE packages/types/src/project.ts
- **IMPLEMENT**: Extended project types for CMS
- **EXTEND**: BuilderProject interface with:
  ```typescript
  export interface CMSBuilderProject extends BuilderProject {
    _id: string                    // Sanity document ID
    intersection: string           // e.g., "Whitevale Rd. & Brock Rd."
    featuredImage: string          // URL from Sanity
    gallery: string[]              // Gallery image URLs
    productTypes: ProductType[]    // Referenced product types
  }

  export interface ProductType {
    name: string                   // "Townhomes", "Detached", etc.
    priceRange: {
      min: number
      max: number
    }
    sqftRange?: {
      min: number
      max: number
    }
    features?: string[]
  }

  export interface RegistrationData {
    projectSlug: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    budgetRange: string
    timeline: string
    source: string
  }
  ```
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/projects/ProjectCard.tsx
- **IMPLEMENT**: Project card component for grid display
- **BASE ON**: PropertyCard.tsx template
- **INCLUDE**:
  - Status badge (Now Selling = green, Coming Soon = blue, Sold Out = gray)
  - Project name prominently displayed
  - Intersection location
  - Product types list (Townhomes, Detached)
  - Starting price (formatPrice utility)
  - Register CTA button
  - Hover effects with Framer Motion
- **PROPS**:
  ```typescript
  interface ProjectCardProps {
    project: CMSBuilderProject
    onRegisterClick?: (slug: string) => void
  }
  ```
- **PATTERN**: Follow PropertyCard hover animations and badge styles
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/projects/RegistrationSurvey.tsx
- **IMPLEMENT**: Multi-step registration form
- **BASE ON**: PropertySurvey.tsx template
- **STEPS**:
  1. Name collection (firstName, lastName)
  2. Contact info (email, phone optional)
  3. Budget range (dropdown: Under $500K, $500K-$750K, $750K-$1M, $1M-$1.5M, Over $1.5M)
  4. Timeline (dropdown: Immediately, 1-3 months, 3-6 months, 6-12 months, Just browsing)
  5. Confirmation
- **INCLUDE**:
  - Progress indicator
  - Back button
  - Form validation with Zod
  - Submit to /api/register
  - Success state with confirmation message
- **VALIDATE**: `npm run type-check`

### CREATE apps/newhomeshow/app/(features)/builder-projects/page.tsx
- **IMPLEMENT**: Projects listing page (Server Component)
- **IMPORTS**:
  ```typescript
  import { Metadata } from 'next'
  import { getAllProjects } from '@/lib/projects'
  import { ProjectGrid } from '@repo/ui'
  ```
- **INCLUDE**:
  - Hero section with title and description
  - ProjectGrid with fetched projects
  - Filter by status (optional)
  - Empty state handling
- **SEO**:
  ```typescript
  export const metadata: Metadata = {
    title: 'Pre-Construction Homes | NewHomeShow',
    description: 'Browse our selection of new pre-construction homes and developments in the Greater Toronto Area',
  }
  ```
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/app/(features)/builder-projects/[slug]/page.tsx
- **IMPLEMENT**: Project detail page (Server Component)
- **IMPORTS**:
  ```typescript
  import { Metadata } from 'next'
  import { notFound } from 'next/navigation'
  import { getProjectBySlug } from '@/lib/projects'
  ```
- **INCLUDE**:
  - Breadcrumb navigation
  - Featured image/gallery
  - Project details (name, status, location, price)
  - Product types with price ranges
  - Features list
  - Register CTA linking to /builder-projects/[slug]/register
  - Map/location section (optional)
- **DYNAMIC METADATA**:
  ```typescript
  export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const project = await getProjectBySlug(slug)
    // ...
  }
  ```
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/app/(features)/builder-projects/[slug]/register/page.tsx
- **IMPLEMENT**: Registration page with survey form
- **PATTERN**: Client component with RegistrationSurvey
- **INCLUDE**:
  - Project context (name, image)
  - RegistrationSurvey component
  - Form submission to /api/register
  - Success redirect or confirmation
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/app/api/register/route.ts
- **IMPLEMENT**: Registration API endpoint
- **PATTERN**: Follow apps/sri-collective/app/api/contact/route.ts
- **INCLUDE**:
  - Request validation with Zod
  - Lead quality scoring
  - BoldTrail CRM integration
  - Hashtag assignment (#pre-construction, #project-name)
  - Structured logging
  - Error handling
- **EXAMPLE**:
  ```typescript
  import { NextResponse } from 'next/server'
  import { BoldTrailClient } from '@repo/crm'
  import { z } from 'zod'

  const registrationSchema = z.object({
    projectSlug: z.string(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    budgetRange: z.string(),
    timeline: z.string(),
  })

  export async function POST(req: Request) {
    try {
      const body = await req.json()
      const data = registrationSchema.parse(body)

      const crm = new BoldTrailClient()
      const contact = await crm.createContact({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        source: `NewHomeShow - ${data.projectSlug}`,
        notes: `Budget: ${data.budgetRange}, Timeline: ${data.timeline}`,
      })

      console.log('[api.register.success]', {
        project: data.projectSlug,
        crmId: contact.id
      })

      return NextResponse.json({ success: true, id: contact.id })
    } catch (error) {
      console.error('[api.register.failed]', { error })
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      )
    }
  }
  ```
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/app/(features)/quick-closings/page.tsx
- **IMPLEMENT**: Quick closings page with filtered projects
- **PATTERN**: Server Component fetching projects with upcoming closing dates
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/app/(features)/assignments/page.tsx
- **IMPLEMENT**: Assignments page (placeholder/coming soon)
- **PATTERN**: Static page with contact CTA
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/app/(features)/promotions/page.tsx
- **IMPLEMENT**: Promotions page with current offers
- **PATTERN**: Server Component fetching promotion content from Sanity
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/app/(features)/connect-with-sales/page.tsx
- **IMPLEMENT**: Connect with sales page with contact form
- **PATTERN**: Client component with form submission
- **INCLUDE**: Phone, email, office address, contact form
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### UPDATE apps/newhomeshow/app/layout.tsx
- **ADD**: Navigation tabs for new pages
- **UPDATE**: headerConfig.navigation array
- **PATTERN**:
  ```typescript
  const headerConfig: HeaderConfig = {
    siteName: 'NewHomeShow',
    navigation: [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/builder-projects' },
      { label: 'Quick Closings', href: '/quick-closings' },
      { label: 'Assignments', href: '/assignments' },
      { label: 'Promotions', href: '/promotions' },
      { label: 'Connect', href: '/connect-with-sales' },
    ],
  }
  ```
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

### CREATE apps/newhomeshow/data/mock-projects.json
- **IMPLEMENT**: Mock project data for development
- **INCLUDE**: Seatonville project with all fields populated
- **DATA**:
  ```json
  [
    {
      "id": "seatonville",
      "slug": "seatonville",
      "name": "Seatonville",
      "developer": "Builder",
      "status": "selling",
      "intersection": "Whitevale Rd. & Brock Rd.",
      "city": "Pickering",
      "startingPrice": 844990,
      "closingDate": "2025-12-01",
      "featuredImage": "/images/projects/seatonville-hero.jpg",
      "gallery": [],
      "productTypes": [
        {
          "name": "Townhomes",
          "priceRange": { "min": 844990, "max": 1009990 }
        },
        {
          "name": "Detached",
          "priceRange": { "min": 999990, "max": 1279990 }
        }
      ],
      "features": [
        "Contemporary & Modern Farmhouse designs",
        "7 min to Hwy 407",
        "11 min to Pickering GO Station",
        "30 min to Downtown Toronto"
      ],
      "description": "A new community in Pickering offering townhomes and detached homes with contemporary and modern farmhouse designs."
    }
  ]
  ```
- **VALIDATE**: JSON syntax is valid

### CREATE apps/newhomeshow/app/api/revalidate/route.ts
- **IMPLEMENT**: Sanity webhook revalidation endpoint
- **PATTERN**: Parse webhook body, validate signature, revalidate tags
- **INCLUDE**:
  - Signature validation with SANITY_WEBHOOK_SECRET
  - Tag-based revalidation (projects, project-[slug])
  - Logging
- **VALIDATE**: `npm run type-check --filter=newhomeshow`

---

## TESTING STRATEGY

### Unit Tests

**Scope**: Utility functions and form validation
**Framework**: Jest + ts-jest
**Location**: `packages/sanity/src/__tests__/`, `packages/ui/src/projects/__tests__/`

- GROQ query syntax validation
- Registration form Zod schema validation
- Lead quality scoring algorithm
- formatPrice utility with large numbers

### Integration Tests

**Scope**: API routes and data fetching
**Location**: `apps/newhomeshow/app/api/__tests__/`

- Registration API creates contact in CRM
- Revalidation webhook triggers cache invalidation
- Data fetching falls back to mock data

### Edge Cases

- Project with missing optional fields (no gallery, no features)
- Registration with minimal data (no phone)
- Invalid project slug (404 handling)
- Sanity API unavailable (fallback to mock)
- Registration form validation errors
- Very long project names/descriptions
- Price formatting for millions
- Mobile responsive layout

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# Lint all code
npm run lint
```
**Expected**: No ESLint errors

```bash
# Type check all packages
npm run type-check
```
**Expected**: No TypeScript errors

### Level 2: Build Verification

```bash
# Build the sanity package
npm run build --filter=@repo/sanity
```
**Expected**: Package builds successfully

```bash
# Build the newhomeshow app
npm run build --filter=newhomeshow
```
**Expected**: Build completes without errors

### Level 3: Development Testing

```bash
# Start dev server
npm run dev --filter=newhomeshow
```
**Expected**: Server starts on http://localhost:3000

### Level 4: Manual Validation

**Projects Listing Page:**
1. Navigate to http://localhost:3000/builder-projects
2. Verify projects grid displays
3. Check project cards show: name, status badge, intersection, product types, price, Register button
4. Test responsive layout on mobile

**Project Detail Page:**
1. Click on project card
2. Verify navigation to /builder-projects/[slug]
3. Check all project details display
4. Verify product types with price ranges
5. Test Register CTA button

**Registration Flow:**
1. Click Register on project detail
2. Complete multi-step form
3. Verify validation on required fields
4. Submit registration
5. Check BoldTrail CRM for new contact
6. Verify success confirmation

**Navigation:**
1. Verify all nav links work
2. Test Quick Closings page
3. Test Assignments page
4. Test Promotions page
5. Test Connect with Sales page

---

## ACCEPTANCE CRITERIA

- [ ] Projects listing page displays all projects from CMS/mock data
- [ ] Project cards show: name, status badge, intersection, product types, starting price
- [ ] Status badges correctly colored (Now Selling = green, Coming Soon = blue)
- [ ] Project detail page shows full information with image gallery
- [ ] Registration form collects: name, email, phone (optional), budget, timeline
- [ ] Registrations sync to BoldTrail CRM with proper tags
- [ ] Lead quality scoring assigns hot/warm/cold ratings
- [ ] Navigation includes all new pages
- [ ] Quick Closings page filters by closing date
- [ ] All pages responsive on mobile
- [ ] Loading skeletons display during data fetching
- [ ] 404 page for invalid project slugs
- [ ] Sanity webhook triggers revalidation
- [ ] All validation commands pass with zero errors
- [ ] No TypeScript `any` types

---

## COMPLETION CHECKLIST

- [ ] Sanity package created with client, schemas, queries
- [ ] Extended project types defined
- [ ] ProjectCard component created
- [ ] ProjectGrid component created
- [ ] RegistrationSurvey component created
- [ ] Projects listing page functional
- [ ] Project detail page functional
- [ ] Registration flow complete with CRM sync
- [ ] Quick Closings page created
- [ ] Assignments page created
- [ ] Promotions page created
- [ ] Connect with Sales page created
- [ ] Navigation updated with all links
- [ ] Mock data includes Seatonville project
- [ ] Sanity webhook revalidation working
- [ ] All validation commands pass
- [ ] Mobile responsive design verified

---

## NOTES

### Design Decisions

**Why Sanity CMS over alternatives?**
- Visual editing for non-technical users
- Real-time content updates
- Excellent Next.js integration via next-sanity
- GROQ query language is powerful and flexible
- Already mentioned in CLAUDE.md as planned CMS

**Why separate packages/sanity package?**
- Shared across both apps if needed
- Follows monorepo best practices
- Isolates CMS configuration from app code
- Enables independent versioning

**Why multi-step registration over single form?**
- Better user experience (less overwhelming)
- Higher completion rates
- Matches PropertySurvey existing pattern
- Allows collecting more data without friction

**Why client-side form instead of Server Action?**
- Multi-step state management requires client component
- Better UX with immediate validation
- Progress persistence with sessionStorage
- Matches existing PropertySurvey pattern

### Trade-offs

**Mock Data in Development:**
- **Pro**: Development works without Sanity setup
- **Pro**: Faster iteration during UI development
- **Con**: Need to maintain sync with CMS schema
- **Decision**: Essential for dev experience, worth maintenance cost

**Product Types as References vs Embedded:**
- **Pro of References**: Reusable across projects
- **Con of References**: Extra query complexity
- **Decision**: Use references for scalability with 5+ projects

### Seatonville Project Data

**Location**: Pickering (Whitevale Rd. & Brock Rd.)
**Status**: Now Selling
**Products**:
- Townhomes: $844,990 - $1,009,990
- Detached (30'): $999,990 - $1,154,990
- Detached (36'): $1,149,990 - $1,279,990
**Styles**: Contemporary & Modern Farmhouse
**Key Selling Points**:
- 7 min to Hwy 407
- 11 min to Pickering GO Station
- 30 min to Downtown Toronto

### Environment Variables Required

```bash
# Sanity CMS (required)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production

# Sanity API Token (for mutations/preview)
SANITY_API_TOKEN=sk...

# Webhook Secret
SANITY_WEBHOOK_SECRET=your-secret

# BoldTrail CRM (existing)
BOLDTRAIL_API_KEY=eyJ0eXAi...
```

---

## CONFIDENCE SCORE

**Score: 8/10**

**Strengths:**
- Clear existing patterns to follow (PropertyCard, PropertySurvey, data fetching)
- BuilderProject type already exists in codebase
- Well-documented Sanity integration patterns
- BoldTrail CRM integration already working

**Risks:**
- Sanity project setup requires external account creation
- Image extraction from PDFs needs manual work
- First Sanity integration in codebase (new technology)
- Navigation structure may need design review

**Mitigation:**
- Mock data allows development without Sanity initially
- Progressive implementation (basic → full CMS)
- Reference implementation in ai_docs/sanity-nextjs-integration.md

---

<!-- EOF -->
