# Feature: Migrate MVP Styling to Monorepo

## Feature Description

Migrate the production-quality styling from the MVP sites (`/apps/newhomeshow` and `/apps/sri-collective` in the realtor folder) to the new monorepo (`structure_site/`). This includes comprehensive CSS theming, shared UI components, and all luxury styling patterns that the team approved during MVP review.

The goal is to bring the visual polish and component library from MVP to the monorepo while maintaining the monorepo's architectural advantages (shared packages, Turborepo builds, semantic theming).

## User Story

As a **developer and product stakeholder**
I want to **migrate all MVP styling patterns to the monorepo structure**
So that **the new sites have the same polished, luxury appearance while benefiting from shared code architecture**

## Problem Statement

The new monorepo sites have skeleton styling (~35 lines CSS) compared to the MVP sites (~400-500 lines). Key gaps include:

1. **Missing CSS Classes**: ~50+ luxury styling classes not migrated
2. **Missing Components**: `PropertyCard`, `ChatbotWidget` exist but not exported from `@repo/ui`
3. **Duplicate Components**: MVP sites have local Header/Footer instead of using shared ones
4. **Lost Dark Mode**: NewHomeShow dark mode was removed during migration
5. **Hardcoded Colors**: Monorepo apps use hardcoded hex values instead of CSS variables
6. **Naming Inconsistency**: MVP uses `--gold`, `--red`, `--blue`; monorepo uses `--primary`, `--accent`

## Solution Statement

Systematically migrate MVP styling by:

1. **Enhancing shared theme files** in `packages/ui/src/styles/` with all missing classes
2. **Exporting missing components** from `@repo/ui` (PropertyCard, ChatbotWidget)
3. **Refactoring app pages** to use shared components and semantic CSS classes
4. **Restoring dark mode** for NewHomeShow
5. **Updating app globals.css** to only contain site-specific imports and overrides

## Feature Metadata

**Feature Type**: Enhancement / Migration
**Estimated Complexity**: High
**Primary Systems Affected**:
- `packages/ui/src/styles/` (theme CSS)
- `packages/ui/src/components/` (shared components)
- `packages/ui/src/index.ts` (exports)
- `apps/newhomeshow/` (page + globals.css)
- `apps/sri-collective/` (page + globals.css)

**Dependencies**:
- Tailwind CSS v4
- next-themes (ThemeProvider)
- @repo/types (Property type)
- @repo/lib (formatPrice, cn utilities)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**MVP Source Files (copy styling from):**
- `/Users/josh/code/realtor/apps/newhomeshow/app/globals.css` (482 lines) - Full NewHomeShow theme with dark mode
- `/Users/josh/code/realtor/apps/newhomeshow/app/page.tsx` (455 lines) - Complete hero, sections, cards layout
- `/Users/josh/code/realtor/apps/sri-collective/app/globals.css` (358 lines) - Full Sri Collective theme
- `/Users/josh/code/realtor/apps/sri-collective/app/page.tsx` (446 lines) - Complete page with PropertyCard usage
- `/Users/josh/code/realtor/packages/ui/src/properties/PropertyCard.tsx` (172 lines) - Existing component to export
- `/Users/josh/code/realtor/packages/ui/src/chatbot/ChatbotWidget.tsx` (577 lines) - Existing component to export

**Monorepo Target Files (update these):**
- `/Users/josh/code/realtor/structure_site/packages/ui/src/styles/base.css` (84 lines) - Add animations, utilities
- `/Users/josh/code/realtor/structure_site/packages/ui/src/styles/themes/newhomeshow.css` (366 lines) - Add missing classes
- `/Users/josh/code/realtor/structure_site/packages/ui/src/styles/themes/sri-collective.css` (307 lines) - Add missing classes
- `/Users/josh/code/realtor/structure_site/packages/ui/src/index.ts` (22 lines) - Add PropertyCard, ChatbotWidget exports
- `/Users/josh/code/realtor/structure_site/apps/newhomeshow/app/globals.css` (34 lines) - Refactor to use shared
- `/Users/josh/code/realtor/structure_site/apps/newhomeshow/app/page.tsx` (76 lines) - Replace with MVP content
- `/Users/josh/code/realtor/structure_site/apps/sri-collective/app/globals.css` (33 lines) - Refactor to use shared
- `/Users/josh/code/realtor/structure_site/apps/sri-collective/app/page.tsx` (76 lines) - Replace with MVP content

