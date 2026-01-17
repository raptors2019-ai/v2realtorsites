# PRP: Chatbot Tools Site Integration

## Summary

Transform the chatbot from an inline tool executor to a site navigator that directs users to dedicated tool pages. Add a tools slider to the homepage showcasing available calculators and tools.

## Goals

1. **Homepage Tools Slider** - Visual carousel/slider showcasing available tools
2. **Dedicated Tool Pages** - Create standalone pages for each tool at `/tools/[tool-name]`
3. **Chatbot Navigation Mode** - Instead of showing tool outputs inline, navigate users to tool pages with pre-filled data
4. **Better Site Utilization** - Use the full site real estate instead of cramming everything into the chatbot widget

## Current State

- Tools exist in chatbot only (`mortgageEstimator`, `neighborhoodInfo`, `firstTimeBuyerFAQ`, `propertySearch`)
- Tool outputs are rendered inline in chat messages
- No dedicated tool pages exist
- Homepage has no tools showcase

## Implementation Plan

### Phase 1: Create Tool Pages Infrastructure

#### 1.1 Create Tools Landing Page
**File:** `apps/sri-collective/app/(features)/tools/page.tsx`

- Grid of all available tools with cards
- Each card shows: icon, title, description, CTA button
- Tools to include:
  - Mortgage Calculator
  - Affordability Estimator
  - Neighborhood Explorer
  - First-Time Buyer Guide
  - Property Search
  - Home Valuation (seller)

#### 1.2 Create Individual Tool Pages

**Mortgage Calculator:**
- Path: `/tools/mortgage-calculator`
- File: `apps/sri-collective/app/(features)/tools/mortgage-calculator/page.tsx`
- Features:
  - Full-page form with income, down payment, debts inputs
  - Visual results card (reuse ChatMortgageCard)
  - URL params for pre-filling: `?income=100000&downPayment=50000`
  - CTA to search properties in budget

**Neighborhood Explorer:**
- Path: `/tools/neighborhoods`
- File: `apps/sri-collective/app/(features)/tools/neighborhoods/page.tsx`
- Features:
  - City selector grid/dropdown
  - Detailed neighborhood info display
  - Links to properties in that area
  - URL params: `?city=Mississauga`

**First-Time Buyer Guide:**
- Path: `/tools/first-time-buyer`
- File: `apps/sri-collective/app/(features)/tools/first-time-buyer/page.tsx`
- Features:
  - FAQ accordion
  - Rebate/incentive calculator
  - Step-by-step buying process
  - Contact form for questions

**Home Valuation (Seller):**
- Path: `/tools/home-valuation`
- File: `apps/sri-collective/app/(features)/tools/home-valuation/page.tsx`
- Features:
  - Address input
  - Property details form
  - Lead capture for CMA request

### Phase 2: Homepage Tools Slider

#### 2.1 Create ToolsSlider Component
**File:** `packages/ui/src/components/ToolsSlider.tsx`

- Horizontal scrollable slider (mobile) / grid (desktop)
- Each tool card:
  - Icon (large, visually appealing)
  - Title
  - Short description
  - "Try it" button → links to tool page
- Tools to feature:
  1. Mortgage Calculator - "See what you can afford"
  2. Neighborhood Explorer - "Discover GTA areas"
  3. First-Time Buyer - "Rebates & incentives"
  4. Property Search - "Find your home"
  5. Home Valuation - "What's your home worth?"

#### 2.2 Add to Homepage
**File:** `apps/sri-collective/app/page.tsx`

- Add ToolsSlider after hero section or before/after BentoGrid
- Section title: "Tools to Help Your Journey" or similar

### Phase 3: Chatbot Navigation Mode

#### 3.1 Update Tool Behaviors in Chatbot

Instead of executing tools inline, the chatbot should:

1. **Collect necessary info** through conversation
2. **Generate a URL** with params pre-filled
3. **Navigate user** to the tool page OR show a prominent CTA

**Example Flow - Mortgage Calculator:**
```
User: "What can I afford with $120K income?"
Bot: "I can help you calculate that! Let me get a couple more details:
     - How much do you have saved for a down payment?
     - Any monthly debt payments (car, credit cards)?"
User: "$80K down, $500/month debts"
Bot: "Great! I've set up the mortgage calculator for you:
     [View Your Affordability Estimate →]"
     (Links to /tools/mortgage-calculator?income=120000&downPayment=80000&debts=500)
```

