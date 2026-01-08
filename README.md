# Realtor Monorepo

Turborepo + npm workspaces monorepo for NewHomeShow and Sri Collective Group real estate platforms.

## Structure

```
realtor/
├── apps/
│   ├── newhomeshow/          # Pre-construction properties (localhost:3000)
│   └── sri-collective/       # Resale properties (localhost:3001)
├── packages/
│   ├── ui/                   # Shared UI components (shadcn/ui)
│   ├── types/                # TypeScript type definitions
│   ├── lib/                  # Utilities & helper functions
│   ├── crm/                  # BoldTrail CRM client + IDX client
│   ├── chatbot/              # AI chatbot engine (7 tools, 2 prompts)
│   ├── analytics/            # Google Analytics 4 integration
│   └── config/               # Shared ESLint, TypeScript, Tailwind configs
├── boldtrail-mcp-server/     # Standalone MCP server for BoldTrail API
├── package.json              # Root workspace configuration
├── turbo.json                # Turborepo task pipeline & caching
└── README.md
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Monorepo**: Turborepo 2.3+ with npm workspaces
- **AI**: Vercel AI SDK 4.0 with OpenAI & Anthropic
- **CRM**: BoldTrail API (kvCORE Public API V2) + IDX
- **Analytics**: Google Analytics 4 via GTM
- **State**: Zustand 5.0
- **Validation**: Zod 3.25
- **Testing**: Jest 29 + ts-jest + @testing-library/react
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm 10+
- BoldTrail API key (for sri-collective CRM features)
- OpenAI API key (for AI chatbot)
- Anthropic API key (optional, for Claude model)
- Google Analytics/GTM IDs (optional)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd realtor

# Install all dependencies
npm install

# Set up environment variables
cp apps/newhomeshow/.env.local.example apps/newhomeshow/.env.local
cp apps/sri-collective/.env.local.example apps/sri-collective/.env.local

# Edit .env.local files with your API keys
# See "Environment Variables" section below
```

### Development

```bash
# Run all apps concurrently
npm run dev
# newhomeshow: http://localhost:3000
# sri-collective: http://localhost:3001

# Run specific app only
npm run dev --filter=newhomeshow
npm run dev --filter=sri-collective

# Type check all packages
npm run type-check

# Lint all code
npm run lint

# Run tests (chatbot, analytics, lib packages)
npm run test
npm run test:watch

# Build all apps and packages
npm run build

# Clean build artifacts
npm run clean
```

### Apps

#### newhomeshow (Port 3000)
Pre-construction properties and new development projects.

**Features:**
- AI chatbot for property inquiries
- Mortgage calculator
- First-time buyer resources
- Neighborhood information

#### sri-collective (Port 3001)
Resale properties with BoldTrail CRM integration.

**Features:**
- Property search with filters
- BoldTrail lead capture
- User preference tracking
- IDX MLS integration
- AI chatbot with CRM tools
- Contact forms with auto-sync

## Environment Variables

### sri-collective

**Required:**
```bash
BOLDTRAIL_API_KEY=eyJ0eXAi...         # kvCORE Public API V2 key
OPENAI_API_KEY=sk-...                 # OpenAI API key
```

**Optional:**
```bash
ANTHROPIC_API_KEY=sk-ant-...          # Anthropic Claude API key
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX       # Google Tag Manager ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX       # Google Analytics 4 ID
```

### newhomeshow

**Required:**
```bash
OPENAI_API_KEY=sk-...                 # OpenAI API key
```

**Optional:**
```bash
ANTHROPIC_API_KEY=sk-ant-...          # Anthropic Claude API key
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX       # Google Tag Manager ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX       # Google Analytics 4 ID
```

### BoldTrail MCP Server

```bash
BOLDTRAIL_API_KEY=eyJ0eXAi...         # Same as sri-collective
```

## Shared Packages

All packages use the `@repo/*` namespace and are shared across both apps.

### @repo/ui

Shared React components built with shadcn/ui and Tailwind CSS.

```typescript
import { Header, Footer, Button, PropertyCard } from '@repo/ui'
```

**Components:**
- Layout: Header, Footer, Container
- UI: Button, Input, Card, Badge
- Real Estate: PropertyCard, PropertyGrid, SearchFilters

### @repo/types

TypeScript type definitions for properties, contacts, listings, and API responses.

```typescript
import type {
  Property,
  Contact,
  BoldTrailListing,
  IDXListing,
  ChatMessage
} from '@repo/types'
```

### @repo/lib

Utility functions, helpers, and validators.

```typescript
import { cn, formatPrice, formatDate, validateEmail } from '@repo/lib'
```

### @repo/crm

BoldTrail CRM client and IDX integration for MLS listings.

```typescript
import { BoldTrailClient, IDXClient } from '@repo/crm'

const crm = new BoldTrailClient()
const contacts = await crm.getContacts({ limit: 25 })

const idx = new IDXClient()
const listings = await idx.searchListings({ city: 'Toronto', minPrice: 500000 })
```

### @repo/chatbot

AI chatbot tools and system prompts for both sites.

```typescript
import {
  propertySearchTool,
  createContactTool,
  mortgageEstimatorTool,
  neighborhoodInfoTool,
  firstTimeBuyerFAQTool,
  sellHomeTool,
  capturePreferencesTool,
  sriCollectiveSystemPrompt,
  newhomeShowSystemPrompt
} from '@repo/chatbot'
```

