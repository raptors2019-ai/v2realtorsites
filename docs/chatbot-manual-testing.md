# Chatbot Manual Testing Guide

This guide provides step-by-step manual tests you can run to verify all chatbot functionality.

## Prerequisites

1. Start the dev server:
```bash
npm run dev
```

2. Open the chatbot at: http://localhost:3001 (sri-collective)

---

## Test 1: Property Search

### Via Chat UI
**Prompt:** "Search for 3 bedroom houses in Toronto under 1 million dollars"

**Expected Output:**
- Bot should call the `searchProperties` tool
- Should display 3-5 property cards with:
  - Property image (or placeholder)
  - Price (e.g., "$936,000")
  - Address with city zone (e.g., "Toronto E11")
  - Bedrooms/bathrooms count
- Should show total count (e.g., "I found 732 properties. Here are the top 5:")
- Should offer to save preferences or continue searching

### Via Command Line
```bash
cat > /tmp/test-search.json << 'EOF'
{"messages":[{"role":"user","content":"Search for 3 bedroom houses in Toronto under 1 million dollars"}]}
EOF

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d @/tmp/test-search.json | head -20
```

**Expected Response Contains:**
```
"toolName":"searchProperties"
"args":{"city":"Toronto","maxPrice":1000000,"bedrooms":3}
"success":true
"total":732  (or similar number)
"listings":[...]
```

---

## Test 2: Mortgage Calculator

### Via Chat UI
**Prompt:** "How much house can I afford if I make $150,000 per year, have $100,000 for down payment, and pay $500/month in car loans?"

**Expected Output:**
- Bot should call `estimateMortgage` tool
- Should display mortgage card with:
  - **Max Home Price:** ~$695,000
  - **Down Payment:** $100,000 (14%)
  - **Mortgage Amount:** ~$595,000
  - **CMHC Insurance:** ~$18,445 (since < 20% down)
  - **Monthly Payment:** ~$3,307
- Should offer to search properties under that price

### Via Command Line
```bash
cat > /tmp/test-mortgage.json << 'EOF'
{"messages":[{"role":"user","content":"How much house can I afford if I make $150,000 per year, have $100,000 for down payment, and pay $500/month in car loans?"}]}
EOF

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d @/tmp/test-mortgage.json | head -30
```

**Expected Response Contains:**
```
"toolName":"estimateMortgage"
"args":{"annualIncome":150000,"downPayment":100000,"monthlyDebts":500}
"maxHomePrice":695000
"cmhcPremium":18445
"monthlyPayment":3307
"gdsRatio":39
"tdsRatio":43
```

---

## Test 3: Neighborhood Information

### Via Chat UI
**Prompt:** "Tell me about Mississauga"

**Expected Output:**
- Bot should call `getNeighborhoodInfo` tool
- Should display:
  - Average home prices
  - Transit info (GO stations, MiWay, commute times)
  - School information
  - Popular neighborhoods with prices (Port Credit, Streetsville, Erin Mills, etc.)
  - Recreation/attractions

### Via Command Line
```bash
cat > /tmp/test-neighborhood.json << 'EOF'
{"messages":[{"role":"user","content":"Tell me about Mississauga"}]}
EOF

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d @/tmp/test-neighborhood.json | head -40
```

**Expected Response Contains:**
```
"toolName":"getNeighborhoodInfo"
"args":{"city":"Mississauga"}
"success":true
"avgPrice"
"transit"
"neighborhoods"
```

---

## Test 4: First-Time Buyer FAQ

### Via Chat UI

**Test 4a - Closing Costs:**
**Prompt:** "What are the closing costs when buying a home?"

**Expected Output:**
- Breakdown of costs (1.5-4% of purchase price)
- Land Transfer Tax explanation
- Legal fees ($1,500-$2,500)
- Title insurance ($250-$400)
- Home inspection ($500-$800)

**Test 4b - Incentives:**
**Prompt:** "What rebates can I get as a first-time buyer?"

**Expected Output:**
- Ontario LTT Rebate: up to $4,000
- Toronto LTT Rebate: up to $4,475
- FHSA: $8,000/year tax-deductible
- Home Buyers' Plan: up to $60,000 from RRSP

### Via Command Line
```bash
cat > /tmp/test-faq.json << 'EOF'
{"messages":[{"role":"user","content":"What rebates can I get as a first-time buyer?"}]}
EOF

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d @/tmp/test-faq.json | head -30
```

