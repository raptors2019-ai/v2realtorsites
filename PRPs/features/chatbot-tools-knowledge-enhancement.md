# Feature: Chatbot Tools & Knowledge Enhancement

## Feature Description

Enhance the Sri Collective chatbot with new tools and knowledge systems to provide more value to users before capturing leads. This feature addresses six key areas:

1. **Fix Dream Home Survey** - Replace mock data with real IDX API calls
2. **Mortgage/Affordability Estimator Tool** - Help users understand what they can afford
3. **Neighborhood/Area Info Tool** - Provide curated GTA neighborhood information
4. **First-Time Buyer FAQ Tool** - Answer common first-time buyer questions
5. **Fix Rotating Prompts** - Remove problematic "investment advice" messaging
6. **Sell My Home Tool** - Capture seller lead information

## User Story

As a home buyer using the chatbot:
- I want to see **real property listings** when I describe my dream home
- I want to **click on property cards** and view the full listing
- I want to understand **what price range I can afford** based on my income
- I want to learn about **different GTA neighborhoods** to make informed decisions
- I want answers to **first-time buyer questions** without feeling pressured

As a real estate agent:
- I want **qualified leads** with budget information and preferences captured
- I want users to **engage with valuable content** before providing contact info
- I want leads **scored by quality** (hot/warm/cold) based on their responses

## Problem Statement

Currently, the chatbot has these gaps:

1. **Mock Data in Survey** - `ChatbotWidget.tsx:631` has `generateMockListings()` returning fake data
2. **Property Cards Not Clickable** - Cards in `SurveyListingsDisplay` don't link to property pages
3. **No "View More" Link** - Users can't go to `/properties` with filters pre-set
4. **Problematic Prompts** - Line 437 has "Looking for investment opportunities?" which implies financial advice
5. **No Mortgage Guidance** - Users with no pre-approval have no way to estimate affordability
6. **No Neighborhood Info** - Can't answer "Tell me about Mississauga" without web search

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Chatbot Tools (to enhance/create):**

```
packages/chatbot/src/tools/property-search.ts     # Already uses IDX - working
packages/chatbot/src/tools/capture-preferences.ts # Captures preferences - working
packages/chatbot/src/tools/create-contact.ts      # CRM integration - working
packages/chatbot/src/index.ts                     # Tool exports
```

**Key Pattern from property-search.ts:**
```typescript
export const propertySearchTool: CoreTool = {
  description: `Search for properties based on buyer criteria...`,
  parameters: z.object({
    city: z.string().optional().describe('City name'),
    minPrice: z.number().optional().describe('Minimum price'),
    // ... other fields with descriptions
  }),
  execute: async (params) => {
    const client = new IDXClient()
    const result = await client.searchListings(params)
    return {
      success: true,
      message: `Found ${result.total} properties`,
      listings: formattedListings,
      viewAllUrl: `/properties?city=${city}&...`,
    }
  }
}
```

**ChatbotWidget (to fix):**

```
packages/ui/src/chatbot/ChatbotWidget.tsx    # Main widget - lines 631-668 need fixing
packages/ui/src/chatbot/ChatPropertyCard.tsx # Already has Link and viewAllUrl support
packages/ui/src/chatbot/chatbot-store.ts     # Zustand store with persistence
```

**Chat API Route:**

```
apps/sri-collective/app/api/chat/route.ts    # Tool registration
```

**System Prompt:**

```
packages/chatbot/src/prompts/sri-collective.ts # Lead capture strategy
```

### New Files to Create

```
packages/chatbot/src/tools/mortgage-estimator.ts   # NEW - Affordability calculator
packages/chatbot/src/tools/neighborhood-info.ts   # NEW - Area information lookup
packages/chatbot/src/tools/first-time-buyer-faq.ts # NEW - FAQ responses
packages/chatbot/src/tools/sell-home.ts           # NEW - Seller lead capture
packages/chatbot/src/data/neighborhoods.json      # NEW - GTA neighborhood data
packages/chatbot/src/data/first-time-buyer-faq.json # NEW - FAQ content
```

---

## EXTERNAL RESEARCH FINDINGS

### Canadian Mortgage Qualification Rules (2025)

**Key Formulas:**

```typescript
// GDS/TDS Limits
const GDS_MAX = 0.39  // 39% of gross income for housing costs
const TDS_MAX = 0.44  // 44% of gross income for all debts
const STRESS_TEST_FLOOR = 5.25  // Minimum qualifying rate

// Calculate monthly payment factor (per $1,000 borrowed)
function getPaymentFactor(rate: number, years: number): number {
  const monthlyRate = rate / 100 / 12
  const numPayments = years * 12
  return (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1) * 1000
}

// Calculate stress test rate
function getStressTestRate(contractRate: number): number {
  return Math.max(contractRate + 2, STRESS_TEST_FLOOR)
}

// Calculate CMHC premium rate
function getCMHCRate(downPaymentPercent: number): number {
  if (downPaymentPercent >= 20) return 0
  if (downPaymentPercent >= 15) return 2.80
  if (downPaymentPercent >= 10) return 3.10
  return 4.00  // 5-9.99%
}

// Calculate minimum down payment
function getMinDownPayment(homePrice: number): number {
  if (homePrice >= 1500000) return homePrice * 0.20
  if (homePrice <= 500000) return homePrice * 0.05
  return (500000 * 0.05) + ((homePrice - 500000) * 0.10)
}
```

**Example Calculation:**
- Annual Income: $150,000
- Down Payment: $100,000
- Monthly Debts: $500
- GDS Limit: ($150,000 / 12) × 0.39 = $4,875/month
- TDS Limit: ($150,000 / 12) × 0.44 - $500 = $5,000/month
- Available for P+I: ~$4,500/month (after taxes/heat estimates)
- Max Mortgage at 6.5%: ~$670,000
- Max Home Price: ~$770,000

**Sources:**
- https://wowa.ca/cmhc-mortgage-rules
- https://wowa.ca/calculators/affordability
- https://www.ratehub.ca/debt-service-ratios

### Ontario First-Time Buyer Programs (2025)

| Program | Benefit | Eligibility |
|---------|---------|-------------|
| **Ontario LTT Rebate** | Up to $4,000 | Never owned home worldwide |
| **Toronto LTT Rebate** | Up to $4,475 | Toronto purchases only |
| **FHSA** | $8K/year tax-deductible, tax-free withdrawal | 18+, no home in 4 years |
| **Home Buyers' Plan** | Up to $60,000 from RRSP | First-time buyer, 15yr repayment |
| **Federal Tax Credit** | $1,500 tax credit | First-time buyer |
| **GST/HST Rebate (NEW)** | Up to $130,000 on new builds | New construction, signed after May 2025 |

**Closing Costs Breakdown (Ontario):**
- Land Transfer Tax: 0.5-2.5% (doubled in Toronto)
- Legal Fees: $1,500-$2,500
- Title Insurance: $250-$400
- Home Inspection: $500-$800
- Appraisal: $400-$600
- PST on CMHC: 8% of premium
- **Total: 2-4% of purchase price**

**Sources:**
- https://www.ontario.ca/document/land-transfer-tax
- https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html
- https://wowa.ca/calculators/first-time-home-buyer-canada

### GTA Neighborhood Data

**Research-Backed Data for 11 Cities:**

