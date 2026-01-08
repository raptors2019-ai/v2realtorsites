# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install                          # Install all dependencies
npm run dev                          # Run both apps (newhomeshow:3000, sri-collective:3001)
npm run dev --filter=newhomeshow     # Run single app
npm run dev --filter=sri-collective
npm run build                        # Build all (Turborepo caches results)
npm run lint                         # Lint all code
npm run type-check                   # Type check all packages
npm run test                         # Run all tests
npm run test --filter=@repo/chatbot  # Run single package tests
npm run clean                        # Clean build artifacts
```

**BoldTrail MCP Server:**
```bash
cd boldtrail-mcp-server && npm run dev
```

## Architecture Overview

**Monorepo Structure:**
- `apps/newhomeshow/` - Pre-construction properties site (port 3000)
- `apps/sri-collective/` - Resale properties with BoldTrail CRM (port 3001)
- `packages/` - Shared code: ui, types, lib, crm, chatbot, analytics, sanity, config
- `boldtrail-mcp-server/` - MCP server for Claude Code CLI (7 tools for CRM)

**Key Patterns:**
- Vertical Slice Architecture: Features in `apps/[site]/app/(features)/[feature]/`
- Server Components by default, client components only when needed
- Shared packages use `@repo/*` namespace
- Tailwind v4 + shadcn/ui with theme colors: primary (#3B82F6), secondary (#93C5FD), accent (#EAB308)

## Tech Stack

- Next.js 16 (App Router, RSC), TypeScript 5.7+, Tailwind v4
- Turborepo 2.3+ with npm workspaces
- Vercel AI SDK 4.0 (OpenAI, Anthropic)
- BoldTrail API (kvCORE V2) + IDX for MLS
- Jest 29 for testing (tests in `packages/*/src/__tests__/`)
- Zod for runtime validation

## Coding Conventions

- **TypeScript:** Strict mode, no `any`. Run `npm run type-check` before commits.
- **Naming:** PascalCase components, camelCase functions, snake_case env vars
- **Imports:** Use `@repo/*` for shared packages
- **Logging:** `console.log('[domain.feature.action]', { data })` format
- **JSDoc:** Required for public APIs in shared packages

## Chatbot System

7 tools in `@repo/chatbot` (all have Zod schemas):
- propertySearchTool, createContactTool, capturePreferencesTool
- mortgageEstimatorTool, neighborhoodInfoTool, firstTimeBuyerFAQTool, sellHomeTool

Site-specific prompts: `sriCollectiveSystemPrompt`, `newhomeShowSystemPrompt`

## Environment Variables

**sri-collective (required):**
- `BOLDTRAIL_API_KEY` - kvCORE API key
- `OPENAI_API_KEY` - OpenAI for chatbot

**newhomeshow (required):**
- `OPENAI_API_KEY` - OpenAI for chatbot

**Optional (both):**
- `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_ID`

## Important Notes

- New features go in `apps/[site]/app/(features)/[name]/`
- Tests live in `packages/*/src/__tests__/`, not colocated with app code
- BoldTrail MCP server uses stdio transport (stdout=JSON-RPC, stderr=logs)
- Mobile-first responsive design with Tailwind utilities

## PRP Implementation Status

PRPs (Project Requirement Plans) are in `PRPs/features/`. Status as of Jan 2025:

### Completed (95-100%)

| PRP | Status | Notes |
|-----|--------|-------|
| `seo-foundation.md` | ✅ DONE | SEO types, lib functions, sitemap, robots, PropertyJsonLd, city routes, [...filters] catch-all |
| `add-properties-page-boldtrail.md` | ✅ DONE | Properties page, detail page, loading states, 404 handling, BoldTrail integration |
| `chatbot-hero-ux-enhancements.md` | ✅ DONE | z-index fix, pulse animation, hero button enhancements, Framer Motion |

### Mostly Complete (80-95%)

| PRP | Status | Notes |
|-----|--------|-------|
| `ui-ux-enhancements.md` | ✅ 95% | BentoGrid integrated in both home pages, Framer Motion done |
| `analytics-implementation.md` | ✅ 90% | PageViewTracker, trackPropertyListView wired, Consent Mode v2 |
| `properties-page-performance.md` | ✅ 95% | PAGE_SIZE=20, Show More button, loading states all done |

### Substantially Complete (70-95%)

| PRP | Status | Notes |
|-----|--------|-------|
| `fix-boldtrail-mcp-lead-capture.md` | ✅ 95% | MCP server fixed with correct `/v2/public` endpoints, contact capture working |
| `jest-testing-enhancement.md` | ✅ 96% | 396 tests pass (chatbot: 224, lib: 152, analytics: 20), coverage targets met |
| `chatbot-architecture-refactor.md` | ✅ 70% | **Phase 1 DONE**: Component extraction complete, ChatbotWidget 1160→394 lines |

### Partial Implementation (30-60%)

| PRP | Status | Missing |
|-----|--------|---------|
| `chatbot-tools-knowledge-enhancement.md` | 40% | Tool enhancements for better knowledge |
| `properties-page-survey-ux-enhancement.md` | 30% | Survey landing page, image deduplication, mobile fixes |

### Not Started (0%)

| PRP | Status | Notes |
|-----|--------|-------|
| `idx-integration-user-preferences.md` | TODO | Full IDX API client, Zustand persistence, preference sync |
| `newhomeshow-builder-projects-sanity.md` | TODO | Large feature - Sanity CMS integration for builder projects |

### Key Implemented Features

**SEO Infrastructure:**
- `packages/types/src/seo.ts` - GTA cities, price ranges, property types configs
- `packages/lib/src/seo.ts` - Slug parsing, metadata generation, filter validation
- `packages/ui/src/seo/PropertyJsonLd.tsx` - JSON-LD structured data
- `apps/sri-collective/app/sitemap.ts` - Dynamic sitemap generation
- `apps/sri-collective/app/robots.ts` - Crawler directives
- `apps/sri-collective/app/(features)/properties/[city]/page.tsx` - City SEO pages
- `apps/sri-collective/app/(features)/properties/[city]/[...filters]/page.tsx` - Filter combo pages

**Analytics Infrastructure:**
- `packages/analytics/src/ga4.ts` - GA4 core functions
- `packages/analytics/src/real-estate-events.ts` - Property tracking events
- `packages/analytics/src/components/CookieConsent.tsx` - Consent Mode v2
- `packages/analytics/src/components/PageViewTracker.tsx` - Client-side page views
- `packages/analytics/src/components/PropertyDetailTracker.tsx` - Property detail tracking

**UI/Motion Components:**
- `packages/ui/src/motion/` - Framer Motion primitives, variants, hooks
- `packages/ui/src/components/BentoGrid.tsx` - Bento grid layout component
- `packages/ui/src/properties/PropertyCardCarousel.tsx` - Image carousel

**Chatbot Component Architecture (Refactored Jan 2025):**
- `packages/ui/src/chatbot/ChatbotWidget.tsx` - Main container (394 lines, was 1160)
- `packages/ui/src/chatbot/ChatHeader.tsx` - Header with avatar and close button
- `packages/ui/src/chatbot/ChatInput.tsx` - Message input with send button
- `packages/ui/src/chatbot/ChatMessages.tsx` - Message list with TypingIndicator
- `packages/ui/src/chatbot/ChatQuickActions.tsx` - Quick action buttons grid
- `packages/ui/src/chatbot/ChatbotErrorBoundary.tsx` - Error boundary with fallback UI
- `packages/ui/src/chatbot/survey/` - Survey flow orchestrator and step components
- `packages/ui/src/chatbot/tool-renderers/` - Tool result rendering components
