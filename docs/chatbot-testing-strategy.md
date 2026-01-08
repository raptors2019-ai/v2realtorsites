# Chatbot Testing Strategy

This document outlines a comprehensive testing strategy for the Sri Collective and NewHomeShow chatbots.

## Summary of Issues Fixed

### 1. Property Search Bug (FIXED)
**Issue:** Property search failed with "I'm having trouble searching right now" error.

**Root Causes:**
1. IDX API uses city names with zone codes (e.g., "Toronto C01", "Toronto W02") but the filter used exact match `City eq 'Toronto'`
2. Chat API route used Edge Runtime which had issues executing workspace package tools

**Fixes Applied:**
- Changed city filter from `eq` to `startswith` in `packages/crm/src/idx-client.ts`
- Changed chat route from `runtime = 'edge'` to `runtime = 'nodejs'` in `apps/sri-collective/app/api/chat/route.ts`

---

## Testing Checklist

### 1. Property Search Tool
| Test Case | Expected Result | Test Command |
|-----------|-----------------|--------------|
| Search Toronto properties | Returns listings with `startswith(City,'Toronto')` | `curl POST /api/chat -d '{"messages":[{"role":"user","content":"Search for 3 bedroom houses in Toronto under 1 million"}]}'` |
| Search with price range | Filters by minPrice/maxPrice | Test $750K-$1M range |
| Search with bedrooms | Filters by BedroomsTotal | Test 3+ bedrooms |
| No results handling | Returns friendly message | Search for $50M+ properties |
| API error handling | Graceful fallback message | Test with invalid API key |

**Verification:**
```bash
# Direct API test
IDX_API_KEY=$(grep '^IDX_API_KEY=' apps/sri-collective/.env.local | cut -d'=' -f2)
curl -s "https://query.ampre.ca/odata/Property?\$filter=startswith(City,'Toronto')%20and%20StandardStatus%20eq%20'Active'&\$top=3" \
  -H "Authorization: Bearer $IDX_API_KEY" \
  -H "Accept: application/json" | jq '.value[].City'
```

### 2. CRM Contact Creation
| Test Case | Expected Result | Verification |
|-----------|-----------------|--------------|
| Create buyer contact | Contact saved with buyer preferences | Check BoldTrail dashboard |
| Create seller contact | Contact saved with seller timeline | Check BoldTrail dashboard |
| Hot lead scoring | Phone + pre-approved = hot lead | Verify #hot-lead tag |
| Warm lead scoring | Phone only = warm lead | Verify #warm-lead tag |
| Cold lead scoring | Email only = cold lead | Verify #cold-lead tag |
| Hashtag generation | Proper tags for budget, location, type | Verify tags in CRM |
| Mortgage data persistence | mortgageEstimate in notes | Check contact notes |

**Unit Test Command:**
```bash
cd packages/chatbot && npm test -- --testPathPattern="create-contact"
```

### 3. Mortgage Calculator
| Test Case | Expected Result | Verification |
|-----------|-----------------|--------------|
| Basic calculation | Returns max home price | See estimate in response |
| GDS/TDS ratios | GDS ≤ 39%, TDS ≤ 44% | Check ratios in response |
| CMHC insurance | Correct premium for < 20% down | Verify premium amount |
| Stress test | Uses max(rate + 2%, 5.25%) | Check stress test rate |
| CRM data | mortgageEstimate object returned | Verify crmData field |

**Unit Test Command:**
```bash
cd packages/chatbot && npm test -- --testPathPattern="mortgage-estimator"
```

**Manual Test:**
```bash
cat > /tmp/mortgage-test.json << 'EOF'
{"messages":[{"role":"user","content":"How much house can I afford? I make $150K, have $100K down payment, and $500/month in debts"}]}
EOF
curl -s -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d @/tmp/mortgage-test.json
```

### 4. Neighborhood Info Tool
| Test Case | Expected Result | Verification |
|-----------|-----------------|--------------|
| City info request | Returns transit, schools, neighborhoods | Test "Tell me about Mississauga" |
| Specific neighborhood | Returns targeted neighborhood info | Test "What's Port Credit like?" |
| Unknown city | Graceful handling | Test made-up city |

**Unit Test Command:**
```bash
cd packages/chatbot && npm test -- --testPathPattern="neighborhood-info"
```

### 5. First-Time Buyer FAQ
| Test Case | Expected Result | Verification |
|-----------|-----------------|--------------|
| Closing costs question | Returns breakdown with amounts | Test "What are closing costs?" |
| Incentives question | Returns FHSA, HBP, LTT rebates | Test "What rebates can I get?" |
| Down payment question | Returns minimum requirements | Test "How much down payment?" |

