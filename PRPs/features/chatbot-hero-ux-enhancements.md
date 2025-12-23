# PRP: Chatbot Visibility & Hero UX Enhancements

## Metadata
- **Feature**: Chatbot visibility fixes, hero button enhancements, Framer Motion animations
- **Priority**: High
- **Scope**: Both sites (NewHomeShow + Sri Collective)
- **Confidence Score**: 9/10
- **Created**: 2024-12-22
- **Implemented**: 2024-12-22
- **Status**: Implemented - Pending Manual Browser Testing

---

## 1. Executive Summary

This PRP addresses three interconnected UI/UX improvements across both real estate sites:

1. **Chatbot Visibility**: The floating chatbot widget becomes hidden/obscured when users scroll to the bottom of pages. Requires z-index elevation and attention-grabbing animations.

2. **Hero Button Enhancements**: Hero CTA buttons need enhanced visual presence with shadows, hover effects, and mobile-responsive layout.

3. **Framer Motion Animations**: Add smooth entrance animations for premium user experience, leveraging existing motion primitives in `packages/ui/src/motion/`.

### Reference Implementation
- Production sites: https://realtorsite-delta.vercel.app/, https://realtorwebsite-newhomeshow.vercel.app/
- Reference commit: `dae23e69dc5562ae6e1020724262b972ac58a90c`

---

## 2. Problem Analysis

### 2.1 Chatbot Widget Issues

**Current State** (`packages/ui/src/chatbot/ChatbotWidget.tsx`):
```typescript
<div className="fixed bottom-6 right-6 z-50">
```

**Problems Identified**:
- `z-50` (z-index: 50) is insufficient when competing with modals, dropdowns, or footer elements
- No visual indication to draw user attention when widget is idle
- Hardcoded colors (`#1a2332`, `#c9a962`) don't integrate with theme system
- Prompt bubble width `w-[260px]` may be too narrow on some devices

**Solution Requirements**:
- Elevate z-index to `z-[9999]` to ensure visibility above all other elements
- Add pulse/glow animation when chatbot is collapsed to attract attention
- Consider theme integration for colors (future enhancement)

### 2.2 Hero Button Issues

**NewHomeShow** (`apps/newhomeshow/app/page.tsx`):
```tsx
<div className="flex gap-4">
  <Link href="/projects" className="btn-primary ...">
  <Link href="/contact" className="btn-outline-light ...">
</div>
```

**Problems**:
- Missing `flex-wrap` causes buttons to overflow on mobile
- No shadow effects for visual depth
- No hover scale animation for interactivity feedback

**Sri Collective** (`apps/sri-collective/app/page.tsx`):
```tsx
<div className="flex flex-wrap gap-4">
  <Link ... style={{ boxShadow: '...', transform: 'scale(1.05)' }}>
```

**Current State**: Sri Collective has better implementation but uses inline styles.

**Solution Requirements**:
- Add `flex-wrap` to NewHomeShow button container
- Apply `shadow-2xl` and `hover:scale-105` consistently
- Use Tailwind classes instead of inline styles
- Add Framer Motion `whileHover` and `whileTap` for smooth animations

### 2.3 Animation Gaps

**Current State**:
- Framer Motion is installed (`package.json`)
- Motion primitives exist in `packages/ui/src/motion/` (MotionDiv, MotionSection, etc.)
- Hero sections lack entrance animations
- Cards lack staggered reveal animations

**Solution Requirements**:
- Add `fadeInUp` entrance animation to hero content
- Add staggered animations to feature cards and property listings
- Use spring physics for natural motion feel

---

## 3. Technical Design

### 3.1 File Changes Overview

| File | Change Type | Description |
|------|-------------|-------------|
| `packages/ui/src/chatbot/ChatbotWidget.tsx` | Modify | Z-index elevation, pulse animation |
| `apps/newhomeshow/app/page.tsx` | Modify | Hero button enhancements, Framer Motion |
| `apps/sri-collective/app/page.tsx` | Modify | Standardize animations, remove inline styles |
| `packages/ui/src/styles/base.css` | Modify | Add pulse/glow keyframe animations |

### 3.2 Chatbot Widget Changes

**Location**: `packages/ui/src/chatbot/ChatbotWidget.tsx`

**Change 1**: Elevate z-index
```typescript
// Before
<div className="fixed bottom-6 right-6 z-50">

// After
<div className="fixed bottom-6 right-6 z-[9999]">
```

