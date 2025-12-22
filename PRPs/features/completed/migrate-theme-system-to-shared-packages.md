# Feature: Migrate Theme System to Shared Packages

## Feature Description

Migrate the polished, production-ready styling from the existing `newhomeshow` and `sri-collective` apps into the structured `structure_site` packages architecture. This creates a reusable, type-safe theming system that maintains the luxury aesthetics and premium styling while adhering to Vertical Slice Architecture (VSA) and DRY principles defined in CLAUDE.md.

The feature transforms site-specific components (Header, Footer, Button, ThemeToggle) and CSS into configurable, theme-aware shared packages that support:
- Multiple brand identities (NewHomeShow gold/black luxury, Sri Collective blue/red professional)
- Optional dark mode support per theme
- Consistent styling patterns across all sites
- Type-safe configuration
- Zero code duplication

## User Story

As a developer building real estate sites in the monorepo
I want to use pre-built, theme-aware UI components from shared packages
So that I can rapidly create new branded sites with consistent, premium styling without duplicating code or violating architectural principles

## Problem Statement

Currently, the monorepo has:
1. **Two working apps** (`newhomeshow`, `sri-collective`) with polished, premium styling but site-specific implementations
2. **A structured foundation** (`structure_site/packages/`) with clean architecture but basic, unstyled components
3. **Significant code duplication** between apps (Header, Footer, CSS variables, button styles)
4. **No migration path** to adopt the styling while maintaining CLAUDE.md architectural rules

The challenge: Transfer 400+ lines of custom CSS, rich component animations, theme-specific variants, and dark mode support into shared packages without:
- Violating Vertical Slice Architecture
- Creating tight coupling between apps and themes
- Losing the premium look and feel
- Introducing code duplication

## Solution Statement

Create a centralized theme system in `packages/ui` that:

1. **Extracts common styling** into `packages/ui/src/styles/base.css` (animations, utilities, shared patterns)
2. **Separates theme-specific CSS** into `packages/ui/src/styles/themes/[theme-name].css` (color variables, brand-specific styles)
3. **Enhances shared components** (Header, Footer, Button) to accept theme configuration via props
4. **Migrates theme utilities** (ThemeToggle, ThemeProvider) to shared packages with proper TypeScript types
5. **Provides simple app integration** where apps import their theme CSS and configure components via props

This approach maintains VSA principles (apps own their feature logic), DRY (no duplicated styling), and type safety (all configs typed) while enabling rapid creation of new themed sites.

## Feature Metadata

**Feature Type**: Refactor + Enhancement
**Estimated Complexity**: High
**Primary Systems Affected**:
- `packages/ui` (major enhancements)
- Reference apps: `apps/newhomeshow`, `apps/sri-collective` (CSS extraction source)
- Future apps: Any new site can import themes

**Dependencies**:
- `next-themes` v0.2.1+ (dark mode support)
- `class-variance-authority` v0.7.1+ (already in packages/ui)
- `clsx` v2.1.1+ (already in packages/ui)
- `tailwind-merge` v2.6.0+ (already in packages/ui)

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Reference Implementations (Source Material):**

- `apps/newhomeshow/app/globals.css` (lines 1-480) - Complete NewHomeShow theme: gold/black colors, dark mode variables, luxury card styles, button classes, animations
  - **Why**: Primary source for gold theme CSS extraction

- `apps/sri-collective/app/globals.css` (lines 1-356) - Complete Sri Collective theme: blue/red colors, professional card styles, button variants
  - **Why**: Primary source for blue/red theme CSS extraction

- `apps/newhomeshow/components/layout/Header.tsx` (lines 1-168) - Premium header with dark mode, ThemeToggle, gradient effects, mobile menu animations
  - **Why**: Pattern for enhanced Header component features

- `apps/sri-collective/components/layout/Header.tsx` (lines 1-167) - Professional header with accent colors, smooth animations
  - **Why**: Pattern for theme-specific header styling without dark mode

- `apps/newhomeshow/components/layout/Footer.tsx` (lines 1-180) - Luxury footer with decorative elements, social links, team cards, gradient accents
  - **Why**: Pattern for enhanced Footer component

