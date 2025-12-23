# Feature: BoldTrail MCP Fix & Enhanced Lead Capture System

## Feature Description

Fix the BoldTrail MCP server integration (currently returning 404 errors due to incorrect API endpoints) and implement an enhanced conversational lead capture system that collects cell phone numbers and buyer/seller preferences through the AI chatbot. The system will follow the reciprocity principle - providing value before asking for contact information - to maximize lead conversion rates.

**Two-Part Implementation:**
1. **MCP Server Fix**: Correct the base URL and endpoint paths to match kvCORE Public API V2 specification
2. **Enhanced Lead Capture**: Upgrade chatbot tools, prompts, and UI to systematically collect phone numbers and intent-specific preferences (buyer/seller/investor)

## User Story

As a realtor using Sri Collective/NewHomeShow platforms
I want my AI chatbot to collect client cell phone numbers and property preferences
So that I can follow up with qualified leads who have provided their contact information and specific intent

As a home buyer/seller using the chatbot
I want to share my preferences and receive relevant property recommendations
So that I can find what I'm looking for without feeling pressured to give my information upfront

## Problem Statement

### Critical Issue 1: BoldTrail MCP Server Not Working

The MCP server (`boldtrail-mcp-server/src/index.ts`) is configured with:
- **Wrong Base URL**: `https://api.kvcore.com` (missing `/v2/public`)
- **Wrong Endpoint Paths**: Using plural `/contacts` instead of singular `/contact`
- **Result**: All API calls return 404 errors

**Current vs Correct Endpoints:**
| Function | Current (Wrong) | Correct Path |
|----------|----------------|--------------|
| Base URL | `api.kvcore.com` | `api.kvcore.com/v2/public` |
| Get Contact | `/contacts/{id}` | `/contact/{id}` |
| Create Contact | `/contacts` | `/contact` |
| Get Listings | `/listings` | `/manuallistings` |
| Add Note | `/contacts/{id}/notes` | `/contact/{id}/action-note` |

### Critical Issue 2: Inadequate Lead Capture

Current chatbot limitations:
1. **No systematic phone collection**: Phone is optional and rarely captured
2. **No value-first approach**: System prompts don't guide AI to show value before asking for contact
3. **Stub tool implementations**: `create-contact.ts` returns mock data, never saves to CRM
4. **Survey doesn't collect contact info**: Preferences captured but not tied to lead record
5. **No intent-specific fields**: Can't distinguish hot buyers from casual browsers

**Business Impact:**
- Realtors can't follow up with leads (missing phone numbers)
- No visibility into buyer/seller preferences in CRM
- Missed opportunities to convert interested visitors

## Solution Statement

### Phase 1: Fix MCP Server

Update `boldtrail-mcp-server/src/index.ts`:
1. Fix base URL to `https://api.kvcore.com/v2/public`
2. Correct all endpoint paths per kvCORE API V2 spec
3. Add proper error handling and retry logic
4. Add diagnostic tools for troubleshooting

### Phase 2: Enhanced Lead Capture

**Core Flow**: Survey Questions (4 options each) → Show 3 Listings → Ask for Contact Info

1. **New Chatbot Tools** in `packages/chatbot/src/tools/`:
   - `capture-preferences.ts` - Collect buyer/seller preferences via survey
   - `create-contact.ts` - Enhanced contact capture with phone priority

2. **Enhanced System Prompts**:
   - Survey-style questions with 4 options each
   - Show 3 listings BEFORE asking for contact (reciprocity)
   - Phone collection after showing value
   - Buyer AND seller flows (sellers often become buyers)

3. **ChatbotWidget UI Enhancement**:
   - Survey-style buttons (4 options per question)
   - Display 3 property cards after preferences collected
   - Contact capture form (email required, phone recommended)

4. **BoldTrail Field Mapping**:
   - Map preferences to kvCORE contact fields
   - Use `average_price`, `average_beds`, `average_bathrooms` for buyer prefs
   - Use `hashtags` for property type and location preferences
   - Use `notes` for structured preference JSON

5. **Simplified Scope** (Focus on lead capture only):
   - NO email sending (CRM handles follow-up)
   - NO OTP verification (configure later in CRM)
   - NO buyer's guides, neighborhood reports (build later)
   - YES: Capture phone + email + preferences to CRM

## Feature Metadata

**Feature Type**: Bug Fix + Enhancement
**Estimated Complexity**: Medium-High
**Primary Systems Affected**:
- `boldtrail-mcp-server/src/index.ts` - MCP server with API fixes
- `packages/chatbot/src/tools/` - New and updated tool definitions
- `packages/chatbot/src/prompts/` - Enhanced system prompts
- `packages/ui/src/chatbot/ChatbotWidget.tsx` - Contact capture UI
- `packages/crm/src/client.ts` - BoldTrail client updates
- `packages/types/src/contact.ts` - Enhanced contact types
- `apps/sri-collective/app/api/chat/route.ts` - Tool integration

**Dependencies**:
- kvCORE Public API V2 (documented at developer.insiderealestate.com)
- Existing: `@modelcontextprotocol/sdk`, `zod`, `ai` (Vercel AI SDK)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**MCP Server (Critical Fix):**