```json
{
  "Toronto": {
    "avgPrice": "$1,100,000",
    "priceRange": { "min": 450000, "max": 3000000 },
    "vibe": "Urban core with diverse neighborhoods from trendy to family-friendly",
    "transit": {
      "goStations": ["Union Station (hub)", "Exhibition", "Danforth", "Scarborough"],
      "ttc": "Full subway, streetcar, bus network",
      "commuteToUnion": "0-45 min depending on neighborhood"
    },
    "schools": ["Toronto District School Board", "Toronto Catholic DSB"],
    "topSchools": ["University of Toronto Schools", "Northern SS", "Earl Haig SS"],
    "recreation": ["High Park", "Toronto Islands", "Harbourfront Centre", "30+ community centres"],
    "attractions": ["CN Tower", "Eaton Centre", "Distillery District", "St. Lawrence Market", "Kensington Market"],
    "neighborhoods": [
      { "name": "Yorkville", "vibe": "Luxury shopping and dining", "avgPrice": "$2,500,000+" },
      { "name": "Leslieville", "vibe": "Trendy cafes and young professionals", "avgPrice": "$1,200,000" },
      { "name": "The Beaches", "vibe": "Beachfront community, family-friendly", "avgPrice": "$1,500,000" },
      { "name": "High Park", "vibe": "Green space, families", "avgPrice": "$1,300,000" },
      { "name": "North York", "vibe": "Suburban feel with urban amenities", "avgPrice": "$900,000" }
    ]
  },
  "Mississauga": {
    "avgPrice": "$1,050,000",
    "priceRange": { "min": 400000, "max": 2500000 },
    "vibe": "Canada's 6th largest city, suburban with urban pockets",
    "transit": {
      "goStations": ["Port Credit", "Clarkson", "Cooksville", "Erindale", "Streetsville"],
      "local": "MiWay bus, Hurontario LRT (opening 2024)",
      "commuteToUnion": "25-45 min via GO"
    },
    "schools": ["Peel District School Board", "Dufferin-Peel Catholic DSB"],
    "topSchools": ["John Fraser SS", "Glenforest SS", "Applewood Heights SS"],
    "recreation": ["Credit Valley Golf", "Living Arts Centre", "Riverwood Conservancy", "40+ community centres"],
    "attractions": ["Square One Shopping Centre", "Port Credit waterfront", "Celebration Square"],
    "neighborhoods": [
      { "name": "Port Credit", "vibe": "Waterfront village feel, restaurants", "avgPrice": "$1,400,000" },
      { "name": "Streetsville", "vibe": "Historic village, community events", "avgPrice": "$1,200,000" },
      { "name": "Erin Mills", "vibe": "Family-friendly, good schools", "avgPrice": "$1,100,000" },
      { "name": "Lorne Park", "vibe": "Affluent, ravine lots", "avgPrice": "$2,000,000" },
      { "name": "City Centre", "vibe": "Urban condos, walkable", "avgPrice": "$600,000" }
    ]
  },
  "Brampton": {
    "avgPrice": "$950,000",
    "priceRange": { "min": 500000, "max": 1800000 },
    "vibe": "Fast-growing, diverse, family-oriented",
    "transit": {
      "goStations": ["Bramalea", "Brampton"],
      "local": "Brampton Transit, Zum rapid transit",
      "commuteToUnion": "45-60 min via GO"
    },
    "schools": ["Peel District School Board", "Dufferin-Peel Catholic DSB"],
    "topSchools": ["Turner Fenton SS", "Heart Lake SS"],
    "recreation": ["Gage Park", "Heart Lake Conservation", "CAA Centre", "30+ community centres"],
    "attractions": ["Garden Square", "Rose Theatre", "Powerade Centre"],
    "neighborhoods": [
      { "name": "Heart Lake", "vibe": "Conservation area, nature lovers", "avgPrice": "$1,100,000" },
      { "name": "Mount Pleasant", "vibe": "New development, young families", "avgPrice": "$1,000,000" },
      { "name": "Bramalea", "vibe": "Established, diverse", "avgPrice": "$850,000" },
      { "name": "Downtown Brampton", "vibe": "Historic, revitalizing", "avgPrice": "$800,000" }
    ]
  },
  "Vaughan": {
    "avgPrice": "$1,250,000",
    "priceRange": { "min": 600000, "max": 3000000 },
    "vibe": "Affluent suburbs with TTC subway access",
    "transit": {
      "goStations": ["Rutherford", "Maple"],
      "ttc": "Line 1 extension to VMC",
      "commuteToUnion": "40-55 min via subway/GO"
    },
    "schools": ["York Region DSB", "York Catholic DSB"],
    "topSchools": ["Vaughan SS", "Thornhill SS", "Maple HS"],
    "recreation": ["Boyd Conservation Area", "Kortright Centre", "Vaughan Mills area"],
    "attractions": ["Canada's Wonderland", "Vaughan Mills mall", "Kleinburg village"],
    "neighborhoods": [
      { "name": "Thornhill", "vibe": "Established, excellent schools", "avgPrice": "$1,400,000" },
      { "name": "Woodbridge", "vibe": "Italian heritage, restaurants", "avgPrice": "$1,300,000" },
      { "name": "Maple", "vibe": "Historic main street, growing", "avgPrice": "$1,200,000" },
      { "name": "Kleinburg", "vibe": "Village feel, McMichael Gallery", "avgPrice": "$2,000,000" },
      { "name": "Vaughan Metropolitan Centre", "vibe": "New urban core, condos", "avgPrice": "$700,000" }
    ]
  },
  "Markham": {
    "avgPrice": "$1,300,000",
    "priceRange": { "min": 600000, "max": 3500000 },
    "vibe": "Tech hub, multicultural, excellent schools",
    "transit": {
      "goStations": ["Markham", "Unionville", "Centennial"],
      "local": "York Region Transit, Viva rapid",
      "commuteToUnion": "45-60 min via GO"
    },
    "schools": ["York Region DSB", "York Catholic DSB"],
    "topSchools": ["Markville SS", "Unionville HS", "Pierre Elliott Trudeau HS"],
    "recreation": ["Markham Museum", "Toogood Pond", "Frederick Chicken Festival", "25+ community centres"],
    "attractions": ["Unionville Main Street", "Pacific Mall", "Markville Mall"],
    "neighborhoods": [
      { "name": "Unionville", "vibe": "Historic village, boutiques", "avgPrice": "$1,800,000" },
      { "name": "Cornell", "vibe": "New urbanism, walkable", "avgPrice": "$1,100,000" },
      { "name": "Markham Village", "vibe": "Heritage area", "avgPrice": "$1,200,000" },
      { "name": "Thornhill (Markham)", "vibe": "Family-oriented, transit", "avgPrice": "$1,400,000" },
      { "name": "Wismer", "vibe": "New development", "avgPrice": "$1,300,000" }
    ]
  },
  "Richmond Hill": {
    "avgPrice": "$1,350,000",
    "priceRange": { "min": 700000, "max": 3000000 },
    "vibe": "Affluent, family-focused, good schools",
    "transit": {
      "goStations": ["Richmond Hill", "Langstaff", "Gormley"],
      "local": "York Region Transit, Viva",
      "commuteToUnion": "50-65 min via GO (Yonge subway extension planned)"
    },
    "schools": ["York Region DSB", "York Catholic DSB"],
    "topSchools": ["Richmond Hill HS", "Bayview SS"],
    "recreation": ["Mill Pond Park", "Richmond Green", "Oak Ridges Trail", "20+ community centres"],
    "attractions": ["Hillcrest Mall", "Richmond Hill Centre", "David Dunlap Observatory"],
    "neighborhoods": [
      { "name": "Oak Ridges", "vibe": "Nature, trails, larger lots", "avgPrice": "$1,600,000" },
      { "name": "Jefferson", "vibe": "Established, mature trees", "avgPrice": "$1,400,000" },
      { "name": "Bayview Hill", "vibe": "Luxury homes, top schools", "avgPrice": "$2,000,000" },
      { "name": "Elgin Mills", "vibe": "New development", "avgPrice": "$1,200,000" }
    ]
  },
  "Milton": {
    "avgPrice": "$1,050,000",
    "priceRange": { "min": 600000, "max": 2000000 },
    "vibe": "Fastest-growing town, young families, affordable",
    "transit": {
      "goStations": ["Milton"],
      "local": "Milton Transit",
      "commuteToUnion": "55-70 min via GO"
    },
    "schools": ["Halton DSB", "Halton Catholic DSB"],
    "topSchools": ["Craig Kielburger SS", "Milton District HS"],
    "recreation": ["Kelso Conservation Area", "Rattlesnake Point", "Milton Leisure Centre"],
    "attractions": ["Milton Mall", "Kelso/Glen Eden", "Country Heritage Park"],
    "neighborhoods": [
      { "name": "Old Milton", "vibe": "Historic downtown, walkable", "avgPrice": "$900,000" },
      { "name": "Bronte Meadows", "vibe": "New development", "avgPrice": "$1,100,000" },
      { "name": "Timberlea", "vibe": "Family-friendly, parks", "avgPrice": "$1,000,000" },
      { "name": "Willmott", "vibe": "New community, amenities", "avgPrice": "$1,050,000" }
    ]
  },
  "Oakville": {
    "avgPrice": "$1,450,000",
    "priceRange": { "min": 600000, "max": 5000000 },
    "vibe": "Affluent lakefront town, excellent schools",
    "transit": {
      "goStations": ["Oakville", "Bronte"],
      "local": "Oakville Transit",
      "commuteToUnion": "30-45 min via GO"
    },
    "schools": ["Halton DSB", "Halton Catholic DSB"],
    "topSchools": ["Oakville Trafalgar HS", "Abbey Park HS", "Appleby College (private)"],
    "recreation": ["Bronte Creek Provincial Park", "Coronation Park", "Glen Abbey Golf", "20+ community centres"],
    "attractions": ["Downtown Oakville", "Bronte Harbour", "Oakville Place Mall"],
    "neighborhoods": [
      { "name": "Old Oakville", "vibe": "Historic, lakefront estates", "avgPrice": "$3,000,000+" },
      { "name": "Bronte", "vibe": "Harbour village, restaurants", "avgPrice": "$1,500,000" },
      { "name": "Glen Abbey", "vibe": "Golf community, families", "avgPrice": "$1,600,000" },
      { "name": "River Oaks", "vibe": "Newer homes, parks", "avgPrice": "$1,200,000" },
      { "name": "Joshua Creek", "vibe": "Family-friendly, trails", "avgPrice": "$1,400,000" }
    ]
  },
  "Burlington": {
    "avgPrice": "$1,100,000",
    "priceRange": { "min": 500000, "max": 3000000 },
    "vibe": "Lakefront city with small-town feel",
    "transit": {
      "goStations": ["Burlington", "Appleby", "Aldershot"],
      "local": "Burlington Transit",
      "commuteToUnion": "45-55 min via GO"
    },
    "schools": ["Halton DSB", "Halton Catholic DSB"],
    "topSchools": ["Nelson HS", "M.M. Robinson HS"],
    "recreation": ["Royal Botanical Gardens", "Spencer Smith Park", "Mount Nemo", "Burlington Waterfront Trail"],
    "attractions": ["Downtown Burlington", "Mapleview Mall", "Village Square"],
    "neighborhoods": [
      { "name": "Downtown Burlington", "vibe": "Waterfront, walkable", "avgPrice": "$1,300,000" },
      { "name": "Aldershot", "vibe": "GO access, diverse housing", "avgPrice": "$900,000" },
      { "name": "Roseland", "vibe": "Mature, ravine lots", "avgPrice": "$1,400,000" },
      { "name": "Tyandaga", "vibe": "Golf community", "avgPrice": "$1,200,000" },
      { "name": "Millcroft", "vibe": "Family-oriented, newer", "avgPrice": "$1,100,000" }
    ]
  },
  "Hamilton": {
    "avgPrice": "$750,000",
    "priceRange": { "min": 350000, "max": 2000000 },
    "vibe": "Revitalizing steel city, arts scene, affordable",
    "transit": {
      "goStations": ["Hamilton GO Centre", "West Harbour", "Aldershot"],
      "local": "HSR, future LRT planned",
      "commuteToUnion": "60-75 min via GO"
    },
    "schools": ["Hamilton-Wentworth DSB", "Hamilton-Wentworth Catholic DSB"],
    "topSchools": ["Westdale SS", "Ancaster HS"],
    "recreation": ["Bruce Trail access", "Bayfront Park", "McMaster University", "Dundurn Castle"],
    "attractions": ["James Street North arts district", "Locke Street", "Canadian Warplane Heritage Museum"],
    "neighborhoods": [
      { "name": "Westdale", "vibe": "McMaster area, walkable", "avgPrice": "$1,000,000" },
      { "name": "Dundas", "vibe": "Small town feel, conservation", "avgPrice": "$900,000" },
      { "name": "Locke Street", "vibe": "Trendy shops, young professionals", "avgPrice": "$750,000" },
      { "name": "Ancaster", "vibe": "Affluent, larger lots", "avgPrice": "$1,200,000" },
      { "name": "Stoney Creek", "vibe": "Waterfront, diverse", "avgPrice": "$800,000" }
    ]
  },
  "Caledon": {
    "avgPrice": "$1,400,000",
    "priceRange": { "min": 800000, "max": 4000000 },
    "vibe": "Rural estate living, horse country",
    "transit": {
      "goStations": ["Bolton (planned)"],
      "local": "Limited, car-dependent",
      "commuteToUnion": "60-80 min by car"
    },
    "schools": ["Peel DSB", "Dufferin-Peel Catholic DSB"],
    "topSchools": ["Humberview SS", "Mayfield SS"],
    "recreation": ["Caledon Trailway", "Belfountain Conservation", "Forks of the Credit"],
    "attractions": ["Cheltenham Badlands", "Alton Mill Arts Centre", "Terra Cotta"],
    "neighborhoods": [
      { "name": "Bolton", "vibe": "Town centre, growing", "avgPrice": "$1,100,000" },
      { "name": "Caledon East", "vibe": "Village feel", "avgPrice": "$1,200,000" },
      { "name": "Palgrave", "vibe": "Equestrian estates", "avgPrice": "$2,500,000" },
      { "name": "Inglewood", "vibe": "Quaint village, Credit River", "avgPrice": "$1,500,000" }
    ]
  }
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Fix Dream Home Survey (HIGH PRIORITY)

**Problem:** `ChatbotWidget.tsx` uses `generateMockListings()` instead of real IDX data.

**Solution:** Replace mock data call with real IDX search via propertySearchTool pattern.

### Phase 2: Mortgage Estimator Tool (HIGH PRIORITY)

Create `mortgage-estimator.ts` with GDS/TDS calculations.

### Phase 3: Neighborhood Info Tool (MEDIUM PRIORITY)

Create `neighborhood-info.ts` with curated JSON data lookup.

### Phase 4: First-Time Buyer FAQ Tool (MEDIUM PRIORITY)

Create `first-time-buyer-faq.ts` with curated FAQ responses.

### Phase 5: Fix Rotating Prompts

Update `ChatbotWidget.tsx` line 437 to remove investment advice messaging.

### Phase 6: Sell My Home Tool (LOW PRIORITY)

Create `sell-home.ts` for seller lead capture.

---

## STEP-BY-STEP TASKS

### TASK 1: Create neighborhoods.json data file

**File:** `packages/chatbot/src/data/neighborhoods.json`

**Action:** Create the JSON file with all 11 GTA cities data (use the research JSON above)

**Validate:** `npm run type-check`

---

### TASK 2: Create first-time-buyer-faq.json data file

**File:** `packages/chatbot/src/data/first-time-buyer-faq.json`

**Content:**
```json
{
  "home-buying-process": {
    "question": "What are the steps to buying a home in Ontario?",
    "answer": "The home buying process in Ontario typically takes 3-6 months...",
    "steps": [
      "Get mortgage pre-approval (shows you're a serious buyer)",
      "Find a real estate agent (their commission is paid by seller)",
      "Search for homes and attend viewings",
      "Make an offer (Agreement of Purchase and Sale)",
      "Complete conditions (financing, inspection)",
      "Closing day (sign documents, get keys)"
    ]
  },
  "closing-costs": {
    "question": "What are closing costs and how much should I budget?",
    "answer": "Closing costs in Ontario typically range from 1.5-4% of purchase price...",
    "breakdown": {
      "landTransferTax": "0.5-2.5% (doubled in Toronto)",
      "legalFees": "$1,500-$2,500",
      "titleInsurance": "$250-$400",
      "homeInspection": "$500-$800",
      "appraisal": "$400-$600",
      "movingCosts": "$500-$2,000"
    }
  },
  "first-time-buyer-incentives": {
    "question": "What incentives are available for first-time buyers?",
    "answer": "First-time buyers in Ontario can save thousands through various programs...",
    "programs": [
      {
        "name": "Ontario Land Transfer Tax Rebate",
        "benefit": "Up to $4,000",
        "eligibility": "Never owned a home worldwide"
      },
      {
        "name": "Toronto Municipal LTT Rebate",
        "benefit": "Up to $4,475 additional",
        "eligibility": "Toronto purchases only"
      },
      {
        "name": "First Home Savings Account (FHSA)",
        "benefit": "$8,000/year tax-deductible, tax-free withdrawal",
        "eligibility": "18+, no home in past 4 years"
      },
      {
        "name": "Home Buyers' Plan (HBP)",
        "benefit": "Withdraw up to $60,000 from RRSP",
        "eligibility": "First-time buyer, 15-year repayment"
      },
      {
        "name": "Federal Tax Credit",
        "benefit": "$1,500 tax credit",
        "eligibility": "First-time home buyers"
      }
    ],
    "totalPotentialSavings": "Up to $10,000+ in Toronto"
  },
  "pre-approval": {
    "question": "Do I need mortgage pre-approval?",
    "answer": "Yes! Pre-approval is highly recommended before house hunting...",
    "benefits": [
      "Know your exact budget before searching",
      "Sellers take your offer more seriously",
      "Lock in interest rate for 90-120 days",
      "Identify any credit issues early"
    ]
  },
  "down-payment": {
    "question": "How much down payment do I need?",
    "answer": "Minimum down payment in Canada depends on home price...",
    "requirements": {
      "under500k": "5% minimum",
      "500kTo1M": "5% of first $500K + 10% of remainder",
      "1MTo1.5M": "5% of first $500K + 10% of remainder",
      "over1.5M": "20% minimum (no CMHC insurance)"
    },
    "example": "For a $750,000 home: $25,000 + $25,000 = $50,000 minimum"
  }
}
```

**Validate:** `npm run type-check`

---

### TASK 3: Create mortgage-estimator.ts tool

**File:** `packages/chatbot/src/tools/mortgage-estimator.ts`

**Code:**
```typescript
import { z } from 'zod'
import type { CoreTool } from 'ai'

