import { streamText, StreamData, type CoreMessage } from 'ai'
import { openai } from '@ai-sdk/openai'
import {
  sriCollectiveSystemPrompt,
  propertySearchTool,
  capturePreferencesTool,
  createContactTool,
  mortgageEstimatorTool,
  neighborhoodInfoTool,
  firstTimeBuyerFAQTool,
  sellHomeTool,
} from '@repo/chatbot'

// Use nodejs runtime for tool execution (Edge has issues with workspace package imports)
export const runtime = 'nodejs'

// Interface for stored context from returning visitors
interface StoredContext {
  contact?: {
    name?: string
    phone?: string | null
    email?: string | null
  }
  preferences?: {
    budget?: { min?: number; max?: number }
    propertyType?: string
    bedrooms?: number
    locations?: string[]
    timeline?: string
  }
  viewedProperties?: Array<{
    listingId: string
    address: string
    price: number
  }>
  lastVisit?: string
}

// Build contextual system prompt with returning visitor info
function buildSystemPrompt(storedContext?: StoredContext): string {
  if (!storedContext) {
    return sriCollectiveSystemPrompt
  }

  const contextSection = `

## RETURNING VISITOR CONTEXT

This user has visited before. Use this context to personalize the conversation:

${storedContext.contact ? `**Contact Info (already captured - DO NOT ask again):**
- Name: ${storedContext.contact.name}
- Phone: ${storedContext.contact.phone}
- Email: ${storedContext.contact.email || 'not provided'}` : ''}

${storedContext.preferences ? `**Previous Preferences:**
${storedContext.preferences.propertyType ? `- Property Type: ${storedContext.preferences.propertyType}` : ''}
${storedContext.preferences.budget ? `- Budget: $${storedContext.preferences.budget.min?.toLocaleString() || '0'} - $${storedContext.preferences.budget.max?.toLocaleString() || 'any'}` : ''}
${storedContext.preferences.bedrooms ? `- Bedrooms: ${storedContext.preferences.bedrooms}+` : ''}
${storedContext.preferences.locations?.length ? `- Locations: ${storedContext.preferences.locations.join(', ')}` : ''}
${storedContext.preferences.timeline ? `- Timeline: ${storedContext.preferences.timeline}` : ''}` : ''}

${storedContext.viewedProperties?.length ? `**Previously Viewed Properties:**
${storedContext.viewedProperties.map(p => `- ${p.address} ($${p.price.toLocaleString()})`).join('\n')}` : ''}

${storedContext.lastVisit ? `**Last Visit:** ${new Date(storedContext.lastVisit).toLocaleDateString()}` : ''}

**CRITICAL RULES FOR THIS RETURNING VISITOR:**
1. DO NOT ask for name - we already have it: ${storedContext.contact?.name}
2. DO NOT ask for phone - we already have it: ${storedContext.contact?.phone}
3. Since we have their contact info, you can proceed directly to searchProperties WITHOUT asking for contact info first
4. Greet them by name and reference their previous interests
5. Skip any preference questions for info we already have above
`

  return sriCollectiveSystemPrompt + contextSection
}

export async function POST(req: Request) {
  const { messages, storedContext } = await req.json() as {
    messages: CoreMessage[]
    storedContext?: StoredContext
  }

  const data = new StreamData()

  // Build system prompt with optional returning visitor context
  const systemPrompt = buildSystemPrompt(storedContext)

  // Log when storedContext is provided
  if (storedContext) {
    console.error('[chat.sri-collective.storedContext]', {
      hasContact: !!storedContext.contact,
      contactName: storedContext.contact?.name,
      hasPhone: !!storedContext.contact?.phone,
      hasPreferences: !!storedContext.preferences,
    })
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
    tools: {
      searchProperties: propertySearchTool,
      capturePreferences: capturePreferencesTool,
      createContact: createContactTool,
      estimateMortgage: mortgageEstimatorTool,
      getNeighborhoodInfo: neighborhoodInfoTool,
      answerFirstTimeBuyerQuestion: firstTimeBuyerFAQTool,
      captureSeller: sellHomeTool,
    },
    maxSteps: 5,

    onStepFinish: async ({ toolResults }) => {
      // Capture tool results for rich rendering
      const results = toolResults as any[] || []
      for (const toolResult of results) {
        if (toolResult.toolName === 'estimateMortgage' && toolResult.result?.success) {
          data.append({
            type: 'mortgageEstimate',
            data: toolResult.result.estimate,
            cta: toolResult.result.cta,
          })
        }
        // Capture property search results for card rendering
        if (toolResult.toolName === 'searchProperties' && toolResult.result?.success) {
          data.append({
            type: 'propertySearch',
            listings: toolResult.result.listings,
            total: toolResult.result.total,
            viewAllUrl: toolResult.result.viewAllUrl,
          })
        }
      }
    },

    onFinish: async ({ usage, finishReason }) => {
      // Close the data stream
      data.close()

      // Log conversation completion
      console.error('[chat.sri-collective.complete]', {
        messageCount: messages.length,
        finishReason,
        usage,
      })
    },

    onError: (error: unknown) => {
      console.error('[chat.sri-collective.error]', error)
    },
  })

  return result.toDataStreamResponse({ data })
}