- `boldtrail-mcp-server/src/index.ts` (lines 1-305) - Current MCP server with wrong endpoints
  - **Line 8**: Wrong base URL `https://api.kvcore.com`
  - **Lines 58-98**: `get_contacts` - path OK but base URL wrong
  - **Lines 103-132**: `get_contact` - wrong path `/contacts/{id}` should be `/contact/{id}`
  - **Lines 137-171**: `create_contact` - wrong path `/contacts` should be `/contact`
  - **Lines 176-215**: `get_listings` - wrong path `/listings` should be `/manuallistings`
  - **Lines 257-291**: `add_contact_note` - wrong path, should be `/contact/{id}/action-note`
  - **Lines 220-252**: `get_activities` - endpoint may not exist in API

**Chatbot Tools (Enhancement):**

- `packages/chatbot/src/tools/create-contact.ts` (lines 1-20) - Stub implementation
  - **Issue**: Returns mock success, never calls CRM
  - **Missing**: Phone validation, preferences capture

- `packages/chatbot/src/tools/property-search.ts` (lines 1-21) - Stub implementation
  - **Issue**: Returns empty results array

- `packages/chatbot/src/index.ts` - Tool exports
  - **Update**: Add new tools to exports

**System Prompts:**

- `packages/chatbot/src/prompts/sri-collective.ts` (entire file) - Current prompt
  - **Missing**: Reciprocity principle, progressive disclosure, phone collection strategy

- `packages/chatbot/src/prompts/newhomeshow.ts` (entire file) - Pre-construction prompt
  - **Missing**: Same issues as sri-collective

**Chatbot UI:**

- `packages/ui/src/chatbot/ChatbotWidget.tsx` (lines 1-578) - Chat widget
  - **Lines 7-13**: SurveyState interface - missing contact fields
  - **Lines 58-220**: Survey steps - no contact capture step
  - **Lines 346-380**: Summary sent to AI - doesn't include contact request

- `packages/ui/src/chatbot/chatbot-store.ts` (lines 1-62) - Zustand store
  - **Issue**: Messages not persisted

**CRM Client:**

- `packages/crm/src/client.ts` (lines 1-186) - BoldTrail client
  - **Lines 73-143**: `getListings()` - uses wrong endpoint path
  - **Lines 10-48**: `createContact()` - field mapping needs update for preferences

- `packages/crm/src/types.ts` (lines 1-56) - CRM types
  - **Missing**: Enhanced buyer/seller preference types

**Type Definitions:**

- `packages/types/src/contact.ts` (lines 1-11) - Basic contact interface
  - **Missing**: Preferences, intent signals, verification status

**API Routes:**

- `apps/sri-collective/app/api/chat/route.ts` (lines 1-22) - Chat API
  - **Lines 12-18**: Tool registration - needs new tools
  - **Missing**: onFinish callback for CRM integration

**Research Documents:**

- `PRPs/research/conversational-lead-capture-best-practices.md` - Full research
  - Progressive disclosure patterns
  - Phone collection strategies
  - Validation approaches
  - Industry examples (Zillow, Realtor.com)

### kvCORE API V2 Documentation

**Base URL**: `https://api.kvcore.com/v2/public`

**Authentication**:
```http
Authorization: Bearer {BOLDTRAIL_API_KEY}
Content-Type: application/json
Accept: application/json
```

**Contact Endpoints**:
- `POST /contact` - Create contact
- `GET /contacts` - List contacts (pagination)
- `GET /contact/{id}` - Get single contact
- `PUT /contact/{id}` - Update contact
- `PUT /contact/{id}/action-note` - Add note
- `PUT /contact/{id}/tags` - Add/remove tags

**Listing Endpoints**:
- `GET /manuallistings` - List all listings
- `GET /manuallisting/{id}` - Get single listing

**Contact Fields for Preferences**:
```typescript
{
  // Phone fields - PRIORITY
  cell_phone: string,      // Primary cell (MOST IMPORTANT)
  cell_phone_2: string,    // Secondary cell
  home_phone: string,
  work_phone: string,
  phone: string,           // General phone

  // Buyer preferences (built-in fields)
  average_price: number,   // Target budget
  average_beds: number,    // Desired bedrooms
  average_bathrooms: number,
  lead_type: "buyer" | "seller" | "renter" | "vendor" | "agent",

  // Location preferences
  city: string,
  state: string,
  poi_city: string,        // Point of interest city

  // Categorization
  hashtags: string[],      // Use for property type, areas, preferences

  // Freeform preferences
  notes: string,           // Use for structured JSON of detailed preferences
}
```

