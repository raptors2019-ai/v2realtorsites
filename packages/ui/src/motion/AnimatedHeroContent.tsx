"use client";

import { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

// Hero-specific animation variants with stagger
const heroVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Smooth ease-out curve
    },
  }),
};

interface AnimatedHeroContentProps {
  children: ReactNode;
  className?: string;
}

interface AnimatedHeroItemProps {
  children: ReactNode;
  index: number;
  className?: string;
  as?: "h1" | "h2" | "p" | "div" | "span";
}

/**
 * Container for animated hero content
 */
export function AnimatedHeroContent({ children, className }: AnimatedHeroContentProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual animated hero item with stagger effect
 * Use the `index` prop to control animation order (0, 1, 2, etc.)
 */
export function AnimatedHeroItem({
  children,
  index,
  className,
  as = "div",
}: AnimatedHeroItemProps) {
  const Component = motion[as];

  return (
    <Component
      custom={index}
      initial="hidden"
      animate="visible"
      variants={heroVariants}
      className={className}
    >
      {children}
    </Component>
  );
}

/**
 * Pre-configured animated wrapper for hero title (h1)
 */
export function AnimatedHeroTitle({
  children,
  index = 0,
  className,
}: Omit<AnimatedHeroItemProps, "as">) {
  return (
    <motion.h1
      custom={index}
      initial="hidden"
      animate="visible"
      variants={heroVariants}
      className={className}
    >
      {children}
    </motion.h1>
  );
}

/**
 * Pre-configured animated wrapper for hero subtitle (p)
 */
export function AnimatedHeroSubtitle({
  children,
  index = 1,
  className,
}: Omit<AnimatedHeroItemProps, "as">) {
  return (
    <motion.p
      custom={index}
      initial="hidden"
      animate="visible"
      variants={heroVariants}
      className={className}
    >
      {children}
    </motion.p>
  );
}

/**
 * Pre-configured animated wrapper for hero buttons container
 */
export function AnimatedHeroButtons({
  children,
  index = 2,
  className,
}: Omit<AnimatedHeroItemProps, "as">) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={heroVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated accent line that fades in first
 */
export function AnimatedAccentLine({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: "4rem" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    />
  );
}