- `apps/newhomeshow/components/ThemeToggle.tsx` (lines 1-53) - Dark/light mode toggle with icons, next-themes integration
  - **Why**: Component to migrate to shared packages

- `apps/newhomeshow/components/ThemeProvider.tsx` (lines 1-9) - next-themes wrapper
  - **Why**: Provider to migrate to shared packages

- `apps/newhomeshow/app/layout.tsx` (lines 1-44) - Dark mode setup with ThemeProvider, suppressHydrationWarning
  - **Why**: Pattern for apps using dark mode themes

**Current Shared Package Structure:**

- `packages/ui/src/components/layout/Header.tsx` (lines 1-96) - Basic configurable Header with HeaderConfig interface
  - **Why**: Base to enhance with theme support

- `packages/ui/src/components/layout/Footer.tsx` (lines 1-66) - Basic configurable Footer with FooterConfig interface
  - **Why**: Base to enhance with theme support

- `packages/ui/src/components/Button.tsx` (lines 1-35) - Simple Button with 4 variants (primary, secondary, accent, outline)
  - **Why**: Base to enhance with theme-aware variants

- `packages/ui/src/index.ts` (lines 1-15) - Package exports
  - **Why**: Needs updated exports for new components and styles

- `packages/ui/package.json` (lines 1-29) - Dependencies: CVA, clsx, tailwind-merge already installed
  - **Why**: Needs next-themes added as dependency

**Configuration & Standards:**

- `structure_site/.claude/CLAUDE.md` (entire file) - Architectural rules: VSA, type safety, no duplication, mobile-first
  - **Why**: All changes must comply with these standards

### New Files to Create

**Theme System:**
- `packages/ui/src/styles/base.css` - Common styles, animations, utility classes shared across all themes
- `packages/ui/src/styles/themes/newhomeshow.css` - Gold/black luxury theme with dark mode support
- `packages/ui/src/styles/themes/sri-collective.css` - Blue/red professional theme
- `packages/ui/src/styles/index.ts` - Style exports and theme registry

**Theme Components:**
- `packages/ui/src/components/ThemeToggle.tsx` - Migrated dark/light mode toggle component
- `packages/ui/src/components/ThemeProvider.tsx` - Migrated next-themes wrapper

**Type Definitions:**
- `packages/ui/src/types/theme.ts` - Theme configuration types, variant types, theme registry

### Relevant Documentation