**Documentation URLs**:
- [kvCORE Public API V2](https://developer.insiderealestate.com/publicv2/reference)
- [API Token Setup](https://help.insiderealestate.com/en/articles/4263959-boldtrail-api-tokens)
- [Postman Collection](https://www.postman.com/insidere/insidere-s-public-workspace/documentation/1j600er/kvcore-public-api-v2)

### MCP Server Best Practices

**Documentation**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)

**Tool Design Patterns**:
```typescript
server.tool(
  "tool_name",           // snake_case naming
  "Description for AI",  // Clear capability description
  { /* Zod schema */ },  // Parameter validation
  async (args) => {      // Handler with error handling
    try {
      const result = await apiCall(args);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);
```

**Error Handling**:
- Return structured error messages for AI
- Use `isError: true` flag for failures
- Log to stderr, not stdout (breaks JSON-RPC)

**Retry Logic**:
- Implement exponential backoff with jitter
- Respect Retry-After headers (429 responses)
- Don't retry 401/403 auth errors

### Conversational Lead Capture Patterns

**Reciprocity Principle** (60-80% conversion rate):
```
1. User indicates interest (buying/selling)
2. Bot asks survey-style questions (4 options each)
3. Bot SHOWS 3 MATCHING LISTINGS in chat (VALUE FIRST)
4. Bot: "I can save these and send you similar listings. What's your email?"
5. User provides email
6. Bot: "Would you like an agent to call you about these? What's your cell number?"
```

**Survey-Style Question Format**:
Each preference question presents exactly 4 options for easy selection:
```
Bot: "What type of property are you looking for?"
[Detached] [Semi-Detached] [Townhouse] [Condo]

Bot: "What's your budget range?"
[Under $750K] [$750K - $1M] [$1M - $1.5M] [$1.5M+]

Bot: "How many bedrooms do you need?"
[1-2] [3] [4] [5+]

Bot: "Which areas interest you most?"
[Toronto] [Mississauga] [Brampton/Vaughan] [Oakville/Burlington]
```

**Value Exchange** (Keep it simple):
- Personalized property recommendations (PRIMARY)
- Mortgage calculator results (FUTURE)
- NO: buyer's guides, neighborhood tools, market reports (build later)

**Phone Number Priority**:
- Cell phone = immediate contact (highest value)
- Validate format: 10 digits
- OTP verification: Configure later via CRM follow-up workflows

**Goal**: Capture lead info to CRM. Email sending and follow-up handled by CRM, not this system.

---

## IMPLEMENTATION PLAN

### Phase 1: Fix MCP Server Endpoints

Fix all API endpoints to match kvCORE V2 specification.

**Tasks:**
1. Update base URL to `https://api.kvcore.com/v2/public`
2. Fix `get_contact` path to `/contact/{id}`
3. Fix `create_contact` path to `/contact`
4. Fix `get_listings` path to `/manuallistings`
5. Fix `add_contact_note` path to `/contact/{id}/action-note`
6. Remove or fix `get_activities` (not documented)
7. Add error logging with structured format
8. Test all endpoints with real API key

**Goal**: All MCP tools successfully communicate with BoldTrail API.

### Phase 2: Enhanced Contact Types

Update type definitions to support preferences and intent data.

**Tasks:**
1. Update `packages/types/src/contact.ts` with enhanced fields
2. Add buyer/seller/investor preference interfaces
3. Add lead qualification fields
4. Update CRM types for kvCORE field mapping

**Goal**: Type-safe preference capture throughout the system.

### Phase 3: New Chatbot Tools

Create enhanced tools for preference and contact capture.

**Tasks:**
1. Create `capture-preferences.ts` tool for survey responses
2. Update `create-contact.ts` with phone priority and preferences
3. Wire tools to BoldTrail CRM client
4. Add proper tool result handling in chat API

**Goal**: Tools that capture and persist lead data to CRM.

### Phase 4: Enhanced System Prompts

Update prompts with lead capture strategy.

**Tasks:**
1. Add reciprocity principle instructions
2. Add progressive disclosure guidelines
3. Add phone collection strategy (after value)
4. Add buyer vs seller conversation flows
5. Add urgency detection guidelines

**Goal**: AI follows optimal lead capture patterns.

### Phase 5: ChatbotWidget Contact Capture

Add contact collection UI to chatbot widget.

**Tasks:**
1. Add contact capture step to survey flow
2. Add phone number input with validation
3. Add value proposition messaging
4. Wire to chat API with contact tool call
5. Test full flow from survey to CRM

**Goal**: Users can provide contact info through intuitive UI.

---

## STEP-BY-STEP TASKS

### UPDATE boldtrail-mcp-server/src/index.ts - Fix Base URL
- **CHANGE** line 8: `const BOLDTRAIL_API_BASE = "https://api.kvcore.com";`
- **TO**: `const BOLDTRAIL_API_BASE = "https://api.kvcore.com/v2/public";`
- **VALIDATE**: Restart MCP server, check no startup errors

### UPDATE boldtrail-mcp-server/src/index.ts - Fix get_contact
- **CHANGE** line 111: `const data = await boldtrailRequest(\`/contacts/${contact_id}\`);`
- **TO**: `const data = await boldtrailRequest(\`/contact/${contact_id}\`);`
- **VALIDATE**: Test tool call returns contact data

### UPDATE boldtrail-mcp-server/src/index.ts - Fix create_contact
- **CHANGE** line 150: `const data = await boldtrailRequest("/contacts", "POST", params);`
- **TO**: `const data = await boldtrailRequest("/contact", "POST", params);`
- **ADD** new parameters for preferences:
```typescript
server.tool(
  "create_contact",
  "Create a new contact/lead in BoldTrail with preferences",
  {
    first_name: z.string().describe("Contact's first name"),
    last_name: z.string().describe("Contact's last name"),
    email: z.string().email().optional().describe("Contact's email"),
    cell_phone: z.string().optional().describe("Contact's cell phone (PRIORITY)"),
    phone: z.string().optional().describe("Contact's general phone"),
    source: z.string().optional().describe("Lead source (e.g., 'sri-collective', 'newhomeshow')"),
    lead_type: z.enum(["buyer", "seller", "renter", "investor", "general"]).optional(),
    average_price: z.number().optional().describe("Target budget for buyers"),
    average_beds: z.number().optional().describe("Desired bedrooms"),
    average_bathrooms: z.number().optional().describe("Desired bathrooms"),
    city: z.string().optional().describe("Preferred city"),
    hashtags: z.array(z.string()).optional().describe("Tags for property type, preferences"),
    notes: z.string().optional().describe("Additional notes or preferences JSON"),
  },
  async (params) => {
    try {
      // Map to kvCORE field names
      const payload = {
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        cell_phone: params.cell_phone,
        phone: params.phone,
        source: params.source,
        lead_type: params.lead_type,
        average_price: params.average_price,
        average_beds: params.average_beds,
        average_bathrooms: params.average_bathrooms,
        city: params.city,
        hashtags: params.hashtags,
        notes: params.notes,
      };

      const data = await boldtrailRequest("/contact", "POST", payload);
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(data, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error creating contact: ${error instanceof Error ? error.message : String(error)}`,
        }],
        isError: true,
      };
    }
  }
);
```
- **VALIDATE**: Test creating contact with preferences

### UPDATE boldtrail-mcp-server/src/index.ts - Fix get_listings
- **CHANGE** line 189: `let endpoint = \`/listings?limit=${limit}\`;`
- **TO**: `let endpoint = \`/manuallistings?limit=${limit}\`;`
- **VALIDATE**: Test tool returns listing data

