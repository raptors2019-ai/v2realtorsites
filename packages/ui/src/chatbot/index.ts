// Main chatbot widget
export { ChatbotWidget } from './ChatbotWidget'

// Chatbot store and types
export { useChatbotStore, type Message, type UserPreferences, type ViewedProperty, type MortgageEstimate, type PropertyListing, type PropertySearchResult, type CallToAction, type UrlCallToAction, type CitySearchCallToAction, type MortgageInputCallToAction } from './chatbot-store'
export { useChatbotHydration, getClientSessionId } from './use-chatbot-hydration'

// Tool result cards
export { ChatPropertyCard, ChatPropertyList } from './ChatPropertyCard'
export { ChatMortgageCard } from './ChatMortgageCard'
export { ChatMortgageInputForm } from './ChatMortgageInputForm'

// Extracted components (for customization/extension)
export { ChatHeader } from './ChatHeader'
export { ChatInput } from './ChatInput'
export { ChatMessages, MessageBubble, TypingIndicator } from './ChatMessages'
export { ChatQuickActions } from './ChatQuickActions'
export { ChatCitySearch } from './ChatCitySearch'
export { ChatbotErrorBoundary } from './ChatbotErrorBoundary'

// Survey system
export { SurveyFlow, type SurveyState, type SurveyStepType, type SurveyType } from './survey'
export {
  PropertyTypeStep,
  BudgetStep,
  BedroomsStep,
  TimelineStep,
  LocationStep,
  ListingsDisplayStep,
  ContactInfoStep,
} from './survey'

