import { streamText } from 'ai'
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

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()

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

    onFinish: async ({ usage, finishReason }) => {
      // Log conversation completion
      console.error('[chat.sri-collective.complete]', {
        messageCount: messages.length,
        finishReason,
        usage,
      })
    },
  })

  return result.toDataStreamResponse()
}
