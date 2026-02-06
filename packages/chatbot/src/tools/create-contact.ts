import { z } from 'zod'
import type { CoreTool } from 'ai'
import { BoldTrailClient, sendLeadNotificationEmail } from '@repo/crm'
import { calculateLeadQuality } from '../utils/lead-scoring'

// Format budget to hashtag-friendly format (no periods allowed in BoldTrail)
function formatBudgetHashtag(budget: number): string {
  if (budget < 500000) return 'budget-under-500k'
  if (budget < 750000) return 'budget-500k-750k'
  if (budget < 1000000) return 'budget-750k-1m'
  if (budget < 2000000) return 'budget-1m-2m'
  return 'budget-2m-plus'
}

export const createContactTool: CoreTool = {
  description: `[PURPOSE] Create a contact in BoldTrail CRM with full lead scoring and preference tagging.
[WHEN TO USE] For property search: BEFORE showing listings (phone required). For value tools: AFTER showing value.
[IMPORTANT] Phone is REQUIRED for property search. Include ALL captured data: mortgage estimates, viewed listings, conversation context.
[OUTPUT] Returns success status, contactId, and thank you message. CRM automatically scores and tags the lead.`,

  parameters: z.object({
    firstName: z.string().describe("Contact's first name"),
    lastName: z.string().optional().describe("Contact's last name"),
    email: z.string().email().optional().describe("Contact's email address (optional but valuable)"),
    cellPhone: z.string()
      .describe("Contact's cell phone number (REQUIRED for property search)"),
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

    // Properties they engaged with during conversation
    viewedListings: z.array(z.object({
      listingId: z.string(),
      address: z.string(),
      price: z.number(),
    })).optional().describe("Properties the user viewed or discussed in conversation"),

    // Conversation engagement metrics
    engagement: z.object({
      toolsUsed: z.array(z.string()).describe("Tools used: propertySearch, mortgageEstimator, neighborhoodInfo, firstTimeBuyerFAQ"),
      propertiesViewed: z.number().describe("Number of properties viewed in conversation"),
      conversationTopics: z.array(z.string()).describe("Topics discussed: neighborhoods, first-time-buyer, mortgage, selling"),
    }).optional().describe("Engagement metrics from the conversation"),

    // Conversation summary for agent context
    conversationSummary: z.string().optional()
      .describe("1-2 sentence summary of what the user is looking for and key context for the agent"),

    // Source tracking - ALWAYS include these
    source: z.enum(['newhomeshow', 'sri-collective']).optional()
      .describe("Which website the lead came from"),
  }),

  execute: async (params) => {
    // Log incoming parameters (for debugging)
    console.error('[chatbot.createContact.params]', {
      firstName: params.firstName,
      hasEmail: !!params.email,
      hasPhone: !!params.cellPhone,
      leadType: params.leadType,
      preferredCity: params.preferredCity,
      hasNeighborhoods: !!params.preferredNeighborhoods?.length,
      conversationSummary: params.conversationSummary?.slice(0, 50),
    });

    // Phone is required - validate format
    const cleaned = params.cellPhone.replace(/\D/g, '')
    if (cleaned.length !== 10 && cleaned.length !== 11) {
      return {
        success: false,
        error: "Invalid phone format. Please provide a 10-digit phone number.",
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

      // 10. ENGAGEMENT TAGS (from conversation metrics)
      if (params.engagement) {
        // Tag based on tools used
        if (params.engagement.toolsUsed.includes('mortgageEstimator')) {
          hashtags.push('engaged-mortgage-calc')
        }
        if (params.engagement.toolsUsed.includes('neighborhoodInfo')) {
          hashtags.push('engaged-neighborhoods')
        }
        if (params.engagement.toolsUsed.includes('firstTimeBuyerFAQ')) {
          hashtags.push('engaged-faq')
        }
        // Tag based on search behavior
        const searchCount = params.engagement.toolsUsed.filter((t: string) => t === 'propertySearch').length
        if (searchCount >= 2) {
          hashtags.push('multiple-searches')
        }
        // Tag based on properties viewed
        if (params.engagement.propertiesViewed >= 5) {
          hashtags.push('viewed-5-plus-listings')
        } else if (params.engagement.propertiesViewed >= 3) {
          hashtags.push('viewed-3-plus-listings')
        }
      }

      // 11. VIEWED LISTINGS TAG
      if (params.viewedListings && params.viewedListings.length > 0) {
        hashtags.push(`viewed-${params.viewedListings.length}-listings`)
      }

      // Build human-readable notes for agent reference
      const noteLines: string[] = []

      // Header with timestamp and source
      noteLines.push(`📋 CHATBOT LEAD - ${new Date().toLocaleDateString('en-CA')}`)
      noteLines.push(`Source: ${params.source || 'website'} | Quality: ${leadQuality.toUpperCase()}`)
      noteLines.push('')

      // Conversation summary (most important)
      if (params.conversationSummary) {
        noteLines.push(`💬 Summary: ${params.conversationSummary}`)
        noteLines.push('')
      }

      // Mortgage/affordability info
      if (params.mortgageEstimate) {
        noteLines.push('💰 AFFORDABILITY:')
        noteLines.push(`  • Max Budget: $${params.mortgageEstimate.maxPrice.toLocaleString()}`)
        noteLines.push(`  • Income: $${params.mortgageEstimate.annualIncome.toLocaleString()}/yr`)
        noteLines.push(`  • Down Payment: $${params.mortgageEstimate.downPayment.toLocaleString()}`)
        if (params.mortgageEstimate.monthlyDebts) {
          noteLines.push(`  • Monthly Debts: $${params.mortgageEstimate.monthlyDebts.toLocaleString()}`)
        }
        noteLines.push('')
      }

      // Location preferences
      if (params.preferredCity || params.preferredNeighborhoods?.length) {
        noteLines.push('📍 LOCATION INTEREST:')
        if (params.preferredCity) noteLines.push(`  • City: ${params.preferredCity}`)
        if (params.preferredNeighborhoods?.length) {
          noteLines.push(`  • Neighborhoods: ${params.preferredNeighborhoods.join(', ')}`)
        }
        noteLines.push('')
      }

      // Qualifications
      const quals: string[] = []
      if (params.firstTimeBuyer) quals.push('First-time buyer')
      if (params.preApproved) quals.push('Pre-approved')
      if (params.timeline) quals.push(`Timeline: ${params.timeline}`)
      if (params.urgencyFactors?.length) quals.push(`Urgency: ${params.urgencyFactors.join(', ')}`)
      if (quals.length) {
        noteLines.push('✅ QUALIFICATIONS:')
        quals.forEach(q => noteLines.push(`  • ${q}`))
        noteLines.push('')
      }

      // Properties viewed
      if (params.viewedListings?.length) {
        noteLines.push(`🏠 PROPERTIES VIEWED (${params.viewedListings.length}):`)
        params.viewedListings.slice(0, 5).forEach((l: { address: string; price: number }) => {
          noteLines.push(`  • ${l.address} ($${l.price.toLocaleString()})`)
        })
        noteLines.push('')
      }

      // Seller info
      if (params.propertyAddress || params.reasonForSelling) {
        noteLines.push('🏷️ SELLING:')
        if (params.propertyAddress) noteLines.push(`  • Property: ${params.propertyAddress}`)
        if (params.reasonForSelling) noteLines.push(`  • Reason: ${params.reasonForSelling}`)
        if (params.sellerTimeline) noteLines.push(`  • Timeline: ${params.sellerTimeline}`)
        noteLines.push('')
      }

      const notes = noteLines.join('\n')

      // Create contact with all data
      // The CRM client will:
      // 1. Create contact with basic fields
      // 2. Attempt to add hashtags via separate endpoint
      // 3. Attempt to add note to activity timeline
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

      // Log API attempts for debugging
      console.error('[chatbot.createContact.crmResponse]', {
        success: response.success,
        contactId: response.contactId,
        hashtagCount: hashtags.length,
        noteLength: notes.length,
      })

      // Fire-and-forget email notification (send regardless of CRM success)
      sendLeadNotificationEmail({
        firstName: params.firstName,
        lastName: params.lastName || '',
        email: params.email,
        phone: params.cellPhone,
        source: params.source || 'sri-collective',
        leadSource: 'chatbot',
        leadType: params.leadType,
        leadQuality,
        conversationSummary: params.conversationSummary,
        budget: params.averagePrice ? `$${params.averagePrice.toLocaleString()}` : undefined,
        timeline: params.timeline,
        locations: [params.preferredCity, ...(params.preferredNeighborhoods || [])].filter(Boolean) as string[],
        propertyTypes: params.propertyTypes,
        bedrooms: params.averageBeds,
        bathrooms: params.averageBathrooms,
        mortgageEstimate: params.mortgageEstimate ? {
          annualIncome: params.mortgageEstimate.annualIncome,
          downPayment: params.mortgageEstimate.downPayment,
          monthlyDebts: params.mortgageEstimate.monthlyDebts,
          maxPrice: params.mortgageEstimate.maxPrice,
        } : undefined,
        viewedListings: params.viewedListings?.map((l: { address: string; price: number }) => ({ address: l.address, price: l.price })),
        engagement: params.engagement,
        preApproved: params.preApproved,
        firstTimeBuyer: params.firstTimeBuyer,
        urgencyFactors: params.urgencyFactors,
        propertyAddress: params.propertyAddress,
      }).catch(err => console.error('[chatbot.createContact.email.error]', err))

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