**7 Chatbot Tools:**
1. `propertySearchTool` - Search properties by criteria
2. `createContactTool` - Capture lead information
3. `capturePreferencesTool` - Save user preferences
4. `mortgageEstimatorTool` - Calculate monthly payments
5. `neighborhoodInfoTool` - Provide neighborhood details
6. `firstTimeBuyerFAQTool` - Answer common questions
7. `sellHomeTool` - Guide sellers through listing

**Tests:** All tools have comprehensive Jest tests in `packages/chatbot/src/__tests__/`

### @repo/analytics

Google Analytics 4 utilities, event tracking, and cookie consent management.

```typescript
import {
  trackPropertyView,
  trackLeadFormSubmit,
  trackChatInteraction,
  CookieConsent
} from '@repo/analytics'
```

## BoldTrail MCP Server

Standalone Model Context Protocol server providing 7 tools for Claude Code CLI.

### Running the MCP Server

```bash
cd boldtrail-mcp-server
npm install
npm run dev
```

### Available MCP Tools

1. **get_contacts** - List contacts/leads with search and pagination
2. **get_contact** - Get specific contact details by ID
3. **create_contact** - Create new contact/lead in CRM
4. **get_listings** - Fetch property listings with status filter
5. **get_activities** - Get contact interaction history
6. **add_contact_note** - Add note to contact record
7. **search_greptile_comments** - Search review comments (future feature)

### Configuration

Configure in Claude Code CLI settings (`.claude/mcp.json`):

```json
{
  "mcpServers": {
    "boldtrail": {
      "command": "node",
      "args": ["boldtrail-mcp-server/src/index.ts"],
      "env": {
        "BOLDTRAIL_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Scripts

All scripts run via Turborepo for optimal caching and parallel execution.

- `npm run dev` - Start all dev servers concurrently
- `npm run build` - Build all apps and packages
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all TypeScript
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run clean` - Clean all build artifacts

### Turbo Filtering

Run commands for specific workspaces:

```bash
# Dev specific app
npm run dev --filter=newhomeshow
npm run dev --filter=sri-collective

# Build specific package
npm run build --filter=@repo/chatbot

# Test specific package
npm run test --filter=@repo/chatbot
```

## Architecture

### Vertical Slice Architecture

Features are organized in self-contained slices with all related code together.

**Example:** Properties feature in sri-collective

```
apps/sri-collective/app/(features)/properties/
├── page.tsx                    # Main properties page
├── [city]/
│   ├── page.tsx               # City-specific listings
│   └── [id]/
│       ├── page.tsx           # Property detail page
│       ├── loading.tsx        # Loading state
│       └── not-found.tsx      # 404 state
├── loading.tsx
└── not-found.tsx
```

### Server Components First

- Default to React Server Components for performance
- Client components only when needed (`"use client"`)
- Data fetching in server components
- Progressive enhancement

### Type Safety

- Strict TypeScript (`strict: true`)
- No `any` types allowed
- Shared types in `@repo/types`
- Zod schemas for runtime validation

### Mobile-First Design

- Tailwind responsive utilities
- Touch-friendly interfaces
- Progressive enhancement
- Performance budget

## Testing

Tests are colocated in `__tests__` folders within packages.

### Running Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Specific package
npm run test --filter=@repo/chatbot
```

### Test Structure

```
packages/chatbot/src/__tests__/
├── property-search.test.ts
├── create-contact.test.ts
├── mortgage-estimator.test.ts
├── neighborhood-info.test.ts
├── first-time-buyer-faq.test.ts
├── sell-home.test.ts
└── capture-preferences.test.ts
```

### Coverage Targets

- **chatbot**: Comprehensive tool testing
- **analytics**: Event tracking validation
- **lib**: Utility function coverage

## Deployment

Both apps are deployed to Vercel.

### Build Configuration

```bash
# Vercel will automatically detect Next.js apps
# Root directory: apps/newhomeshow or apps/sri-collective
# Framework: Next.js
# Build command: npm run build --filter=newhomeshow
# Output directory: .next
```

### Environment Variables

Set all environment variables in Vercel dashboard:
- `BOLDTRAIL_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA_ID`

### Preview Deployments

Every push to a branch creates a preview deployment for both apps.

## Performance

### Turborepo Caching

- First build: ~2 minutes
- Cached builds: ~5 seconds
- Only rebuilds changed packages
- Remote caching available

### Build Optimization

- Server Components reduce bundle size
- Route-based code splitting
- Image optimization via next/image
- Edge Runtime for API routes
- Incremental Static Regeneration (future with Sanity)

## Contributing

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- JSDoc for public APIs

### Workflow

1. Create feature branch from `main`
2. Make changes in appropriate workspace
3. Run `npm run type-check` and `npm run lint`
4. Add tests for new features
5. Commit with conventional commit format
6. Push and create PR

### Commit Format

```
feat(chatbot): add property comparison tool
fix(crm): resolve contact sync issue
docs(readme): update installation steps
test(analytics): add event tracking tests
```

## Documentation

- **CLAUDE.md**: Full coding guidelines for AI assistants
- **PRPs/**: Project Requirement Plans for features
- **.agents/**: Agent reference documentation
- **docs/**: Additional documentation

## Future Enhancements

- **Sanity CMS**: Content management with visual editing
- **Advanced IDX**: Enhanced MLS integration
- **Multi-language**: i18n support
- **Admin Dashboard**: Property management interface
- **Mobile Apps**: React Native applications
- **API Platform**: Public API for partners

## License

Private - All Rights Reserved

## Support

For questions or issues, contact the development team or create an issue in the repository.
