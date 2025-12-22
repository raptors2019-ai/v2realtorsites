import { z } from 'zod'
import type { CoreTool } from 'ai'

/**
 * Determines lead quality based on captured preferences
 */
function determineLeadQuality(prefs: Record<string, unknown>): 'hot' | 'warm' | 'cold' {
  // Hot: Has timeline (immediate/3-months) or urgency factors
  if (prefs.timeline === 'immediate' || prefs.timeline === '3-months') {
    return 'hot'
  }
  if (prefs.urgencyFactors && Array.isArray(prefs.urgencyFactors) && prefs.urgencyFactors.length > 0) {
    return 'hot'
  }
  if (prefs.preApproved === true) {
    return 'warm'
  }
  if (prefs.timeline === 'just-browsing') {
    return 'cold'
  }
  return 'warm'
}

export const capturePreferencesTool: CoreTool = {
  description: `Capture buyer or seller preferences during conversation.
Use this tool when the user shares their property requirements.
Store preferences for later use when creating contact.`,

  parameters: z.object({
    leadType: z.enum(['buyer', 'seller', 'investor', 'general'])
      .describe("Type of lead based on conversation"),

    // Buyer preferences
    budget: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      range: z.string().optional(),
    }).optional().describe("Budget range for buyers"),

    propertyType: z.enum(['detached', 'semi-detached', 'townhouse', 'condo']).optional()
      .describe("Type of property"),
    bedrooms: z.number().min(1).max(10).optional()
      .describe("Number of bedrooms"),
    bathrooms: z.number().min(1).max(10).optional()
      .describe("Number of bathrooms"),
    locations: z.array(z.string()).optional()
      .describe("Preferred locations/cities"),
    timeline: z.enum(['immediate', '3-months', '6-months', '12-months', 'just-browsing']).optional()
      .describe("When they want to buy/sell"),
    preApproved: z.boolean().optional()
      .describe("Whether buyer is pre-approved for mortgage"),

    // Seller preferences
    propertyAddress: z.string().optional()
      .describe("Seller's property address"),
    reasonForSelling: z.string().optional()
      .describe("Why they're selling"),
    expectedPrice: z.number().optional()
      .describe("Seller's expected price"),

    // Intent signals
    urgencyFactors: z.array(z.string()).optional()
      .describe("Urgency factors: job relocation, growing family, downsizing, lease ending, etc."),
  }),

  execute: async (preferences) => {
    const leadQuality = determineLeadQuality(preferences)

    // Log for debugging
    console.error('[chatbot.capturePreferences]', {
      leadType: preferences.leadType,
      leadQuality,
      hasLocations: !!preferences.locations?.length,
      hasTimeline: !!preferences.timeline,
    })

    // Store in conversation context for later CRM sync
    return {
      success: true,
      message: "Preferences captured successfully",
      preferences,
      leadQuality,
      nextStep: "Now show 3 matching listings before asking for contact info",
    }
  },
}
