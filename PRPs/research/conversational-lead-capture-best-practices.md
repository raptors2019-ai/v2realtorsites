# Conversational Lead Capture Best Practices for Real Estate AI Chatbots

**Research Date**: December 22, 2025
**Purpose**: Define best practices for implementing conversational lead capture in real estate AI chatbots using Vercel AI SDK

---

## Table of Contents
1. [Key Data to Collect for Realtors](#key-data-to-collect)
2. [Conversational Collection Patterns](#conversational-patterns)
3. [Progressive Disclosure Strategy](#progressive-disclosure)
4. [Real Estate Chatbot Examples](#industry-examples)
5. [Data Quality & Validation](#data-quality)
6. [Implementation Examples (Vercel AI SDK)](#implementation)

---

## 1. Key Data to Collect for Realtors {#key-data-to-collect}

### Priority 1: Contact Information (Critical)
- **Phone number** (cell preferred over landline)
  - Cell phone = immediate contact
  - Landline may indicate business line or less mobile contact
  - VoIP numbers require further investigation
- **Email address** (required for follow-up)

### Priority 2: Lead Qualification Data
**For Buyers:**
- Budget/price range
- Property type (detached, semi-detached, townhouse, condo)
- Bedrooms/bathrooms
- Preferred locations/neighborhoods
- Timeline to buy (immediate, 3 months, 6+ months)
- Pre-approval status (critical qualifier)
- First-time buyer vs experienced

**For Sellers:**
- Property address (current home)
- Property type
- Reason for selling
- Timeline to sell
- Expected price range
- Current mortgage status

**For Investors:**
- Investment budget
- Investment type (rental, flip, commercial)
- Preferred areas
- Timeline
- Experience level

### Priority 3: Intent Signals
- Urgency factors (job relocation, growing family, downsizing)
- Specific questions about properties or areas
- Previous agent relationships
- Mortgage pre-approval status
- Family needs and lifestyle preferences

---

## 2. Conversational Collection Patterns {#conversational-patterns}

### The Reciprocity Principle
**Give value BEFORE asking for contact information**

✅ **Good Example:**
```
Bot: I found 3 properties in Oakville that match your criteria, all 3-bedroom detached homes under $750K.
Bot: Would you like me to send you the full listings with photos and virtual tours?
User: Yes
Bot: Great! What's the best email to send these to?
```

❌ **Bad Example:**
```
Bot: Welcome! Please provide your name, email, and phone number to get started.
```

### Conversation Flow Best Practices

#### 1. **Keep it Under 3-5 Exchanges Before Asking for Contact Details**
Research shows that keeping conversations brief (3-5 exchanges) before asking for contact information increases conversion rates by 40-60%.

#### 2. **Natural, Progressive Questions**
Instead of asking for all information at once, weave questions into natural conversation:

```
Bot: What type of property are you looking for?
User: A 3-bedroom house
Bot: Great! What's your budget range?
User: Around $800K
Bot: Perfect. Which neighborhoods are you interested in?
User: Mississauga or Oakville
Bot: Excellent! I can send you a personalized list. What's the best email to reach you?
```

#### 3. **Value Exchange for Lead Capture**
Offer immediate value in exchange for contact info:
- Personalized property recommendations (PRIMARY - show 3 listings)
- Save listings and send similar ones as they come up
- Agent callback for questions

**Keep it simple** - these can be added later:
- Buyer's guide PDFs
- Neighborhood comparison tools
- Market analysis reports

**Example:**
```
Bot: Here are 3 homes matching your criteria: [shows property cards]
Bot: I can save these and send you similar listings. What's your email?
```

### Survey-Style Question Format (Recommended)

Present each question with exactly 4 clickable options:
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

**Benefits:**
- Reduces friction (clicking vs typing)
- Structured data for CRM
- Guides conversation naturally
- Easy to parse and store

### When to Ask for Contact Information

**AFTER Showing 3 Listings (Recommended)**
- Complete survey questions first
- Show 3 matching property cards in chat
- THEN ask for email/phone
- Conversion rate: 60-80%

**Why this works:**
- User sees immediate value
- Reciprocity principle in action
- Earns the right to ask for contact

**BAD: At the Beginning**
- Risk: 40-60% drop-off rate
- User hasn't seen any value yet
- Feels like a form, not a conversation

---

## 3. Progressive Disclosure Strategy {#progressive-disclosure}

### What is Progressive Disclosure?
Progressive disclosure means gathering information naturally through conversation, one question at a time, instead of presenting a long form.

### Progressive Profiling Approach

**Stage 1: Initial Contact (First Visit)**
- Name (first name only is fine)
- Email address
- Basic intent (buyer/seller/investor)

**Stage 2: Qualification (Subsequent Interactions)**
- Budget/price range
- Property preferences
- Location preferences
- Timeline

**Stage 3: Deep Qualification (Serious Leads)**
- Pre-approval status
- Specific urgency factors
- Detailed preferences
- Phone number (for hot leads)

### The 3-Question Rule
**Don't ask more than 3 questions before providing value or asking for contact info.**

**Example Flow:**
```
1. Bot: What type of property are you looking for?
2. Bot: What's your budget range?
3. Bot: Which areas interest you?
   → PROVIDE VALUE: Show matching properties
   → THEN ASK: "Can I get your email to send you the full details?"
```

### Conversational vs Traditional Forms

**Traditional Form (Low Conversion: 5-15%)**
```
Name: ___________
Email: ___________
Phone: ___________
Budget: ___________
Property Type: ___________
Location: ___________
Submit
```

**Conversational Approach (High Conversion: 30-50%)**
```
Bot: Hi! Looking for your dream home?
User: Yes
Bot: Awesome! What type of property interests you?
[Progressive questions, one at a time...]
```

---

## 4. Real Estate Chatbot Examples {#industry-examples}

### Industry Leaders

#### Zillow's Approach
- **Market Share**: 44% of real estate search traffic
- **Strategy**:
  - ChatGPT integration shows real listings with photos, maps, pricing
  - Guides users seamlessly back to Zillow to schedule tours or connect with agents
  - Focuses on immediate value before lead capture
- **Response Time**: Premier Agents reply within 5 minutes to 1 hour
- **Tools**: AI chatbots + autoresponders + personal touch

#### Realtor.com's Approach
- **Market Share**: 19% (focuses on licensed agent listings only)
- **Strategy**: Ensures data accuracy, attracts buyers seeking professional representation
- **Lead Capture**: Direct interaction through Premier Agent program
- **Average Lead Cost**: $223 in major metros, $139 in non-major metros

#### Common Patterns from Top Real Estate Chatbots

**The Keyes Company - "Sunny" Chatbot**
- Asks qualifying questions
- Collects contact info for agent follow-up
- Shares property options directly in chat
- Books viewings

**SpainForSale - Quiz-Style Qualification**
- Property type
- Preferred location
- Budget
- Move-in season
- Offers Buyer's Guide in exchange for email
- Ensures personalized follow-up

### Key Qualification Questions Used by Top Chatbots

1. **Budget** - "What's your budget?"
2. **Property Type** - "What type of property are you interested in?"
3. **Location** - "Which neighborhoods appeal to you?"
4. **Timeline** - "When are you looking to move?"
5. **Bedrooms/Bathrooms** - "How many bedrooms do you need?"
6. **Pre-approval** - "Are you already approved for a mortgage?"
7. **Urgency** - "Any specific factors driving your timeline?"

---

## 5. Data Quality & Validation {#data-quality}

### Phone Number Validation

#### Line Type Identification
Modern validation tools provide:
- **Mobile vs Landline Detection**
  - Mobile = immediate contact (preferred)
  - Landline = may indicate business or less mobile contact
  - VoIP = requires investigation
  - Toll-free = usually business, not relevant for individual leads

#### Validation Methods

**1. Format Validation (Basic)**
```typescript
const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const isValidFormat = phoneRegex.test(phoneNumber);
```

**2. Real-Time Verification (Recommended)**
- Services like Twilio Lookup API, Byteplant Phone-Validator
- Verifies number exists and is active
- Identifies line type (mobile/landline)
- Returns carrier information

**3. OTP (One-Time Password) Verification (Best)**
- Sends verification code to phone number
- Confirms number is real and accessible
- Prevents fake submissions at point of capture
- Increases lead quality by 70-90%

**Example OTP Flow:**
```
Bot: Great! What's your cell phone number?
User: (416) 555-0123
Bot: Perfect! I just sent a verification code to (416) 555-0123.
     What's the 6-digit code?
User: 123456
Bot: Verified! ✓
```

### Email Validation

#### AI-Powered Email Validation (2025)
Modern email validation uses AI/LLM to:
- Analyze patterns associated with risky addresses
- Identify temporary email services (mailinator, guerrillamail)
- Detect fraudulent domains
- Flag known spammers
- Predict bounce likelihood

#### Email Categories
- **Valid**: Verified, deliverable email
- **Risky**: Temporary service, suspicious domain
- **Invalid**: Syntax errors, non-existing domain, unaccepted by mail exchanger
- **Unknown**: Cannot verify (server issues, etc.)

#### Basic Email Validation
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidFormat = emailRegex.test(email);

// Additional checks:
// - No temporary email domains (mailinator.com, etc.)
// - Domain has valid MX records
// - Not a known spam domain
```

### Detecting Fake Leads

#### Common Fake Lead Indicators
1. **Suspicious Patterns**
   - Same IP submitting multiple forms
   - Too-fast form completion (bot-like behavior)
   - Generic emails (test@test.com, abc@gmail.com)
   - Invalid phone formats or clearly fake numbers (555-555-5555)
   - Unusual geographic locations relative to property interest

2. **Bot Detection Methods**
   - **reCAPTCHA** (Google's bot detection)
   - **Multi-step forms** (bots struggle with complex flows)
   - **Honeypot fields** (hidden fields that bots fill but humans don't)
   - **Behavior analysis** (mouse movements, typing speed)
   - **Traffic source monitoring** (suspicious referrers)

3. **Engagement Verification**
   - Real leads show engagement: click emails, visit multiple pages, respond to follow-ups
   - Fake leads: no engagement, bounce immediately, never respond

#### Working with Invalid Contact Info
**Important Insight**: A lead with a fake phone number isn't necessarily a bad lead.

**Strategy:**
```
1. Send email asking for correct phone number
2. Explain there may have been a typo
3. ~10% respond with correct info
4. This puts you ahead of competitors who ignored the lead
```

**Example Email:**
```
Subject: Quick question about your property search

Hi [Name],

I noticed there might have been a typo with the phone number you provided.
I'd love to discuss those 3-bedroom homes in Oakville you were interested in.

Could you reply with your best contact number?

Thanks!
[Agent Name]
```

### Point-of-Capture Verification (Recommended)

**Benefits:**
- Validates information BEFORE it enters your database
- Prevents wasted time on fake leads
- Improves CRM data quality
- Reduces follow-up costs

**Implementation:**
- Real-time email verification APIs
- Phone number authentication
- IP address validation
- Device fingerprinting

---

## 6. Implementation Examples (Vercel AI SDK) {#implementation}

### Current System Analysis

**Existing Codebase Structure:**
```
/packages/chatbot/src/tools/create-contact.ts - Contact creation tool
/packages/types/src/contact.ts - Contact type definitions
/apps/sri-collective/app/api/chat/route.ts - Chat API endpoint
/packages/ui/src/chatbot/ChatbotWidget.tsx - Chat UI component
```

**Current Contact Schema:**
```typescript
interface Contact {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string  // Optional - SHOULD BE REQUIRED FOR QUALIFIED LEADS
  message?: string
  source: 'newhomeshow' | 'sri-collective'
  leadType: 'buyer' | 'seller' | 'investor' | 'general'
  timestamp: Date
}
```

### Enhanced Contact Schema (Recommended)

```typescript
// /packages/types/src/contact.ts
export interface Contact {
  // Basic Info
  id?: string
  firstName: string
  lastName: string
  email: string
  emailVerified?: boolean
  phone?: string
  phoneVerified?: boolean
  phoneType?: 'mobile' | 'landline' | 'voip' | 'unknown'

  // Lead Classification
  source: 'newhomeshow' | 'sri-collective'
  leadType: 'buyer' | 'seller' | 'investor' | 'general'
  leadQuality: 'hot' | 'warm' | 'cold' | 'unqualified'

  // Buyer Preferences (optional fields)
  buyerPreferences?: {
    budget?: {
      min?: number
      max?: number
      range?: string  // e.g., "500k-750k"
    }
    propertyType?: 'detached' | 'semi-detached' | 'townhouse' | 'condo'
    bedrooms?: number
    bathrooms?: number
    locations?: string[]
    timeline?: 'immediate' | '3-months' | '6-months' | '12-months' | 'just-browsing'
    preApproved?: boolean
    firstTimeBuyer?: boolean
    mustHaves?: string[]  // e.g., ['garage', 'backyard', 'near schools']
  }

  // Seller Preferences (optional fields)
  sellerPreferences?: {
    propertyAddress?: string
    propertyType?: string
    reasonForSelling?: string
    timeline?: string
    expectedPrice?: number
    currentMortgageStatus?: 'paid-off' | 'has-mortgage' | 'unknown'
  }

  // Investor Preferences (optional fields)
  investorPreferences?: {
    investmentBudget?: number
    investmentType?: 'rental' | 'flip' | 'commercial' | 'land'
    preferredAreas?: string[]
    experienceLevel?: 'beginner' | 'intermediate' | 'experienced'
  }

  // Engagement Tracking
  message?: string
  conversationHistory?: {
    messages: number
    topics: string[]
    propertiesViewed?: string[]
  }
  urgencyFactors?: string[]  // e.g., ['job relocation', 'growing family']

  // Metadata
  timestamp: Date
  lastEngagement?: Date
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}
```

### Vercel AI SDK Tool: Progressive Lead Capture

```typescript
// /packages/chatbot/src/tools/capture-lead-info.ts
import { z } from 'zod'
import type { CoreTool } from 'ai'

/**
 * Progressive lead capture tool for collecting buyer preferences
 * Use this AFTER providing value to the user
 */
export const captureBuyerPreferencesTool: CoreTool = {
  description: `Capture buyer preferences during natural conversation.
    Use this tool when the user has shared property preferences.
    IMPORTANT: Only ask for contact info AFTER showing value (property matches, insights, etc.)`,

  parameters: z.object({
    budget: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      range: z.string().optional()
    }).optional().describe("User's budget range"),

    propertyType: z.enum(['detached', 'semi-detached', 'townhouse', 'condo']).optional()
      .describe("Type of property user is interested in"),

    bedrooms: z.number().min(1).max(10).optional()
      .describe("Number of bedrooms needed"),

    bathrooms: z.number().min(1).max(10).optional()
      .describe("Number of bathrooms needed"),

    locations: z.array(z.string()).optional()
      .describe("Preferred neighborhoods or cities"),

    timeline: z.enum(['immediate', '3-months', '6-months', '12-months', 'just-browsing']).optional()
      .describe("User's timeline to purchase"),

    preApproved: z.boolean().optional()
      .describe("Whether user has mortgage pre-approval"),

    firstTimeBuyer: z.boolean().optional()
      .describe("Whether this is user's first home purchase"),

    mustHaves: z.array(z.string()).optional()
      .describe("Must-have features (garage, backyard, etc.)")
  }),

  execute: async (preferences) => {
    // Store preferences in conversation state
    // This will be sent to CRM when user provides contact info
    return {
      success: true,
      message: "Preferences captured",
      preferences
    }
  }
}

/**
 * Contact capture tool - use AFTER providing value
 */
export const captureContactInfoTool: CoreTool = {
  description: `Capture contact information to follow up with the user.
    ONLY use this tool when:
    1. You've already provided value (shown properties, answered questions, etc.)
    2. User has expressed interest in follow-up
    3. Conversation has been 3-5 exchanges minimum

    Ask for email first, then phone. Use reciprocity principle.`,

  parameters: z.object({
    firstName: z.string().describe("User's first name"),
    lastName: z.string().optional().describe("User's last name (optional)"),
    email: z.string().email().describe("User's email address"),
    phone: z.string().optional().describe("User's phone number (optional, but valuable)"),
    leadType: z.enum(['buyer', 'seller', 'investor', 'general']).describe("Type of lead"),
    urgencyFactors: z.array(z.string()).optional()
      .describe("Any urgency factors mentioned (job relocation, growing family, etc.)")
  }),

  execute: async ({ firstName, lastName, email, phone, leadType, urgencyFactors }) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Invalid email format. Please provide a valid email address."
      }
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return {
          success: false,
          error: "Invalid phone format. Please provide a 10-digit phone number."
        }
      }
    }

    // TODO: Integrate with BoldTrail MCP or CRM
    // await createContactInCRM({ firstName, lastName, email, phone, leadType })

    return {
      success: true,
      message: `Thank you ${firstName}! I'll send you personalized property recommendations to ${email}${phone ? ' and follow up via phone' : ''}.`,
      leadType,
      contactCaptured: true
    }
  }
}