### New Files to Create

- `/Users/josh/code/realtor/structure_site/packages/ui/src/properties/index.ts` - Property component exports
- `/Users/josh/code/realtor/structure_site/packages/ui/src/chatbot/index.ts` - Chatbot component exports
- `/Users/josh/code/realtor/structure_site/packages/ui/src/chatbot/chatbot-store.ts` - Zustand store for chatbot

### Relevant Documentation

- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) - `@theme` directive usage
- [Tailwind CSS v4 Multi-Theme Strategy](https://simonswiss.com/posts/tailwind-v4-multi-theme) - CSS variables with @theme inline
- [Tailwind CSS v4 Best Practices](https://github.com/tailwindlabs/tailwindcss/discussions/18471) - Community patterns
- [Adding Custom Styles](https://tailwindcss.com/docs/adding-custom-styles) - @layer, @theme usage

### Patterns to Follow

**Tailwind v4 @theme inline Pattern:**
```css
@theme inline {
  --color-primary: var(--primary);
  --color-primary-light: var(--primary-light);
}
```

**Dark Mode Pattern (from MVP):**
```css
@variant dark (&:where(.dark, .dark *));

.dark {
  --background: #0a1628;
  --foreground: #ffffff;
}
```

**Button Class Pattern (from MVP):**
```css
.btn-primary {
  background: var(--primary);
  color: var(--text-light);
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}
.btn-primary:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
}
```

**Card Premium Pattern (from MVP):**
```css
.luxury-card-premium {
  background: var(--white);
  border: 2px solid var(--primary);
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.15);
  position: relative;
  overflow: hidden;
}
.luxury-card-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Enhance Shared Styles (~30% of work)

Update `packages/ui/src/styles/base.css` with:
- Animation keyframes (shimmer, spin)
- Hero gradient overlay
- Feature icon base styles
- Section divider styles
- Focus states
- Link hover animations
- Scrollbar styling

Update theme files with all missing classes:
- Button variants (8+ per theme)
- Card variants (4+ per theme)
- Badge styles
- Shadow utilities
- Gradient text utilities
- Section backgrounds
- Dark mode overrides (NewHomeShow only)

### Phase 2: Export Missing Components (~20% of work)

Create barrel exports for existing components:
- PropertyCard from `packages/ui/src/properties/`
- ChatbotWidget from `packages/ui/src/chatbot/`

Copy chatbot-store.ts to monorepo packages/ui.

Update `packages/ui/src/index.ts` with new exports.

### Phase 3: Refactor App Globals (~20% of work)

Simplify `apps/*/app/globals.css` to:
1. Import Tailwind
2. Import shared base.css
3. Import theme file
4. Minimal app-specific overrides only

Remove duplicate class definitions now in shared packages.

### Phase 4: Migrate Page Content (~30% of work)

Replace skeleton pages with MVP content:
- Copy hero sections with proper class names
- Copy feature cards sections
- Copy contact sections
- Update imports to use `@repo/ui`
- Use semantic CSS classes from shared theme

---

## STEP-BY-STEP TASKS

**IMPORTANT:** Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Phase 1: Enhance Shared Styles

#### TASK 1.1: UPDATE `packages/ui/src/styles/base.css`

- **IMPLEMENT**: Add animation keyframes, scrollbar styles, focus states, link styles
- **PATTERN**: Mirror `/Users/josh/code/realtor/apps/newhomeshow/app/globals.css` lines 271-416
- **IMPORTS**: None (pure CSS)
- **GOTCHA**: Use CSS variables (not hardcoded colors) for theme-agnostic base styles
- **VALIDATE**: `cat packages/ui/src/styles/base.css | grep -c "@keyframes"` should return 2+

Add these to base.css:
```css
/* Animations */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(var(--primary-rgb), 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 3s infinite;
}

.spinner {
  border: 3px solid var(--border-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Hero gradient overlay */
.hero-gradient {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.2) 100%
  );
}

/* Feature icon container */
.feature-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgba(var(--primary-rgb), 0.1);
  border: 1px solid rgba(var(--primary-rgb), 0.2);
}

/* Section divider */
.section-divider-light {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--primary-rgb), 0.3) 50%,
    transparent 100%
  );
}

