export interface LeadEmailData {
  // Contact info (always present)
  firstName: string
  lastName: string
  email?: string
  phone?: string

  // Source & classification
  source: 'newhomeshow' | 'sri-collective'
  leadSource: 'contact-form' | 'registration' | 'chatbot' | 'property-inquiry'
  leadType: 'buyer' | 'seller' | 'investor' | 'general'
  leadQuality?: 'hot' | 'warm' | 'cold' | 'unqualified'

  // Context
  interest?: string
  message?: string
  conversationSummary?: string

  // Preferences
  budget?: string
  timeline?: string
  locations?: string[]
  propertyTypes?: string[]
  bedrooms?: number
  bathrooms?: number

  // Property-specific (inquiry or walkthrough)
  propertyAddress?: string
  propertyMls?: string
  inquiryType?: 'viewing' | 'question'

  // Registration-specific
  projectSlug?: string

  // Mortgage (from chatbot)
  mortgageEstimate?: {
    annualIncome: number
    downPayment: number
    monthlyDebts?: number
    maxPrice: number
  }

  // Engagement (from chatbot)
  viewedListings?: Array<{ address: string; price: number }>
  engagement?: {
    toolsUsed: string[]
    propertiesViewed: number
    conversationTopics: string[]
  }

  // Qualifications (from chatbot)
  preApproved?: boolean
  firstTimeBuyer?: boolean
  urgencyFactors?: string[]
}
