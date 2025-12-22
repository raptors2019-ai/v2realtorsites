# Feature: UI/UX Enhancements with Framer Motion & Bento Grid

## Feature Description

Enhance the UI/UX of both real estate platforms (NewHomeShow and Sri Collective) by implementing:
1. **Animated PropertyCard** with Framer Motion hover effects, image carousel, and staggered animations
2. **Bento Grid feature section** replacing the current 3-column feature grid with a dynamic, visually hierarchical layout
3. **Motion component library** providing reusable animation primitives for the monorepo

This feature transforms the static UI into a dynamic, engaging experience that conveys the premium, luxury feel expected from high-end real estate platforms while maintaining performance and accessibility.

## User Story

As a potential home buyer browsing the real estate platform
I want smooth, engaging animations and visual feedback
So that the browsing experience feels premium, modern, and trustworthy

As a developer working in the monorepo
I want reusable motion components and animation patterns
So that I can implement consistent animations across all sites without duplicating code

## Problem Statement

Currently, the UI components have:
1. **Static interactions** - PropertyCard has basic CSS transitions but no spring-physics animations
2. **No image navigation** - PropertyCard shows a single image; users can't preview multiple photos
3. **Flat feature sections** - The 3-column grid lacks visual hierarchy; all features appear equally weighted
4. **Limited hover feedback** - Basic opacity/scale transitions don't convey the luxury brand positioning
5. **No scroll-triggered animations** - Content appears instantly without engaging reveal effects

The challenge: Add sophisticated animations using Framer Motion while:
- Maintaining Server Component compatibility (Next.js 15 App Router)
- Keeping bundle size reasonable (LazyMotion for code splitting)
- Preserving type safety and existing patterns
- Supporting both theme systems (NewHomeShow gold, Sri Collective blue)

## Solution Statement

Implement a layered animation system:

1. **Create motion primitives** in `packages/ui/src/motion/` with client component wrappers
2. **Enhance PropertyCard** with:
   - Image carousel using AnimatePresence
   - Spring-physics hover scale + shadow lift
   - Staggered content reveal on mount
   - Skeleton loading with shimmer animation
3. **Create BentoGrid component** with:
   - Responsive grid using grid-template-areas
   - Variable card sizes (2x2, 1x2, 2x1, 1x1)
   - Scroll-triggered reveal animations
   - Hover state with CTA reveal
4. **Add scroll-triggered animations** to existing sections

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium-High
**Primary Systems Affected**:
- `packages/ui/src/` (new motion components, enhanced PropertyCard, new BentoGrid)
- `apps/newhomeshow/app/page.tsx` (feature section replacement)
- `apps/sri-collective/app/page.tsx` (feature section replacement)

**Dependencies**:
- `framer-motion` ^11.15.0 (animation library)
- Existing: `clsx`, `tailwind-merge`, `@repo/lib`

---

## CONTEXT REFERENCES

### Relevant Codebase Files

**Existing Components to Enhance:**

- `packages/ui/src/properties/PropertyCard.tsx` (lines 1-163) - Current property card with basic image loading and hover transitions
  - **Why**: Primary component to enhance with Framer Motion animations

- `packages/ui/src/index.ts` (lines 1-42) - Package exports
  - **Why**: Needs updated exports for motion components and BentoGrid

- `packages/ui/package.json` (lines 1-29) - Current dependencies
  - **Why**: Needs framer-motion added

**Page Files to Update:**

- `apps/newhomeshow/app/page.tsx` (lines 86-186) - "The NewHomeShow Advantage" section with 3-column feature grid
  - **Why**: Replace with BentoGrid component

- `apps/sri-collective/app/page.tsx` (lines 81-178) - "The Sri Collective Advantage" section with 3-column feature grid
  - **Why**: Replace with BentoGrid component

**Styling References:**

- `packages/ui/src/styles/base.css` - Common animations (shimmer, spin)
  - **Why**: Add new animation keyframes here

- `packages/ui/src/styles/themes/newhomeshow.css` - Gold theme variables
  - **Why**: Reference for theme-aware animations

- `packages/ui/src/styles/themes/sri-collective.css` - Blue theme variables
  - **Why**: Reference for theme-aware animations

**Type Definitions:**

- `packages/types/src/property.ts` (lines 1-25) - Property interface
  - **Why**: PropertyCard prop types

- `packages/ui/src/lib/utils.ts` - cn utility function
  - **Why**: Class name merging for animated components

### New Files to Create

