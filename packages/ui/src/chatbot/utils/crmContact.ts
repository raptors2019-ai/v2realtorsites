import type { Message } from '../chatbot-store'

interface ContactInfo {
  firstName?: string
  lastName?: string
  phone: string
  email?: string
}

interface LeadContext {
  leadType: 'buyer' | 'seller' | 'general'
  source?: string
  propertyTypes?: string[]
  averagePrice?: number
  averageBeds?: number
  preferredCity?: string
  preferredNeighborhoods?: string[]
  timeline?: string
  firstTimeBuyer?: boolean
  conversationSummary?: string
}

/**
 * Builds a contact creation prompt for the AI to save to CRM.
 */
export function buildContactPrompt(contact: ContactInfo, context: LeadContext): string {
  const parts: string[] = ['Use the createContact tool to save this lead:']

  if (contact.firstName) parts.push(`- firstName: "${contact.firstName}"`)
  if (contact.lastName) parts.push(`- lastName: "${contact.lastName}"`)
  parts.push(`- cellPhone: "${contact.phone}"`)
  parts.push(`- email: "${contact.email || ''}"`)
  parts.push(`- leadType: "${context.leadType}"`)
  parts.push(`- source: "${context.source || 'sri-collective'}"`)

  if (context.propertyTypes?.length) {
    parts.push(`- propertyTypes: ${JSON.stringify(context.propertyTypes)}`)
  }
  if (context.averagePrice) {
    parts.push(`- averagePrice: ${context.averagePrice}`)
  }
  if (context.averageBeds) {
    parts.push(`- averageBeds: ${context.averageBeds}`)
  }
  if (context.preferredCity) {
    parts.push(`- preferredCity: "${context.preferredCity}"`)
  }
  if (context.preferredNeighborhoods?.length) {
    parts.push(`- preferredNeighborhoods: ${JSON.stringify(context.preferredNeighborhoods)}`)
  }
  if (context.timeline) {
    parts.push(`- timeline: "${context.timeline}"`)
  }
  if (context.firstTimeBuyer) {
    parts.push(`- firstTimeBuyer: true`)
  }
  if (context.conversationSummary) {
    parts.push(`- conversationSummary: "${context.conversationSummary}"`)
  }

  return parts.join('\n')
}

/**
 * Parses a full name into first and last name parts.
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const nameParts = fullName.trim().split(/\s+/)
  return {
    firstName: nameParts[0] || fullName,
    lastName: nameParts.slice(1).join(' ') || '',
  }
}

/**
 * Sends a contact creation request to the chat API (fire and forget).
 */
export function saveContactToCRM(
  messages: Message[],
  contactPrompt: string
): void {
  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: contactPrompt }]
    }),
  }).catch(error => console.error("Error saving contact:", error))
}

/**
 * Formats currency for display in conversation summaries.
 */
export function formatCurrencyCAD(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}
