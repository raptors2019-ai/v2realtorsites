// Components
export { Header } from './components/layout/Header'
export { Footer } from './components/layout/Footer'
export { Button } from './components/Button'
export { Spinner } from './components/Spinner'

// BentoGrid
export { BentoGrid, BentoCard, BentoFeatureCard, type BentoCardSize } from './components/BentoGrid'

// Properties
export { PropertyCard, PropertyCardCarousel, PropertyGallery, PropertyGrid, PropertyFilters, PropertiesPageClient } from './properties'

// Chatbot
export { ChatbotWidget } from './chatbot'

// Theme System
export { ThemeProvider } from './components/ThemeProvider'
export { ThemeToggle } from './components/ThemeToggle'
export { themes } from './styles'

// Hooks
export { useScrollPosition } from './hooks/useScrollPosition'

// Utils
export { cn, formatPrice } from './lib/utils'

// Motion System
export {
  // Motion primitives (client components)
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
  // Animated hero components
  AnimatedHeroContent,
  AnimatedHeroItem,
  AnimatedHeroTitle,
  AnimatedHeroSubtitle,
  AnimatedHeroButtons,
  AnimatedAccentLine,
  // Animation variants
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
  // Hooks
  useAnimateInView,
  useAnimateInViewGeneric,
  // Re-exports from framer-motion
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
} from './motion'

// Motion types
export type {
  MotionDivProps,
  MotionSectionProps,
  MotionArticleProps,
  MotionLiProps,
  MotionButtonProps,
  MotionSpanProps,
  MotionImgProps,
  MotionUlProps,
  MotionAProps,
  Variants,
  Transition,
  AnimatePresenceProps,
  MotionProps,
  MotionValue,
} from './motion'

// Types
export type { HeaderConfig, HeaderProps } from './components/layout/Header'
export type { FooterConfig, FooterProps } from './components/layout/Footer'
export type { ButtonProps } from './components/Button'
export type { ThemeName, ThemeConfig, ButtonVariant } from './types/theme'
