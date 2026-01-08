import { streamText, StreamData } from 'ai'
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

export async function POST(req: Request) {
  const { messages } = await req.json()

  const data = new StreamData()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: sriCollectiveSystemPrompt,
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
