import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { newhomeShowSystemPrompt, propertySearchTool } from '@repo/chatbot'

export const runtime = 'edge'

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
