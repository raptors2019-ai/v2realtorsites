import type { MortgageEstimate, PropertySearchResult, NeighborhoodInfo, CallToAction } from '../chatbot-store'

/**
 * Result from parsing an AI SDK stream response
 */
export interface ParsedStreamResult {
  text: string
  mortgageData: MortgageEstimate | null
  propertySearchData: PropertySearchResult | null
  neighborhoodData: NeighborhoodInfo | null
  firstTimeBuyerData: { topic: string; relatedTopics: string[] } | null
  ctaData: CallToAction | null
}

/**
 * Parses an AI SDK v4 streaming response.
 *
 * Stream prefixes:
 * - 0: text content
 * - 2: data array (custom data from StreamData)
 * - d: done signal
 * - e: error
 * - f: finish reason
 */
export async function parseStreamResponse(response: Response): Promise<ParsedStreamResult> {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  let text = ''
  let mortgageData: MortgageEstimate | null = null
  let propertySearchData: PropertySearchResult | null = null
  let neighborhoodData: NeighborhoodInfo | null = null
  let firstTimeBuyerData: { topic: string; relatedTopics: string[] } | null = null
  let ctaData: CallToAction | null = null

  if (!reader) {
    return { text, mortgageData, propertySearchData, neighborhoodData, firstTimeBuyerData, ctaData }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    for (const line of chunk.split('\n')) {
      if (!line.trim()) continue

      const prefix = line.substring(0, 2)
      const content = line.substring(2)

      if (prefix === '0:') {
        try {
          text += JSON.parse(content)
        } catch {
          // Ignore parse errors for text content
        }
      } else if (prefix === '2:') {
        try {
          const parsed = JSON.parse(content)
          if (parsed && Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item.type === 'mortgageEstimate' && item.data) {
                mortgageData = item.data
                ctaData = item.cta || null
              }
              if (item.type === 'propertySearch' && item.listings) {
                propertySearchData = {
                  listings: item.listings,
                  total: item.total,
                  viewAllUrl: item.viewAllUrl,
                }
              }
              if (item.type === 'neighborhoodInfo' && item.data) {
                neighborhoodData = {
                  city: item.city,
                  ...item.data,
                  searchSuggestion: item.searchSuggestion,
                } as NeighborhoodInfo
              }
              if (item.type === 'firstTimeBuyer' && item.topic) {
                firstTimeBuyerData = {
                  topic: item.topic,
                  relatedTopics: item.relatedTopics || [],
                }
              }
              if (item.type === 'conversationCrmData' && item.data) {
                console.log('[chatbot] Received CRM data:', item.data)
              }
            }
          }
        } catch {
          // Ignore parse errors for data content
        }
      }
      // Silently ignore other prefixes (d:, e:, f:) - they're control messages
    }
  }

  return { text, mortgageData, propertySearchData, neighborhoodData, firstTimeBuyerData, ctaData }
}

/**
 * Parses a simple text-only stream response.
 * Use when you only need the text content (e.g., contact creation).
 */
export async function parseTextOnlyStream(response: Response): Promise<string> {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let text = ''

  if (!reader) return text

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    for (const line of decoder.decode(value).split('\n')) {
      if (!line.trim()) continue
      const prefix = line.substring(0, 2)
      if (prefix === '0:') {
        try {
          text += JSON.parse(line.substring(2))
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  return text
}
