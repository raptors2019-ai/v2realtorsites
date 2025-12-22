// Components
export { Header } from './components/layout/Header'
export { Footer } from './components/layout/Footer'
export { Button } from './components/Button'

// Properties
export { PropertyCard, PropertyGrid, PropertyFilters, PropertiesPageClient } from './properties'

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

// Types
export type { HeaderConfig, HeaderProps } from './components/layout/Header'
export type { FooterConfig, FooterProps } from './components/layout/Footer'
export type { ButtonProps } from './components/Button'
export type { ThemeName, ThemeConfig, ButtonVariant } from './types/theme'