/**
 * Request phone verification tool
 */
export const requestPhoneVerificationTool: CoreTool = {
  description: `Request phone number verification via OTP.
    Use this for high-value leads to ensure contact quality.`,

  parameters: z.object({
    phone: z.string().describe("Phone number to verify"),
  }),

  execute: async ({ phone }) => {
    // TODO: Send OTP via Twilio or similar
    // const verificationCode = await sendOTP(phone)

    return {
      success: true,
      message: `I just sent a verification code to ${phone}. What's the 6-digit code?`,
      awaitingVerification: true
    }
  }
}
```

### System Prompt with Progressive Disclosure

```typescript
// /packages/chatbot/src/prompts/sri-collective.ts
export const sriCollectiveSystemPrompt = `You are an AI assistant for Sri Collective Group, a luxury real estate agency in the Greater Toronto Area.

LEAD CAPTURE STRATEGY - FOLLOW THESE RULES STRICTLY:

1. RECIPROCITY PRINCIPLE - Always provide value BEFORE asking for contact information:
   ✅ Show property matches first
   ✅ Answer questions thoroughly
   ✅ Demonstrate expertise
   ✅ Build trust
   ❌ DON'T ask for contact info in first 1-2 messages

2. PROGRESSIVE DISCLOSURE - Gather information naturally:
   - Start with property preferences (budget, type, location)
   - Ask 1-2 questions at a time, not all at once
   - Keep conversations under 3-5 exchanges before value delivery
   - After showing value, THEN ask for contact info

3. CONTACT COLLECTION PRIORITY:
   - Email (required) - Ask first: "What's the best email to send these to?"
   - Phone (valuable) - Ask second: "Would you like a call from one of our agents? What's your cell number?"
   - Name (required) - Natural to ask: "What's your name?"

4. LEAD QUALIFICATION QUESTIONS (ask naturally during conversation):
   For Buyers:
   - Budget/price range
   - Property type (detached, semi-detached, townhouse, condo)
   - Bedrooms/bathrooms needed
   - Preferred locations
   - Timeline (immediate, 3 months, 6+ months)
   - Pre-approval status (critical qualifier)
   - Must-have features

   For Sellers:
   - Property address
   - Property type
   - Reason for selling
   - Timeline to sell
   - Expected price range

   For Investors:
   - Investment budget
   - Investment type (rental, flip, commercial)
   - Preferred areas
   - Experience level

5. CONVERSATION FLOW EXAMPLES:

   GOOD FLOW (60-80% conversion):
   User: I'm looking for a house
   Bot: Great! What's your budget range?
   User: Around $800K
   Bot: Perfect! Which neighborhoods interest you?
   User: Mississauga or Oakville
   Bot: Excellent! [Shows 3 matching properties]
   Bot: I can send you the full listings with photos and virtual tours. What's your email?
   User: john@example.com
   Bot: Thanks John! Would you like one of our agents to call you to discuss these properties? What's your cell number?

   BAD FLOW (5-15% conversion):
   Bot: Welcome! Please provide your name, email, and phone number to get started.

6. VALUE PROPOSITIONS to offer in exchange for contact info:
   - Personalized property recommendations
   - Virtual tour links
   - Market analysis reports
   - Mortgage calculator results
   - Buyer's/Seller's guides
   - Neighborhood comparisons
   - Off-market listings access

7. URGENCY DETECTION - Listen for urgency factors:
   - Job relocation
   - Growing family
   - Downsizing
   - Investment deadlines
   - School year timing
   - Lease ending

   If urgent, qualify as "hot lead" and prioritize phone number capture.

8. HANDLING OBJECTIONS:
   - "Why do you need my email?" → "So I can send you the full property details with photos and virtual tours"
   - "I don't want to be contacted" → "No problem! Just provide your email and I'll send the info. We won't call unless you request it."
   - "Can't I just browse?" → "Absolutely! Feel free to browse our listings. When you find something interesting, I can send you more details."

9. VERIFICATION (for hot leads):
   - If user provides phone, consider OTP verification for high-value leads
   - "I just sent a code to verify your number. What's the 6-digit code?"

TONE: Professional, helpful, conversational (not pushy), luxury-focused

Remember: BUILD TRUST → PROVIDE VALUE → CAPTURE CONTACT INFO`
```

### Chat API Route Enhancement

```typescript
// /apps/sri-collective/app/api/chat/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import {
  sriCollectiveSystemPrompt,
  propertySearchTool,
  captureBuyerPreferencesTool,
  captureContactInfoTool,
  requestPhoneVerificationTool
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
      captureBuyerPreferences: captureBuyerPreferencesTool,
      captureContactInfo: captureContactInfoTool,
      requestPhoneVerification: requestPhoneVerificationTool,
    },
    maxSteps: 5,

    // Optional: Add onFinish callback to save conversation to CRM
    onFinish: async ({ usage, finishReason, text, toolCalls }) => {
      // Check if contact was captured in any tool call
      const contactToolCall = toolCalls?.find(tc => tc.toolName === 'captureContactInfo')

      if (contactToolCall && contactToolCall.result.success) {
        // Save to BoldTrail CRM
        console.log('[chat.lead-captured]', {
          contact: contactToolCall.args,
          conversationLength: messages.length,
          usage
        })

        // TODO: Send to BoldTrail MCP
        // await createContactInBoldTrail(contactToolCall.args)
      }
    }
  })

  return result.toDataStreamResponse()
}
```

### UI Component Enhancement (ChatbotWidget.tsx)

**Current Implementation Analysis:**
- ✅ Has progressive survey flow (property-type → budget → bedrooms → location)
- ✅ Uses visual interactive elements (buttons, not forms)
- ✅ One question at a time
- ❌ Collects preferences but doesn't ask for contact info at end
- ❌ No email/phone capture in survey flow
- ❌ No validation

**Recommended Enhancement:**

```typescript
// Add contact capture step after location selection
// /packages/ui/src/chatbot/ChatbotWidget.tsx

