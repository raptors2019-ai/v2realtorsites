// Motion primitives (client components)
export {
  MotionDiv,
  MotionSection,
  MotionArticle,
  MotionLi,
  MotionButton,
  MotionSpan,
  MotionImg,
  MotionUl,
  MotionNav,
  MotionHeader,
  MotionFooter,
  MotionAside,
  MotionMain,
  MotionFigure,
  MotionA,
  MotionP,
  MotionH1,
  MotionH2,
  MotionH3,
  MotionH4,
  type MotionDivProps,
  type MotionSectionProps,
  type MotionArticleProps,
  type MotionLiProps,
  type MotionButtonProps,
  type MotionSpanProps,
  type MotionImgProps,
  type MotionUlProps,
  type MotionAProps,
} from "./motion-primitives";

// Animated hero components
export {
  AnimatedHeroContent,
  AnimatedHeroItem,
  AnimatedHeroTitle,
  AnimatedHeroSubtitle,
  AnimatedHeroButtons,
  AnimatedAccentLine,
} from "./AnimatedHeroContent";

// Animation variants
export {
  easings,
  cardHoverVariants,
  staggerContainerVariants,
  staggerItemVariants,
  fadeInUpVariants,
  fadeInLeftVariants,
  fadeInRightVariants,
  fadeInDownVariants,
  scaleUpVariants,
  carouselSlideVariants,
  bentoCardVariants,
  buttonPressVariants,
  iconSpinVariants,
  pulseVariants,
  listItemSlideVariants,
  overlayVariants,
  modalVariants,
} from "./variants";

// Hooks
export { useAnimateInView, useAnimateInViewGeneric } from "./use-animate-in-view";

// Re-export useful framer-motion types and components
export type { Variants, Transition, AnimatePresenceProps, MotionProps, MotionValue } from "framer-motion";
export { AnimatePresence, motion, useAnimation, useMotionValue, useTransform, useSpring } from "framer-motion";