### UPDATE boldtrail-mcp-server/src/index.ts - Fix add_contact_note
- **CHANGE** line 266: `const data = await boldtrailRequest(\`/contacts/${contact_id}/notes\`, "POST", { note });`
- **TO**: `const data = await boldtrailRequest(\`/contact/${contact_id}/action-note\`, "PUT", { note });`
- **NOTE**: Changed from POST to PUT per API spec
- **VALIDATE**: Test adding note to existing contact

### UPDATE boldtrail-mcp-server/src/index.ts - Handle get_activities
- **OPTION A**: Remove tool if endpoint doesn't exist
- **OPTION B**: Update path if endpoint is documented elsewhere
- **RECOMMENDATION**: Comment out and log deprecation warning
- **VALIDATE**: Server starts without errors

### UPDATE boldtrail-mcp-server/src/index.ts - Add structured logging
- **ADD** helper function:
```typescript
function logError(domain: string, action: string, details: Record<string, unknown>) {
  console.error(`[${domain}.${action}]`, JSON.stringify(details));
}

function logInfo(domain: string, action: string, details: Record<string, unknown>) {
  console.error(`[${domain}.${action}]`, JSON.stringify(details));
}
```
- **UPDATE** all error handlers to use structured logging
- **VALIDATE**: Check logs show proper format

### CREATE packages/types/src/contact.ts - Enhanced Types
- **REPLACE** entire file with:
```typescript
export interface BuyerPreferences {
  budget?: {
    min?: number;
    max?: number;
    range?: string;
  };
  propertyType?: 'detached' | 'semi-detached' | 'townhouse' | 'condo';
  bedrooms?: number;
  bathrooms?: number;
  locations?: string[];
  timeline?: 'immediate' | '3-months' | '6-months' | '12-months' | 'just-browsing';
  preApproved?: boolean;
  firstTimeBuyer?: boolean;
  mustHaves?: string[];
}

export interface SellerPreferences {
  propertyAddress?: string;
  propertyType?: string;
  reasonForSelling?: string;
  timeline?: string;
  expectedPrice?: number;
  currentMortgageStatus?: 'paid-off' | 'has-mortgage' | 'unknown';
}

export interface InvestorPreferences {
  investmentBudget?: number;
  investmentType?: 'rental' | 'flip' | 'commercial' | 'land';
  preferredAreas?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
}

export interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  cellPhone?: string;
  phoneVerified?: boolean;
  phoneType?: 'mobile' | 'landline' | 'voip' | 'unknown';

  source: 'newhomeshow' | 'sri-collective' | 'chatbot';
  leadType: 'buyer' | 'seller' | 'investor' | 'general';
  leadQuality?: 'hot' | 'warm' | 'cold' | 'unqualified';

  buyerPreferences?: BuyerPreferences;
  sellerPreferences?: SellerPreferences;
  investorPreferences?: InvestorPreferences;

  urgencyFactors?: string[];
  message?: string;
  conversationId?: string;

  timestamp: Date;
  lastEngagement?: Date;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export type LeadType = Contact['leadType'];
export type LeadQuality = NonNullable<Contact['leadQuality']>;
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/types/src/index.ts - Export new types
- **ADD** exports for new interfaces
- **VALIDATE**: Other packages can import types

### CREATE packages/chatbot/src/tools/capture-preferences.ts
- **IMPLEMENT**: Tool for capturing buyer/seller preferences
```typescript
import { z } from 'zod';
import type { CoreTool } from 'ai';