const GDS_MAX = 0.39
const TDS_MAX = 0.44
const STRESS_TEST_FLOOR = 5.25
const DEFAULT_PROPERTY_TAX_RATE = 0.012 // 1.2% annually
const DEFAULT_HEATING_MONTHLY = 150

function getPaymentFactor(rate: number, years: number): number {
  const monthlyRate = rate / 100 / 12
  const numPayments = years * 12
  return (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1) * 1000
}

function getStressTestRate(contractRate: number): number {
  return Math.max(contractRate + 2, STRESS_TEST_FLOOR)
}

function getCMHCRate(downPaymentPercent: number): number {
  if (downPaymentPercent >= 20) return 0
  if (downPaymentPercent >= 15) return 0.028
  if (downPaymentPercent >= 10) return 0.031
  return 0.04
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const mortgageEstimatorTool: CoreTool = {
  description: `Estimate maximum affordable home price based on income and finances.
Use this tool when user asks about affordability, budget, or says they're not pre-approved.
Provides rough estimate with disclaimer - not financial advice.
After showing estimate, offer to search for properties in that price range.`,

  parameters: z.object({
    annualIncome: z.number()
      .describe('Total annual household income before taxes'),
    downPayment: z.number()
      .describe('Amount saved for down payment'),
    monthlyDebts: z.number().optional().default(0)
      .describe('Monthly debt payments (car, loans, credit cards)'),
    currentMortgageRate: z.number().optional().default(4.5)
      .describe('Current mortgage rate estimate (default 4.5%)'),
  }),

  execute: async ({ annualIncome, downPayment, monthlyDebts = 0, currentMortgageRate = 4.5 }) => {
    console.error('[chatbot.mortgageEstimator.execute]', {
      annualIncome, downPayment, monthlyDebts, currentMortgageRate
    })

    try {
      const monthlyIncome = annualIncome / 12
      const stressTestRate = getStressTestRate(currentMortgageRate)

      // Calculate max housing cost (GDS)
      const maxHousingGDS = monthlyIncome * GDS_MAX

      // Calculate max housing cost (TDS)
      const maxHousingTDS = (monthlyIncome * TDS_MAX) - monthlyDebts

      // Use the lower of the two
      const maxHousingCost = Math.min(maxHousingGDS, maxHousingTDS)

      // Estimate property taxes and heating
      // We'll iterate since taxes depend on home price
      let maxHomePrice = 0
      let maxMortgage = 0
      let monthlyPayment = 0

      // Binary search for max home price
      let low = downPayment
      let high = downPayment + 2000000

      while (high - low > 1000) {
        const mid = (low + high) / 2
        const mortgage = mid - downPayment

        const monthlyTax = (mid * DEFAULT_PROPERTY_TAX_RATE) / 12
        const availableForPI = maxHousingCost - monthlyTax - DEFAULT_HEATING_MONTHLY

        const paymentFactor = getPaymentFactor(stressTestRate, 25)
        const maxMortgageAtPrice = (availableForPI / paymentFactor) * 1000

        if (mortgage <= maxMortgageAtPrice) {
          low = mid
        } else {
          high = mid
        }
      }

      maxHomePrice = Math.floor(low / 1000) * 1000 // Round to nearest $1000
      maxMortgage = maxHomePrice - downPayment

      // Calculate actual monthly payment at current rate
      const paymentFactor = getPaymentFactor(currentMortgageRate, 25)
      monthlyPayment = (maxMortgage / 1000) * paymentFactor

      // Calculate CMHC if applicable
      const downPaymentPercent = (downPayment / maxHomePrice) * 100
      const cmhcRate = getCMHCRate(downPaymentPercent)
      const cmhcPremium = maxMortgage * cmhcRate
      const totalMortgage = maxMortgage + cmhcPremium

      // Calculate property taxes
      const monthlyPropertyTax = (maxHomePrice * DEFAULT_PROPERTY_TAX_RATE) / 12

      const result = {
        success: true,
        estimate: {
          maxHomePrice,
          maxMortgage,
          totalMortgageWithCMHC: cmhcPremium > 0 ? totalMortgage : maxMortgage,
          downPayment,
          downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
          cmhcPremium: cmhcPremium > 0 ? cmhcPremium : null,
          monthlyPayment: Math.round(monthlyPayment),
          monthlyPropertyTax: Math.round(monthlyPropertyTax),
          monthlyHeating: DEFAULT_HEATING_MONTHLY,
          totalMonthlyHousing: Math.round(monthlyPayment + monthlyPropertyTax + DEFAULT_HEATING_MONTHLY),
          stressTestRate,
          gdsRatio: Math.round((maxHousingCost / monthlyIncome) * 100),
          tdsRatio: Math.round(((maxHousingCost + monthlyDebts) / monthlyIncome) * 100),
        },
        message: `Based on your income of ${formatCurrency(annualIncome)} and down payment of ${formatCurrency(downPayment)}, you could potentially afford a home up to ${formatCurrency(maxHomePrice)}.`,
        formattedSummary: `
📊 **Affordability Estimate**
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏠 **Max Home Price:** ${formatCurrency(maxHomePrice)}
💰 **Down Payment:** ${formatCurrency(downPayment)} (${Math.round(downPaymentPercent)}%)
📋 **Mortgage Amount:** ${formatCurrency(maxMortgage)}${cmhcPremium > 0 ? `\n🛡️ **CMHC Insurance:** ${formatCurrency(cmhcPremium)}` : ''}

**Monthly Costs (estimated):**
• Mortgage Payment: ${formatCurrency(monthlyPayment)}
• Property Tax: ${formatCurrency(monthlyPropertyTax)}
• Heating: ${formatCurrency(DEFAULT_HEATING_MONTHLY)}
• **Total:** ${formatCurrency(monthlyPayment + monthlyPropertyTax + DEFAULT_HEATING_MONTHLY)}/month

⚠️ *This is an estimate only, not financial advice. Actual approval depends on credit history, employment, and lender policies. Please consult a mortgage broker for accurate pre-approval.*
`.trim(),
        searchSuggestion: {
          maxPrice: maxHomePrice,
          message: `Would you like me to search for properties under ${formatCurrency(maxHomePrice)}?`
        }
      }

      console.error('[chatbot.mortgageEstimator.success]', {
        maxHomePrice: result.estimate.maxHomePrice,
        monthlyPayment: result.estimate.monthlyPayment,
      })

      return result
    } catch (error) {
      console.error('[chatbot.mortgageEstimator.error]', error)
      return {
        success: false,
        message: "I had trouble calculating the estimate. Could you provide your income and down payment again?",
        error: error instanceof Error ? error.message : 'Calculation error'
      }
    }
  }
}
```

**Validate:** `npm run type-check`

---

### TASK 4: Create neighborhood-info.ts tool

**File:** `packages/chatbot/src/tools/neighborhood-info.ts`

**Code:**
```typescript
import { z } from 'zod'
import type { CoreTool } from 'ai'
import neighborhoodsData from '../data/neighborhoods.json'

type NeighborhoodData = typeof neighborhoodsData
type CityKey = keyof NeighborhoodData

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const neighborhoodInfoTool: CoreTool = {
  description: `Get information about GTA cities and neighborhoods.
Use this tool when user asks about a specific area, city, or neighborhood.
Provides details about average prices, transit, schools, recreation, and notable neighborhoods.
Available cities: Toronto, Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Milton, Oakville, Burlington, Hamilton, Caledon.`,

  parameters: z.object({
    city: z.string().describe('City name to get information about'),
    specificNeighborhood: z.string().optional()
      .describe('Optional specific neighborhood within the city'),
  }),

  execute: async ({ city, specificNeighborhood }) => {
    console.error('[chatbot.neighborhoodInfo.execute]', { city, specificNeighborhood })

    // Normalize city name
    const normalizedCity = city.trim()
    const cityKey = Object.keys(neighborhoodsData).find(
      k => k.toLowerCase() === normalizedCity.toLowerCase()
    ) as CityKey | undefined

    if (!cityKey) {
      const availableCities = Object.keys(neighborhoodsData).join(', ')
      return {
        success: false,
        message: `I don't have detailed information about "${city}". I can tell you about: ${availableCities}.`,
        availableCities: Object.keys(neighborhoodsData),
      }
    }

    const cityData = neighborhoodsData[cityKey]

    // If specific neighborhood requested
    if (specificNeighborhood) {
      const neighborhood = cityData.neighborhoods.find(
        n => n.name.toLowerCase().includes(specificNeighborhood.toLowerCase())
      )

      if (neighborhood) {
        return {
          success: true,
          city: cityKey,
          neighborhood: neighborhood.name,
          message: `**${neighborhood.name}** in ${cityKey}:\n• Vibe: ${neighborhood.vibe}\n• Average Price: ${neighborhood.avgPrice}\n\nWould you like to see properties in ${neighborhood.name}?`,
          data: neighborhood,
          searchSuggestion: {
            city: cityKey,
            neighborhood: neighborhood.name,
          }
        }
      }
    }

    // Return full city info
    const topNeighborhoods = cityData.neighborhoods.slice(0, 4)
      .map(n => `• **${n.name}**: ${n.vibe} (avg ${n.avgPrice})`)
      .join('\n')

    const formattedInfo = `
## ${cityKey}

**Average Home Price:** ${cityData.avgPrice}
**Character:** ${cityData.vibe}

### Transit
• GO Stations: ${cityData.transit.goStations.join(', ')}
• Local Transit: ${cityData.transit.local || cityData.transit.ttc || 'Local bus service'}
• Commute to Union Station: ${cityData.transit.commuteToUnion}

### Schools
${cityData.schools.join(', ')}
Top schools: ${cityData.topSchools.slice(0, 3).join(', ')}

### Recreation & Attractions
${cityData.recreation.slice(0, 4).join(', ')}
${cityData.attractions.slice(0, 3).join(', ')}

### Popular Neighborhoods
${topNeighborhoods}

Would you like more details about a specific neighborhood, or shall I search for properties in ${cityKey}?
`.trim()

    console.error('[chatbot.neighborhoodInfo.success]', { city: cityKey })

    return {
      success: true,
      city: cityKey,
      message: formattedInfo,
      data: {
        avgPrice: cityData.avgPrice,
        priceRange: cityData.priceRange,
        vibe: cityData.vibe,
        transit: cityData.transit,
        neighborhoods: cityData.neighborhoods,
      },
      searchSuggestion: {
        city: cityKey,
        maxPrice: cityData.priceRange.max,
      }
    }
  }
}
```

**Validate:** `npm run type-check`

---

### TASK 5: Create first-time-buyer-faq.ts tool

**File:** `packages/chatbot/src/tools/first-time-buyer-faq.ts`

**Code:**
```typescript
import { z } from 'zod'
import type { CoreTool } from 'ai'
import faqData from '../data/first-time-buyer-faq.json'

type FAQKey = keyof typeof faqData

const FAQ_KEYWORDS: Record<FAQKey, string[]> = {
  'home-buying-process': ['process', 'steps', 'how to buy', 'buying process', 'start'],
  'closing-costs': ['closing costs', 'fees', 'how much', 'budget for', 'expenses'],
  'first-time-buyer-incentives': ['incentives', 'rebate', 'programs', 'savings', 'fhsa', 'hbp', 'first time'],
  'pre-approval': ['pre-approval', 'preapproval', 'pre approval', 'approved', 'mortgage approval'],
  'down-payment': ['down payment', 'downpayment', 'minimum', 'how much down', 'save for'],
}

function findBestMatch(question: string): FAQKey | null {
  const lowerQuestion = question.toLowerCase()

  let bestMatch: FAQKey | null = null
  let highestScore = 0

  for (const [key, keywords] of Object.entries(FAQ_KEYWORDS)) {
    const score = keywords.filter(kw => lowerQuestion.includes(kw)).length
    if (score > highestScore) {
      highestScore = score
      bestMatch = key as FAQKey
    }
  }

  return highestScore > 0 ? bestMatch : null
}

export const firstTimeBuyerFAQTool: CoreTool = {
  description: `Answer common first-time home buyer questions.
Use this tool when user asks about:
- Home buying process/steps
- Closing costs
- First-time buyer incentives/rebates/programs
- Pre-approval
- Down payment requirements
Provides accurate Ontario/Canada-specific information.`,

  parameters: z.object({
    question: z.string().describe('The question being asked'),
    topic: z.enum([
      'home-buying-process',
      'closing-costs',
      'first-time-buyer-incentives',
      'pre-approval',
      'down-payment',
      'general'
    ]).optional().describe('Specific topic if known'),
  }),

  execute: async ({ question, topic }) => {
    console.error('[chatbot.firstTimeBuyerFAQ.execute]', { question, topic })

    // Find matching FAQ
    const matchedTopic = topic !== 'general' && topic
      ? topic as FAQKey
      : findBestMatch(question)

    if (!matchedTopic || !faqData[matchedTopic]) {
      return {
        success: false,
        message: `That's a great question! For specific advice on "${question}", I'd recommend speaking with one of our agents who can provide personalized guidance. Would you like me to connect you with an agent?`,
        handoffSuggested: true,
      }
    }

    const faq = faqData[matchedTopic]

    let formattedResponse = `## ${faq.question}\n\n${faq.answer}\n\n`

    // Add structured content based on topic
    if ('steps' in faq && faq.steps) {
      formattedResponse += '**Steps:**\n'
      faq.steps.forEach((step: string, i: number) => {
        formattedResponse += `${i + 1}. ${step}\n`
      })
    }

    if ('breakdown' in faq && faq.breakdown) {
      formattedResponse += '\n**Cost Breakdown:**\n'
      for (const [key, value] of Object.entries(faq.breakdown)) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        formattedResponse += `• ${label}: ${value}\n`
      }
    }

    if ('programs' in faq && faq.programs) {
      formattedResponse += '\n**Available Programs:**\n'
      faq.programs.forEach((program: { name: string; benefit: string; eligibility: string }) => {
        formattedResponse += `\n**${program.name}**\n• Benefit: ${program.benefit}\n• Eligibility: ${program.eligibility}\n`
      })
      if ('totalPotentialSavings' in faq) {
        formattedResponse += `\n💰 **Total Potential Savings:** ${faq.totalPotentialSavings}\n`
      }
    }

    if ('benefits' in faq && faq.benefits) {
      formattedResponse += '\n**Benefits:**\n'
      faq.benefits.forEach((benefit: string) => {
        formattedResponse += `• ${benefit}\n`
      })
    }

    if ('requirements' in faq && faq.requirements) {
      formattedResponse += '\n**Requirements:**\n'
      for (const [key, value] of Object.entries(faq.requirements)) {
        formattedResponse += `• ${key}: ${value}\n`
      }
      if ('example' in faq) {
        formattedResponse += `\n*Example: ${faq.example}*\n`
      }
    }

    formattedResponse += '\n---\n*This information is for general guidance. For personalized advice, please consult with our agents or a mortgage professional.*'

    console.error('[chatbot.firstTimeBuyerFAQ.success]', { topic: matchedTopic })

    return {
      success: true,
      topic: matchedTopic,
      message: formattedResponse,
      relatedTopics: Object.keys(faqData).filter(k => k !== matchedTopic).slice(0, 2),
    }
  }
}
```

**Validate:** `npm run type-check`

---

### TASK 6: Create sell-home.ts tool

**File:** `packages/chatbot/src/tools/sell-home.ts`

**Code:**
```typescript
import { z } from 'zod'
import type { CoreTool } from 'ai'