/* Info card for hero sections */
.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

---

#### TASK 1.2: UPDATE `packages/ui/src/styles/themes/newhomeshow.css`

- **IMPLEMENT**: Add missing classes: `.luxury-card-dark`, `.feature-icon-dark`, dark mode block
- **PATTERN**: Copy from `/Users/josh/code/realtor/apps/newhomeshow/app/globals.css` lines 47-65 (dark mode) and 447-469 (feature-icon-dark, luxury-card-dark)
- **IMPORTS**: None
- **GOTCHA**: The dark mode block `@variant dark` must be at top of file
- **VALIDATE**: `grep -c "\.dark" packages/ui/src/styles/themes/newhomeshow.css` should return 10+

Add dark mode and missing classes:
```css
/* At top of file after @variant */
.dark {
  --background: #0a1628;
  --foreground: #ffffff;
  --secondary: #0a1628;
  --secondary-light: #1a2d4d;
  --secondary-dark: #0d2847;
  --off-white: #1a2d4d;
  --cream: #0f1d32;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --border-light: rgba(255, 255, 255, 0.1);
  --border-primary: rgba(212, 175, 55, 0.4);
  --border-secondary: rgba(255, 255, 255, 0.2);
}

/* Dark mode card variant */
.luxury-card-dark {
  background: rgba(26, 45, 77, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.luxury-card-dark:hover {
  background: rgba(26, 45, 77, 0.5);
  border-color: rgba(212, 175, 55, 0.3);
}

/* Dark mode feature icon */
.feature-icon-dark {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* Dark mode info card */
.dark .info-card {
  background: rgba(26, 45, 77, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* Dark mode card overrides */
.dark .luxury-card {
  background: rgba(26, 45, 77, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15);
}
.dark .luxury-card:hover {
  border-color: var(--border-primary);
  box-shadow: 0 8px 30px rgba(var(--primary-rgb), 0.2), 0 0 0 1px var(--border-primary);
}

.dark .luxury-card-premium {
  background: rgba(26, 45, 77, 0.5);
  border: 2px solid var(--primary);
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.25);
}

.dark .badge-featured {
  background: rgba(26, 45, 77, 0.95);
  color: var(--white);
  border: 1px solid var(--border-primary);
}
```

---

#### TASK 1.3: UPDATE `packages/ui/src/styles/themes/sri-collective.css`

- **IMPLEMENT**: Add `.professional-card-premium` alias and missing shadow classes
- **PATTERN**: Ensure parity with newhomeshow theme structure
- **IMPORTS**: None
- **GOTCHA**: Sri Collective uses `--accent` for red, not `--secondary`
- **VALIDATE**: `grep -c "shadow-accent" packages/ui/src/styles/themes/sri-collective.css` should return 2+

Verify these exist (add if missing):
```css
/* Shadow accent utilities */
.shadow-accent {
  box-shadow: 0 10px 40px rgba(var(--accent-rgb), 0.2);
}
.shadow-accent-lg {
  box-shadow: 0 20px 60px rgba(var(--accent-rgb), 0.3);
}

/* Alias for backwards compatibility */
.luxury-card-dark {
  background: rgba(26, 45, 77, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.luxury-card-dark:hover {
  background: rgba(26, 45, 77, 0.5);
  border-color: rgba(220, 38, 38, 0.3);
}

.feature-icon-dark {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
}
```

---

### Phase 2: Export Missing Components

#### TASK 2.1: CREATE `packages/ui/src/properties/index.ts`

- **IMPLEMENT**: Create barrel export for PropertyCard
- **PATTERN**: Follow existing `packages/ui/src/components/layout/` structure
- **IMPORTS**: PropertyCard from same directory
- **GOTCHA**: Must use relative import path
- **VALIDATE**: `cat packages/ui/src/properties/index.ts` shows export statement

Create file:
```typescript
export { PropertyCard } from './PropertyCard'
export type { PropertyCardProps } from './PropertyCard'
```

