This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

1. Core Principles

- Type Safety: Strict TypeScript (no implicit any, strict: true in tsconfig). All props, hooks, functions typed.

- Vertical Slice Architecture: Feature folders in apps/[site]/(features)/[feature]/ own page, components, hooks, api, tests.

- Monorepo Sharing: Shared UI/logic in packages/ui, packages/shared. No duplication.

- Performance: Server Components default. Use cache: 'no-store' or revalidateTag for dynamic data.

- Real Estate Focus: Tools (mortgage estimator, dream house) as self-contained slices. BoldTrail MCP for contacts/lists.

- Mobile-First: Tailwind responsive utilities mandatory.

2. Tech Stack

- Monorepo: npm workspaces (shared packages, concurrent dev/build via scripts).

- Framework: Next.js 15+ App Router (RSC, Server Actions).

- Language: TypeScript 5.5+.

- Styling: Tailwind v4+ + shadcn/ui. Theme: primary (#3B82F6), secondary (#93C5FD), accent (#EAB308).

- Linting: ESLint 9+ (eslint-config-next, typescript-eslint).

- Testing: Jest 30+ + @testing-library/react.

- CMS: Sanity for new projects (visual editing, GROQ webhooks).

- AI/Chatbot: Vercel AI SDK (multi-model: Grok, Claude, GPT).

- Real Estate API: BoldTrail MCP (contacts/lists via API routes).

- Analytics: Google Analytics 4 (G4A).

- Deployment: Vercel (Edge Runtime for APIs).

3. Architecture

   packages/
   ├── ui/ # shadcn/ui components
   ├── shared/ # Types, utils, BoldTrail client, hooks
   ├── config/ # ESLint, tsconfig, Tailwind
   └── db/ # Prisma/Sanity schemas (if needed)

   apps/
   ├── site-projects/ # New projects showcase + admin panel
   │ ├── app/
   │ │ ├── (admin)/ # Admin routes
   │ │ ├── (features)/ # Vertical slices: mortgage-estimator/
   │ │ ├── api/ # BoldTrail MCP, chatbot
   │ │ └── layout.tsx
   │ └── tests/
   └── site-listings/ # Listings, sell house, realtor connect
   ├── app/
   │ ├── (features)/ # dream-house/, listings/
   │ ├── api/
   │ └── layout.tsx
   └── tests/
   package.json # Root with "workspaces": ["apps/*", "packages/*"]
   tailwind.config.ts # Shared theme: primary/secondary/accent

- Vertical Slices: app/(features)/[feature]/page.tsx, components/, api/, hooks/, tests/.

- Route Groups: (features), (admin) for organization.

- Data Fetching: Server Components + fetch with tags. Sanity: next-sanity.

- State: URLSearchParams/Context for simple; Zustand for global.

- API: /api/[feature]/route.ts. BoldTrail MCP: Secure API routes (Bearer auth).

- Chatbot: /api/chat/route.ts with Vercel AI SDK + tools (BoldTrail search, mortgage calc).

4. Code Style

- Naming: PascalCase components (MortgageEstimator), camelCase functions (fetchListings), snake_case env vars.

- Components: RSC preferred. Typed props.

  // packages/ui/components/Button.tsx
  import { ButtonHTMLAttributes } from 'react';
  import { cn } from '@/lib/utils'; // From shared

  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  }

  export const Button = ({ children, variant = 'primary', className, ...props }: ButtonProps) => (
  <button
  className={cn(
  'px-4 py-2 rounded-md font-medium transition-colors',
  variant === 'primary' && 'bg-primary text-white hover:bg-primary/90',
  variant === 'secondary' && 'bg-secondary text-primary hover:bg-secondary/90',
  variant === 'accent' && 'bg-accent text-primary hover:bg-accent/90',
  className
  )}
  {...props}

  >

      {children}

    </button>
  );

- Hooks: Custom hooks typed, memoized.

  // packages/shared/hooks/useBoldTrail.ts
  /\*\*
  - Fetches contacts/lists from BoldTrail MCP.
  - @param query Search term
  - @returns Promise<Contact[]>
    \*/
    export async function fetchContacts(query: string): Promise<Contact[]> {
    // API call to BoldTrail MCP
    }

- Docstrings: JSDoc for all public APIs.

5. Logging

- Dev: console.log('[domain.feature.action] data', { id });.

- Prod: Use Vercel Logs. Structured: { domain: 'realtor.chat', action: 'query', data: { query } }.

- Errors: console.error('[api.boldtrail.failed]', { error, endpoint });.

6. Testing

- Framework: Jest + React Testing Library. 80% coverage.

- Structure: Colocated tests/page.test.tsx in slices.

- Run: npm test (parallel via root scripts), npm run test:watch.

- Example:

  // apps/site-listings/app/(features)/listings/tests/page.test.tsx
  import { render, screen } from '@testing-library/react';
  import ListingsPage from '../page';

  test('renders listings', () => {
  render(<ListingsPage />);
  expect(screen.getByText('Listings')).toBeInTheDocument();
  });

7. API Contracts

- API Routes: app/api/[feature]/route.ts (Edge Runtime).

- Types: Shared in packages/shared/types.ts.

  // packages/shared/types.ts
  export interface Listing { id: string; price: number; address: string; }
  export interface Contact { id: string; name: string; email: string; }

  // app/api/boldtrail/route.ts
  import { NextResponse } from 'next/server';
  export async function GET(request: Request) {
  const contacts: Contact[] = await fetchFromBoldTrail();
  return NextResponse.json(contacts);
  }

- Errors: { error: string, code: number }.

8. Common Patterns

-

Vertical Slice:

    // apps/site-listings/app/(features)/mortgage-estimator/page.tsx
    import { fetchMortgage } from '@/shared/api/mortgage';
    import { MortgageForm } from './components/MortgageForm';

    export default async function MortgagePage({ searchParams }: { searchParams: { income?: string } }) {
      const estimate = await fetchMortgage({ income: searchParams.income });
      return <MortgageForm initialData={estimate} />;
    }

- Chatbot Tool:

      // apps/site-listings/app/api/chat/route.ts
      import { createAI, streamText } from 'ai';
      import { boldTrailTool } from '@/shared/tools/boldtrail';

      export async function POST(req: Request) {
        const { messages } = await req.json();
        const ai = createAI({ apiKey: process.env.OPENAI_API_KEY });
        const result = await streamText({ model: ai('gpt-4o'), tools: { boldTrail: boldTrailTool }, messages });
        return result.toAIStreamResponse();
      }

9. Development Commands

   # Install: npm install (root)

   # Dev all: npm run dev (concurrent via root package.json scripts, e.g., concurrently)

   # Dev specific: npm run dev --workspace=site-projects

   # Build: npm run build

   # Lint: npm run lint

   # Test: npm run test

   # TypeCheck: npm run type-check

10. AI Coding Assistant Instructions

- Consult CLAUDE.md for all changes.

- Use vertical slices: New features in apps/[site]/(features)/[name]/.

- Import shared: @/ui/components/Button, @/shared/hooks/useBoldTrail.

- Type everything; no any.

- Run npm run lint before commits.

- Sanity: Use GROQ, secure webhooks (@sanity/webhook).

- Chatbot: Vercel AI SDK + BoldTrail tools.

- Tailwind: Use primary/secondary/accent classes.

- Admin: shadcn dashboard components in site-projects/(admin).

- BoldTrail MCP: API routes with auth; types in shared.

- Keep simple: YAGNI, explain if complex.