**Expected Response Contains:**
```
"toolName":"answerFirstTimeBuyerQuestion"
"topic":"first-time-buyer-incentives"
"FHSA"
"Home Buyers' Plan"
"Land Transfer Tax"
```

---

## Test 5: Seller Lead Capture

### Via Chat UI
**Prompt:** "I want to sell my house"

**Expected Flow:**
1. Bot asks: "What type of property are you selling?" [Detached] [Semi-Detached] [Townhouse] [Condo]
2. Select: "Detached"
3. Bot asks: "When are you looking to sell?" [ASAP] [1-3 months] [3-6 months] [Just exploring]
4. Select: "ASAP"
5. Bot should flag as HOT lead and offer free market analysis

### Via Command Line
```bash
cat > /tmp/test-seller.json << 'EOF'
{"messages":[
  {"role":"user","content":"I want to sell my detached house ASAP"}
]}
EOF

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d @/tmp/test-seller.json | head -30
```

**Expected Response Contains:**
```
"toolName":"captureSeller"
"propertyType":"detached"
"timeline":"asap"
"leadQuality":"hot"
```

---

## Test 6: Complete Buyer Journey (E2E)

### Via Chat UI - Step by Step

1. **Start conversation:**
   - You: "I want to buy a house"
   - Bot: "Are you looking to buy or sell?" [Buy a Home] [Sell My Home] [Both] [Just Browsing]

2. **Select intent:**
   - Click: [Buy a Home]
   - Bot: "What type of property?" [Detached] [Semi-Detached] [Townhouse] [Condo]

3. **Select property type:**
   - Click: [Detached]
   - Bot: "What's your budget?" [Under $750K] [$750K-$1M] [$1M-$1.5M] [$1.5M+]

4. **Select budget:**
   - Click: [$750K-$1M]
   - Bot: "How many bedrooms?" [1-2] [3] [4] [5+]

5. **Select bedrooms:**
   - Click: [3]
   - Bot: "Which area?" [Toronto] [Mississauga] [Brampton/Vaughan] [Oakville/Burlington]

6. **Select location:**
   - Click: [Toronto]
   - Bot: Should show 3-5 property listings with images and details

7. **Contact capture:**
   - Bot: "I can save these and send you similar listings. What's your email?"
   - You: "test@example.com"
   - Bot: "Would you like an agent to call you? What's your cell number?"
   - You: "416-555-1234"
   - Bot: Should confirm contact saved and mention follow-up

### Via Command Line (Full Conversation)
```bash
cat > /tmp/test-buyer-journey.json << 'EOF'
{"messages":[
  {"role":"user","content":"I want to buy a house"},
  {"role":"assistant","content":"Great! What type of property are you looking for?\n[Detached] [Semi-Detached] [Townhouse] [Condo]"},
  {"role":"user","content":"Detached"},
  {"role":"assistant","content":"What's your budget range?\n[Under $750K] [$750K-$1M] [$1M-$1.5M] [$1.5M+]"},
  {"role":"user","content":"$750K-$1M"},
  {"role":"assistant","content":"How many bedrooms do you need?\n[1-2] [3] [4] [5+]"},
  {"role":"user","content":"3"},
  {"role":"assistant","content":"Which areas interest you most?\n[Toronto] [Mississauga] [Brampton/Vaughan] [Oakville/Burlington]"},
  {"role":"user","content":"Toronto"}
]}
EOF

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d @/tmp/test-buyer-journey.json
```

**Expected:** Should call `searchProperties` and return Toronto listings.

---

## Test 7: CRM Contact Creation

### Via Chat UI
After completing the buyer journey above, provide contact info:
- Email: "testlead@example.com"
- Phone: "416-555-9999"

### Verify in BoldTrail CRM
1. Log into BoldTrail/kvCORE dashboard
2. Search for the email: testlead@example.com
3. Verify contact has:
   - Correct name/email/phone
   - Hashtags: #website, #sri-collective, #buyer, #budget-750k-1m, #toronto
   - Lead quality tag: #warm-lead or #hot-lead (if phone provided)
   - Notes with preferences

