// Main chatbot widget
export { ChatbotWidget } from './ChatbotWidget'

// Chatbot store and types
export { useChatbotStore, type Message, type UserPreferences, type ViewedProperty, type MortgageEstimate, type PropertyListing, type PropertySearchResult } from './chatbot-store'
export { useChatbotHydration, getClientSessionId } from './use-chatbot-hydration'

// Tool result cards
export { ChatPropertyCard, ChatPropertyList } from './ChatPropertyCard'
export { ChatMortgageCard } from './ChatMortgageCard'

// Extracted components (for customization/extension)
export { ChatHeader } from './ChatHeader'
export { ChatInput } from './ChatInput'
export { ChatMessages, MessageBubble, TypingIndicator } from './ChatMessages'
export { ChatQuickActions } from './ChatQuickActions'
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

// Tool renderers
export { ToolResultRenderer, type ToolResult, type ToolResultType } from './tool-renderers'