Note: Must also add `PropertyCardProps` export to PropertyCard.tsx if not already exported.

---

#### TASK 2.2: CREATE `packages/ui/src/chatbot/chatbot-store.ts`

- **IMPLEMENT**: Copy Zustand store for ChatbotWidget state management
- **PATTERN**: Copy from `/Users/josh/code/realtor/packages/ui/src/chatbot/chatbot-store.ts`
- **IMPORTS**: zustand
- **GOTCHA**: Check if zustand is in packages/ui dependencies
- **VALIDATE**: `grep "create" packages/ui/src/chatbot/chatbot-store.ts` shows Zustand usage

---

#### TASK 2.3: CREATE `packages/ui/src/chatbot/index.ts`

- **IMPLEMENT**: Create barrel export for ChatbotWidget
- **PATTERN**: Follow properties/index.ts pattern
- **IMPORTS**: ChatbotWidget from same directory
- **GOTCHA**: ChatbotWidget imports from chatbot-store, ensure relative path works
- **VALIDATE**: `cat packages/ui/src/chatbot/index.ts` shows export

Create file:
```typescript
export { ChatbotWidget } from './ChatbotWidget'
```

---

#### TASK 2.4: UPDATE `packages/ui/src/index.ts`

- **IMPLEMENT**: Add exports for PropertyCard, ChatbotWidget
- **PATTERN**: Follow existing export pattern in file
- **IMPORTS**: From new index files
- **GOTCHA**: PropertyCard needs @repo/types and @repo/lib - ensure these are dependencies
- **VALIDATE**: `grep "PropertyCard" packages/ui/src/index.ts` returns export line

Add to index.ts:
```typescript
// Properties
export { PropertyCard } from './properties'
export type { PropertyCardProps } from './properties'

// Chatbot
export { ChatbotWidget } from './chatbot'
```

---

#### TASK 2.5: UPDATE `packages/ui/package.json`

- **IMPLEMENT**: Add missing dependencies (zustand, @repo/types, @repo/lib)
- **PATTERN**: Check existing dependencies section
- **IMPORTS**: N/A
- **GOTCHA**: Workspace dependencies use `workspace:*` syntax
- **VALIDATE**: `grep "zustand" packages/ui/package.json` returns dependency entry

Add if missing:
```json
{
  "dependencies": {
    "zustand": "^4.5.0",
    "@repo/types": "workspace:*",
    "@repo/lib": "workspace:*"
  }
}
```

---

### Phase 3: Refactor App Globals

#### TASK 3.1: REFACTOR `apps/newhomeshow/app/globals.css`

- **IMPLEMENT**: Replace with imports from shared packages, minimal overrides
- **PATTERN**: Import order: tailwindcss > base.css > theme.css
- **IMPORTS**: @repo/ui/src/styles/base.css, @repo/ui/src/styles/themes/newhomeshow.css
- **GOTCHA**: Tailwind v4 uses `@import "tailwindcss"` not `@tailwind`
- **VALIDATE**: `wc -l apps/newhomeshow/app/globals.css` should be < 50 lines

Replace content with:
```css
@import "tailwindcss";
@import "@repo/ui/src/styles/base.css";
@import "@repo/ui/src/styles/themes/newhomeshow.css";

@variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

---

#### TASK 3.2: REFACTOR `apps/sri-collective/app/globals.css`

- **IMPLEMENT**: Replace with imports from shared packages, minimal overrides
- **PATTERN**: Same as newhomeshow but with sri-collective theme
- **IMPORTS**: @repo/ui/src/styles/base.css, @repo/ui/src/styles/themes/sri-collective.css
- **GOTCHA**: Sri Collective doesn't use dark mode - no @variant dark needed
- **VALIDATE**: `wc -l apps/sri-collective/app/globals.css` should be < 40 lines

Replace content with:
```css
@import "tailwindcss";
@import "@repo/ui/src/styles/base.css";
@import "@repo/ui/src/styles/themes/sri-collective.css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
}
```

---

### Phase 4: Migrate Page Content

#### TASK 4.1: UPDATE `apps/newhomeshow/app/page.tsx`

- **IMPLEMENT**: Replace skeleton with full MVP page content
- **PATTERN**: Copy from `/Users/josh/code/realtor/apps/newhomeshow/app/page.tsx`
- **IMPORTS**: Link from 'next/link', no Button import needed (using CSS classes)
- **GOTCHA**: Replace hardcoded colors `#c9a962` with `var(--primary)` in className
- **GOTCHA**: Use semantic classes: `btn-primary` not `btn-gold`, `text-gradient-primary` not `text-gradient-gold`
- **VALIDATE**: `wc -l apps/newhomeshow/app/page.tsx` should be ~450 lines

