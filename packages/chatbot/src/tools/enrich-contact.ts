import { z } from 'zod';
import type { CoreTool } from 'ai';
import { BoldTrailClient } from '@repo/crm';

export const enrichContactTool: CoreTool = {
  description: `[PURPOSE] Update an existing contact in CRM with additional data captured during conversation.
[WHEN TO USE] After a contact exists and user provides MORE information (mortgage estimate, preferences, neighborhoods explored).
[IMPORTANT] Only call this if you have a contactId from a previous createContact call. Include ALL new data discovered.
[OUTPUT] Returns success status. CRM contact is enriched with new tags and data.`,

  parameters: z.object({
    contactId: z.string()
      .describe('The contact ID from a previous createContact call'),

    // Mortgage/affordability data
    mortgageEstimate: z.object({
      maxHomePrice: z.number(),
      downPayment: z.number(),
      monthlyPayment: z.number(),
      annualIncome: z.number(),
      cmhcPremium: z.number().optional(),
    }).optional().describe('Results from mortgage affordability calculation'),

    // Location preferences (primaryCity maps to kvCORE primary_city field)
    primaryCity: z.string().optional()
      .describe('City the user is interested in (maps to CRM primary_city)'),
    preferredCity: z.string().optional()
      .describe('Alias for primaryCity - will be mapped'),
    preferredNeighborhoods: z.array(z.string()).optional()
      .describe('Specific neighborhoods of interest'),

    // Property preferences
    averagePrice: z.number().optional()
      .describe('Target budget/price'),
    averageBeds: z.number().optional()
      .describe('Desired bedrooms'),
    averageBaths: z.number().optional()
      .describe('Desired bathrooms'),

    // Properties they engaged with
    viewedListings: z.array(z.object({
      listingId: z.string(),
      address: z.string(),
      price: z.number(),
    })).optional().describe('Properties the user viewed or discussed'),

    // Intent signals
    timeline: z.string().optional()
      .describe('When they want to buy/sell'),
    preApproved: z.boolean().optional()
      .describe('Whether buyer is pre-approved'),
    firstTimeBuyer: z.boolean().optional()
      .describe('Whether this is a first-time buyer'),
    urgencyFactors: z.array(z.string()).optional()
      .describe('Urgency signals: relocating, lease-ending, etc.'),

    // Conversation summary for agent reference
    conversationSummary: z.string().optional()
      .describe('Brief summary of what the user is looking for'),
  }),

  execute: async (params) => {
    const { contactId, preferredCity, ...updateData } = params;

    if (!contactId) {
      return {
        success: false,
        error: 'Contact ID is required to enrich a contact',
      };
    }

    try {
      const client = new BoldTrailClient();

      // Map preferredCity to primaryCity if not already set (CRM uses primaryCity)
      const mappedData = {
        ...updateData,
        primaryCity: updateData.primaryCity || preferredCity,
      };

      const response = await client.updateContact(contactId, mappedData);

      if (response.success) {
        console.error('[chatbot.enrichContact.success]', {
          contactId,
          fieldsUpdated: Object.keys(updateData).filter(k => updateData[k as keyof typeof updateData] !== undefined),
        });

        return {
          success: true,
          contactId,
          message: 'Contact enriched with additional data',
          fieldsUpdated: Object.keys(updateData).filter(k => updateData[k as keyof typeof updateData] !== undefined),
        };
      } else {
        console.error('[chatbot.enrichContact.failed]', {
          contactId,
          error: response.error,
        });

        return {
          success: false,
          error: response.error || 'Failed to update contact',
        };
      }
    } catch (error) {
      console.error('[chatbot.enrichContact.error]', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
