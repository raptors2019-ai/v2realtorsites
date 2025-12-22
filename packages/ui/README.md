# @repo/ui

Shared UI components and theme system for real estate applications.

## Features

- **Theme System**: Pre-built themes with semantic color names (primary, secondary, accent)
- **Dark Mode Support**: Optional dark mode for themes that support it
- **Type-Safe**: Full TypeScript support with exported types
- **Responsive**: Mobile-first design with Tailwind CSS
- **Accessible**: ARIA labels and keyboard navigation

## Installation

This package is part of the monorepo workspace. It's automatically available to apps via npm workspaces.

```bash
npm install
```

## Using Themes

### 1. Import Theme CSS

Import the base CSS and your chosen theme in your app's layout file:

```typescript
// app/layout.tsx
import '@repo/ui/src/styles/base.css'
import '@repo/ui/src/styles/themes/newhomeshow.css' // or sri-collective.css
```

**Available Themes:**
- `newhomeshow.css` - Luxury gold/black theme with dark mode support
- `sri-collective.css` - Professional blue/red theme

### 2. Setup ThemeProvider (for Dark Mode)

If your theme supports dark mode (like NewHomeShow), wrap your app with ThemeProvider:

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

### 3. Use Components

Import and use components with your theme's styling:

```typescript
import { Header, Footer, Button } from '@repo/ui'

const headerConfig = {
  siteName: 'NewHomeShow',
  logo: {
    text: 'NewHomeShow',
    className: 'text-gradient-primary'
  },
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Contact', href: '/contact' },
  ]
}

export default function Layout({ children }) {
  return (
    <>
      <Header config={headerConfig} enableDarkMode={true} />
      <main>{children}</main>
      <Footer config={footerConfig} />
    </>
  )
}
```

## Components

### Header

Premium header with scroll effects, mobile menu, and optional dark mode toggle.

```typescript
import { Header, type HeaderConfig } from '@repo/ui'

const config: HeaderConfig = {
  siteName: 'Your Site',
  logoFirstPart: 'Your', // Optional - first part of logo
  logoSecondPart: 'Brand', // Optional - second part (gets gradient)
  logoSecondPartClass: 'text-gradient-primary', // Optional custom class
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ],
  ctaButton: {
    text: 'Get Started',
    href: '/contact'
  } // Optional CTA button
}

<Header
  config={config}
  enableDarkMode={true} // Optional, default false
/>
```

**Example for NewHomeShow:**
```typescript
const config: HeaderConfig = {
  siteName: 'NewHomeShow',
  logoFirstPart: 'New',
  logoSecondPart: 'HomeShow',
  logoSecondPartClass: 'text-gradient-primary',
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/contact', label: 'Contact' },
  ],
  ctaButton: {
    text: 'Get Started',
    href: '/contact'
  }
}
```

**Example for Sri Collective:**
```typescript
const config: HeaderConfig = {
  siteName: 'Sri Collective',
  logoFirstPart: 'Sri',
  logoSecondPart: 'Collective',
  logoSecondPartClass: 'text-gradient-accent', // Use accent color (red)
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/properties', label: 'Properties' },
    { href: '/contact', label: 'Contact' },
  ]
}
```

### Footer

Configurable footer with 4-column layout (Brand, Quick Links, Services, Team).

```typescript
import { Footer, type FooterConfig } from '@repo/ui'

const config: FooterConfig = {
  siteName: 'Your Site',
  logoFirstPart: 'Your',
  logoSecondPart: 'Site',
  logoSecondPartClass: 'text-gradient-primary',
  description: 'Your exclusive gateway to premium real estate.',
  socialLinks: [
    {
      platform: 'Instagram',
      url: 'https://instagram.com/yoursite',
      icon: <svg>...</svg>
    }
  ],
  quickLinks: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
  ],
  services: [
    { name: 'Pre-Construction Homes', href: '/projects' },
    { name: 'VIP Access', href: '/contact' },
  ],
  teamMembers: [
    {
      name: 'John Doe',
      instagram: 'https://instagram.com/johndoe',
      phone: '+1 (555) 123-4567'
    }
  ],
  tagline: 'Real Estate Professionals • Ontario, Canada'
}

<Footer config={config} />
```