export const capturePreferencesTool: CoreTool = {
  description: `Capture buyer or seller preferences during conversation.
Use this tool when the user shares their property requirements.
Store preferences for later use when creating contact.`,

  parameters: z.object({
    leadType: z.enum(['buyer', 'seller', 'investor', 'general'])
      .describe("Type of lead based on conversation"),

    // Buyer preferences
    budget: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      range: z.string().optional(),
    }).optional().describe("Budget range for buyers"),

    propertyType: z.enum(['detached', 'semi-detached', 'townhouse', 'condo']).optional(),
    bedrooms: z.number().min(1).max(10).optional(),
    bathrooms: z.number().min(1).max(10).optional(),
    locations: z.array(z.string()).optional(),
    timeline: z.enum(['immediate', '3-months', '6-months', '12-months', 'just-browsing']).optional(),
    preApproved: z.boolean().optional(),

    // Seller preferences
    propertyAddress: z.string().optional().describe("Seller's property address"),
    reasonForSelling: z.string().optional(),
    expectedPrice: z.number().optional(),

    // Intent signals
    urgencyFactors: z.array(z.string()).optional()
      .describe("Urgency factors: job relocation, growing family, downsizing, etc."),
  }),

  execute: async (preferences) => {
    // Store in conversation context for later CRM sync
    return {
      success: true,
      message: "Preferences captured",
      preferences,
      leadQuality: determineLeadQuality(preferences),
    };
  },
};

function determineLeadQuality(prefs: Record<string, unknown>): string {
  // Hot: Has timeline (immediate/3-months) or urgency factors
  if (prefs.timeline === 'immediate' || prefs.timeline === '3-months') {
    return 'hot';
  }
  if (prefs.urgencyFactors && (prefs.urgencyFactors as string[]).length > 0) {
    return 'hot';
  }
  if (prefs.preApproved === true) {
    return 'warm';
  }
  if (prefs.timeline === 'just-browsing') {
    return 'cold';
  }
  return 'warm';
}
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/chatbot/src/tools/create-contact.ts
- **REPLACE** with enhanced implementation:
```typescript
import { z } from 'zod';
import type { CoreTool } from 'ai';
import { BoldTrailClient } from '@repo/crm';

export const createContactTool: CoreTool = {
  description: `Create a contact in BoldTrail CRM.
