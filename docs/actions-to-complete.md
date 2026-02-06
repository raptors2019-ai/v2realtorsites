# Actions to Complete

*Organized from team conversation - January 2025*
*Updated: February 2026 - reconciled with codebase*

---

## Completed

### 1. Site Visit Popup Questionnaire (NewHomeShow) — DONE
3-step modal (budget, locations, timeline) with localStorage persistence. Triggers on first visit. Wired into layout.tsx and connect-with-sales form reads stored preferences.

### 4. Property Filter Count Fix (Sri Collective) — DONE
Dynamic count display in PropertiesPageClient.tsx. Shows "X of Y" with filteredTotal updating on every API response.

### 5. Display Deposit Structure (NewHomeShow) — DONE
Builder project detail page shows deposit amount, payment schedule (parsed from Sanity `depositStructure` field), and incentives list.

### 6. Enhanced Contact Form (NewHomeShow) — DONE
Connect-with-sales form checks for stored `newhomeshow_preferences`. Shows budget/timeline fields only if questionnaire not completed. Shows preferences summary if it was.

### 8. NewHomeShow Disclaimer — DONE
Footer: "NewHomeShow is an independent real estate information service. We are not affiliated with, endorsed by, or representing any builders or developers."

### 12. BoldTrail API Key Setup — DONE
Operational. API key configured in environment variables.

---

## Remaining Work

### 2. WhatsApp Integration (Both Apps)
**Priority:** HIGH
**Goal:** Send leads to WhatsApp group chat with Narubin and Sri

**Status:** NOT STARTED — No code exists for this. Needs research decision first.

**Options:**
- WhatsApp Business API (official, paid)
- Twilio/MessageBird (third-party, paid)
- Simple `wa.me` click-to-chat links (free, no group notification)

**Decision needed:** Is the goal notifications to a group chat (requires API), or just a "Chat on WhatsApp" button for visitors (just a link)?

---

### 3. HoodQ Neighborhood Info (Sri Collective)
**Priority:** HIGH
**Goal:** Add neighborhood data to property pages similar to Realtor.ca

**Status:** PARTIALLY DONE — Chatbot has a `neighborhoodInfoTool` with curated data in `neighborhoods.json` covering schools, transit, and general info for GTA cities. But this data is NOT surfaced on property detail pages — only accessible through the chatbot.

**Remaining:**
- [ ] Research HoodQ API pricing and data coverage
- [ ] Add neighborhood section/tabs to property detail page
- [ ] Decide: use existing chatbot data, HoodQ API, or both

---

### 7. Sold Properties Display (Sri Collective)
**Priority:** MEDIUM
**Goal:** Show properties sold within last year with sale prices

**Status:** NOT STARTED — Requires research into what sold data is available via IDX/BoldTrail APIs.

**Remaining:**
- [ ] Check IDX API for sold/closed listing access
- [ ] Design sold properties section UI
- [ ] Display: address, sold price, sold date, days on market

---

### 9. Property Summary Tabs (Sri Collective)
**Priority:** LOW
**Goal:** Add tabbed property information similar to Realtor.ca

**Status:** NOT STARTED — Property detail page shows gallery, highlights, details, and similar properties but no tabbed interface.

**Depends on:** #3 (HoodQ) for neighborhood tab content.

---

### 10. Update Sri's Phone Number (Sri Collective) — DONE
Confirmed `+1 (416) 305-1111`. Formatted consistently with country code.

---

### 11. Remove Phone Numbers (NewHomeShow) — DONE
Removed phone from footer config and connect-with-sales contact info section. Email-only contact. Phone field still in forms (for capturing user's number).

---

### 13. Regional Market Analytics Dashboard (Sri Collective)
**Priority:** EXPLORATION / FUTURE
**Goal:** Monthly stats by region for Instagram Stories content

**Status:** NOT STARTED — Large feature requiring database, data pipeline, and visualization.

**Blocked by:** Need to determine data source (MLS API access for sold/listed data).

---

## Research Items

| Topic | Status | Notes |
|-------|--------|-------|
| WhatsApp Business API | NOT STARTED | Check costs, group chat capabilities |
| HoodQ API | NOT STARTED | Pricing, data coverage, API docs |
| MLS Sold Data | NOT STARTED | What's available via IDX/BoldTrail for #7 and #13 |

---

## By App Summary

### NewHomeShow
- [x] Site visit popup questionnaire
- [ ] WhatsApp integration *(HIGH — needs research)*
- [x] Display deposit structure from Sanity
- [x] Enhanced contact form
- [x] Footer disclaimer
- [x] Remove phone numbers

### Sri Collective
- [x] Fix filter count not updating
- [ ] HoodQ neighborhood info *(HIGH — partial, chatbot only)*
- [ ] Property summary tabs *(LOW — depends on HoodQ)*
- [ ] Sold properties display *(MEDIUM — needs data source research)*
- [x] Verify Sri's phone number
- [x] BoldTrail API key
- [ ] Regional market analytics dashboard *(FUTURE)*

---

*Last updated: February 5, 2026*