export const sellHomeTool: CoreTool = {
  description: `Capture seller lead information.
Use this tool when user indicates they want to sell their home.
Collect property details and timeline to qualify the seller lead.`,

  parameters: z.object({
    propertyType: z.enum(['detached', 'semi-detached', 'townhouse', 'condo'])
      .describe('Type of property being sold'),
    propertyAddress: z.string().optional()
      .describe('Address or general area of the property'),
    bedrooms: z.number().optional()
      .describe('Number of bedrooms'),
    bathrooms: z.number().optional()
      .describe('Number of bathrooms'),
    timeline: z.enum(['asap', '1-3-months', '3-6-months', 'just-exploring'])
      .describe('When they want to sell'),
    reasonForSelling: z.string().optional()
      .describe('Why they are selling (relocating, downsizing, etc.)'),
    expectedPrice: z.number().optional()
      .describe('Expected or hoped-for sale price'),
    alreadyListed: z.boolean().optional()
      .describe('Whether property is already listed'),
  }),

  execute: async (params) => {
    console.error('[chatbot.sellHome.execute]', params)

    const {
      propertyType,
      propertyAddress,
      bedrooms,
      bathrooms,
      timeline,
      reasonForSelling,
      expectedPrice,
      alreadyListed,
    } = params

    // Determine lead quality
    let leadQuality: 'hot' | 'warm' | 'cold' = 'warm'
    if (timeline === 'asap' || timeline === '1-3-months') {
      leadQuality = 'hot'
    } else if (timeline === 'just-exploring') {
      leadQuality = 'cold'
    }

    // Format property description
    const propertyDesc = [
      propertyType,
      bedrooms ? `${bedrooms} bed` : null,
      bathrooms ? `${bathrooms} bath` : null,
    ].filter(Boolean).join(', ')

    let message = `Thank you for sharing details about your ${propertyDesc}. `

    if (timeline === 'asap' || timeline === '1-3-months') {
      message += `Since you're looking to sell soon, one of our experienced listing agents would love to provide you with a free market analysis and discuss your options. `
    } else if (timeline === '3-6-months') {
      message += `With a few months to prepare, we can help you maximize your home's value before listing. `
    } else {
      message += `It's smart to start planning early! We can provide market insights to help you decide when the time is right. `
    }

    if (alreadyListed) {
      message += `\n\nI see your property is already listed. If you're not getting the results you expected, our team specializes in relisting strategies that get homes sold.`
    }

    message += `\n\nWould you like to schedule a free consultation with one of our listing specialists?`

    console.error('[chatbot.sellHome.success]', { leadQuality })

    return {
      success: true,
      message,
      sellerPreferences: {
        propertyType,
        propertyAddress,
        bedrooms,
        bathrooms,
        timeline,
        reasonForSelling,
        expectedPrice,
        alreadyListed,
        leadQuality,
        capturedAt: new Date().toISOString(),
      },
      leadQuality,
      nextStep: leadQuality === 'hot'
        ? 'Ask for contact info immediately'
        : 'Offer free market analysis to capture contact',
    }
  }
}
```

**Validate:** `npm run type-check`

---

### TASK 7: Update chatbot index.ts exports

**File:** `packages/chatbot/src/index.ts`

**Code:**
```typescript
export { propertySearchTool } from './tools/property-search'
export { createContactTool } from './tools/create-contact'
export { capturePreferencesTool } from './tools/capture-preferences'
export { mortgageEstimatorTool } from './tools/mortgage-estimator'
export { neighborhoodInfoTool } from './tools/neighborhood-info'
export { firstTimeBuyerFAQTool } from './tools/first-time-buyer-faq'
export { sellHomeTool } from './tools/sell-home'
export { sriCollectiveSystemPrompt } from './prompts/sri-collective'
export { newhomeShowSystemPrompt } from './prompts/newhomeshow'
```

**Validate:** `npm run type-check`

---

### TASK 8: Update chat API route to register new tools

**File:** `apps/sri-collective/app/api/chat/route.ts`

**Code:**
```typescript
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import {
  sriCollectiveSystemPrompt,
  propertySearchTool,
  capturePreferencesTool,
  createContactTool,
  mortgageEstimatorTool,
  neighborhoodInfoTool,
  firstTimeBuyerFAQTool,
  sellHomeTool,
} from '@repo/chatbot'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: sriCollectiveSystemPrompt,
    messages,
    tools: {
      searchProperties: propertySearchTool,
      capturePreferences: capturePreferencesTool,
      createContact: createContactTool,
      estimateMortgage: mortgageEstimatorTool,
      getNeighborhoodInfo: neighborhoodInfoTool,
      answerFirstTimeBuyerQuestion: firstTimeBuyerFAQTool,
      captureSeller: sellHomeTool,
    },
    maxSteps: 5,

    onFinish: async ({ usage, finishReason }) => {
      console.error('[chat.sri-collective.complete]', {
        messageCount: messages.length,
        finishReason,
        usage,
      })
    },
  })

  return result.toDataStreamResponse()
}
```

**Validate:** `npm run type-check`

---

### TASK 9: Update system prompt with new tool guidance

**File:** `packages/chatbot/src/prompts/sri-collective.ts`

**Add to the system prompt (after existing tools section):**

```typescript
### 8. ADDITIONAL TOOLS AVAILABLE

