import { z } from 'zod'
import type { CoreTool } from 'ai'

export const sellHomeTool: CoreTool = {
  description: `[PURPOSE] Capture seller lead information and qualify their intent.
[WHEN TO USE] When user indicates they want to sell ("sell my house", "thinking of selling", "list my property").
[IMPORTANT] Determine timeline urgency. Hot sellers (ASAP/1-3 months) should be flagged for immediate agent follow-up.
[OUTPUT] Returns sellerPreferences object and leadQuality score. Suggest free market analysis for engagement.`,

  parameters: z.object({
    propertyType: z.enum(['detached', 'semi-detached', 'townhouse', 'condo'])
      .describe('Type of property being sold'),
    propertyAddress: z.string().optional()
      .describe('Address or general area of the property'),
    bedrooms: z.number().optional()
      .describe('Number of bedrooms'),
    bathrooms: z.number().optional()
      .describe('Number of bathrooms'),
    timeline: z.enum(['asap', '1-3-months', '3-6-months', 'just-exploring'])
      .describe('When they want to sell'),
    reasonForSelling: z.string().optional()
      .describe('Why they are selling (relocating, downsizing, etc.)'),
    expectedPrice: z.number().optional()
      .describe('Expected or hoped-for sale price'),
    alreadyListed: z.boolean().optional()
      .describe('Whether property is already listed with another agent'),
  }),

  execute: async (params) => {
    console.error('[chatbot.sellHome.execute]', params)

    const {
      propertyType,
      propertyAddress,
      bedrooms,
      bathrooms,
      timeline,
      reasonForSelling,
      expectedPrice,
      alreadyListed,
    } = params

    // Determine lead quality
    let leadQuality: 'hot' | 'warm' | 'cold' = 'warm'
    if (timeline === 'asap' || timeline === '1-3-months') {
      leadQuality = 'hot'
    } else if (timeline === 'just-exploring') {
      leadQuality = 'cold'
    }

    // Format property description
    const propertyDesc = [
      propertyType,
      bedrooms ? `${bedrooms} bed` : null,
      bathrooms ? `${bathrooms} bath` : null,
    ].filter(Boolean).join(', ')

    let message = `Thank you for sharing details about your ${propertyDesc}. `

    if (timeline === 'asap' || timeline === '1-3-months') {
      message += `Since you're looking to sell soon, one of our experienced listing agents would love to provide you with a **free market analysis** and discuss your options. `
    } else if (timeline === '3-6-months') {
      message += `With a few months to prepare, we can help you maximize your home's value before listing. `
    } else {
      message += `It's smart to start planning early! We can provide market insights to help you decide when the time is right. `
    }

    if (alreadyListed) {
      message += `\n\nI see your property is already listed. If you're not getting the results you expected, our team specializes in relisting strategies that get homes sold.`
    }

    message += `\n\nWould you like to schedule a free consultation with one of our listing specialists?`

    console.error('[chatbot.sellHome.success]', { leadQuality, timeline })

    return {
      success: true,
      message,
      sellerPreferences: {
        propertyType,
        propertyAddress,
        bedrooms,
        bathrooms,
        timeline,
        reasonForSelling,
        expectedPrice,
        alreadyListed,
        leadQuality,
        capturedAt: new Date().toISOString(),
      },
      leadQuality,
      nextStep: leadQuality === 'hot'
        ? 'Ask for contact info immediately'
        : 'Offer free market analysis to capture contact',
      // CRM integration data
      crmData: {
        leadType: 'seller' as const,
        propertyAddress,
        propertyType,
        reasonForSelling,
        sellerTimeline: timeline,
      }
    }
  }
}