// Add to SurveyState interface:
interface SurveyState {
  step: "idle" | "property-type" | "budget" | "bedrooms" | "location" | "contact-info" | "complete";
  propertyType?: string;
  budget?: string;
  bedrooms?: string;
  locations?: string[];
  email?: string;
  phone?: string;
  firstName?: string;
}

// Add new component after SurveyLocation:
function SurveyContactInfo({ onSubmit }: { onSubmit: (contact: { firstName: string; email: string; phone?: string }) => void }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Phone is optional
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

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
        <p className="text-sm font-medium text-stone-800 mb-1">Almost There!</p>
        <p className="text-xs text-stone-500">Let me send you personalized property recommendations</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#c9a962]"
            placeholder="John"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] ${
              errors.email ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="john@example.com"
            required
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Cell Phone <span className="text-stone-400">(optional, but helps us reach you faster)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] ${
              errors.phone ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="(416) 555-0123"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!firstName || !email}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          firstName && email
            ? "bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        Send Me Property Recommendations
      </button>

      <p className="text-xs text-stone-400 text-center">
        We respect your privacy. Your information will only be used to send you relevant property listings.
      </p>
    </div>
  );
}

// Update handleSurveyLocation to transition to contact-info step:
const handleSurveyLocation = async (locations: string[]) => {
  addMessage({ role: "user", content: locations.join(", ") });
  setSurvey(prev => ({ ...prev, locations, step: "contact-info" }));

  // Add bot message explaining next step
  addMessage({
    role: "assistant",
    content: "Perfect! I found several properties matching your criteria. Let me send you the full details with photos and virtual tours."
  });
};