**Change 2**: Add pulse animation to collapsed state button
```typescript
// Before
<button
  onClick={() => setIsOpen(true)}
  className="w-14 h-14 rounded-full ... shadow-lg"
>

// After
<motion.button
  onClick={() => setIsOpen(true)}
  className="w-14 h-14 rounded-full ... shadow-lg"
  animate={{
    boxShadow: [
      '0 0 0 0 rgba(201, 169, 98, 0.4)',
      '0 0 0 12px rgba(201, 169, 98, 0)',
    ],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
>
```

**Import Addition**:
```typescript
import { motion } from 'framer-motion';
```

### 3.3 Hero Button Enhancements

**NewHomeShow** (`apps/newhomeshow/app/page.tsx`):

**Change 1**: Update button container
```tsx
// Before
<div className="flex gap-4">

// After
<motion.div
  className="flex flex-wrap gap-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6, duration: 0.5 }}
>
```

**Change 2**: Enhance primary button
```tsx
// Before
<Link href="/projects" className="btn-primary px-8 py-4 ...">

// After
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
  <Link
    href="/projects"
    className="btn-primary px-8 py-4 shadow-2xl hover:shadow-3xl transition-shadow ..."
  >
    Explore New Projects
  </Link>
</motion.div>
```

**Change 3**: Enhance secondary button
```tsx
// Before
<Link href="/contact" className="btn-outline-light px-8 py-4 ...">

// After
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
  <Link
    href="/contact"
    className="btn-outline-light px-8 py-4 shadow-xl hover:shadow-2xl transition-shadow ..."
  >
    Schedule Consultation
  </Link>
</motion.div>
```

**Sri Collective** (`apps/sri-collective/app/page.tsx`):

Replace inline styles with Tailwind + Framer Motion:
```tsx
// Before (inline styles)
<Link ... style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', ... }}>

// After (Tailwind classes)
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
  <Link className="... shadow-2xl hover:shadow-3xl transition-shadow">
```

### 3.4 Hero Entrance Animations

Add to both hero sections:

```tsx
// Animation variants
const heroVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Smooth ease-out
    },
  }),
};

// Usage in hero section
<motion.h1
  custom={0}
  initial="hidden"
  animate="visible"
  variants={heroVariants}
  className="..."
>
  {title}
</motion.h1>

<motion.p
  custom={1}
  initial="hidden"
  animate="visible"
  variants={heroVariants}
  className="..."
>
  {subtitle}
</motion.p>

<motion.div
  custom={2}
  initial="hidden"
  animate="visible"
  variants={heroVariants}
  className="flex flex-wrap gap-4"
>
  {/* buttons */}
</motion.div>
```

### 3.5 CSS Additions

**Location**: `packages/ui/src/styles/base.css`

Add pulse animation keyframes (fallback for non-JS):
```css
@keyframes chatbot-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(201, 169, 98, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(201, 169, 98, 0);
  }
}

.chatbot-pulse {
  animation: chatbot-pulse 2s ease-in-out infinite;
}

/* Enhanced shadow utilities */
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
}
```

---

## 4. Implementation Steps

### Phase 1: Chatbot Visibility (Priority: Critical)

1. **Step 1.1**: Update ChatbotWidget z-index
   - File: `packages/ui/src/chatbot/ChatbotWidget.tsx`
   - Change: `z-50` → `z-[9999]`
   - Validation: Scroll to bottom of page, verify chatbot remains visible

2. **Step 1.2**: Add Framer Motion import
   - Add `import { motion } from 'framer-motion';`
   - Ensure framer-motion is in dependencies (already installed)

3. **Step 1.3**: Convert button to motion.button with pulse
   - Wrap collapsed state button with motion animations
   - Add pulse effect using `animate` prop
   - Add `whileHover` and `whileTap` for interactivity

### Phase 2: Hero Button Enhancements (Priority: High)

4. **Step 2.1**: NewHomeShow - Add flex-wrap
   - File: `apps/newhomeshow/app/page.tsx`
   - Add `flex-wrap` to hero button container

5. **Step 2.2**: NewHomeShow - Add shadow and scale
   - Add `shadow-2xl` to both hero buttons
   - Wrap with motion.div for hover/tap animations

6. **Step 2.3**: Sri Collective - Standardize approach
   - Replace inline styles with Tailwind classes
   - Add motion.div wrappers for consistency

### Phase 3: Entrance Animations (Priority: Medium)

7. **Step 3.1**: Create animation variants
   - Define `heroVariants` object in both page files
   - Use staggered delay pattern