- **estimateMortgage**: Use when user isn't pre-approved or asks about affordability. Collects income, down payment, debts. Shows estimate then offers to search in that range.

- **getNeighborhoodInfo**: Use when user asks about a city/area (e.g., "Tell me about Mississauga", "What's Oakville like?"). Returns prices, transit, schools, neighborhoods.

- **answerFirstTimeBuyerQuestion**: Use for questions about home buying process, closing costs, incentives, down payment requirements, pre-approval.

- **captureSeller**: Use when user wants to sell. Collects property details, timeline, reason for selling.

### 9. CONVERSATION EXAMPLES

**Mortgage Question:**
User: "I'm not pre-approved yet"
Bot: "No problem! I can give you a rough estimate. What's your approximate annual household income?"
User: "$120,000"
Bot: "And how much do you have saved for a down payment?"
User: "$80,000"
Bot: [Uses estimateMortgage tool] "Based on your numbers..."

**Neighborhood Question:**
User: "What's Oakville like?"
Bot: [Uses getNeighborhoodInfo tool] Provides detailed area info

**First-Time Buyer:**
User: "What rebates can I get as a first-time buyer?"
Bot: [Uses answerFirstTimeBuyerQuestion tool] Lists all programs with amounts
```

**Validate:** `npm run type-check`

---

### TASK 10: Fix ChatbotWidget dream home survey to use real IDX

**File:** `packages/ui/src/chatbot/ChatbotWidget.tsx`

**Changes needed at lines 539-560 (handleSurveyLocation function):**

Replace the mock listing generation with actual API call to search properties.

**Before:**
```typescript
const handleSurveyLocation = async (locations: string[]) => {
  addMessage({ role: "user", content: locations.join(", ") });

  // Generate mock listings based on preferences
  const mockListings: PropertyListing[] = generateMockListings(
    survey.propertyType || 'detached',
    survey.budget || '750k-1m',
    survey.bedrooms || '3',
    locations
  );
  // ...
}
```

**After:**
```typescript
const handleSurveyLocation = async (locations: string[]) => {
  addMessage({ role: "user", content: locations.join(", ") });
  setLoading(true);

  try {
    // Convert budget string to price range
    const budgetRanges: Record<string, { min: number; max: number }> = {
      "under-500k": { min: 0, max: 500000 },
      "500k-750k": { min: 500000, max: 750000 },
      "750k-1m": { min: 750000, max: 1000000 },
      "1m-1.5m": { min: 1000000, max: 1500000 },
      "1.5m-2m": { min: 1500000, max: 2000000 },
      "over-2m": { min: 2000000, max: 5000000 },
    };
    const priceRange = budgetRanges[survey.budget || "750k-1m"];
    const bedsNum = parseInt(survey.bedrooms || "3");

    // Call the chat API which will use propertySearchTool
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "user", content: `Search for ${survey.propertyType || 'any'} properties in ${locations.join(" or ")} with ${bedsNum}+ bedrooms between $${priceRange.min.toLocaleString()} and $${priceRange.max.toLocaleString()}` }
        ],
      }),
    });

    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();

    // Parse listings from response if available
    // For now, use the simplified approach
    addMessage({
      role: "assistant",
      content: `Great choices! Let me find properties in ${locations.join(", ")} matching your criteria...`
    });

    // Trigger actual property search via chat
    setSurvey(prev => ({
      ...prev,
      locations,
      step: "contact-info" // Skip to contact after search is triggered
    }));

  } catch (error) {
    console.error("Search error:", error);
    addMessage({
      role: "assistant",
      content: "I had trouble searching right now. Let me save your preferences and have an agent follow up with matching properties."
    });
    setSurvey(prev => ({ ...prev, locations, step: "contact-info" }));
  } finally {
    setLoading(false);
  }
};
```

**Also add "View on properties page" link to SurveyListingsDisplay component (lines 249-301):**

```typescript
function SurveyListingsDisplay({
  listings,
  searchParams,  // Add this prop
  onContinue
}: {
  listings: PropertyListing[];
  searchParams?: { city?: string; minPrice?: number; maxPrice?: number; bedrooms?: number };
  onContinue: () => void;
}) {
  const viewAllUrl = searchParams
    ? `/properties?city=${searchParams.city || ''}&minPrice=${searchParams.minPrice || ''}&maxPrice=${searchParams.maxPrice || ''}&bedrooms=${searchParams.bedrooms || ''}`
    : '/properties';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ... existing property cards ... */}

      {/* Add View All link */}
      <a
        href={viewAllUrl}
        className="block text-center text-sm text-[#c9a962] hover:text-[#b89952] transition-colors"
      >
        View all matching properties →
      </a>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
      >
        Save These & Get Similar Listings
      </button>
    </div>
  );
}
```

**Validate:** `npm run type-check && npm run build`

---

### TASK 11: Add timeline question to dream home survey

**File:** `packages/ui/src/chatbot/ChatbotWidget.tsx`

**Rationale:** Timeline is critical for lead scoring. Add it as a question after bedrooms, before location.

**Add new survey step component:**
```typescript
function SurveyTimeline({ onSelect }: { onSelect: (timeline: string) => void }) {
  const options = [
    { value: "asap", label: "ASAP / As soon as possible", icon: "🔥" },
    { value: "1-3-months", label: "1-3 months", icon: "📅" },
    { value: "3-6-months", label: "3-6 months", icon: "🗓️" },
    { value: "just-exploring", label: "Just exploring", icon: "🔍" },
  ];

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <p className="text-sm font-medium text-stone-800">
        How soon are you looking to purchase?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="p-3 rounded-xl border border-stone-200 hover:border-[#c9a962] hover:bg-[#c9a962]/5 transition-all duration-200 text-left"
          >
            <span className="text-lg mr-2">{option.icon}</span>
            <span className="text-sm font-medium text-stone-700">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Update survey state and flow:**
```typescript
// Update SurveyState type
type SurveyStep = "idle" | "property-type" | "budget" | "bedrooms" | "timeline" | "location" | "contact-info" | "complete";

interface SurveyState {
  step: SurveyStep;
  propertyType?: string;
  budget?: string;
  bedrooms?: string;
  timeline?: string;  // ADD THIS
  locations?: string[];
}

// Add handler
const handleSurveyTimeline = (timeline: string) => {
  addMessage({ role: "user", content: timeline.replace("-", " ") });
  setSurvey(prev => ({ ...prev, timeline, step: "location" }));
  addMessage({
    role: "assistant",
    content: "Great! Which areas are you interested in? Select all that apply."
  });
};

// Update handleSurveyBedrooms to go to timeline instead of location
const handleSurveyBedrooms = (bedrooms: string) => {
  addMessage({ role: "user", content: `${bedrooms} bedroom(s)` });
  setSurvey(prev => ({ ...prev, bedrooms, step: "timeline" }));  // Changed from "location"
  addMessage({
    role: "assistant",
    content: "How soon are you looking to purchase?"
  });
};

// Add to render:
{survey.step === "timeline" && (
  <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
    <SurveyTimeline onSelect={handleSurveyTimeline} />
  </div>
)}
```

**Validate:** `npm run type-check`

---

### TASK 12: Fix rotating prompts

**File:** `packages/ui/src/chatbot/ChatbotWidget.tsx`

**Find lines ~434-440 and replace:**

**Before:**
```typescript
const prompts = [
  "How can we help you? 💬",
  "Tell us about your dream home! 🏡",
  "Looking for investment opportunities? 💼",
  "Need help with selling? 🏠",
  "Questions about the market? 📊"
];
```

**After:**
```typescript
const prompts = [
  "How can we help you?",
  "Tell us about your dream home",
  "Ready to start your home search?",
  "Need help with selling?",
  "First-time buyer? We can help!"
];
```

**Validate:** `npm run type-check`

---

### TASK 12: Delete generateMockListings function

**File:** `packages/ui/src/chatbot/ChatbotWidget.tsx`

**Remove the entire function (lines ~631-668):**

```typescript
// DELETE THIS FUNCTION - no longer needed
function generateMockListings(
  propertyType: string,
  budget: string,
  bedrooms: string,
  locations: string[]
): PropertyListing[] {
  // ... entire function
}
```

**Validate:** `npm run type-check && npm run build`

---

### TASK 13: Enhance BoldTrail CRM Integration with Hashtags & Lead Quality

**Reference:** `PRPs/research/conversational-lead-capture-best-practices.md`

**File:** `packages/chatbot/src/tools/create-contact.ts`

**Enhancements needed:**

1. **Add website source hashtags** - Track where leads came from
2. **Add lead quality scoring** - Hot/warm/cold based on engagement
3. **Store new tool data** - Mortgage estimates, neighborhood interests
4. **Add first-time buyer flag** - Important qualifier

**Updated code:**
```typescript
import { z } from 'zod'
import type { CoreTool } from 'ai'
import { BoldTrailClient } from '@repo/crm'

export const createContactTool: CoreTool = {
  description: `Create a contact in BoldTrail CRM.
IMPORTANT: Only use this AFTER providing value to the user (e.g., showing listings).
Ask for email first, then cell phone number.
Include any captured preferences and automatically tag with source hashtags.`,

  parameters: z.object({
    firstName: z.string().describe("Contact's first name"),
    lastName: z.string().optional().describe("Contact's last name"),
    email: z.string().email().describe("Contact's email address (required)"),
    cellPhone: z.string().optional()
      .describe("Contact's cell phone number (valuable - ask after showing value)"),
    leadType: z.enum(['buyer', 'seller', 'investor', 'general'])
      .describe("Type of lead"),

    // Buyer preferences
    averagePrice: z.number().optional().describe("Target budget"),
    averageBeds: z.number().optional().describe("Desired bedrooms"),
    averageBathrooms: z.number().optional().describe("Desired bathrooms"),
    preferredCity: z.string().optional().describe("Preferred city/area"),
    preferredNeighborhoods: z.array(z.string()).optional()
      .describe("Specific neighborhoods of interest"),
    propertyTypes: z.array(z.string()).optional()
      .describe("Property types: detached, condo, etc."),

    // Seller preferences
    propertyAddress: z.string().optional().describe("Seller's property address"),
    reasonForSelling: z.string().optional(),
    sellerTimeline: z.enum(['asap', '1-3-months', '3-6-months', 'just-exploring']).optional(),

    // Intent & Qualification
    timeline: z.string().optional().describe("Timeline: immediate, 3-months, etc."),
    urgencyFactors: z.array(z.string()).optional(),
    preApproved: z.boolean().optional(),
    firstTimeBuyer: z.boolean().optional().describe("Is this their first home purchase?"),

    // Mortgage estimate data (from mortgage-estimator tool)
    mortgageEstimate: z.object({
      maxHomePrice: z.number().optional(),
      downPayment: z.number().optional(),
      monthlyPayment: z.number().optional(),
      annualIncome: z.number().optional(),
    }).optional().describe("Results from mortgage affordability calculation"),

    // Source tracking
    source: z.enum(['newhomeshow', 'sri-collective']).optional(),
  }),

  execute: async (params) => {
    // Validate phone format if provided
    if (params.cellPhone) {
      const cleaned = params.cellPhone.replace(/\D/g, '')
      if (cleaned.length !== 10 && cleaned.length !== 11) {
        return {
          success: false,
          error: "Invalid phone format. Please provide a 10-digit phone number.",
        }
      }
    }

    try {
      const client = new BoldTrailClient()

      // === BUILD HASHTAGS ===
      const hashtags: string[] = []

      // 1. Source tracking hashtags (ALWAYS ADDED)
      hashtags.push('website')  // Came from website (vs referral, ad, etc.)
      if (params.source === 'sri-collective') {
        hashtags.push('sri-collective')
      } else if (params.source === 'newhomeshow') {
        hashtags.push('newhomeshow')
      }

      // 2. Lead type hashtags
      hashtags.push(params.leadType)  // buyer, seller, investor, general

      // 3. Property preferences
      if (params.propertyTypes) {
        hashtags.push(...params.propertyTypes.map(t => t.toLowerCase()))
      }
      if (params.preferredCity) {
        hashtags.push(params.preferredCity.toLowerCase().replace(/\s+/g, '-'))
      }
      if (params.preferredNeighborhoods) {
        hashtags.push(...params.preferredNeighborhoods.map(n => n.toLowerCase().replace(/\s+/g, '-')))
      }

      // 4. Qualification hashtags
      if (params.preApproved) {
        hashtags.push('pre-approved')
      }
      if (params.firstTimeBuyer) {
        hashtags.push('first-time-buyer')
      }
      if (params.timeline) {
        hashtags.push(`timeline-${params.timeline}`)
      }

      // 5. Lead quality scoring
      const leadQuality = calculateLeadQuality(params)
      hashtags.push(`${leadQuality}-lead`)  // hot-lead, warm-lead, cold-lead

      // 6. Seller-specific hashtags
      if (params.leadType === 'seller') {
        if (params.sellerTimeline === 'asap' || params.sellerTimeline === '1-3-months') {
          hashtags.push('urgent-seller')
        }
      }

      // 7. Budget range hashtags (helpful for filtering)
      if (params.averagePrice) {
        if (params.averagePrice < 500000) hashtags.push('budget-under-500k')
        else if (params.averagePrice < 750000) hashtags.push('budget-500k-750k')
        else if (params.averagePrice < 1000000) hashtags.push('budget-750k-1m')
        else if (params.averagePrice < 1500000) hashtags.push('budget-1m-1.5m')
        else hashtags.push('budget-over-1.5m')
      }

      // === BUILD STRUCTURED NOTES ===
      const notes = JSON.stringify({
        capturedAt: new Date().toISOString(),
        source: params.source || 'chatbot',
        leadQuality,

        // Buyer preferences
        buyerPreferences: params.leadType === 'buyer' ? {
          timeline: params.timeline,
          urgencyFactors: params.urgencyFactors,
          preApproved: params.preApproved,
          firstTimeBuyer: params.firstTimeBuyer,
          neighborhoods: params.preferredNeighborhoods,
        } : undefined,

        // Seller preferences
        sellerPreferences: params.leadType === 'seller' ? {
          propertyAddress: params.propertyAddress,
          reasonForSelling: params.reasonForSelling,
          timeline: params.sellerTimeline,
        } : undefined,

        // Mortgage estimate (if captured)
        mortgageEstimate: params.mortgageEstimate ? {
          maxHomePrice: params.mortgageEstimate.maxHomePrice,
          downPayment: params.mortgageEstimate.downPayment,
          estimatedMonthly: params.mortgageEstimate.monthlyPayment,
          annualIncome: params.mortgageEstimate.annualIncome,
          calculatedAt: new Date().toISOString(),
        } : undefined,
      }, null, 2)

      const response = await client.createContact({
        firstName: params.firstName,
        lastName: params.lastName || '',
        email: params.email,
        phone: params.cellPhone,
        source: params.source || 'chatbot',
        leadType: params.leadType,
        customFields: {
          average_price: params.averagePrice,
          average_beds: params.averageBeds,
          average_bathrooms: params.averageBathrooms,
          city: params.preferredCity,
          hashtags,
          notes,
        },
      })

      if (response.success) {
        const thankYouMessage = params.cellPhone
          ? `Thank you ${params.firstName}! I've saved your preferences and one of our agents will call you at ${params.cellPhone} soon.`
          : `Thank you ${params.firstName}! I'll send personalized recommendations to ${params.email}.`

        console.error('[chatbot.createContact.success]', {
          contactId: response.contactId,
          leadType: params.leadType,
          leadQuality,
          hasPhone: !!params.cellPhone,
          hasMortgageEstimate: !!params.mortgageEstimate,
          source: params.source,
          hashtagCount: hashtags.length,
        })

        return {
          success: true,
          contactId: response.contactId,
          message: thankYouMessage,
          leadQuality,
        }
      } else {
        console.error('[chatbot.createContact.crmError]', {
          error: response.error,
          fallback: response.fallback,
        })

        return {
          success: false,
          error: response.error || "Failed to create contact",
          fallback: response.fallback,
          message: `Thanks ${params.firstName}! We've noted your information and will be in touch soon.`,
        }
      }
    } catch (error) {
      console.error('[chatbot.createContact.error]', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Thanks for your interest! Our team will follow up with you shortly.",
      }
    }
  },
}

