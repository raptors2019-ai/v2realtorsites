import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { newhomeShowSystemPrompt, propertySearchTool } from '@repo/chatbot'

// Use nodejs runtime for tool execution (Edge has issues with workspace package imports)
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: newhomeShowSystemPrompt,
    messages,
    tools: {
      searchProperties: propertySearchTool,
    },
    maxSteps: 5,
  })

  return result.toDataStreamResponse()
}