**Example for NewHomeShow:**
```typescript
const config: FooterConfig = {
  siteName: 'NewHomeShow',
  logoFirstPart: 'New',
  logoSecondPart: 'HomeShow',
  logoSecondPartClass: 'text-gradient-primary',
  description: 'Your exclusive gateway to pre-construction homes and builder projects across the Greater Toronto Area.',
  socialLinks: [
    {
      platform: 'Instagram',
      url: 'https://www.instagram.com/newhomeshow/',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">...</svg>
    }
  ],
  quickLinks: [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  services: [
    { name: 'Pre-Construction Homes', href: '/projects' },
    { name: 'Builder Projects', href: '/projects' },
    { name: 'VIP Access', href: '/contact' },
    { name: 'Investment Consulting', href: '/contact' },
  ],
  teamMembers: [
    {
      name: 'Sri Kathiravelu',
      instagram: 'https://www.instagram.com/remaxsri/'
    },
    {
      name: 'Niru Arulselvan',
      instagram: 'https://www.instagram.com/thesneakerrealtor_/',
      phone: '+1 (416) 786-0431'
    }
  ],
  tagline: 'Pre-Construction Specialists • Ontario, Canada'
}
```

**Example for Sri Collective:**
```typescript
const config: FooterConfig = {
  siteName: 'Sri Collective',
  logoFirstPart: 'Sri',
  logoSecondPart: 'Collective',
  logoSecondPartClass: 'text-gradient-accent', // Use red accent
  // ... similar structure with different content
}
```

### Button

Theme-aware button component with multiple variants.

```typescript
import { Button } from '@repo/ui'

// Uses semantic color names from theme
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="accent">Accent Action</Button>
<Button variant="outline-primary">Outline Primary</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

**Available Variants:**
- `primary` - Uses `--primary` color from theme
- `secondary` - Uses `--secondary` color from theme
- `accent` - Uses `--accent` color from theme
- `outline` - Primary color outline
- `outline-primary` - Primary color outline
- `outline-secondary` - Secondary color outline
- `outline-accent` - Accent color outline

### ThemeToggle

Dark/light mode toggle (only for themes that support dark mode).

```typescript
import { ThemeToggle } from '@repo/ui'

<ThemeToggle />
```

## Theme Customization

### Changing Colors

To change theme colors, edit the CSS variables in the theme file:

**NewHomeShow Theme** (`themes/newhomeshow.css`):
```css
:root {
  /* Primary = Gold */
  --primary: #D4AF37;
  --primary-light: #E5C158;
  --primary-dark: #B8941F;

  /* Secondary = Black */
  --secondary: #000000;
  --secondary-light: #1a1a1a;

  /* Accent = Supporting gold */
  --accent: #C9A962;
}
```

**Sri Collective Theme** (`themes/sri-collective.css`):
```css
:root {
  /* Primary = Blue */
  --primary: #2563eb;
  --primary-light: #3b82f6;
  --primary-dark: #1d4ed8;

  /* Secondary = Navy */
  --secondary: #1a1a2e;

  /* Accent = Red */
  --accent: #dc2626;
  --accent-light: #ef4444;
}
```

**Simply change the hex values to customize colors!**

### Creating a New Theme

1. Create a new CSS file in `packages/ui/src/styles/themes/your-theme.css`
2. Define semantic color variables:
   - `--primary` and variants (primary-light, primary-dark)
   - `--secondary` and variants
   - `--accent` and variants
3. Add theme-specific button classes (`.btn-primary`, `.btn-secondary`, etc.)
4. Add card styles and utility classes
5. Import in your app: `import '@repo/ui/src/styles/themes/your-theme.css'`

## CSS Utility Classes

Themes provide utility classes using semantic names:

- `.text-primary` - Primary color text
- `.bg-primary` - Primary background
- `.border-primary` - Primary border
- `.btn-primary` - Primary button style
- `.btn-outline-primary` - Outlined primary button
- `.accent-line` - Decorative accent line
- `.luxury-card` / `.professional-card` - Card styles
- `.section-divider-light` - Section divider

## TypeScript Types

All components and configs are fully typed:

```typescript
import type {
  HeaderConfig,
  HeaderProps,
  FooterConfig,
  FooterProps,
  ButtonProps,
  ButtonVariant,
  ThemeName,
  ThemeConfig,
} from '@repo/ui'
```

## Architecture Notes

- **Semantic Colors**: Components use `primary`, `secondary`, `accent` - not brand-specific names
- **Theme Isolation**: Each theme defines its own color mappings
- **No Duplication**: Common styles in `base.css`, theme-specific in theme files
- **Type Safety**: All props and configs are TypeScript interfaces
- **Performance**: CSS classes, not JS-in-CSS, for better caching

## Examples

See the reference implementations:
- NewHomeShow: `/apps/newhomeshow`
- Sri Collective: `/apps/sri-collective`