/**
 * Calculate lead quality based on engagement and qualification signals
 *
 * HOT Lead (highest priority):
 * - Has phone number (willing to be contacted)
 * - Immediate/short timeline
 * - Pre-approved OR has mortgage estimate
 * - Urgency factors present
 *
 * WARM Lead (good potential):
 * - Has email
 * - 3-6 month timeline
 * - Engaged with survey/preferences
 *
 * COLD Lead (nurture):
 * - Just browsing
 * - Long timeline
 * - Minimal engagement
 */
function calculateLeadQuality(params: {
  cellPhone?: string
  timeline?: string
  preApproved?: boolean
  mortgageEstimate?: { maxHomePrice?: number }
  urgencyFactors?: string[]
  sellerTimeline?: string
  leadType: string
}): 'hot' | 'warm' | 'cold' {
  let score = 0

  // Phone number is a strong signal (willing to be contacted)
  if (params.cellPhone) score += 3

  // Pre-approval or mortgage estimate shows serious intent
  if (params.preApproved) score += 2
  if (params.mortgageEstimate?.maxHomePrice) score += 2

  // Timeline scoring
  if (params.timeline === 'immediate' || params.timeline === '3-months') {
    score += 3
  } else if (params.timeline === '6-months') {
    score += 1
  } else if (params.timeline === 'just-browsing' || params.timeline === '12-months') {
    score -= 1
  }

  // Seller timeline
  if (params.leadType === 'seller') {
    if (params.sellerTimeline === 'asap') score += 3
    else if (params.sellerTimeline === '1-3-months') score += 2
    else if (params.sellerTimeline === 'just-exploring') score -= 1
  }

  // Urgency factors (job relocation, growing family, etc.)
  if (params.urgencyFactors && params.urgencyFactors.length > 0) {
    score += params.urgencyFactors.length
  }

  // Determine quality
  if (score >= 5) return 'hot'
  if (score >= 2) return 'warm'
  return 'cold'
}
```

**Validate:** `npm run type-check`

---

### TASK 14: Update all tools to pass data to createContact

**Integration pattern for new tools to CRM:**

When any tool captures valuable lead data, it should return that data in a format that can be passed to `createContactTool`:

**mortgage-estimator.ts - Add to return object:**
```typescript
return {
  success: true,
  estimate: { ... },
  // Add CRM integration data
  crmData: {
    mortgageEstimate: {
      maxHomePrice: maxHomePrice,
      downPayment: downPayment,
      monthlyPayment: Math.round(monthlyPayment),
      annualIncome: annualIncome,
    }
  }
}
```

**neighborhood-info.ts - Add to return object:**
```typescript
return {
  success: true,
  city: cityKey,
  message: formattedInfo,
  // Add CRM integration data
  crmData: {
    preferredNeighborhoods: specificNeighborhood ? [specificNeighborhood] : undefined,
    preferredCity: cityKey,
  }
}
```

**sell-home.ts - Add to return object:**
```typescript
return {
  success: true,
  message,
  // Add CRM integration data
  crmData: {
    leadType: 'seller' as const,
    propertyAddress,
    propertyType,
    reasonForSelling,
    sellerTimeline: timeline,
  }
}
```

**System prompt guidance (add to sri-collective.ts):**
```typescript
### 10. CRM DATA COLLECTION

