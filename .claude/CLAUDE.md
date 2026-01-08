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