Key sections to include:
1. Hero with background image, gradient overlay, accent-line, CTA buttons, info-card
2. Advantage section with 3 feature cards (luxury-card-premium)
3. Featured Projects section with 2 project cards
4. About section with benefits list
5. Contact section (navy background with contact cards)

---

#### TASK 4.2: UPDATE `apps/newhomeshow/app/layout.tsx`

- **IMPLEMENT**: Add ChatbotWidget import and component
- **PATTERN**: Copy structure from MVP `/Users/josh/code/realtor/apps/newhomeshow/app/layout.tsx`
- **IMPORTS**: `ChatbotWidget` from "@repo/ui"
- **GOTCHA**: ChatbotWidget goes inside ThemeProvider, after Footer
- **VALIDATE**: `grep "ChatbotWidget" apps/newhomeshow/app/layout.tsx` returns import and usage

Add to layout:
```tsx
import { Header, Footer, ThemeProvider, ChatbotWidget } from "@repo/ui";
// ... existing code ...
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
  <Header config={headerConfig} enableDarkMode={true} />
  <main className="min-h-screen">{children}</main>
  <Footer config={footerConfig} />
  <ChatbotWidget />
</ThemeProvider>
```

---

#### TASK 4.3: UPDATE `apps/sri-collective/app/page.tsx`

- **IMPLEMENT**: Replace skeleton with full MVP page content
- **PATTERN**: Copy from `/Users/josh/code/realtor/apps/sri-collective/app/page.tsx`
- **IMPORTS**: `PropertyCard` from "@repo/ui", `getFeaturedProperties` from lib/data
- **GOTCHA**: This is a Server Component with `async` - different from newhomeshow
- **GOTCHA**: Replace `#dc2626` with `var(--accent)`, `#2563eb` with `var(--primary)`
- **VALIDATE**: `wc -l apps/sri-collective/app/page.tsx` should be ~445 lines

Key sections to include:
1. Hero with search card
2. Advantage section with 3 feature cards
3. Featured Properties section using PropertyCard component
4. Sell Your Home section with stats
5. About section
6. Contact section

---

#### TASK 4.4: UPDATE `apps/sri-collective/app/layout.tsx`

- **IMPLEMENT**: Add ChatbotWidget import and component
- **PATTERN**: Copy from MVP layout
- **IMPORTS**: `ChatbotWidget` from "@repo/ui"
- **GOTCHA**: Sri Collective doesn't use ThemeProvider (no dark mode)
- **VALIDATE**: `grep "ChatbotWidget" apps/sri-collective/app/layout.tsx` returns match

---

#### TASK 4.5: CREATE/UPDATE `apps/sri-collective/lib/data.ts`

- **IMPLEMENT**: Ensure `getFeaturedProperties` function exists and works
- **PATTERN**: Check if this exists in MVP, copy if needed
- **IMPORTS**: Property type from @repo/types
- **GOTCHA**: This provides data for PropertyCard components
- **VALIDATE**: `grep "getFeaturedProperties" apps/sri-collective/lib/data.ts` returns function

---

### Phase 5: Validation and Cleanup

#### TASK 5.1: RUN TURBOREPO BUILD

- **IMPLEMENT**: Verify all apps build successfully
- **PATTERN**: N/A
- **IMPORTS**: N/A
- **GOTCHA**: Check for TypeScript errors related to missing types
- **VALIDATE**: `cd /Users/josh/code/realtor/structure_site && npm run build`

---

#### TASK 5.2: RUN DEV SERVER AND VISUAL CHECK