#### 3.2 Update Prompt Instructions
**File:** `packages/chatbot/src/prompts/sri-collective.ts`

Add section:
```
### TOOL NAVIGATION MODE

When users ask about tools/calculators, DON'T execute the tool inline.
Instead:
1. Gather the necessary inputs through conversation
2. Generate a link to the dedicated tool page with params
3. Encourage them to use the full tool on the page

TOOLS AND THEIR PAGES:
- Mortgage/affordability → /tools/mortgage-calculator?income=X&downPayment=Y&debts=Z
- Neighborhoods → /tools/neighborhoods?city=X
- First-time buyer → /tools/first-time-buyer
- Property search → /properties?city=X&budgetMax=Y&bedrooms=Z
- Sell home → /tools/home-valuation
```

#### 3.3 Create Navigation Tool
**File:** `packages/chatbot/src/tools/navigate-to-tool.ts`

New tool that returns a navigation CTA:
```typescript
{
  type: 'navigation',
  url: '/tools/mortgage-calculator?income=120000&downPayment=80000',
  title: 'Mortgage Calculator',
  description: 'See your full affordability breakdown',
  buttonText: 'Open Calculator'
}
```

#### 3.4 Update ChatMessages to Handle Navigation
**File:** `packages/ui/src/chatbot/ChatMessages.tsx`

- Render navigation CTAs as prominent buttons/cards
- Style them to stand out (full-width, gradient background)

### Phase 4: Shared Tool Components

#### 4.1 Extract Reusable Components
Move tool UI components to shared package:

- `packages/ui/src/tools/MortgageCalculatorForm.tsx`
- `packages/ui/src/tools/MortgageResultCard.tsx`
- `packages/ui/src/tools/NeighborhoodCard.tsx`
- `packages/ui/src/tools/FirstTimeBuyerFAQ.tsx`

These can be used both on tool pages AND potentially in chatbot for quick previews.

## File Changes Summary

### New Files
- `apps/sri-collective/app/(features)/tools/page.tsx` - Tools landing
- `apps/sri-collective/app/(features)/tools/mortgage-calculator/page.tsx`
- `apps/sri-collective/app/(features)/tools/neighborhoods/page.tsx`
- `apps/sri-collective/app/(features)/tools/first-time-buyer/page.tsx`
- `apps/sri-collective/app/(features)/tools/home-valuation/page.tsx`
- `packages/ui/src/components/ToolsSlider.tsx`
- `packages/ui/src/tools/MortgageCalculatorForm.tsx`
- `packages/ui/src/tools/NeighborhoodCard.tsx`
- `packages/chatbot/src/tools/navigate-to-tool.ts`

### Modified Files
- `apps/sri-collective/app/page.tsx` - Add ToolsSlider
- `packages/chatbot/src/prompts/sri-collective.ts` - Add navigation mode
- `packages/ui/src/chatbot/ChatMessages.tsx` - Handle navigation CTAs

## Implementation Order

1. [ ] Create `/tools` landing page with placeholder cards
2. [ ] Create ToolsSlider component
3. [ ] Add ToolsSlider to homepage
4. [ ] Create mortgage calculator page with form
5. [ ] Create neighborhoods explorer page
6. [ ] Create first-time buyer guide page
7. [ ] Create home valuation page
8. [ ] Create navigate-to-tool chatbot tool
9. [ ] Update chatbot prompt for navigation mode
10. [ ] Update ChatMessages for navigation CTAs
11. [ ] Test full flow: chatbot → tool page with params
12. [ ] Polish styling and animations

## URL Parameter Schemas

### Mortgage Calculator
```
/tools/mortgage-calculator?income={number}&downPayment={number}&debts={number}
```

### Neighborhoods
```
/tools/neighborhoods?city={string}
```

### Properties (existing)
```
/properties?cities={string}&budgetMax={number}&bedrooms={number}&propertyType={string}
```

## Success Criteria

1. Homepage shows attractive tools slider
2. Each tool has a dedicated, full-featured page
3. Chatbot navigates users to tool pages instead of inline execution
4. URL params work for pre-filling tool forms
5. Smooth UX flow from chatbot → tool page → back to chat if needed