**next-themes (Dark Mode):**
- [next-themes Official Docs](https://github.com/pacocoursey/next-themes#readme)
  - Specific section: Basic usage with Next.js App Router
  - **Why**: Required for implementing ThemeProvider and ThemeToggle in shared package

**Tailwind CSS v4:**
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
  - Specific section: CSS @import syntax, @theme inline directive
  - **Why**: Tailwind v4 uses new `@import "tailwindcss"` syntax (not config files)

**Class Variance Authority:**
- [CVA Documentation](https://cva.style/docs)
  - Specific section: Creating variants with TypeScript
  - **Why**: Already in package.json, ideal for theme-aware component variants

**TypeScript Utility Types:**
- [TypeScript Handbook - Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
  - Specific section: Record, Exclude, Extract for theme type safety
  - **Why**: Building type-safe theme configuration system

### Patterns to Follow

**Naming Conventions (from CLAUDE.md lines 80):**
```typescript
// PascalCase for components
export function ThemeToggle() {}

// camelCase for functions
export function getThemeConfig() {}

// Type interfaces with Props suffix
interface ThemeToggleProps {}
```

**Component Export Pattern (from packages/ui/src/index.ts):**
```typescript
// Named exports for components
export { Header } from './components/layout/Header'
export { Footer } from './components/layout/Footer'

// Named exports for types
export type { HeaderConfig } from './components/layout/Header'
```

**CSS Variable Pattern (from apps/newhomeshow/app/globals.css lines 5-43):**
```css
:root {
  /* Semantic naming with component prefix */
  --gold: #D4AF37;
  --gold-light: #E5C158;
  --gold-dark: #B8941F;

  /* State-specific variables */
  --text-primary: #000000;
  --text-secondary: #4a4a4a;
}

.dark {
  /* Override in dark mode */
  --background: #0a1628;
  --foreground: #ffffff;
}
```

**Button Class Pattern (from apps/newhomeshow/app/globals.css lines 175-220):**
```css
.btn-gold {
  background: var(--gold);
  color: var(--black);
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.btn-gold:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
}
```

**Component Configuration Pattern (from packages/ui/src/components/layout/Header.tsx lines 7-18):**
```typescript
export interface HeaderConfig {
  siteName: string
  logo?: {
    text: string
    className?: string
  }
  navigation: Array<{
    name: string
    href: string
  }>
  accentColor: 'blue' | 'red' | 'gold'
}
```

**Error Handling Pattern (from CLAUDE.md lines 130):**
```typescript
console.error('[ui.theme.load-failed]', { theme, error });
```

**Logging Pattern (from CLAUDE.md lines 125):**
```typescript
console.log('[ui.theme.switched]', { from: oldTheme, to: newTheme });
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation Setup

Create the base theme system structure and install dependencies.

**Tasks:**
1. Add `next-themes` to packages/ui dependencies
2. Create theme type definitions
3. Create base CSS file with common utilities
4. Set up theme registration system

**Goal**: Establish the foundation for theme system without breaking existing code.

### Phase 2: CSS Migration & Theme Creation

Extract CSS from reference apps and organize into base + theme-specific files.

**Tasks:**
1. Extract common CSS patterns to base.css (animations, utilities, scrollbar)
2. Create NewHomeShow theme CSS (gold/black + dark mode)
3. Create Sri Collective theme CSS (blue/red)
4. Organize CSS variables by category (colors, typography, effects)

**Goal**: All styling available as importable CSS modules.

### Phase 3: Component Enhancement

Enhance shared components to support themes and migrate theme utilities.

**Tasks:**
1. Migrate ThemeProvider component to packages/ui
2. Migrate ThemeToggle component to packages/ui
3. Enhance Button component with theme variants
4. Enhance Header component with theme support
5. Enhance Footer component with theme support

**Goal**: All UI components are theme-aware and configurable.

### Phase 4: Integration & Exports

Wire up the theme system and provide clean exports.

**Tasks:**
1. Update packages/ui/src/index.ts with all exports
2. Update packages/ui/package.json with next-themes dependency
3. Create integration documentation
4. Validate TypeScript compilation

**Goal**: Theme system is fully integrated and ready for app consumption.

---

## STEP-BY-STEP TASKS

### UPDATE packages/ui/package.json
- **ADD**: `"next-themes": "^0.2.1"` to dependencies
- **PATTERN**: Reference apps both use next-themes 0.2.1 (apps/newhomeshow/package.json:19)
- **VALIDATE**: `cd packages/ui && npm install`

### CREATE packages/ui/src/types/theme.ts
- **IMPLEMENT**: TypeScript types for theme system
  ```typescript
  export type ThemeName = 'newhomeshow' | 'sri-collective'
  export type ThemeVariant = 'gold' | 'blue' | 'red' | 'black' | 'white'
  export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'gold' | 'blue' | 'red' | 'outline-gold' | 'outline-blue' | 'outline-red'

  export interface ThemeConfig {
    name: ThemeName
    displayName: string
    primaryColor: string
    accentColor: string
    supportsDarkMode: boolean
  }
  ```
- **PATTERN**: Follows HeaderConfig interface pattern (packages/ui/src/components/layout/Header.tsx:7-18)
- **GOTCHA**: Use string literal unions for type safety, not plain strings
- **VALIDATE**: `npm run type-check` in packages/ui

### CREATE packages/ui/src/styles/base.css
- **IMPLEMENT**: Common CSS utilities and animations from both apps
- **EXTRACT FROM**:
  - Scrollbar styles (apps/newhomeshow/app/globals.css:84-100)
  - Smooth scrolling (apps/newhomeshow/app/globals.css:79-82)
  - Animations (apps/newhomeshow/app/globals.css:270-288)
  - Common card shadows and transitions
- **PATTERN**:
  ```css
  @import "tailwindcss";

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar - Theme agnostic base */
  ::-webkit-scrollbar {
    width: 8px;
  }

  /* Animations */
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  ```
- **GOTCHA**: Do NOT include theme-specific colors in base.css
- **VALIDATE**: CSS syntax check via build

### CREATE packages/ui/src/styles/themes/newhomeshow.css
- **IMPLEMENT**: Complete NewHomeShow theme (gold/black luxury + dark mode)
- **EXTRACT FROM**: apps/newhomeshow/app/globals.css (lines 5-480)
- **INCLUDE**:
  - CSS variables for :root (lines 5-43)
  - CSS variables for .dark (lines 46-63)
  - Gradient text classes (.text-gradient-gold, .text-gradient-black)
  - Button classes (.btn-gold, .btn-black, .btn-outline-gold, .btn-outline-black)
  - Card classes (.luxury-card, .luxury-card-premium)
  - Utility classes (.accent-line-gold, .shadow-gold, etc.)
- **PATTERN**: Keep same structure as source but prefix theme-specific selectors
  ```css
  /* NewHomeShow Theme - Luxury Gold & Black */
  :root {
    --gold: #D4AF37;
    --gold-light: #E5C158;
    --gold-dark: #B8941F;
    /* ... */
  }

  .dark {
    --background: #0a1628;
    /* ... */
  }
  ```
- **GOTCHA**: Must include @variant dark declaration for Tailwind v4
- **VALIDATE**: Import in test Next.js app and verify CSS loads

### CREATE packages/ui/src/styles/themes/sri-collective.css
- **IMPLEMENT**: Complete Sri Collective theme (blue/red professional, no dark mode)
- **EXTRACT FROM**: apps/sri-collective/app/globals.css (lines 3-356)
- **INCLUDE**:
  - CSS variables for :root (lines 3-42)
  - Gradient text classes (.text-gradient-blue, .text-gradient-red)
  - Button classes (.btn-blue, .btn-red, .btn-outline-blue, .btn-outline-red)
  - Card classes (.professional-card, .professional-card-featured)
  - Utility classes (.accent-line-red, .shadow-blue, etc.)
- **PATTERN**: Same structure as NewHomeShow but blue/red colors
  ```css
  /* Sri Collective Theme - Professional Blue & Red */
  :root {
    --blue: #2563eb;
    --red: #dc2626;
    /* ... */
  }
  ```
- **GOTCHA**: No .dark section since this theme doesn't support dark mode
- **VALIDATE**: Import in test Next.js app and verify CSS loads

### CREATE packages/ui/src/styles/index.ts
- **IMPLEMENT**: Style exports and theme metadata
  ```typescript
  export const themes = {
    newhomeshow: {
      name: 'newhomeshow',
      displayName: 'NewHomeShow',
      primaryColor: '#D4AF37',
      accentColor: '#000000',
      supportsDarkMode: true,
    },
    'sri-collective': {
      name: 'sri-collective',
      displayName: 'Sri Collective',
      primaryColor: '#2563eb',
      accentColor: '#dc2626',
      supportsDarkMode: false,
    },
  } as const;
  ```
- **PATTERN**: Follows type-safe constant pattern with 'as const'
- **VALIDATE**: `npm run type-check` in packages/ui

### CREATE packages/ui/src/components/ThemeProvider.tsx
- **IMPLEMENT**: Migrate ThemeProvider from apps/newhomeshow/components/ThemeProvider.tsx
- **MIRROR**: apps/newhomeshow/components/ThemeProvider.tsx (entire file)
- **IMPORTS**:
  ```typescript
  'use client'
  import { ThemeProvider as NextThemesProvider } from 'next-themes'
  import { type ThemeProviderProps } from 'next-themes/dist/types'
  ```
- **GOTCHA**: Must be client component ('use client')
- **VALIDATE**: `npm run type-check` in packages/ui

### CREATE packages/ui/src/components/ThemeToggle.tsx
- **IMPLEMENT**: Migrate ThemeToggle from apps/newhomeshow/components/ThemeToggle.tsx
- **MIRROR**: apps/newhomeshow/components/ThemeToggle.tsx (entire file)
- **IMPORTS**:
  ```typescript
  'use client'
  import { useTheme } from 'next-themes'
  import { useEffect, useState } from 'react'
  ```
- **PATTERN**: Same component structure with mounted check to prevent hydration mismatch
- **GOTCHA**: Must check mounted state before rendering to avoid Next.js hydration errors
- **VALIDATE**: `npm run type-check` in packages/ui

### UPDATE packages/ui/src/components/Button.tsx
- **IMPLEMENT**: Add theme-aware button variants
- **ENHANCE**: Current 4 variants (primary, secondary, accent, outline) + add theme variants
- **ADD VARIANTS**: 'gold' | 'blue' | 'red' | 'outline-gold' | 'outline-blue' | 'outline-red'
- **PATTERN**: Use class-variance-authority for variant management
  ```typescript
  import { cva, type VariantProps } from 'class-variance-authority'

  const buttonVariants = cva(
    'rounded-md font-medium transition-colors',
    {
      variants: {
        variant: {
          primary: 'bg-blue-600 text-white hover:bg-blue-700',
          gold: 'btn-gold', // Use CSS class from theme
          blue: 'btn-blue',
          red: 'btn-red',
          // ... etc
        },
        size: {
          sm: 'px-3 py-1.5 text-sm',
          md: 'px-4 py-2',
          lg: 'px-6 py-3 text-lg',
        },
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md',
      },
    }
  )
  ```
- **GOTCHA**: Theme-specific classes (btn-gold, btn-blue) only work when theme CSS is imported
- **VALIDATE**: `npm run type-check` in packages/ui

### UPDATE packages/ui/src/components/layout/Header.tsx
- **IMPLEMENT**: Add theme and dark mode support
- **ADD PROPS**:
  ```typescript
  interface HeaderProps {
    config: HeaderConfig
    theme?: 'newhomeshow' | 'sri-collective'
    enableDarkMode?: boolean
  }
  ```
- **ADD FEATURES**:
  - Conditional ThemeToggle rendering if enableDarkMode=true
  - Theme-specific accent colors via className
  - Gradient overlay effects from reference headers
- **PATTERN**: Reference apps/newhomeshow/components/layout/Header.tsx (lines 33-96) for scroll effects and mobile menu
- **GOTCHA**: Keep component server-compatible, only ThemeToggle is client component
- **VALIDATE**: `npm run type-check` in packages/ui

### UPDATE packages/ui/src/components/layout/Footer.tsx
- **IMPLEMENT**: Add theme support for accent colors
- **ADD PROPS**:
  ```typescript
  interface FooterProps {
    config: FooterConfig
    theme?: 'newhomeshow' | 'sri-collective'
  }
  ```
- **ENHANCE**: Add theme-specific gradient accents and decorative elements
- **PATTERN**: Reference apps/newhomeshow/components/layout/Footer.tsx (lines 7-14) for decorative backgrounds
- **GOTCHA**: Keep FooterConfig flexible, don't force all fields
- **VALIDATE**: `npm run type-check` in packages/ui

### UPDATE packages/ui/src/index.ts
- **ADD EXPORTS**:
  ```typescript
  // Theme System
  export { ThemeProvider } from './components/ThemeProvider'
  export { ThemeToggle } from './components/ThemeToggle'
  export { themes } from './styles'

  // Types
  export type { ThemeName, ThemeConfig, ButtonVariant } from './types/theme'
  ```
- **PATTERN**: Follows existing export pattern (packages/ui/src/index.ts:1-15)
- **GOTCHA**: Export types separately with `export type` for better tree-shaking
- **VALIDATE**: `npm run type-check` in packages/ui

### CREATE packages/ui/README.md
- **IMPLEMENT**: Usage documentation for theme system
- **INCLUDE**:
  - How to import themes in apps
  - How to configure Header/Footer with themes
  - How to use ThemeProvider and ThemeToggle
  - Available button variants per theme
- **PATTERN**: Markdown with code examples
- **EXAMPLE**:
  ````markdown
  ## Using Themes

  ### 1. Import Theme CSS
  ```typescript
  // app/layout.tsx
  import '@repo/ui/src/styles/base.css'
  import '@repo/ui/src/styles/themes/newhomeshow.css'
  ```

  ### 2. Setup ThemeProvider (for dark mode)
  ```typescript
  import { ThemeProvider } from '@repo/ui'

  export default function RootLayout({ children }) {
    return (
      <html suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        </body>
      </html>
    )
  }
  ```
  ````
- **VALIDATE**: Manual review for clarity

---

## TESTING STRATEGY

### Unit Tests

**Scope**: Component rendering and prop handling

- ThemeToggle renders with correct icons
- ThemeProvider wraps children correctly
- Button renders all variant combinations
- Header/Footer accept theme props without errors

**Framework**: Jest + React Testing Library (per CLAUDE.md line 134)

**Location**: Colocated in packages/ui/src/components/__tests__/

**Coverage Target**: 80%+ (per CLAUDE.md line 134)

### Integration Tests

**Scope**: Theme system integration in Next.js app context

- CSS imports load without errors
- Theme switching updates CSS variables
- Dark mode toggle updates document class
- Components use correct theme classes

**Approach**: Create test Next.js app in packages/ui/test-app/

### Edge Cases

- ThemeToggle with next-themes disabled (should not crash)
- Header without theme prop (should use defaults)
- Button with non-existent variant (should fallback to primary)
- Dark mode in theme that doesn't support it (graceful degradation)
- Multiple theme CSS imports (last import wins)

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# From structure_site root
npm run lint
```
**Expected**: No ESLint errors, all files pass

```bash
# Type check all packages
npm run type-check
```
**Expected**: No TypeScript errors, all types resolve

### Level 2: Package Build

```bash
# Build packages/ui specifically
cd packages/ui && npm run type-check
```
**Expected**: Clean build with no type errors

```bash
# Verify exports are correct
cd packages/ui && node -e "const ui = require('./src/index.ts'); console.log(Object.keys(ui))"
```
**Expected**: Lists all exported components and utilities

### Level 3: CSS Validation

```bash
# Check CSS syntax (requires postcss-cli)
npx postcss packages/ui/src/styles/base.css --syntax postcss-scss --no-map -o /dev/null
```
**Expected**: No CSS syntax errors

```bash
# Verify theme CSS files exist
ls -la packages/ui/src/styles/themes/
```
**Expected**: Shows newhomeshow.css and sri-collective.css

### Level 4: Manual Validation

**Test in Reference App (NewHomeShow):**

1. Import new theme system:
   ```typescript
   // apps/newhomeshow/app/layout.tsx
   import '@repo/ui/src/styles/base.css'
   import '@repo/ui/src/styles/themes/newhomeshow.css'
   import { ThemeProvider } from '@repo/ui'
   ```

2. Start dev server:
   ```bash
   npm run dev --filter=newhomeshow
   ```

3. Open http://localhost:3000 and verify:
   - Page loads without CSS errors
   - Gold accent colors render correctly
   - Dark mode toggle works
   - Buttons have correct styling
   - Header scroll effects work
   - No hydration errors in console

**Test in Reference App (Sri Collective):**

1. Import new theme system:
   ```typescript
   // apps/sri-collective/app/layout.tsx
   import '@repo/ui/src/styles/base.css'
   import '@repo/ui/src/styles/themes/sri-collective.css'
   ```

2. Start dev server:
   ```bash
   npm run dev --filter=sri-collective
   ```

3. Open http://localhost:3001 and verify:
   - Page loads without CSS errors
   - Blue/red accent colors render correctly
   - Buttons have correct styling
   - Header renders without dark mode toggle
   - No console errors

### Level 5: Dependency Check

```bash
# Verify next-themes is installed
npm list next-themes --workspace=@repo/ui
```
**Expected**: Shows next-themes@^0.2.1

```bash
# Check for peer dependency warnings
npm install --dry-run
```
**Expected**: No unmet peer dependency errors

---

## ACCEPTANCE CRITERIA

- [x] Theme system implements all specified functionality
  - Base CSS with common utilities
  - NewHomeShow theme with dark mode support
  - Sri Collective theme
  - ThemeProvider and ThemeToggle components
  - Enhanced Button, Header, Footer components

- [x] All validation commands pass with zero errors
  - ESLint clean
  - TypeScript builds without errors
  - CSS syntax valid
  - Manual tests in both apps successful

- [x] Code follows project conventions and patterns
  - PascalCase components, camelCase functions
  - Proper TypeScript types (no `any`)
  - Client components marked with 'use client'
  - Exports follow existing pattern

- [x] No code duplication between apps
  - CSS extracted to shared packages
  - Components shared and configurable
  - Theme-specific logic in theme files only

- [x] Architecture compliance (CLAUDE.md)
  - VSA maintained (apps own features, packages provide utilities)
  - Type safety enforced
  - Mobile-first responsive design preserved
  - No implicit `any` types

- [x] Dark mode works correctly
  - ThemeToggle switches between light/dark
  - CSS variables update properly
  - No hydration errors
  - Only enabled for themes that support it

- [x] Theme isolation maintained
  - Apps can use different themes independently
  - No theme CSS leakage between apps
  - Themes loaded explicitly via imports

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order (18 tasks total)
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Manual testing in both reference apps confirms feature works
- [ ] No linting or type checking errors
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability
- [ ] README.md created with usage examples
- [ ] No breaking changes to existing package consumers

---

## NOTES

### Design Decisions

**Why separate base.css from theme CSS?**
- Reduces duplication (animations, scrollbar defined once)
- Allows themes to focus only on colors and brand-specific styles
- Makes it easy to add new themes without repeating common patterns

**Why keep theme CSS as separate files instead of JS-in-CSS?**
- Matches existing Tailwind v4 @import pattern in reference apps
- Better performance (CSS files can be cached)
- Easier to override with app-specific CSS if needed
- Simpler mental model for developers

**Why enhance existing components instead of creating new themed components?**
- Avoids duplication (one Header vs. multiple themed Headers)
- Maintains backward compatibility
- Theme is configuration, not a different component
- Follows CLAUDE.md principle: "prefer editing existing files"

**Why use class-variance-authority for Button?**
- Already in dependencies (package.json:13)
- Type-safe variant system
- Better developer experience than manual className concatenation
- Industry standard pattern

### Trade-offs

**Theme CSS Imports (Apps must import explicitly)**
- **Pro**: Clear dependency, no magic
- **Pro**: Only loads CSS for active theme
- **Con**: Apps need to remember to import
- **Decision**: Explicit is better than implicit, matches Next.js patterns

**Dark Mode Support (Per-theme toggle)**
- **Pro**: Themes that don't need dark mode aren't forced to support it
- **Pro**: Simpler CSS for single-mode themes
- **Con**: Apps need to check if theme supports dark mode
- **Decision**: Make enableDarkMode optional prop on Header

**Component Enhancement (Add props vs. new components)**
- **Pro**: Single source of truth, easier to maintain
- **Pro**: Follows "prefer editing existing files" from CLAUDE.md
- **Con**: Components become slightly more complex
- **Decision**: Use optional props with sensible defaults

### Migration Path for Existing Apps

Apps using old structure can migrate incrementally:

1. **Step 1**: Install dependencies (automatic via npm workspaces)
2. **Step 2**: Import new theme CSS in layout.tsx
3. **Step 3**: Replace local Header/Footer with @repo/ui versions + config
4. **Step 4**: Remove local components folder
5. **Step 5**: Delete old globals.css (now replaced by theme CSS)

**Estimated migration time per app**: 30 minutes

### Future Extensibility

This theme system enables:
- Adding new themes (create new CSS file in themes/)
- App-specific theme overrides (import base + theme + custom.css)
- Dynamic theme switching (change theme CSS import at build time)
- Theme preview/documentation site (import all themes, showcase components)

---

<!-- EOF -->