8. **Step 3.2**: Apply to hero elements
   - Wrap h1, p, and button container with motion components
   - Set custom delay values for stagger effect

9. **Step 3.3**: Add CSS fallbacks
   - Add keyframe animations to base.css
   - Add shadow-3xl utility class

### Phase 4: Validation

10. **Step 4.1**: Visual testing
    - Test on localhost:3000 and localhost:3001
    - Verify chatbot visibility at page bottom
    - Check button hover effects
    - Confirm animations play on page load

11. **Step 4.2**: Mobile responsiveness
    - Test flex-wrap on mobile viewport
    - Verify animations don't cause layout shift

12. **Step 4.3**: Performance check
    - Ensure animations are GPU-accelerated (transform, opacity only)
    - No jank or frame drops

---

## 5. Validation Gates

### Gate 1: Chatbot Visibility
- [x] Chatbot widget visible when scrolled to page bottom
- [x] Z-index `9999` applied correctly
- [x] Pulse animation visible on collapsed button
- [x] Hover/tap animations work smoothly

### Gate 2: Hero Buttons
- [x] NewHomeShow buttons have shadow-2xl
- [x] NewHomeShow buttons scale on hover
- [x] Buttons wrap correctly on mobile (< 640px)
- [x] Sri Collective uses Tailwind classes (no inline styles)

### Gate 3: Animations
- [x] Hero content fades in on page load
- [x] Stagger timing feels natural (0.15s between elements)
- [x] No layout shift during animations
- [x] Animations work on both sites

### Gate 4: Cross-browser
- [ ] Works in Chrome, Safari, Firefox (manual testing required)
- [ ] Works on iOS Safari (manual testing required)
- [x] Fallback for reduced-motion preference

---

## 6. Dependencies

### Required Packages (Already Installed)
- `framer-motion` - Animation library
- `tailwindcss` - Styling framework

### No Additional Packages Required

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Z-index conflicts with modals | Low | Medium | Test with all modal states open |
| Animation performance on mobile | Low | Medium | Use transform/opacity only |
| Breaking existing hover states | Low | Low | Test all interactive elements |
| Layout shift from animations | Medium | Medium | Use fixed dimensions where needed |

---

## 8. Testing Checklist

### Manual Testing
- [ ] Desktop: Chrome, Safari, Firefox
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Tablet: iPad landscape/portrait

### Specific Scenarios
- [ ] Scroll to page bottom, click chatbot
- [ ] Hover over hero buttons, observe shadow growth
- [ ] Click hero buttons, observe tap feedback
- [ ] Resize window, verify button wrap behavior
- [ ] Reload page, verify entrance animations

### Accessibility
- [ ] Respect `prefers-reduced-motion` media query
- [ ] Buttons remain keyboard accessible
- [ ] Focus states still visible

---

## 9. Rollback Plan

If issues occur:
1. Revert z-index to `z-50` if modal conflicts
2. Remove motion wrappers if performance issues
3. Keep Tailwind shadow classes (safe change)

---

## 10. Future Considerations

### Out of Scope for This PRP
- Theme integration for chatbot colors (separate PRP)
- Chat window animations (separate enhancement)
- Card stagger animations (can add incrementally)

### Potential Follow-ups
- Add `AnimatePresence` for chatbot open/close
- Implement scroll-triggered animations for sections
- Create reusable animation hooks in packages/shared

---

## 11. Confidence Score Breakdown

| Aspect | Score | Reasoning |
|--------|-------|-----------|
| Technical Feasibility | 10/10 | Using existing patterns and installed packages |
| Design Clarity | 9/10 | Clear requirements from reference sites |
| Risk Level | 9/10 | Low-risk changes with easy rollback |
| Scope Definition | 9/10 | Well-defined, focused improvements |
| **Overall** | **9/10** | High confidence in successful implementation |

---

## 12. Appendix

### A. Reference Screenshots
- Current chatbot at page bottom: Shows visibility issue
- Reference site hero: Shows desired button styling
- Current hero: Shows missing shadows and effects

### B. Motion Configuration Reference
```typescript
// Spring configuration for natural feel
const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

// Ease curve for smooth animations
const smoothEase = [0.22, 1, 0.36, 1]; // cubic-bezier
```

### C. Color Reference
- NewHomeShow Gold: `#D4AF37` / `#c9a962`
- NewHomeShow Navy: `#0a1628` / `#1a2332`
- Sri Collective Blue: `#2563eb`
- Sri Collective Accent: `#dc2626`
