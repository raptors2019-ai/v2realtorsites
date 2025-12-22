import { z } from 'zod'
import type { CoreTool } from 'ai'
import { BoldTrailClient } from '@repo/crm'

export const createContactTool: CoreTool = {
  description: `Create a contact in BoldTrail CRM.
IMPORTANT: Only use this AFTER providing value to the user (e.g., showing listings).
Ask for email first, then cell phone number.
Include any captured preferences.`,

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
    propertyTypes: z.array(z.string()).optional()
      .describe("Property types: detached, condo, etc."),

    // Seller preferences
    propertyAddress: z.string().optional().describe("Seller's property address"),
    reasonForSelling: z.string().optional(),

    // Intent
    timeline: z.string().optional().describe("Timeline: immediate, 3-months, etc."),
    urgencyFactors: z.array(z.string()).optional(),
    preApproved: z.boolean().optional(),

    // Source
    source: z.enum(['newhomeshow', 'sri-collective']).optional(),
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

      // Build hashtags from preferences
      const hashtags: string[] = []
      if (params.propertyTypes) {
        hashtags.push(...params.propertyTypes)
      }
      if (params.preferredCity) {
        hashtags.push(params.preferredCity.toLowerCase())
      }
      if (params.preApproved) {
        hashtags.push('pre-approved')
      }
      if (params.timeline) {
        hashtags.push(`timeline-${params.timeline}`)
      }

      // Build notes with structured data
      const notes = JSON.stringify({
        capturedAt: new Date().toISOString(),
        source: params.source || 'chatbot',
        preferences: {
          timeline: params.timeline,
          urgencyFactors: params.urgencyFactors,
          preApproved: params.preApproved,
          propertyAddress: params.propertyAddress,
          reasonForSelling: params.reasonForSelling,
        },
      })

      const response = await client.createContact({
        firstName: params.firstName,
        lastName: params.lastName || '',
        email: params.email,
        phone: params.cellPhone,
        source: params.source || 'chatbot',
        leadType: params.leadType,
        customFields: {
          average_price: params.averagePrice,
          average_beds: params.averageBeds,
          average_bathrooms: params.averageBathrooms,
          city: params.preferredCity,
          hashtags,
          notes,
        },
      })

      if (response.success) {
        const thankYouMessage = params.cellPhone
          ? `Thank you ${params.firstName}! I've saved your preferences and one of our agents will call you at ${params.cellPhone} soon.`
          : `Thank you ${params.firstName}! I'll send personalized recommendations to ${params.email}.`

        // Log success
        console.error('[chatbot.createContact.success]', {
          contactId: response.contactId,
          leadType: params.leadType,
          hasPhone: !!params.cellPhone,
          source: params.source,
        })

        return {
          success: true,
          contactId: response.contactId,
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
