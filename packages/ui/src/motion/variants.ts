import type { Variants } from "framer-motion";

// Standard easing curves
export const easings = {
  easeOut: [0.32, 0.72, 0, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  spring: { type: "spring", stiffness: 300, damping: 30 } as const,
  springGentle: { type: "spring", stiffness: 200, damping: 25 } as const,
  springBouncy: { type: "spring", stiffness: 400, damping: 20 } as const,
};

// Card hover animation
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
    transition: easings.spring,
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
    transition: { duration: 0.4, ease: easings.easeOut },
  },
};

// Scroll-triggered fade in
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easings.easeOut },
  },
};

// Fade in from different directions
export const fadeInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easings.easeOut },
  },
};

export const fadeInRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easings.easeOut },
  },
};

export const fadeInDownVariants: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easings.easeOut },
  },
};

// Scale up animation
export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easings.easeOut },
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
    transition: { duration: 0.5, ease: easings.easeOut },
  },
};

// Button press animation
export const buttonPressVariants: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.97 },
  hover: { scale: 1.02 },
};

// Icon spin animation
export const iconSpinVariants: Variants = {
  initial: { rotate: 0 },
  animate: { rotate: 360, transition: { duration: 1, ease: "linear", repeat: Infinity } },
};

// Pulse animation
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 2, ease: "easeInOut", repeat: Infinity },
  },
};

// List item stagger with different effects
export const listItemSlideVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: easings.easeOut,
    },
  }),
};

// Modal/overlay animations
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: easings.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};
