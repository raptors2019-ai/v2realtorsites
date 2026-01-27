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
  enrichContactTool,
  extractCrmDataFromToolResult,
  mergeConversationData,
  generateConversationSummary,
  type ConversationCrmData,
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

// Build contextual system prompt with returning visitor info and accumulated data
function buildSystemPrompt(storedContext?: StoredContext, conversationData?: ConversationCrmData): string {
  let prompt = sriCollectiveSystemPrompt

  // Add returning visitor context
  if (storedContext?.contact) {
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
    prompt += contextSection
  }

  // Add accumulated conversation data
  if (conversationData && Object.keys(conversationData).length > 0) {
    const dataSection = buildAccumulatedDataSection(conversationData)
    if (dataSection) {
      prompt += dataSection
    }
  }

  return prompt
}

// Build section showing accumulated data from this conversation
function buildAccumulatedDataSection(data: ConversationCrmData): string {
  const parts: string[] = []

  parts.push('\n\n## ACCUMULATED CONVERSATION DATA')
  parts.push('\nData captured so far in THIS conversation. Include ALL of this when calling createContact or enrichContact:\n')

  if (data.contactId) {
    parts.push(`**Contact ID:** ${data.contactId} (use enrichContact to add more data)`)
  }

  if (data.mortgageEstimate) {
    parts.push(`\n**Mortgage Estimate:**`)
    parts.push(`- Max Home Price: $${data.mortgageEstimate.maxHomePrice.toLocaleString()}`)
    parts.push(`- Down Payment: $${data.mortgageEstimate.downPayment.toLocaleString()}`)
    parts.push(`- Monthly Payment: $${data.mortgageEstimate.monthlyPayment.toLocaleString()}`)
    if (data.mortgageEstimate.cmhcPremium) {
      parts.push(`- CMHC Premium: $${data.mortgageEstimate.cmhcPremium.toLocaleString()} (required - down payment < 20%)`)
    }
  }

  if (data.preferredCity || data.preferredNeighborhoods?.length) {
    parts.push(`\n**Location Interests:**`)
    if (data.preferredCity) parts.push(`- City: ${data.preferredCity}`)
    if (data.preferredNeighborhoods?.length) parts.push(`- Neighborhoods: ${data.preferredNeighborhoods.join(', ')}`)
  }

  if (data.averagePrice || data.averageBeds || data.averageBaths) {
    parts.push(`\n**Property Preferences:**`)
    if (data.averagePrice) parts.push(`- Budget: $${data.averagePrice.toLocaleString()}`)
    if (data.averageBeds) parts.push(`- Bedrooms: ${data.averageBeds}`)
    if (data.averageBaths) parts.push(`- Bathrooms: ${data.averageBaths}`)
  }

  if (data.firstTimeBuyer || data.preApproved || data.timeline || data.urgencyFactors?.length) {
    parts.push(`\n**Intent Signals:**`)
    if (data.firstTimeBuyer) parts.push(`- First-time buyer: YES`)
    if (data.preApproved) parts.push(`- Pre-approved: YES`)
    if (data.timeline) parts.push(`- Timeline: ${data.timeline}`)
    if (data.urgencyFactors?.length) parts.push(`- Urgency: ${data.urgencyFactors.join(', ')}`)
  }

  if (data.viewedListings?.length) {
    parts.push(`\n**Properties Viewed (${data.viewedListings.length}):**`)
    data.viewedListings.slice(0, 5).forEach(l => {
      parts.push(`- ${l.address} ($${l.price.toLocaleString()})`)
    })
  }

  if (data.toolsUsed?.length) {
    parts.push(`\n**Tools Used:** ${data.toolsUsed.join(', ')}`)
  }

  parts.push(`\n**IMPORTANT:** When calling createContact, include ALL the data above in the parameters.`)
  if (data.contactId) {
    parts.push(`Since contact already exists (ID: ${data.contactId}), use enrichContact to add new data.`)
  }

  return parts.join('\n')
}

export async function POST(req: Request) {
  const { messages, storedContext, conversationCrmData: incomingCrmData } = await req.json() as {
    messages: CoreMessage[]
    storedContext?: StoredContext
    conversationCrmData?: ConversationCrmData
  }

  const data = new StreamData()

  // Initialize accumulated CRM data from incoming data or empty
  let accumulatedCrmData: ConversationCrmData = incomingCrmData || {}

  // Build system prompt with all context
  const systemPrompt = buildSystemPrompt(storedContext, accumulatedCrmData)

  // Log context
  if (storedContext || incomingCrmData) {
    console.error('[chat.sri-collective.context]', {
      hasStoredContext: !!storedContext,
      contactName: storedContext?.contact?.name,
      hasPhone: !!storedContext?.contact?.phone,
      hasAccumulatedData: !!incomingCrmData,
      accumulatedFields: incomingCrmData ? Object.keys(incomingCrmData).filter(k => incomingCrmData[k as keyof ConversationCrmData]) : [],
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
      enrichContact: enrichContactTool,
    },
    maxSteps: 5,

    onStepFinish: async ({ toolResults }) => {
      // Capture tool results for rich rendering AND accumulate CRM data
      const results = toolResults as Array<{ toolName: string; result: Record<string, unknown> }> || []

      for (const toolResult of results) {
        // Extract and accumulate CRM data from tool result
        const crmData = extractCrmDataFromToolResult(toolResult.toolName, toolResult.result)
        if (crmData) {
          accumulatedCrmData = mergeConversationData(accumulatedCrmData, crmData)

          // Log what we accumulated
          console.error('[chat.sri-collective.crmDataAccumulated]', {
            tool: toolResult.toolName,
            newFields: Object.keys(crmData).filter(k => crmData[k as keyof typeof crmData]),
          })
        }

        // Existing: capture mortgage estimate for UI rendering
        if (toolResult.toolName === 'estimateMortgage' && toolResult.result?.success) {
          const result = toolResult.result as Record<string, unknown>
          data.append({
            type: 'mortgageEstimate',
            data: result.estimate as Record<string, unknown>,
            cta: result.cta as Record<string, unknown>,
          } as unknown as Parameters<typeof data.append>[0])
        }

        // Existing: capture property search results for card rendering
        if (toolResult.toolName === 'searchProperties' && toolResult.result?.success) {
          const result = toolResult.result as Record<string, unknown>
          data.append({
            type: 'propertySearch',
            listings: result.listings as unknown[],
            total: result.total as number,
            viewAllUrl: result.viewAllUrl as string,
          } as unknown as Parameters<typeof data.append>[0])
        }
      }
    },

    onFinish: async ({ usage, finishReason }) => {
      // Log accumulated CRM data (client-side storage can be added later)
      if (Object.keys(accumulatedCrmData).length > 0) {
        const summary = generateConversationSummary(accumulatedCrmData)
        accumulatedCrmData.conversationSummary = summary

        // Note: Not sending conversationCrmData via stream for now
        // The AI has access to accumulated data via system prompt injection
        // Client-side persistence can be added later if needed

        console.error('[chat.sri-collective.crmDataFinal]', {
          summary,
          hasContactId: !!accumulatedCrmData.contactId,
          hasMortgageEstimate: !!accumulatedCrmData.mortgageEstimate,
          toolsUsed: accumulatedCrmData.toolsUsed,
        })
      }

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