**Motion System:**
- `packages/ui/src/motion/index.ts` - Motion component exports
- `packages/ui/src/motion/motion-primitives.tsx` - Client component wrappers for motion elements
- `packages/ui/src/motion/variants.ts` - Reusable animation variants with TypeScript types
- `packages/ui/src/motion/use-animate-in-view.ts` - Custom hook for scroll-triggered animations

**Components:**
- `packages/ui/src/components/BentoGrid.tsx` - Bento grid container and card components
- `packages/ui/src/properties/PropertyCardCarousel.tsx` - Image carousel sub-component

### Relevant Documentation

**Framer Motion:**
- [Motion Documentation](https://motion.dev/docs/react-motion-component) - Core motion component API
- [Gestures (Hover/Tap)](https://www.framer.com/motion/gestures/) - whileHover, whileTap props
- [AnimatePresence](https://motion.dev/docs/react-animate-presence) - Exit animations for carousel
- [useInView Hook](https://www.framer.com/motion/use-in-view/) - Scroll-triggered animations
- [Stagger Function](https://www.framer.com/motion/stagger/) - Staggered list animations
- [Performance Guide](https://motion.dev/docs/performance) - GPU-accelerated properties

**Next.js Server Components + Framer Motion:**
- [Hemant's Guide](https://www.hemantasundaray.com/blog/use-framer-motion-with-nextjs-server-components) - Using motion/react-client import

**Bento Grid Patterns:**
- [Magic UI Bento Grid](https://magicui.design/docs/components/bento-grid) - Component architecture reference
- [Aceternity Tutorial](https://blog.aceternity.com/how-to-create-a-bento-grid-with-tailwindcss-nextjs-and-framer-motion) - Tailwind + Framer Motion integration

### Patterns to Follow

**Client Component Pattern (from ChatbotWidget.tsx):**
```typescript
"use client";

import { useState, useRef, useEffect } from "react";
// Client-only imports
```

**Animation Class Pattern (from PropertyCard.tsx lines 33-36):**
```typescript
className={cn(
  "object-cover transition-all duration-700 ease-out",
  "group-hover:scale-110",
  imageLoaded ? "opacity-100" : "opacity-0"
)}
```

**CVA Variant Pattern (from Button.tsx):**
```typescript
const buttonVariants = cva(
  'base-classes',
  {
    variants: {
      variant: { primary: '...', secondary: '...' },
      size: { sm: '...', md: '...', lg: '...' }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
)
```

**Export Pattern (from packages/ui/src/index.ts):**
```typescript
// Components
export { PropertyCard } from './properties/PropertyCard'

// Types
export type { PropertyCardProps } from './properties/PropertyCard'
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation - Motion Primitives

Install Framer Motion and create reusable motion components.

**Tasks:**
1. Add `framer-motion` to packages/ui dependencies
2. Create motion primitive wrappers (MotionDiv, MotionSection, etc.)
3. Create typed animation variants library
4. Create useAnimateInView custom hook

**Goal**: Motion system foundation without breaking existing code.

### Phase 2: PropertyCard Enhancement

Add image carousel and hover animations to PropertyCard.

**Tasks:**
1. Create PropertyCardCarousel sub-component
2. Enhance PropertyCard with Framer Motion
3. Add staggered content animations
4. Add skeleton loading enhancement

**Goal**: PropertyCard has smooth, spring-physics animations and image navigation.

### Phase 3: BentoGrid Component

Create the Bento Grid component for feature sections.

**Tasks:**
1. Create BentoGrid container component
2. Create BentoCard component with variants
3. Add scroll-triggered reveal animations
4. Add hover effects with CTA reveal

**Goal**: Reusable, theme-aware Bento Grid component.

### Phase 4: Page Integration

Update both apps to use the new components.

**Tasks:**
1. Replace NewHomeShow feature section with BentoGrid
2. Replace Sri Collective feature section with BentoGrid
3. Verify theme consistency
4. Performance testing

**Goal**: Both sites have enhanced UI with consistent behavior.

---

## STEP-BY-STEP TASKS

### UPDATE packages/ui/package.json
- **ADD**: `"framer-motion": "^11.15.0"` to dependencies
- **VALIDATE**: `npm install` from root, verify no peer dependency warnings

### CREATE packages/ui/src/motion/motion-primitives.tsx
- **IMPLEMENT**: Client component wrappers for motion elements
- **CODE**:
```typescript
"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

// Re-export motion components as client components
export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionArticle = motion.article;
export const MotionLi = motion.li;
export const MotionButton = motion.button;
export const MotionSpan = motion.span;
export const MotionImg = motion.img;

// Typed wrapper for custom motion components
export type MotionDivProps = HTMLMotionProps<"div">;
export type MotionSectionProps = HTMLMotionProps<"section">;
```
- **GOTCHA**: Must have `"use client"` directive
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/motion/variants.ts
- **IMPLEMENT**: Reusable, typed animation variants
- **CODE**:
```typescript
import type { Variants, Transition } from "framer-motion";

// Standard easing curves
export const easings = {
  easeOut: [0.32, 0.72, 0, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const;

// Card hover animation
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
    transition: easings.spring
  },
};

// Staggered children animations
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.easeOut }
  },
};

// Scroll-triggered fade in
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easings.easeOut }
  },
};

// Image carousel slide
export const carouselSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

// Bento card reveal
export const bentoCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easings.easeOut }
  },
};
```
- **PATTERN**: Use `as const` for type inference on easings
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/motion/use-animate-in-view.ts
- **IMPLEMENT**: Custom hook for scroll-triggered animations
- **CODE**:
```typescript
"use client";

