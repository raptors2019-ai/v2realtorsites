import { z } from 'zod'
import type { CoreTool } from 'ai'

export const createContactTool: CoreTool = {
  description: 'Create a new contact/lead in the CRM system',
  parameters: z.object({
    firstName: z.string().describe("Contact's first name"),
    lastName: z.string().describe("Contact's last name"),
    email: z.string().email().describe("Contact's email address"),
    phone: z.string().optional().describe("Contact's phone number"),
    leadType: z.enum(['buyer', 'seller', 'investor', 'general']).describe('Type of lead'),
  }),
  execute: async ({ firstName, lastName, email, phone, leadType }) => {
    // This will be implemented in the app's API route
    return {
      success: true,
      message: `Contact created: ${firstName} ${lastName} (${email})`
    }
  }
}
