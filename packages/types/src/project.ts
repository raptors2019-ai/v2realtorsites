import type { BuilderProject } from './property'
import type { LeadQuality } from './contact'

/**
 * Product type with price range (e.g., Townhomes, Detached)
 */
export interface ProductType {
  name: string
  priceRange?: {
    min: number
    max: number
  } | null
  sqftRange?: {
    min: number
    max: number
  } | null
  features?: string[]
  bedrooms?: string
  bathrooms?: string
  garages?: string
}

/**
 * Extended BuilderProject with CMS-specific fields
 */
export interface CMSBuilderProject extends Omit<BuilderProject, 'propertyTypes' | 'images' | 'address' | 'closingDate' | 'description' | 'features'> {
  _id?: string // Sanity document ID
  intersection?: string | null // e.g., "Whitevale Rd. & Brock Rd."
  featuredImage?: string | null // URL from Sanity or local
  gallery?: string[] | null // Gallery image URLs
  productTypes: ProductType[] // Referenced product types with pricing
  address?: string | null // Full address
  closingDate?: string | null // Optional closing date (ISO string)
  description?: string | null // Project description
  features?: string[] | null // Feature list
  images?: string[] // Optional for backwards compatibility
  // New fields for incentives & deposits
  builder?: string | null // Builder/developer name
  incentives?: string[] | null // Current bonus package items
  depositStructure?: string | null // Deposit payment schedule
  totalDeposit?: number | null // Total deposit amount
  isQuickClosing?: boolean // Has quick closing / move-in ready units
  // Display section control
  displaySections?: ('projects' | 'quick-closings' | 'promotions' | 'assignments')[] | null
}

/**
 * Registration form data submitted by users
 */
export interface RegistrationData {
  projectSlug: string
  firstName: string
  lastName: string
  email: string
  phone: string
  budgetRange: string
  timeline: string
  source?: string
}

/**
 * Budget range options for registration form
 */
export const BUDGET_RANGES = [
  { value: 'under-500k', label: 'Under $500K' },
  { value: '500k-750k', label: '$500K - $750K' },
  { value: '750k-1m', label: '$750K - $1M' },
  { value: '1m-1.5m', label: '$1M - $1.5M' },
  { value: 'over-1.5m', label: 'Over $1.5M' },
] as const

/**
 * Timeline options for registration form
 */
export const TIMELINE_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: '1-3-months', label: '1-3 Months' },
  { value: '3-6-months', label: '3-6 Months' },
  { value: '6-12-months', label: '6-12 Months' },
  { value: 'just-browsing', label: 'Just Browsing' },
] as const

/**
 * Calculate lead quality based on registration data
 */
export function calculateLeadQuality(data: RegistrationData): LeadQuality {
  let score = 0

  // Timeline scoring
  if (data.timeline === 'immediately') score += 4
  else if (data.timeline === '1-3-months') score += 3
  else if (data.timeline === '3-6-months') score += 2
  else if (data.timeline === '6-12-months') score += 1

  // Budget scoring (higher budget = more serious buyer)
  if (data.budgetRange === 'over-1.5m') score += 2
  else if (data.budgetRange === '1m-1.5m') score += 2
  else if (data.budgetRange === '750k-1m') score += 1

  // Phone provided = more engaged
  if (data.phone) score += 1

  if (score >= 5) return 'hot'
  if (score >= 3) return 'warm'
  return 'cold'
}
