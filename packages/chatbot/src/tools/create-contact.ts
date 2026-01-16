import { z } from 'zod'
import type { CoreTool } from 'ai'
import { BoldTrailClient } from '@repo/crm'
import { calculateLeadQuality } from '../utils/lead-scoring'

// Format budget to hashtag-friendly format
function formatBudgetHashtag(budget: number): string {
  if (budget < 500000) return 'budget-under-500k'
  if (budget < 750000) return 'budget-500k-750k'
  if (budget < 1000000) return 'budget-750k-1m'
  if (budget < 1500000) return 'budget-1m-1.5m'
  if (budget < 2000000) return 'budget-1.5m-2m'
  return 'budget-2m-plus'
}

export const createContactTool: CoreTool = {
  description: `[PURPOSE] Create a contact in BoldTrail CRM with full lead scoring and preference tagging.
[WHEN TO USE] ONLY after providing value (showing listings, mortgage estimate, neighborhood info). Never ask for contact info first.
[IMPORTANT] Ask for email first, then cell phone. Include ALL captured data from conversation: mortgage estimates, neighborhood interests, urgency factors.
[OUTPUT] Returns success status, contactId, and thank you message. CRM automatically scores and tags the lead.`,

  parameters: z.object({
    firstName: z.string().describe("Contact's first name"),
    lastName: z.string().optional().describe("Contact's last name"),
    email: z.string().email().describe("Contact's email address (required)"),
    cellPhone: z.string().optional()
      .describe("Contact's cell phone number (valuable - ask after showing value)"),
    leadType: z.enum(['buyer', 'seller', 'investor', 'general'])
      .describe("Type of lead"),

    // Buyer preferences
    averagePrice: z.number().optional().describe("Target budget"),
    averageBeds: z.number().optional().describe("Desired bedrooms"),
    averageBathrooms: z.number().optional().describe("Desired bathrooms"),
    preferredCity: z.string().optional().describe("Preferred city/area"),
    preferredNeighborhoods: z.array(z.string()).optional()
      .describe("Specific neighborhoods of interest"),
    propertyTypes: z.array(z.string()).optional()
      .describe("Property types: detached, condo, etc."),

    // Seller preferences
    propertyAddress: z.string().optional().describe("Seller's property address"),
    reasonForSelling: z.string().optional(),
    sellerTimeline: z.enum(['asap', '1-3-months', '3-6-months', 'just-exploring']).optional(),

    // Intent and qualification
    timeline: z.enum(['asap', 'immediate', '1-3-months', '3-6-months', '6-plus-months', 'just-exploring']).optional()
      .describe("Buyer timeline - determines lead quality"),
    urgencyFactors: z.array(z.string()).optional()
      .describe("Urgency signals: relocating, lease-ending, growing-family, pre-approved"),
    preApproved: z.boolean().optional()
      .describe("Whether buyer is pre-approved for mortgage"),
    firstTimeBuyer: z.boolean().optional()
      .describe("Whether this is a first-time home buyer"),

    // Mortgage estimator data (if they used the tool)
    mortgageEstimate: z.object({
      annualIncome: z.number(),
      downPayment: z.number(),
      monthlyDebts: z.number().optional(),
      maxPrice: z.number(),
    }).optional().describe("Results from mortgage affordability estimator"),

    // Source tracking - ALWAYS include these
    source: z.enum(['newhomeshow', 'sri-collective']).optional()
      .describe("Which website the lead came from"),
  }),

  execute: async (params) => {
    // Validate phone format if provided
    if (params.cellPhone) {
      const cleaned = params.cellPhone.replace(/\D/g, '')
      if (cleaned.length !== 10 && cleaned.length !== 11) {
        return {
          success: false,
          error: "Invalid phone format. Please provide a 10-digit phone number.",
        }
      }
    }

    try {
      const client = new BoldTrailClient()

      // Calculate lead quality score
      const leadQuality = calculateLeadQuality({
        cellPhone: params.cellPhone,
        timeline: params.timeline,
        preApproved: params.preApproved,
        urgencyFactors: params.urgencyFactors,
        firstTimeBuyer: params.firstTimeBuyer,
        mortgageEstimate: params.mortgageEstimate,
      })

      // Build hashtags from preferences
      const hashtags: string[] = []

      // 1. SOURCE TAGS (always include)
      hashtags.push('website')
      if (params.source) {
        hashtags.push(params.source)
      }

      // 2. LEAD QUALITY TAG
      hashtags.push(`${leadQuality}-lead`)

      // 3. TIMELINE TAG
      if (params.timeline) {
        hashtags.push(`timeline-${params.timeline}`)
      }
      if (params.sellerTimeline) {
        hashtags.push(`seller-timeline-${params.sellerTimeline}`)
      }

      // 4. LEAD TYPE TAGS
      hashtags.push(params.leadType)

      // 5. QUALIFICATION TAGS
      if (params.preApproved) {
        hashtags.push('pre-approved')
      }
      if (params.firstTimeBuyer) {
        hashtags.push('first-time-buyer')
      }
      if (params.mortgageEstimate) {
        hashtags.push('mortgage-estimated')
      }

      // 6. PROPERTY PREFERENCE TAGS
      if (params.propertyTypes) {
        hashtags.push(...params.propertyTypes.map((t: string) => t.toLowerCase()))
      }

      // 7. BUDGET TAG
      if (params.averagePrice) {
        hashtags.push(formatBudgetHashtag(params.averagePrice))
      } else if (params.mortgageEstimate?.maxPrice) {
        hashtags.push(formatBudgetHashtag(params.mortgageEstimate.maxPrice))
      }

      // 8. LOCATION TAGS
      if (params.preferredCity) {
        hashtags.push(params.preferredCity.toLowerCase().replace(/\s+/g, '-'))
      }
      if (params.preferredNeighborhoods) {
        hashtags.push(...params.preferredNeighborhoods.map((n: string) => n.toLowerCase().replace(/\s+/g, '-')))
      }

      // 9. URGENCY FACTOR TAGS
      if (params.urgencyFactors) {
        hashtags.push(...params.urgencyFactors.map((f: string) => f.toLowerCase().replace(/\s+/g, '-')))
      }

      // Build notes with structured data for agent reference
      const notes = JSON.stringify({
        capturedAt: new Date().toISOString(),
        source: params.source || 'website',
        leadQuality,
        preferences: {
          timeline: params.timeline,
          urgencyFactors: params.urgencyFactors,
          preApproved: params.preApproved,
          firstTimeBuyer: params.firstTimeBuyer,
          propertyAddress: params.propertyAddress,
          reasonForSelling: params.reasonForSelling,
          preferredNeighborhoods: params.preferredNeighborhoods,
        },
        mortgageEstimate: params.mortgageEstimate ? {
          annualIncome: params.mortgageEstimate.annualIncome,
          downPayment: params.mortgageEstimate.downPayment,
          monthlyDebts: params.mortgageEstimate.monthlyDebts,
          estimatedMaxPrice: params.mortgageEstimate.maxPrice,
        } : undefined,
      })

      const response = await client.createContact({
        firstName: params.firstName,
        lastName: params.lastName || '',
        email: params.email,
        phone: params.cellPhone,
        source: params.source || 'website',
        leadType: params.leadType,
        customFields: {
          average_price: params.averagePrice || params.mortgageEstimate?.maxPrice,
          average_beds: params.averageBeds,
          average_bathrooms: params.averageBathrooms,
          city: params.preferredCity,
          hashtags,
          notes,
        },
      })

      if (response.success) {
        // Generate thank you message based on lead quality
        let thankYouMessage: string

        if (leadQuality === 'hot' && params.cellPhone) {
          thankYouMessage = `Thank you ${params.firstName}! Given your timeline, I'm flagging this for immediate follow-up. One of our agents will call you at ${params.cellPhone} within the hour.`
        } else if (params.cellPhone) {
          thankYouMessage = `Thank you ${params.firstName}! I've saved your preferences and one of our agents will call you at ${params.cellPhone} soon.`
        } else {
          thankYouMessage = `Thank you ${params.firstName}! I'll send personalized recommendations to ${params.email}.`
        }

        // Log success with lead scoring
        console.error('[chatbot.createContact.success]', {
          contactId: response.contactId,
          leadType: params.leadType,
          leadQuality,
          hasPhone: !!params.cellPhone,
          source: params.source,
          hashtagCount: hashtags.length,
        })

        return {
          success: true,
          contactId: response.contactId,
          leadQuality,
          hashtags,
          message: thankYouMessage,
        }
      } else {
        // Log error but still return friendly message
        console.error('[chatbot.createContact.crmError]', {
          error: response.error,
          fallback: response.fallback,
        })

        return {
          success: false,
          error: response.error || "Failed to create contact",
          fallback: response.fallback,
          // Still provide a friendly message
          message: `Thanks ${params.firstName}! We've noted your information and will be in touch soon.`,
        }
      }
    } catch (error) {
      console.error('[chatbot.createContact.error]', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        // Friendly fallback
        message: "Thanks for your interest! Our team will follow up with you shortly.",
      }
    }
  },
}