import { useRef } from "react";
import { useInView, type UseInViewOptions } from "framer-motion";

interface UseAnimateInViewOptions extends UseInViewOptions {
  // Defaults to true - only animate once
  once?: boolean;
  // Defaults to 0.3 - 30% visible before triggering
  amount?: number | "some" | "all";
}

export function useAnimateInView(options: UseAnimateInViewOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { once = true, amount = 0.3, ...rest } = options;

  const isInView = useInView(ref, { once, amount, ...rest });

  return { ref, isInView };
}
```
- **GOTCHA**: Must be client component
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/motion/index.ts
- **IMPLEMENT**: Motion module exports
- **CODE**:
```typescript
// Motion primitives (client components)
export {
  MotionDiv,
  MotionSection,
  MotionArticle,
  MotionLi,
  MotionButton,
  MotionSpan,
  MotionImg,
  type MotionDivProps,
  type MotionSectionProps,
} from "./motion-primitives";

// Animation variants
export {
  easings,
  cardHoverVariants,
  staggerContainerVariants,
  staggerItemVariants,
  fadeInUpVariants,
  carouselSlideVariants,
  bentoCardVariants,
} from "./variants";

// Hooks
export { useAnimateInView } from "./use-animate-in-view";

// Re-export useful framer-motion types
export type { Variants, Transition, AnimatePresenceProps } from "framer-motion";
export { AnimatePresence } from "framer-motion";
```
- **VALIDATE**: `npm run type-check`

### CREATE packages/ui/src/properties/PropertyCardCarousel.tsx
- **IMPLEMENT**: Image carousel for PropertyCard
- **CODE**:
```typescript
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { carouselSlideVariants, easings } from "../motion";
import Image from "next/image";
import { cn } from "@repo/lib";

interface PropertyCardCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function PropertyCardCarousel({
  images,
  alt,
  className
}: PropertyCardCarouselProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

  const paginate = useCallback((newDirection: number) => {
    setCurrentIndex(([prev]) => {
      let next = prev + newDirection;
      if (next < 0) next = images.length - 1;
      if (next >= images.length) next = 0;
      return [next, newDirection];
    });
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={carouselSlideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows - visible on hover */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); paginate(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-md"
            aria-label="Previous image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); paginate(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-md"
            aria-label="Next image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Pagination dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex([index, index > currentIndex ? 1 : -1]);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  currentIndex === index
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```
- **PATTERN**: AnimatePresence with mode="popLayout" for smooth image transitions
- **GOTCHA**: Prevent default on button clicks to avoid Link navigation
- **VALIDATE**: `npm run type-check`

### UPDATE packages/ui/src/properties/PropertyCard.tsx
- **IMPLEMENT**: Enhance with Framer Motion animations
- **CHANGES**:
  1. Import motion components and variants
  2. Wrap with MotionDiv for hover animations
  3. Replace static image with PropertyCardCarousel
  4. Add staggered content animations
- **KEY CODE ADDITIONS**:
```typescript
"use client";

import { Property } from "@repo/types";
import { formatPrice, cn } from "@repo/lib";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { PropertyCardCarousel } from "./PropertyCardCarousel";
import {
  cardHoverVariants,
  staggerContainerVariants,
  staggerItemVariants,
  easings
} from "../motion";

interface PropertyCardProps {
  property: Property;
  className?: string;
  index?: number; // For stagger delay
}

export function PropertyCard({ property, className, index = 0 }: PropertyCardProps) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={cardHoverVariants}
      style={{ borderRadius: "0.75rem" }} // Required for shadow animation
    >
      <Link
        href={`/properties/${property.id}`}
        className={cn(
          "group block luxury-card-premium rounded-xl overflow-hidden",
          className
        )}
      >
        {/* Image Carousel */}
        <div className="relative h-60 bg-gradient-to-br from-cream to-cream-dark overflow-hidden">
          <PropertyCardCarousel
            images={property.images}
            alt={property.title}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />
          {/* Badges */}
          {property.status === "active" && (
            <div className="absolute top-4 left-4 badge-sale z-10">For Sale</div>
          )}
          {property.featured && (
            <div className="absolute top-4 right-4 badge-premium z-10">Premium</div>
          )}
        </div>

        {/* Content with staggered animations */}
        <motion.div
          className="p-6"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.div variants={staggerItemVariants} className="flex items-baseline justify-between mb-3">
            <h3 className="text-2xl font-bold text-gradient-primary">
              {formatPrice(property.price)}
            </h3>
            <span className="text-xs text-primary capitalize uppercase tracking-wider font-medium">
              {property.propertyType}
            </span>
          </motion.div>

          <motion.h4
            variants={staggerItemVariants}
            className="text-lg font-semibold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300"
          >
            {property.title}
          </motion.h4>

          {/* ... rest of content with motion.div wrappers and variants */}
        </motion.div>
      </Link>
    </motion.div>
  );
}
```
- **GOTCHA**: Set borderRadius in style prop for proper shadow animation distortion correction
- **VALIDATE**: `npm run type-check && npm run build`

### CREATE packages/ui/src/components/BentoGrid.tsx
- **IMPLEMENT**: Bento grid container and card components
- **CODE**:
```typescript
"use client";

import { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@repo/lib";
import { bentoCardVariants, staggerContainerVariants, easings } from "../motion";

// Container component
interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <motion.div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
        className
      )}
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Card variants
export type BentoCardSize = "default" | "wide" | "tall" | "large";

interface BentoCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  size?: BentoCardSize;
  className?: string;
  children?: ReactNode;
}