IMPORTANT: Only use this AFTER providing value to the user.
Ask for email first, then cell phone number.
Include any captured preferences.`,

  parameters: z.object({
    firstName: z.string().describe("Contact's first name"),
    lastName: z.string().optional().describe("Contact's last name"),
    email: z.string().email().describe("Contact's email address (required)"),
    cellPhone: z.string().optional()
      .describe("Contact's cell phone number (valuable - ask after showing value)"),
    leadType: z.enum(['buyer', 'seller', 'investor', 'general']),

    // Buyer preferences
    averagePrice: z.number().optional().describe("Target budget"),
    averageBeds: z.number().optional().describe("Desired bedrooms"),
    averageBathrooms: z.number().optional().describe("Desired bathrooms"),
    preferredCity: z.string().optional().describe("Preferred city/area"),
    propertyTypes: z.array(z.string()).optional().describe("Property types: detached, condo, etc."),

    // Seller preferences
    propertyAddress: z.string().optional().describe("Seller's property address"),
    reasonForSelling: z.string().optional(),

    // Intent
    timeline: z.string().optional().describe("Timeline: immediate, 3-months, etc."),
    urgencyFactors: z.array(z.string()).optional(),
    preApproved: z.boolean().optional(),

    // Source
    source: z.enum(['newhomeshow', 'sri-collective']).optional(),
  }),

  execute: async (params) => {
    // Validate phone format if provided
    if (params.cellPhone) {
      const cleaned = params.cellPhone.replace(/\D/g, '');
      if (cleaned.length !== 10 && cleaned.length !== 11) {
        return {
          success: false,
          error: "Invalid phone format. Please provide a 10-digit phone number.",
        };
      }
    }

    try {
      const client = new BoldTrailClient();

      // Build hashtags from preferences
      const hashtags: string[] = [];
      if (params.propertyTypes) {
        hashtags.push(...params.propertyTypes);
      }
      if (params.preferredCity) {
        hashtags.push(params.preferredCity.toLowerCase());
      }
      if (params.preApproved) {
        hashtags.push('pre-approved');
      }
      if (params.timeline) {
        hashtags.push(`timeline-${params.timeline}`);
      }

      // Build notes with structured data
      const notes = JSON.stringify({
        capturedAt: new Date().toISOString(),
        source: params.source || 'chatbot',
        preferences: {
          timeline: params.timeline,
          urgencyFactors: params.urgencyFactors,
          preApproved: params.preApproved,
          propertyAddress: params.propertyAddress,
          reasonForSelling: params.reasonForSelling,
        },
      });

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
      });

      if (response.success) {
        const thankYouMessage = params.cellPhone
          ? `Thank you ${params.firstName}! I've saved your preferences and one of our agents will call you at ${params.cellPhone} soon.`
          : `Thank you ${params.firstName}! I'll send personalized recommendations to ${params.email}.`;

        return {
          success: true,
          contactId: response.contactId,
          message: thankYouMessage,
        };
      } else {
        return {
          success: false,
          error: response.error || "Failed to create contact",
          fallback: response.fallback,
        };
      }
    } catch (error) {
      console.error('[chatbot.createContact.error]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
```
- **VALIDATE**: `npm run type-check`

### UPDATE packages/chatbot/src/prompts/sri-collective.ts
- **REPLACE** with enhanced prompt:
```typescript
export const sriCollectiveSystemPrompt = `You are an AI assistant for Sri Collective Group, a luxury real estate agency in the Greater Toronto Area.

## LEAD CAPTURE STRATEGY - FOLLOW STRICTLY

### 1. SURVEY-STYLE QUESTIONS (4 OPTIONS EACH)
Ask ONE question at a time with exactly 4 clickable options:

**Question 1 - Intent:**
"Are you looking to buy or sell?"
[Buy a Home] [Sell My Home] [Both] [Just Browsing]

**Question 2 - Property Type (for buyers):**
"What type of property are you looking for?"
[Detached] [Semi-Detached] [Townhouse] [Condo]

**Question 3 - Budget:**
"What's your budget range?"
[Under $750K] [$750K - $1M] [$1M - $1.5M] [$1.5M+]

**Question 4 - Bedrooms:**
"How many bedrooms do you need?"
[1-2] [3] [4] [5+]

**Question 5 - Location:**
"Which areas interest you most?"
[Toronto] [Mississauga] [Brampton/Vaughan] [Oakville/Burlington]

**For SELLERS, ask:**
"What type of property are you selling?"
[Detached] [Semi-Detached] [Townhouse] [Condo]

"When are you looking to sell?"
[ASAP] [1-3 months] [3-6 months] [Just exploring]

### 2. SHOW 3 LISTINGS FIRST (VALUE BEFORE ASK)
After collecting preferences, IMMEDIATELY show 3 matching properties:
- Display property cards with image, price, beds/baths, location
- This is the VALUE that earns the right to ask for contact info

### 3. THEN ASK FOR CONTACT INFO
Only AFTER showing listings, ask:
"I can save these and send you similar listings as they come up. What's your email?"
Then: "Would you like an agent to call you about these? What's your cell number?"

### 4. CONVERSATION FLOW EXAMPLE

CORRECT FLOW:
User: "I want to buy a house"
Bot: "Great! What type of property?" [Detached] [Semi-Detached] [Townhouse] [Condo]
User: [Detached]
Bot: "What's your budget?" [Under $750K] [$750K-$1M] [$1M-$1.5M] [$1.5M+]
User: [$1M-$1.5M]
Bot: "How many bedrooms?" [1-2] [3] [4] [5+]
User: [4]
Bot: "Which area?" [Toronto] [Mississauga] [Brampton/Vaughan] [Oakville/Burlington]
User: [Mississauga]
Bot: "Here are 3 detached homes in Mississauga with 4 bedrooms under $1.5M:"
     [Shows 3 property cards with images, prices, details]
Bot: "I can save these and send you similar listings. What's your email?"
User: "john@example.com"
Bot: "Thanks! Would you like an agent to call you about these? What's your cell number?"

WRONG FLOW:
Bot: "Please provide your name, email, and phone to get started." ❌

### 5. VALUE EXCHANGE (KEEP SIMPLE)
What we offer in exchange for contact info:
- Personalized property recommendations ✅
- Save listings and send similar ones ✅
- Agent callback for questions ✅

NOT offering yet (build later):
- Buyer's guides ❌
- Neighborhood reports ❌
- Market analysis ❌

### 6. URGENCY DETECTION
Listen for urgency signals - these are HOT leads:
- "relocating for work"
- "need to move by [date]"
- "lease ending"
- "growing family"
- "pre-approved"

For hot leads, prioritize getting cell phone number.

### 7. SELLER QUESTIONS
If user is selling, capture:
- Property type
- Timeline to sell
- Reason for selling (optional)
- Expected price range (optional)

Sellers often become buyers - capture both intents!

### 8. TOOLS AVAILABLE
- searchProperties: Find matching listings (use BEFORE asking for contact)
- capturePreferences: Save buyer/seller preferences
- createContact: Save to CRM (use AFTER showing value)

### 9. CONTACT INFO
Sri Collective Group
Phone: +1 (416) 786-0431
Areas: Toronto, Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill

TONE: Professional, helpful, conversational (not pushy)

GOAL: Capture phone + email + preferences to CRM. Follow-up handled by CRM workflows.

Remember: SURVEY QUESTIONS → SHOW 3 LISTINGS → ASK FOR CONTACT`;
```
- **VALIDATE**: File saves correctly

### UPDATE packages/chatbot/src/prompts/newhomeshow.ts
- **APPLY** similar enhancements with pre-construction focus
- **KEY DIFFERENCES**:
  - Focus on builder projects and pre-construction
  - VIP access value proposition
  - Deposit structure explanations
  - Investment potential discussions
- **VALIDATE**: File saves correctly

### UPDATE packages/chatbot/src/index.ts - Export new tools
- **ADD** exports:
```typescript
export { capturePreferencesTool } from './tools/capture-preferences';
export { createContactTool } from './tools/create-contact';
```
- **VALIDATE**: `npm run type-check`

### UPDATE apps/sri-collective/app/api/chat/route.ts - Integrate tools
- **REPLACE** with:
```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  sriCollectiveSystemPrompt,
  propertySearchTool,
  capturePreferencesTool,
  createContactTool,
} from '@repo/chatbot';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: sriCollectiveSystemPrompt,
    messages,
    tools: {
      searchProperties: propertySearchTool,
      capturePreferences: capturePreferencesTool,
      createContact: createContactTool,
    },
    maxSteps: 5,

    onFinish: async ({ usage, finishReason, toolCalls }) => {
      // Log conversation completion
      console.error('[chat.sri-collective.complete]', {
        messageCount: messages.length,
        finishReason,
        usage,
      });

      // Check if contact was captured
      const contactCall = toolCalls?.find(tc => tc.toolName === 'createContact');
      if (contactCall?.result?.success) {
        console.error('[chat.lead-captured]', {
          contactId: contactCall.result.contactId,
          leadType: contactCall.args.leadType,
          hasPhone: !!contactCall.args.cellPhone,
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
```
- **VALIDATE**: `npm run type-check --filter=sri-collective`

### UPDATE packages/ui/src/chatbot/ChatbotWidget.tsx - Add listings display + contact capture

**Key Flow**: Survey (4 options each) → Show 3 Listings → Contact Capture

- **UPDATE** SurveyState interface (around line 7):
```typescript
interface SurveyState {
  step: "idle" | "property-type" | "budget" | "bedrooms" | "location" | "show-listings" | "contact-info" | "complete";
  propertyType?: string;
  budget?: string;
  bedrooms?: string;
  locations?: string[];
  matchingListings?: Property[]; // Store 3 listings to display
  firstName?: string;
  email?: string;
  phone?: string;
}
```

- **ADD** SurveyListingsDisplay component (shows 3 property cards):
```typescript
function SurveyListingsDisplay({
  listings,
  onContinue
}: {
  listings: Property[];
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">
          Here are 3 properties matching your criteria:
        </p>
      </div>

      {/* Display 3 compact property cards */}
      <div className="space-y-3">
        {listings.slice(0, 3).map((property) => (
          <div key={property.id} className="flex gap-3 p-2 bg-stone-50 rounded-lg">
            <img
              src={property.images[0] || '/placeholder.jpg'}
              alt={property.title}
              className="w-20 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">
                {formatPrice(property.price)}
              </p>
              <p className="text-xs text-stone-600 truncate">
                {property.bedrooms} bed | {property.bathrooms} bath | {property.city}
              </p>
              <p className="text-xs text-stone-500 truncate">{property.address}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary-light text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
      >
        Save These & Get Similar Listings
      </button>
    </div>
  );
}
```

- **ADD** SurveyContactInfo component:
```typescript
function SurveyContactInfo({
  onSubmit
}: {
  onSubmit: (contact: { firstName: string; email: string; phone?: string }) => void
}) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => !phone || phone.replace(/\D/g, '').length === 10;

  const handleSubmit = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ firstName, email, phone: phone || undefined });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Save these listings</p>
        <p className="text-xs text-stone-500">
          We'll send you similar properties as they become available.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            placeholder="Your first name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary ${
              errors.email ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Cell Phone <span className="text-stone-400">(recommended)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary ${
              errors.phone ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="(416) 555-0123"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          <p className="text-xs text-stone-400 mt-1">
            Our agents respond fastest by phone
          </p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!firstName || !email}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          firstName && email
            ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        Save & Send Me Listings
      </button>

      <p className="text-xs text-stone-400 text-center">
        We respect your privacy. Your information is only used to send relevant listings.
      </p>
    </div>
  );
}
```

- **UPDATE** handleSurveyLocation to fetch 3 listings, then show them:
```typescript
const handleSurveyLocation = async (locations: string[]) => {
  setSurvey(prev => ({ ...prev, locations }));

  // Fetch 3 matching listings based on preferences
  const matchingListings = await getMatchingListings({
    propertyType: survey.propertyType,
    budget: survey.budget,
    bedrooms: survey.bedrooms,
    locations,
  });

  setSurvey(prev => ({
    ...prev,
    matchingListings,
    step: "show-listings"
  }));
};
```

- **ADD** render blocks for show-listings and contact-info steps
- **VALIDATE**: `npm run type-check`

### UPDATE packages/crm/src/client.ts - Map preferences to kvCORE
- **UPDATE** createContact method to handle new fields
- **ADD** field mapping for:
  - `cell_phone` from `phone`
  - `average_price`, `average_beds`, `average_bathrooms` from preferences
  - `hashtags` from property types and locations
  - `notes` for structured preference JSON
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

### Level 3: MCP Server Testing

```bash
# Navigate to MCP server directory
cd boldtrail-mcp-server

# Build the server
npm run build

# Test with stdio transport (requires API key in .env)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```
**Expected**: Returns list of available tools

### Level 4: Manual Testing

```bash
# Start sri-collective in dev mode
npm run dev --filter=sri-collective
```

**At http://localhost:3001:**
1. Open chatbot widget
2. Complete survey (property type, budget, bedrooms, location)
3. Verify contact capture step appears
4. Enter email and phone
5. Submit and verify confirmation message
6. Check console for `[chat.lead-captured]` log

### Level 5: BoldTrail API Testing (with API key)

Test MCP tools directly:
```bash
# Test get_contacts
mcp__boldtrail__get_contacts limit=5

# Test create_contact
mcp__boldtrail__create_contact first_name="Test" last_name="User" email="test@example.com" cell_phone="4165550123" lead_type="buyer"

# Test get_listings
mcp__boldtrail__get_listings limit=5 status="active"
```
**Expected**: All tools return data, no 404 errors

---

## ACCEPTANCE CRITERIA

### MCP Server
- [ ] Base URL updated to `/v2/public`
- [ ] All endpoint paths match kvCORE API V2 spec
- [ ] `get_contacts` returns contact list
- [ ] `get_contact` returns single contact
- [ ] `create_contact` creates contact with preferences
- [ ] `get_listings` returns property listings
- [ ] `add_contact_note` adds note to contact
- [ ] Structured error logging implemented

### Lead Capture
- [ ] Survey-style questions with 4 options each
- [ ] 3 matching listings displayed BEFORE asking for contact
- [ ] Email captured (required)
- [ ] Phone number captured (recommended, validated)
- [ ] Buyer preferences captured (property type, budget, beds, location)
- [ ] Seller preferences captured when relevant (property type, timeline)
- [ ] Preferences mapped to kvCORE fields
- [ ] Contact created in BoldTrail CRM
- [ ] Confirmation message shown to user

### System Prompts
- [ ] Survey-style question format documented
- [ ] "Show 3 listings first" rule enforced
- [ ] Phone collection after showing value
- [ ] Buyer AND seller flows included (sellers become buyers)

### Validation
- [ ] All type-check passes
- [ ] All lint passes
- [ ] Build succeeds
- [ ] Manual testing confirms flow works

---

## COMPLETION CHECKLIST

- [ ] Fixed MCP server base URL (`/v2/public`)
- [ ] Fixed all endpoint paths
- [ ] Enhanced contact types created
- [ ] Chatbot tools implemented (capture-preferences, create-contact)
- [ ] System prompts enhanced with survey-style format
- [ ] ChatbotWidget: Survey with 4 options per question
- [ ] ChatbotWidget: 3 listings displayed before contact capture
- [ ] ChatbotWidget: Contact form (email required, phone recommended)
- [ ] CRM client field mapping updated
- [ ] All validation commands pass
- [ ] Manual testing confirms full flow works
- [ ] Contact saved to BoldTrail CRM with preferences

---

## NOTES

### Design Decisions

**Why fix MCP server first?**
- Foundation for all CRM operations
- Can't test lead capture without working API
- Enables validation of tool implementations

**Why survey-style questions with 4 options?**
- Reduces friction (clicking vs typing)
- Structured data for CRM
- Guides conversation naturally
- Easy to parse and store

**Why show 3 listings BEFORE asking for contact?**
- Reciprocity principle: give value, then ask
- 60-80% conversion rate vs 5-15% upfront
- User sees immediate benefit
- Earns the right to ask for phone number

**Why use hashtags for preferences in kvCORE?**
- kvCORE doesn't support custom fields via API
- Hashtags are searchable and filterable
- Can be used for segmentation and campaigns

**Why JSON in notes field?**
- Preserves structured preference data
- Can be parsed for CRM automation
- No character limit concerns

### Simplified Scope (Intentional)

**What we're building:**
- Capture phone + email + preferences to CRM
- Survey-style preference collection
- Show 3 listings as value exchange

**What we're NOT building (yet):**
- Email sending from chatbot (CRM handles this)
- OTP phone verification (configure in CRM later)
- Buyer's guides, market reports (future enhancement)
- Neighborhood comparison tools (future enhancement)

**Why simplified?**
- Focus on core goal: get lead info into CRM
- CRM already has follow-up workflows
- Can enhance later based on what works

### Trade-offs

**Preferences in notes vs separate fields**
- **Pro**: Unlimited structure
- **Pro**: Future-proof
- **Con**: Requires parsing for automation
- **Decision**: Use both - key fields mapped to built-in, full structure in notes

**OTP verification deferred**
- **Pro**: Simpler initial implementation
- **Pro**: No SMS costs
- **Con**: May have some fake numbers
- **Decision**: Configure follow-up verification in CRM workflows

### kvCORE API Notes

- Token valid for 1 year
- Max 3 tokens per account
- Rate limits not publicly documented
- Contact matching uses email/phone on main card only
- Empty PUT values clear fields

---

## PRP CONFIDENCE SCORE: 8.5/10

**Strengths:**
- Comprehensive API documentation researched
- Exact endpoint paths from official docs
- Detailed lead capture patterns from industry research
- Step-by-step implementation tasks
- Complete validation strategy

**Risks:**
- kvCORE API behavior may differ from docs
- Rate limits unknown
- First-time MCP tool updates

**Mitigations:**
- Test each endpoint individually
- Implement retry logic with backoff
- Add fallback to mock data
- Comprehensive logging for debugging

---

<!-- EOF -->