- **IMPLEMENT**: Start both apps and compare with MVP visually
- **PATTERN**: N/A
- **IMPORTS**: N/A
- **GOTCHA**: Check dark mode toggle on NewHomeShow
- **VALIDATE**: `npm run dev` and open localhost:3000, localhost:3001

---

## TESTING STRATEGY

### Build Tests

- `npm run build` in monorepo root - must pass with no TypeScript errors
- `npm run lint` - must have no linting errors

### Visual Regression

Compare screenshots of:
1. NewHomeShow homepage (light mode)
2. NewHomeShow homepage (dark mode)
3. Sri Collective homepage
4. PropertyCard component rendering
5. ChatbotWidget open state

### Component Tests

Verify imports work:
```tsx
import { PropertyCard, ChatbotWidget, Header, Footer } from "@repo/ui"
```

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
cd /Users/josh/code/realtor/structure_site
npm run lint
```

### Level 2: TypeScript

```bash
cd /Users/josh/code/realtor/structure_site
npm run type-check
```

### Level 3: Build

```bash
cd /Users/josh/code/realtor/structure_site
npm run build
```

### Level 4: Manual Validation

1. Start dev servers: `npm run dev`
2. Open NewHomeShow: http://localhost:3000
3. Open Sri Collective: http://localhost:3001
4. Toggle dark mode on NewHomeShow
5. Open chatbot widget on both sites
6. Navigate to /properties on Sri Collective
7. Verify PropertyCard renders with images

---

## ACCEPTANCE CRITERIA

- [ ] All CSS classes from MVP are available in shared theme files
- [ ] Dark mode works on NewHomeShow (toggle in header)
- [ ] PropertyCard imports from @repo/ui without errors
- [ ] ChatbotWidget imports from @repo/ui without errors
- [ ] Both sites build with `npm run build`
- [ ] Hero sections render with gradient overlays and accent lines
- [ ] Luxury card hover effects work (translateY, shadow enhancement)
- [ ] Button hover states have correct transforms
- [ ] Feature icons display with proper backgrounds
- [ ] Contact sections have dark backgrounds with correct accent colors
- [ ] Scrollbar styling appears in both themes
- [ ] No hardcoded hex colors in app page.tsx files
- [ ] App globals.css files are < 50 lines each

---

## COMPLETION CHECKLIST

- [ ] All Phase 1 tasks completed (shared styles enhanced)
- [ ] All Phase 2 tasks completed (components exported)
- [ ] All Phase 3 tasks completed (app globals refactored)
- [ ] All Phase 4 tasks completed (page content migrated)
- [ ] All validation commands pass
- [ ] Visual comparison confirms parity with MVP
- [ ] Dark mode toggle functional
- [ ] Chatbot widget functional
- [ ] Property cards render correctly

---

## NOTES

### Naming Convention Mapping

| MVP Name | Monorepo Semantic Name |
|----------|------------------------|
| `--gold` | `--primary` |
| `--gold-light` | `--primary-light` |
| `--gold-dark` | `--primary-dark` |
| `--black` | `--secondary` |
| `.btn-gold` | `.btn-primary` |
| `.text-gradient-gold` | `.text-gradient-primary` |
| `--red` | `--accent` |
| `--blue` | `--primary` (for Sri Collective) |
| `.btn-red` | `.btn-accent` |
| `.btn-blue` | `.btn-primary` |

### Trade-offs

1. **Semantic vs Descriptive Names**: Chose semantic (`--primary`) over descriptive (`--gold`) for better theme flexibility
2. **Dark Mode**: Only NewHomeShow has dark mode - Sri Collective remains light-only per MVP
3. **Component Location**: PropertyCard stays in `packages/ui` (external realtor folder) - may need copying to structure_site/packages/ui

### Risk Factors

1. **Import Path Resolution**: `@repo/ui` paths must be configured in tsconfig
2. **Zustand Dependency**: May need to add to packages/ui/package.json
3. **Type Dependencies**: PropertyCard needs @repo/types and @repo/lib

### Performance Considerations

Tailwind v4 with `@theme inline` provides:
- 5x faster full builds
- 100x faster incremental builds
- CSS custom properties for runtime theme switching

<!-- EOF -->