### Via Command Line (Direct Contact Creation)
```bash
cat > /tmp/test-contact.json << 'EOF'
{"messages":[
  {"role":"user","content":"I want to buy a 3 bedroom detached house in Toronto around $900K. My name is Test User, email is testuser@example.com and phone is 416-555-1234. Please save my information."},
  {"role":"assistant","content":"Let me search for properties matching your criteria and save your information."}
]}
EOF

curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d @/tmp/test-contact.json
```

---

## Test 8: Mortgage + CRM Integration

### Via Chat UI
1. Ask: "How much can I afford? I make $120K and have $80K saved"
2. Bot calculates affordability (~$570K)
3. Then say: "Save my info - my email is mortgage.test@example.com"

### Verify in CRM
The contact should have mortgage data in the notes field:
```json
{
  "mortgageEstimate": {
    "maxHomePrice": 570000,
    "downPayment": 80000,
    "monthlyPayment": 2612,
    "annualIncome": 120000
  }
}
```

---

## Test 9: Hot Lead Detection

### Via Chat UI
**Prompt:** "I need to buy a house ASAP - I'm relocating for work and I'm already pre-approved for a mortgage"

**Expected:**
- Bot should detect urgency signals: "relocating", "ASAP", "pre-approved"
- Should prioritize getting phone number
- When contact created, should have:
  - #hot-lead tag
  - #pre-approved tag
  - #relocating tag
  - #timeline-asap tag
- Bot should mention "immediate follow-up" or "agent will call within the hour"

---

## Test 10: Realtor Information

### Via Chat UI
**Prompt:** "How can I contact Sri Collective?"

**Expected Output:**
- Phone: +1 (416) 786-0431
- Email: info@sricollectivegroup.com
- Service areas: Toronto, Mississauga, Brampton, Oakville, Vaughan, Markham, Richmond Hill

**Note:** Individual realtor bios (Sri, Ruben) are NOT currently in the system prompt. If asked "Who is Sri?" the bot will give a generic response.

---

## Test 11: Error Handling

### Test 11a - Invalid Mortgage Input
**Prompt:** "How much can I afford if I make negative $50,000?"

**Expected:** Friendly error message asking for valid income.

### Test 11b - Unknown City
**Prompt:** "Tell me about Atlantis"

**Expected:** Graceful handling - either shows available cities or explains the area isn't covered.

---

## Quick Validation Script

Run this script to test all major functions at once:

```bash
#!/bin/bash
echo "=== Testing Property Search ==="
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Search for condos in Mississauga under 600K"}]}' \
  | grep -o '"success":true' && echo "✓ Property Search PASSED" || echo "✗ Property Search FAILED"

echo ""
echo "=== Testing Mortgage Calculator ==="
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"How much can I afford with 100K income and 50K down?"}]}' \
  | grep -o '"maxHomePrice"' && echo "✓ Mortgage Calculator PASSED" || echo "✗ Mortgage Calculator FAILED"

echo ""
echo "=== Testing Neighborhood Info ==="
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tell me about Oakville"}]}' \
  | grep -o '"toolName":"getNeighborhoodInfo"' && echo "✓ Neighborhood Info PASSED" || echo "✗ Neighborhood Info FAILED"

echo ""
echo "=== Testing First-Time Buyer FAQ ==="
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is the home buying process?"}]}' \
  | grep -o '"toolName":"answerFirstTimeBuyerQuestion"' && echo "✓ First-Time Buyer FAQ PASSED" || echo "✗ First-Time Buyer FAQ FAILED"

echo ""
echo "=== All Tests Complete ==="
```

Save as `test-chatbot.sh` and run with `bash test-chatbot.sh`

---

## Troubleshooting

### "An error occurred" message
- Check server logs: `tail -f` the turbo output
- Verify env vars are set in `apps/sri-collective/.env.local`
- Ensure `runtime = 'nodejs'` in chat route (not 'edge')

### Property search returns empty
- Verify IDX_API_KEY is valid
- Check city names use `startswith` filter (fixed in idx-client.ts)
- Test API directly: see docs/chatbot-testing-strategy.md

### Contact not appearing in CRM
- Verify BOLDTRAIL_API_KEY is valid
- Check server logs for `[crm.boldtrail.createContact.error]`
- Test API key with direct curl to kvCORE

### Mortgage calculation seems wrong
- Verify using Canadian rules (GDS 39%, TDS 44%)
- CMHC applies when down payment < 20%
- Stress test uses max(rate + 2%, 5.25%)