When calling createContact, include ALL captured data from the conversation:

- If user ran mortgage estimator: Include mortgageEstimate object
- If user asked about neighborhoods: Include preferredNeighborhoods array
- If user mentioned urgency: Include urgencyFactors array
- If user is first-time buyer: Set firstTimeBuyer = true
- ALWAYS ask about timeline: "How soon are you looking to purchase/sell?"

The CRM will automatically:
- Tag leads with source: #website, #sri-collective
- Score lead quality: #hot-lead, #warm-lead, #cold-lead
- Tag with timeline: #timeline-asap, #timeline-1-3-months, etc.
- Tag with preferences: #pre-approved, #first-time-buyer, #budget-750k-1m
- Store mortgage estimates in notes for agent reference
```

**Validate:** `npm run type-check`

---

### TASK 15: Update all tool descriptions to Anthropic standard

**Reference:** https://www.anthropic.com/engineering/building-effective-agents

**Pattern to follow:**
```typescript
description: `[PURPOSE] What this tool does.
[WHEN TO USE] Specific triggers.
[IMPORTANT] Constraints and ordering.
[OUTPUT] What to expect and how to present it.`
```

**Update each tool:**

**property-search.ts:**
```typescript
description: `[PURPOSE] Search MLS listings via IDX API based on buyer criteria.
[WHEN TO USE] When user describes what they're looking for (budget, location, bedrooms, property type).
[IMPORTANT] Use this BEFORE asking for contact info to provide value first. Returns up to 5 listings.
[OUTPUT] Returns listings array with photos, price, details, and viewAllUrl for the properties page.`
```

**mortgage-estimator.ts:**
```typescript
description: `[PURPOSE] Calculate maximum affordable home price based on Canadian GDS/TDS rules.
[WHEN TO USE] When user says they're not pre-approved, asks "what can I afford", or mentions budget uncertainty.
[IMPORTANT] This is an ESTIMATE only - always include the disclaimer. Offer to search properties after showing results.
[OUTPUT] Returns formattedSummary (markdown) and searchSuggestion with maxPrice for follow-up search.`
```

**neighborhood-info.ts:**
```typescript
description: `[PURPOSE] Provide curated information about GTA cities and neighborhoods.
[WHEN TO USE] When user asks about an area ("tell me about Mississauga", "what's Oakville like", "good areas for families").
[IMPORTANT] Available cities: Toronto, Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Milton, Oakville, Burlington, Hamilton, Caledon. If city not found, suggest alternatives.
[OUTPUT] Returns formatted markdown with prices, transit, schools, neighborhoods. Offer to search properties after.`
```

**first-time-buyer-faq.ts:**
```typescript
description: `[PURPOSE] Answer common first-time buyer questions with Ontario-specific information.
[WHEN TO USE] Questions about: home buying process, closing costs, rebates/incentives (LTT, FHSA, HBP), pre-approval, down payment requirements.
[IMPORTANT] For questions outside FAQ scope, suggest connecting with an agent. Include disclaimer about seeking professional advice.
[OUTPUT] Returns formatted answer with structured data (steps, costs breakdown, program details).`
```

**sell-home.ts:**
```typescript
description: `[PURPOSE] Capture seller lead information and qualify their intent.
[WHEN TO USE] When user indicates they want to sell ("sell my house", "thinking of selling", "list my property").
[IMPORTANT] Determine timeline urgency. Hot sellers (ASAP/1-3 months) should be flagged for immediate agent follow-up.
[OUTPUT] Returns sellerPreferences object and leadQuality score. Suggest free market analysis for engagement.`
```

**create-contact.ts:**
```typescript
description: `[PURPOSE] Create a qualified lead in BoldTrail CRM with full preference data.
[WHEN TO USE] ONLY after providing value (showing listings, answering questions). Ask for email first, then phone.
[IMPORTANT] Include ALL captured data: preferences, mortgage estimate, neighborhood interests, timeline. Source is auto-tagged.
[OUTPUT] Returns success message and contactId. Lead is auto-scored (hot/warm/cold) and tagged with hashtags.`
```

**Validate:** `npm run type-check`

---

### TASK 16: Add human handoff triggers to system prompt

**File:** `packages/chatbot/src/prompts/sri-collective.ts`

**Add to system prompt:**
```typescript
### 12. HUMAN HANDOFF TRIGGERS

Gracefully hand off to a human agent in these scenarios:

1. **Question outside scope:**
   "That's a great question! For specific advice on [topic], I'd recommend speaking with one of our agents who can provide personalized guidance. Would you like me to connect you?"

2. **Legal/financial advice requested:**
   "I can't provide financial or legal advice, but our experienced agents can guide you through this. Shall I have someone reach out?"

3. **Complex negotiation questions:**
   "Negotiation strategies depend on many factors specific to your situation. Our agents are experts at this - would you like to speak with one?"

4. **User shows frustration:**
   "I want to make sure you get the help you need. Let me connect you with a real person who can assist you directly."

5. **Hot lead detected (timeline ASAP + phone provided):**
   Immediately after capturing contact: "Given your timeline, I'm flagging this for immediate follow-up. One of our agents will call you within the hour."

NEVER leave users without a path forward. Always offer the agent connection as an option.
```

**Validate:** `npm run type-check`

---

## BOLDTRAIL CRM INTEGRATION REFERENCE

### Hashtag Strategy

All leads captured via website will have the following hashtag structure in BoldTrail:

| Category | Hashtags | Purpose |
|----------|----------|---------|
| **Source** | `#website`, `#sri-collective` or `#newhomeshow` | Track lead origin |
| **Lead Type** | `#buyer`, `#seller`, `#investor` | Segment by intent |
| **Quality** | `#hot-lead`, `#warm-lead`, `#cold-lead` | Prioritize follow-up |
| **Timeline** | `#timeline-asap`, `#timeline-1-3-months`, `#timeline-3-6-months`, `#timeline-exploring` | Purchase/sell urgency |
| **Qualification** | `#pre-approved`, `#first-time-buyer` | Filter qualified leads |
| **Budget** | `#budget-under-500k`, `#budget-500k-750k`, `#budget-750k-1m`, `#budget-1m-1.5m`, `#budget-over-1.5m` | Price range filtering |
| **Location** | `#mississauga`, `#port-credit`, `#oakville` | Geographic targeting |
| **Property** | `#detached`, `#condo`, `#townhouse`, `#semi-detached` | Type preferences |
| **Seller** | `#urgent-seller` | Hot seller leads |

### Lead Quality Scoring Rules

```
HOT LEAD (Score >= 5):
  +3: Has cell phone
  +3: Timeline immediate/3-months
  +2: Pre-approved
  +2: Has mortgage estimate
  +1 per urgency factor

WARM LEAD (Score 2-4):
  Has email + some engagement
  6-month timeline
  Completed preferences survey

COLD LEAD (Score < 2):
  Just browsing
  12-month+ timeline
  Minimal data captured
```

### CRM Notes Structure

```json
{
  "capturedAt": "2024-12-23T10:30:00Z",
  "source": "sri-collective",
  "leadQuality": "hot",

  "buyerPreferences": {
    "timeline": "3-months",
    "urgencyFactors": ["job relocation"],
    "preApproved": true,
    "firstTimeBuyer": true,
    "neighborhoods": ["Port Credit", "Erin Mills"]
  },

  "mortgageEstimate": {
    "maxHomePrice": 850000,
    "downPayment": 100000,
    "estimatedMonthly": 4200,
    "annualIncome": 150000,
    "calculatedAt": "2024-12-23T10:25:00Z"
  }
}
```

### Research Reference

For full lead capture best practices, see: `PRPs/research/conversational-lead-capture-best-practices.md`

Key principles applied:
- **Value-before-ask**: Show 3 listings before capturing contact info
- **Progressive disclosure**: Collect data naturally through conversation
- **3-5 exchange rule**: Complete survey questions before asking for email
- **Reciprocity principle**: Provide value to earn contact information

---

## ANTHROPIC AGENT BEST PRACTICES

**Reference:** https://www.anthropic.com/engineering/building-effective-agents

### Architecture: Workflow with Routing (Not Full Agent)

Our chatbot is a **workflow with routing**, not a full autonomous agent. This is the correct choice because:

> "Workflows suit well-defined tasks requiring predictability, while agents excel when flexibility and model-driven decisions are essential."

**Why workflow is right for us:**
- Real estate lead capture has predictable patterns
- We need reliability over flexibility
- Costs are controlled (no runaway agent loops)
- User trust requires predictable behavior

**Our routing pattern:**
```
User Input → Classify Intent → Route to Specialized Tool
                ↓
    ┌──────────┼──────────┬──────────┬──────────┐
    ↓          ↓          ↓          ↓          ↓
 Property   Mortgage   Neighbor-   First-Time  Seller
  Search    Estimator  hood Info   Buyer FAQ   Capture
    ↓          ↓          ↓          ↓          ↓
    └──────────┴──────────┴──────────┴──────────┘
                        ↓
              Create Contact (CRM)
```

### Tool Design: Poka-Yoke Principles

Anthropic recommends **poka-yoke design** (mistake-proofing):

> "Change the arguments so that it is harder to make mistakes."

**Applied to our tools:**

1. **Use enums over free text:**
```typescript
// ✅ GOOD - Constrained options
propertyType: z.enum(['detached', 'semi-detached', 'townhouse', 'condo'])

// ❌ BAD - Free text allows errors
propertyType: z.string()
```

2. **Provide defaults for optional params:**
```typescript
// ✅ GOOD - Safe defaults
monthlyDebts: z.number().optional().default(0)
currentMortgageRate: z.number().optional().default(4.5)
```

