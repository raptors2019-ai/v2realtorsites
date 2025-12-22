# Realtor Monorepo

Turborepo + npm workspaces monorepo for NewHomeShow and Sri Collective Group real estate platforms.

## Structure

```
realtor/
├── apps/
│   ├── newhomeshow/          # Pre-construction properties
│   └── sri-collective/       # Resale properties
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── types/                # TypeScript types
│   ├── lib/                  # Utilities
│   ├── crm/                  # BoldTrail CRM client
│   ├── chatbot/              # AI chatbot engine
│   ├── analytics/            # Google Analytics 4
│   └── config/               # Shared configurations
├── package.json              # Root workspace
├── turbo.json                # Turborepo config
└── README.md
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS v4
- **Monorepo**: Turborepo 2.3+
- **AI**: Vercel AI SDK with OpenAI
- **CRM**: BoldTrail API
- **Analytics**: Google Analytics 4 (GTM)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- BoldTrail API key (for sri-collective)
- OpenAI API key (for chatbot)
- Google Analytics/GTM IDs (optional)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/newhomeshow/.env.local.example apps/newhomeshow/.env.local
cp apps/sri-collective/.env.local.example apps/sri-collective/.env.local
# Edit .env.local files with your keys
```

### Development

```bash
# Run all apps concurrently
npm run dev

# Run specific app
npm run dev --filter=newhomeshow
npm run dev --filter=sri-collective

# Type check all packages
npm run type-check

# Build all apps
npm run build
```

### Apps

- **newhomeshow**: http://localhost:3000
- **sri-collective**: http://localhost:3001

## Environment Variables

### newhomeshow

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
OPENAI_API_KEY=sk-...
```

### sri-collective

```bash
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
OPENAI_API_KEY=sk-...
BOLDTRAIL_API_KEY=eyJ0eXAi...
```

## Shared Packages

### @repo/ui

Shared React components (Header, Footer, Button, etc.)

```typescript
import { Header, Footer, Button } from '@repo/ui'
```

### @repo/types

TypeScript types for properties, contacts, listings

```typescript
import type { Property, Contact, BoldTrailListing } from '@repo/types'
```

### @repo/crm

BoldTrail CRM client for lead management

```typescript
import { BoldTrailClient } from '@repo/crm'

const client = new BoldTrailClient()
const listings = await client.getListings({ limit: 25 })
```

### @repo/chatbot

AI chatbot tools and prompts

```typescript
import { propertySearchTool, newhomeShowSystemPrompt } from '@repo/chatbot'
```

### @repo/analytics

Google Analytics 4 utilities and consent management

```typescript
import { trackPropertyView, trackLeadFormSubmit } from '@repo/analytics'
```

## Scripts

- `npm run dev` - Start all dev servers
- `npm run build` - Build all apps
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all packages
- `npm run clean` - Clean build artifacts

## Architecture

- **Vertical Slice Architecture**: Features organized in self-contained slices
- **Server Components**: Default to RSC for performance
- **Type Safety**: Strict TypeScript with no `any`
- **Mobile-First**: Tailwind responsive utilities
- **Performance**: Turborepo caching for 17x faster builds

## License

Private - All Rights Reserved
# v2realtorsites