**Unit Test Command:**
```bash
cd packages/chatbot && npm test -- --testPathPattern="first-time-buyer"
```

### 6. Seller Lead Capture
| Test Case | Expected Result | Verification |
|-----------|-----------------|--------------|
| ASAP timeline | Hot lead, immediate follow-up | Check lead quality |
| 3-6 months timeline | Warm lead | Check lead quality |
| Just exploring | Cold lead | Check lead quality |
| Already listed | Special relisting message | Verify response |

**Unit Test Command:**
```bash
cd packages/chatbot && npm test -- --testPathPattern="sell-home"
```

### 7. Realtor Information
**Current Status:** System prompt contains:
- Sri Collective Group name
- Phone: +1 (416) 786-0431
- Email: info@sricollectivegroup.com
- Service areas list

**Missing:** Individual realtor bios (Sri, Ruben, etc.)

**Recommendation:** Add realtor bios to system prompt at `packages/chatbot/src/prompts/sri-collective.ts`

---

## Automated Test Suite

### Run All Chatbot Tests
```bash
cd packages/chatbot && npm test
```

### Run Specific Tool Tests
```bash
npm test -- --testPathPattern="property-search"
npm test -- --testPathPattern="create-contact"
npm test -- --testPathPattern="mortgage-estimator"
npm test -- --testPathPattern="neighborhood-info"
npm test -- --testPathPattern="first-time-buyer"
npm test -- --testPathPattern="sell-home"
npm test -- --testPathPattern="capture-preferences"
```

---

## End-to-End Testing Checklist

### Complete Buyer Journey
1. [ ] User says "I want to buy a house"
2. [ ] Bot asks property type with 4 options
3. [ ] User selects "Detached"
4. [ ] Bot asks budget with 4 options
5. [ ] User selects "$750K-$1M"
6. [ ] Bot asks bedrooms with 4 options
7. [ ] User selects "3"
8. [ ] Bot asks location with 4 options
9. [ ] User selects "Toronto"
10. [ ] Bot shows 3-5 property listings
11. [ ] Bot asks for email
12. [ ] User provides email
13. [ ] Bot asks for phone
14. [ ] User provides phone
15. [ ] Contact created in BoldTrail with correct tags

### Complete Seller Journey
1. [ ] User says "I want to sell my house"
2. [ ] Bot asks property type
3. [ ] User selects "Detached"
4. [ ] Bot asks timeline
5. [ ] User selects "ASAP"
6. [ ] Bot offers free market analysis
7. [ ] Bot captures contact info
8. [ ] Hot lead created in CRM

### Mortgage Calculator Flow
1. [ ] User asks about affordability
2. [ ] Bot asks for income (ONE question)
3. [ ] User provides income
4. [ ] Bot asks for down payment (ONE question)
5. [ ] User provides down payment
6. [ ] Bot asks for monthly debts (ONE question)
7. [ ] User provides debts
8. [ ] Bot calculates and displays estimate
9. [ ] Mortgage data stored in CRM notes

---

## Environment Requirements

### Required Environment Variables
```
# apps/sri-collective/.env.local
OPENAI_API_KEY=sk-...
BOLDTRAIL_API_KEY=eyJ...
IDX_API_KEY=eyJ...
IDX_API_URL=https://query.ampre.ca/odata
```

### Verify API Connections
```bash
# Test IDX API
IDX_API_KEY=$(grep '^IDX_API_KEY=' apps/sri-collective/.env.local | cut -d'=' -f2)
curl -s "https://query.ampre.ca/odata/Property?\$top=1" \
  -H "Authorization: Bearer $IDX_API_KEY" | jq '.value | length'
# Expected: 1

# Test BoldTrail API
BOLDTRAIL_API_KEY=$(grep '^BOLDTRAIL_API_KEY=' apps/sri-collective/.env.local | cut -d'=' -f2)
curl -s "https://api.kvcore.com/v2/public/contact" \
  -H "Authorization: Bearer $BOLDTRAIL_API_KEY" | head -c 100
# Expected: Not an auth error
```

---

## Known Limitations

1. **Edge Runtime incompatible with chatbot tools** - Must use `runtime = 'nodejs'`
2. **City names include zone codes** - Use `startswith` filter, not `eq`
3. **No individual realtor bios** - Add to system prompt if needed
4. **Email fallback not implemented** - TODO: Add SendGrid/Resend integration