3. **Clear parameter descriptions:**
```typescript
// ✅ GOOD - Explicit guidance
annualIncome: z.number()
  .describe('Total annual household income before taxes (e.g., 150000 for $150K)')

// ❌ BAD - Ambiguous
income: z.number().describe('Income amount')
```

4. **Validate at boundaries:**
```typescript
// ✅ GOOD - Validate phone before CRM call
if (params.cellPhone) {
  const cleaned = params.cellPhone.replace(/\D/g, '')
  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return { success: false, error: "Invalid phone format" }
  }
}
```

### Tool Documentation Standards

Each tool description should include:

```typescript
export const exampleTool: CoreTool = {
  description: `
    [PURPOSE] What this tool does in one sentence.

    [WHEN TO USE] Specific triggers that indicate this tool should be called.
    Example: "Use when user asks about affordability, budget, or says they're not pre-approved."

    [IMPORTANT] Critical constraints or ordering requirements.
    Example: "Only use AFTER showing property results to provide value first."

    [OUTPUT] What the tool returns and how to present it.
    Example: "Returns formatted estimate with disclaimer - always show the formattedSummary field."
  `,
  // ...
}
```

### System Prompt: Transparency & Planning

Anthropic recommends: **"Explicitly show agent planning steps"**

**Update system prompt to include reasoning transparency:**
```typescript
### 11. TRANSPARENCY IN RESPONSES

When using tools, briefly explain your reasoning to the user:

✅ GOOD:
"Based on your income and down payment, let me calculate what you might be able to afford..."
[Uses mortgageEstimator tool]
"Here's your estimate..."

✅ GOOD:
"Let me search for 3-bedroom homes in Mississauga under $900K..."
[Uses propertySearch tool]
"I found 12 properties..."

❌ BAD:
[Silently uses tool without context]
"Here are some properties."

This transparency:
- Builds user trust
- Sets expectations for response time
- Makes the conversation feel natural
```

### Error Handling: Graceful Degradation

Anthropic notes: "Expect higher costs and potential compounding errors"

**All tools should follow this error pattern:**
```typescript
execute: async (params) => {
  try {
    // Main logic
    return { success: true, message: "...", data: {...} }
  } catch (error) {
    console.error('[tool.name.error]', error)

    // ALWAYS return a user-friendly fallback
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      // Graceful degradation - still provide value
      message: "I'm having trouble with that right now. Let me connect you with an agent who can help.",
      fallbackAction: 'handoff-to-agent'
    }
  }
}
```

### Simplicity: Start Simple, Add Complexity Only When Needed

> "Start with simple prompts, optimize them with comprehensive evaluation, and add multi-step agentic systems only when simpler solutions fall short."

**Our simplicity principles:**

1. **Single-purpose tools** - Each tool does ONE thing well
2. **No tool chaining by default** - Model decides when to use multiple tools
3. **Static data over API calls** - neighborhoods.json vs real-time API
4. **Survey UI over free-form** - Clickable buttons reduce ambiguity

### Success Criteria: Measurable Outcomes

Anthropic identifies successful agent patterns have **"clear success criteria"** and **"feedback loops"**.

**Our success metrics:**
- Lead capture rate (contact info collected / conversations started)
- Lead quality distribution (hot/warm/cold percentages)
- Tool usage patterns (which tools convert best)
- Conversation length to conversion (fewer exchanges = better UX)

**Feedback loop:**
```
User Interaction → Tool Result → CRM Data → Agent Follow-up → Outcome Tracking
                                                    ↓
                                        Refine prompts/tools based on outcomes
```

### Human Oversight: Meaningful Handoff Points

> "Meaningful human oversight" is critical for agent success.

**Our handoff triggers:**

| Scenario | Action |
|----------|--------|
| Question not in FAQ | "That's a great question for one of our agents. May I connect you?" |
| Hot lead (score >= 5) | Immediate agent notification |
| Complex negotiation questions | "Our agents can provide personalized advice on that." |
| Legal/financial advice | "I can't give financial advice, but our team can guide you." |
| User frustration detected | "Let me connect you with a real person who can help." |

### Avoid Over-Engineering

Anthropic warns against complex frameworks:

> "Many patterns can be implemented in a few lines of code using LLM APIs directly rather than complex frameworks."

**What we're NOT doing:**
- ❌ Custom agent orchestration framework
- ❌ Complex state machines
- ❌ Multi-agent coordination
- ❌ Autonomous goal-setting

**What we ARE doing:**
- ✅ Vercel AI SDK's built-in tool calling
- ✅ Simple Zustand state for conversation history
- ✅ Static JSON for knowledge base
- ✅ Direct BoldTrail API integration

---

## VALIDATION COMMANDS

Execute all commands to ensure zero regressions.

### Level 1: Syntax & Types

```bash
# Type check all packages
npm run type-check
```
**Expected:** No TypeScript errors

```bash
# Lint all packages
npm run lint
```
**Expected:** No ESLint errors

### Level 2: Build

```bash
# Build all apps and packages
npm run build
```
**Expected:** Clean build with no errors

### Level 3: Runtime Testing

```bash
# Start dev server
npm run dev --filter=sri-collective
```

**Manual tests at http://localhost:3001:**

1. **Mortgage Estimator:**
   - Open chat, say "I'm not pre-approved"
   - Provide income ($100,000) and down payment ($50,000)
   - Verify estimate shows with disclaimer
   - Verify it offers to search in that range

2. **Neighborhood Info:**
   - Ask "Tell me about Mississauga"
   - Verify detailed response with transit, schools, neighborhoods
   - Ask about specific neighborhood "What's Port Credit like?"

3. **First-Time Buyer FAQ:**
   - Ask "What rebates can I get?"
   - Verify lists Ontario LTT, FHSA, HBP, etc.
   - Ask "What are closing costs?"

4. **Dream Home Survey:**
   - Click "Find Your Dream Home"
   - Complete survey (property type, budget, bedrooms, location)
   - Verify real properties appear (or appropriate message if no IDX key)
   - Verify "View all matching properties" link works
   - Verify link goes to /properties with correct filters

5. **Rotating Prompts:**
   - Close chatbot, wait for prompts to cycle
   - Verify no "investment opportunities" message

6. **Seller Flow:**
   - Say "I want to sell my house"
   - Answer property questions
   - Verify seller preferences captured

### Level 4: Integration Validation

```bash
# Test that all tools are exported
node -e "const c = require('./packages/chatbot/src'); console.log(Object.keys(c))"
```
**Expected:** Lists all 7 tools + 2 prompts

---

## ACCEPTANCE CRITERIA

- [ ] Mortgage estimator provides realistic estimates with disclaimer
- [ ] Neighborhood info returns data for all 11 GTA cities
- [ ] First-time buyer FAQ answers common questions accurately
- [ ] Dream home survey uses real IDX data (or graceful fallback)
- [ ] Property cards link to detail pages
- [ ] "View all" link goes to /properties with filters
- [ ] Rotating prompts have no investment advice
- [ ] Seller tool captures lead info
- [ ] All validation commands pass
- [ ] No console errors in browser
- [ ] **CRM: Leads tagged with source hashtags** (#website, #sri-collective or #newhomeshow)
- [ ] **CRM: Leads scored and tagged** (#hot-lead, #warm-lead, #cold-lead)
- [ ] **CRM: Timeline captured and tagged** (#timeline-asap, #timeline-1-3-months, etc.)
- [ ] **CRM: Mortgage estimates stored in notes**
- [ ] **CRM: Buyer/seller preferences captured with hashtags**
- [ ] **Anthropic: Tools use poka-yoke design** (enums, defaults, validation)
- [ ] **Anthropic: Tool descriptions follow documentation standard** (PURPOSE, WHEN TO USE, IMPORTANT, OUTPUT)
- [ ] **Anthropic: Graceful error handling with user-friendly fallbacks**
- [ ] **Anthropic: Human handoff triggers implemented**

---

## COMPLETION CHECKLIST

- [ ] neighborhoods.json created with all 11 cities
- [ ] first-time-buyer-faq.json created with all topics
- [ ] mortgage-estimator.ts tool working
- [ ] neighborhood-info.ts tool working
- [ ] first-time-buyer-faq.ts tool working
- [ ] sell-home.ts tool working
- [ ] chatbot index.ts exports all tools
- [ ] chat API route registers all tools
- [ ] system prompt updated with tool guidance
- [ ] ChatbotWidget survey uses real data
- [ ] **Timeline question added to survey** (after bedrooms, before location)
- [ ] Property cards are clickable
- [ ] View all link added
- [ ] Rotating prompts fixed
- [ ] Mock listings function removed
- [ ] **create-contact.ts enhanced with hashtag strategy**
- [ ] **Lead quality scoring (calculateLeadQuality) implemented**
- [ ] **Mortgage estimate data passed to CRM**
- [ ] **System prompt includes CRM data collection guidance**
- [ ] **System prompt includes transparency guidance** (explain reasoning to users)
- [ ] **All tool descriptions follow Anthropic documentation standard**
- [ ] **Human handoff triggers added to system prompt**
- [ ] npm run type-check passes
- [ ] npm run build passes
- [ ] Manual testing complete

---

## NOTES

### Disclaimer Requirements

All financial estimates MUST include disclaimers:
- Mortgage estimates: "This is an estimate only, not financial advice"
- First-time buyer info: "For personalized advice, consult with our agents"

### Data Freshness

The neighborhood JSON is curated data (Dec 2024). Average prices and market conditions change. Consider:
- Adding "lastUpdated" field to JSON
- Quarterly review/update process
- Web search fallback for real-time data if needed

### Error Handling

All tools follow the pattern:
```typescript
return {
  success: true/false,
  message: "User-friendly message",
  data: { ... },
  error?: "Technical error for logging"
}
```

### Future Enhancements

1. **RAG integration** for more dynamic Q&A (post-MVP)
2. **Web search fallback** for questions not in FAQ
3. **Market data API** for real-time neighborhood prices
4. **Calculator UI** for mortgage tool in chat

---

## PRP CONFIDENCE SCORE: 9.5/10

**Strengths:**
- Comprehensive research for mortgage/first-time buyer data
- Clear tool patterns from existing codebase
- Detailed GTA neighborhood data for all 11 cities
- Step-by-step tasks with code snippets
- Multiple validation gates
- **Follows Anthropic's agent best practices** (workflow architecture, poka-yoke tool design)
- **Clear documentation standards** for tool descriptions
- **Human handoff triggers** for graceful degradation
- **Lead quality scoring** with measurable success criteria

**Risks:**
- ChatbotWidget refactor touches complex component
- JSON data needs periodic updates
- First implementation of multiple new tools at once

**Mitigations:**
- Each tool can be implemented and tested independently
- JSON data is static and easily updateable
- Existing tool patterns are well-established
- **Workflow architecture** (not full agent) reduces complexity and cost
- **Poka-yoke design** minimizes model mistakes

<!-- EOF -->