const sizeClasses: Record<BentoCardSize, string> = {
  default: "",
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  large: "md:col-span-2 lg:row-span-2",
};

export function BentoCard({
  icon,
  title,
  description,
  href,
  cta = "Learn more",
  size = "default",
  className,
  children,
}: BentoCardProps) {
  const content = (
    <motion.div
      variants={bentoCardVariants}
      whileHover={{
        scale: 1.02,
        transition: easings.spring
      }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 h-full min-h-[200px]",
        "bg-white dark:bg-secondary border border-primary/10",
        "shadow-[0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05)]",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,.12)] hover:border-primary/30",
        "transition-shadow duration-300",
        sizeClasses[size],
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="feature-icon mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Custom content slot */}
      {children}

      {/* CTA - appears on hover */}
      {href && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <span className="inline-flex items-center text-sm font-medium text-primary">
            {cta}
            <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.div>
      )}

      {/* Hover background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}
```
- **PATTERN**: Staggered container with individual card animations
- **VALIDATE**: `npm run type-check`

### UPDATE packages/ui/src/index.ts
- **ADD EXPORTS**:
```typescript
// Motion System
export {
  MotionDiv,
  MotionSection,
  MotionArticle,
  MotionLi,
  MotionButton,
  MotionSpan,
  MotionImg,
  easings,
  cardHoverVariants,
  staggerContainerVariants,
  staggerItemVariants,
  fadeInUpVariants,
  carouselSlideVariants,
  bentoCardVariants,
  useAnimateInView,
  AnimatePresence,
  type Variants,
  type Transition,
  type MotionDivProps,
  type MotionSectionProps,
} from './motion';

// Bento Grid
export { BentoGrid, BentoCard, type BentoCardSize } from './components/BentoGrid';

// Properties (updated)
export { PropertyCard } from './properties/PropertyCard';
export { PropertyCardCarousel } from './properties/PropertyCardCarousel';
```
- **VALIDATE**: `npm run type-check`

### UPDATE apps/newhomeshow/app/page.tsx
- **REPLACE**: "The NewHomeShow Advantage" section (lines 86-186) with BentoGrid
- **IMPLEMENTATION**:
```typescript
import { BentoGrid, BentoCard } from "@repo/ui";

// In the component:
<section className="py-28 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary relative overflow-hidden">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <div className="accent-line mx-auto mb-6" />
      <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-4">
        The NewHomeShow <span className="text-gradient-primary">Advantage</span>
      </h2>
      <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto">
        Your exclusive gateway to pre-construction opportunities
      </p>
    </div>

    <BentoGrid className="max-w-5xl mx-auto">
      <BentoCard
        size="wide"
        icon={<KeyIcon />}
        title="VIP Builder Access"
        description="Get first access to pre-construction developments before they hit the public market. Our direct builder relationships mean better pricing and unit selection."
        href="/builder-projects"
      />
      <BentoCard
        icon={<DollarIcon />}
        title="Platinum Pricing"
        description="Access exclusive incentives, capped development fees, and special pricing only available through our preferred agent network."
      />
      <BentoCard
        icon={<ShieldIcon />}
        title="Expert Guidance"
        description="Navigate the pre-construction market with confidence. Our team provides expert analysis on builder reputation and investment potential."
      />
    </BentoGrid>
  </div>
</section>
```
- **VALIDATE**: `npm run dev --filter=newhomeshow` and visually verify

### UPDATE apps/sri-collective/app/page.tsx
- **REPLACE**: "The Sri Collective Advantage" section with BentoGrid
- **SAME PATTERN**: As NewHomeShow but with Sri Collective content
- **VALIDATE**: `npm run dev --filter=sri-collective` and visually verify

---

## VALIDATION COMMANDS

Execute all commands to ensure zero regressions.

### Level 1: Syntax & Types

```bash
# Type check all packages
npm run type-check
```
**Expected**: No TypeScript errors

```bash
# Lint all packages
npm run lint
```
**Expected**: No ESLint errors

### Level 2: Build

```bash
# Build all apps and packages
npm run build
```
**Expected**: Clean build with no errors

### Level 3: Manual Validation

```bash
# Start NewHomeShow
npm run dev --filter=newhomeshow
```
**Verify at http://localhost:3000**:
- [ ] PropertyCard image carousel works (arrows appear on hover)
- [ ] PropertyCard has spring-physics hover animation
- [ ] BentoGrid section animates in on scroll
- [ ] BentoCards have hover effects
- [ ] No console errors or hydration warnings

```bash
# Start Sri Collective
npm run dev --filter=sri-collective
```
**Verify at http://localhost:3001**:
- [ ] PropertyCard animations work
- [ ] BentoGrid uses theme colors
- [ ] All animations are smooth (60fps)

### Level 4: Performance

```bash
# Check bundle size increase
npm run build --filter=newhomeshow 2>&1 | grep "First Load JS"
```
**Expected**: Less than 30KB increase from framer-motion (LazyMotion optimization)

---

## ACCEPTANCE CRITERIA

- [x] Framer Motion installed and configured for client components
- [x] PropertyCard has smooth hover animations with spring physics
- [x] PropertyCard image carousel with navigation and pagination
- [x] BentoGrid component with variable card sizes
- [x] Scroll-triggered reveal animations working
- [x] Both apps updated with new components
- [x] All validation commands pass
- [x] No hydration errors or console warnings
- [x] Animations run at 60fps
- [x] Theme-aware styling maintained

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each validation passed immediately
- [ ] Manual testing confirms features work in both apps
- [ ] No TypeScript or ESLint errors
- [ ] Performance acceptable (bundle size, frame rate)
- [ ] Code follows existing patterns

---

## NOTES

### Design Decisions

**Why Framer Motion over CSS animations?**
- Spring physics provide natural, engaging feel
- AnimatePresence handles mount/unmount animations (required for carousel)
- useInView hook simplifies scroll-triggered animations
- TypeScript support for variants

**Why create motion primitives wrapper?**
- Centralizes "use client" directive
- Provides typed exports
- Allows future customization (e.g., adding global animation settings)

**Why BentoGrid instead of enhancing existing grid?**
- Bento layout requires variable card sizes
- Clean component boundary for feature sections
- Reusable across both apps with theme awareness

### Trade-offs

**Bundle Size (+~35KB gzipped for framer-motion)**
- **Pro**: Rich animations, better UX
- **Pro**: Industry-standard library with good tree-shaking
- **Con**: Additional JavaScript
- **Decision**: Worth it for luxury real estate brand positioning

**Client Components for animations**
- **Pro**: Required for interactive animations
- **Pro**: Still SSR rendered for SEO
- **Con**: More JavaScript hydration
- **Decision**: Only use client components where needed; keep containers as Server Components

---

## PRP CONFIDENCE SCORE: 8.5/10

**Strengths:**
- Comprehensive codebase analysis complete
- Clear patterns from existing components
- Detailed Framer Motion documentation included
- Step-by-step implementation tasks

**Risks:**
- First-time Framer Motion integration in this codebase
- Image carousel performance with many images
- Bundle size impact on Core Web Vitals

**Mitigations:**
- Start with motion primitives foundation
- Test carousel with varying image counts
- Monitor Lighthouse scores before/after

<!-- EOF -->