// Add new handler for contact info:
const handleSurveyContactInfo = async (contact: { firstName: string; email: string; phone?: string }) => {
  setSurvey(prev => ({ ...prev, ...contact, step: "complete" }));

  // Send to AI + CRM
  setLoading(true);
  const summary = `Contact Info: ${contact.firstName} (${contact.email}${contact.phone ? ', ' + contact.phone : ''})
Preferences: ${survey.propertyType?.replace("-", " ")}, ${survey.bedrooms} bedroom(s), budget ${survey.budget?.replace("-", " to ")}, locations: ${survey.locations?.join(", ")}`;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: summary },
        ],
      }),
    });

    if (!response.ok) throw new Error("Failed to send message");

    const data = await response.json();
    addMessage({ role: "assistant", content: data.message });
  } catch (error) {
    console.error("Chat error:", error);
    addMessage({
      role: "assistant",
      content: `Thank you ${contact.firstName}! I'm sending personalized recommendations to ${contact.email}. One of our agents will reach out within 24 hours.`,
    });
  } finally {
    setLoading(false);
    setSurvey({ step: "idle" });
  }
};

// Add to render section after location survey:
{survey.step === "contact-info" && (
  <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
    <SurveyContactInfo onSubmit={handleSurveyContactInfo} />
  </div>
)}
```

---

## Key Takeaways & Action Items

### What We're Building Now

1. **Survey-Style Questions** - 4 options per question, one at a time
2. **Show 3 Listings First** - Display property cards BEFORE asking for contact
3. **Capture to CRM** - Phone + email + preferences saved to BoldTrail
4. **Basic Validation** - Email and phone format validation

### Scope Boundaries (Simplified)

**IN SCOPE:**
- Capture phone + email + preferences to CRM
- Survey-style preference collection
- Show 3 listings as value exchange
- Basic phone/email validation

**OUT OF SCOPE (Build Later):**
- Email sending from chatbot (CRM handles follow-up)
- OTP phone verification (configure in CRM)
- Buyer's guides, market reports
- Neighborhood comparison tools
- A/B testing

### Future Enhancements (When Volume Justifies)

1. **OTP Verification** - Configure in CRM workflows
2. **AI-Powered Email Validation** - Detect fake emails
3. **Phone Line Type Detection** - Identify mobile vs landline
4. **Engagement Tracking** - Track property views, email opens
5. **Lead Scoring** - Auto-categorize hot/warm/cold
6. **Automated Follow-up** - CRM email sequences based on preferences

---

## Sources

### Lead Capture Best Practices
- [Boost Your Business in 2025 With a Real Estate Chatbot](https://www.chatbot.com/blog/real-estate-chatbot/)
- [5 Best Real Estate Chatbots with AI to Grow Business](https://www.crescendo.ai/blog/best-real-estate-chatbots-with-ai)
- [5 Ways to Use AI for Real Estate Leads in 2025](https://www.luxurypresence.com/blogs/real-estate-ai-lead-generation/)
- [AI Chatbot for Real Estate: Benefits, Use Cases and Top Tools (2025)](https://rtslabs.com/ai-chatbot-for-real-estate/)
- [How Real Estate AI Chatbot Changing Lead Capture Process in 2025](https://blog.itsbot.ai/real-estate-ai-chatbot-change-lead-capture-process/)

### Conversational Lead Qualification
- [Real estate lead qualification in 2025](https://callin.io/real-estate-lead-qualification/)
- [Real Estate Leads Qualification Using ChatGPT](https://dasha.ai/en-us/blog/real-estate-leads-qualification-using-chatgpt)
- [How to Build a Lead Qualification Chatbot That Converts](https://landbot.io/blog/lead-qualification-bot)
- [How to Qualify Real Estate Leads: A Guide for Agents](https://www.coraly.ai/en/blogs/how-to-qualify-real-estate-leads)

### Progressive Disclosure
- [What Is Progressive Profiling & How to Use It](https://blog.hubspot.com/blog/tabid/6307/bid/34155/how-to-capture-more-and-better-lead-intel-with-progressive-profiling.aspx)
- [Build an AI chatbot that captures leads](https://zapier.com/blog/build-ai-chatbot-that-captures-leads/)
- [Chatbots vs Forms: Which Is Better for Lead Capture?](https://ivyforms.com/blog/chatbots-vs-forms/)
- [Lead Generation Chatbot: 24/7 Lead Capture Guide (2025)](https://www.spurnow.com/en/blogs/lead-generation-chatbot)

### Zillow & Industry Examples
- [Zillow's ChatGPT integration forces industry reckoning](https://www.realestatenews.com/2025/10/22/zillows-chatgpt-integration-forces-industry-reckoning)
- [Zillow debuts the only real estate app in ChatGPT](https://www.zillowgroup.com/news/zillow-becomes-first-real-estate-app-in-chatgpt/)
- [Zillow vs. Realtor: A 2025 Comparison](https://www.myoutdesk.com/blog/zillow-vs-realtor/)
- [Real Estate Lead Conversion Scripts](https://www.zillow.com/agent-resources/agent-toolkit/scripts-for-converting-real-estate-leads/)

### Buyer Preference Collection
- [AI Chatbot for Real Estate | Property Chatbot for Realtors](https://boei.help/ai-chatbot/real-estate)
- [Real Estate Broker Chatbot | AI-Powered Lead Capture](https://www.rhinoagents.com/chatbots/real-estate/real-estate-broker-chatbot)
- [Real Estate Chatbots: Automate Customer Interactions](https://gallabox.com/blog/real-estate-chatbots)

### Validation & Data Quality
- [How AI and Large Language Models Are Improving Email Validation](https://www.zerobounce.net/blog/email-resources/email-verification/ai-llm-email-validation)
- [Free email validation check | phone number validation](https://reply.io/email-and-phone-number-validation/)
- [Validate phone number inside chatbot](https://collect.chat/article/show/60981-validate-phone-number-inside-chatbot)
- [Top Phone Verification Services in 2025](https://slashdot.org/software/phone-verification/)

### Fake Lead Detection
- [How Real Estate Agents Can Avoid Wasting Time on Invalid Phone Numbers](https://landlineremover.com/phone-number-validation-for-real-estate)
- [3 Ways To Capture Verified Real Estate Leads + Why It Matters](https://leadcapture.io/blog/verified-real-estate-leads/)
- [3 Ways to Prevent Lead Generation Fraud In Your Forms](https://leadcapture.io/blog/lead-generation-fraud/)
- [How to Verify Leads the Easy Way: OTP Phone Verification](https://leadcapture.io/blog/how-to-verify-leads/)
- [Lead Generation Fraud: How To Detect Fake Leads](https://clickpatrol.com/lead-generation-fraud-how-to-detect-fake-leads-and/)
- [5 Essential Methods To Prevent Lead Generation Fraud](https://phonexa.com/blog/lead-generation-fraud/)

### Vercel AI SDK
- [Lead Agent Template](https://vercel.com/templates/next.js/lead-processing-agent)
- [Tool Use | Vercel Academy](https://vercel.com/academy/ai-sdk/tool-use)
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [How to build AI Agents with Vercel and the AI SDK](https://vercel.com/kb/guide/how-to-build-ai-agents-with-vercel-and-the-ai-sdk)

### Conversation Flow Examples
- [Real Estate Chatbot Templates](https://hellotars.com/chatbot-templates/real-estate)
- [Chatbots For Real Estate Agents](https://chitchatbot.ai/realtor-chatbots/)
- [How to Use Real Estate Chatbots to Drive Leads & Close Deals](https://www.tidio.com/blog/real-estate-chatbots/)
- [9 Real Estate Chatbot Use Cases](https://www.socialintents.com/blog/real-estate-chatbot/)
- [Real Estate Chatbot Use Cases and Examples [2025 Guide]](https://sendpulse.com/blog/real-estate-chatbot)
