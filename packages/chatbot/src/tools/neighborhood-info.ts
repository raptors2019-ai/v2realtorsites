import { z } from 'zod'
import type { CoreTool } from 'ai'
import neighborhoodsData from '../data/neighborhoods.json'

type NeighborhoodData = typeof neighborhoodsData
type CityKey = keyof NeighborhoodData

export const neighborhoodInfoTool: CoreTool = {
  description: `[PURPOSE] Provide curated information about GTA cities and neighborhoods.
[WHEN TO USE] When user asks about an area ("tell me about Mississauga", "what's Oakville like", "good areas for families").
[IMPORTANT] Available cities: Toronto, Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Milton, Oakville, Burlington, Hamilton, Caledon. If city not found, suggest alternatives.
[OUTPUT] Returns formatted markdown with prices, transit, schools, neighborhoods. Offer to search properties after.`,

  parameters: z.object({
    city: z.string().describe('City name to get information about'),
    specificNeighborhood: z.string().optional()
      .describe('Optional specific neighborhood within the city'),
  }),

  execute: async ({ city, specificNeighborhood }) => {
    console.error('[chatbot.neighborhoodInfo.execute]', { city, specificNeighborhood })

    // Normalize city name
    const normalizedCity = city.trim()
    const cityKey = Object.keys(neighborhoodsData).find(
      k => k.toLowerCase() === normalizedCity.toLowerCase()
    ) as CityKey | undefined

    if (!cityKey) {
      const availableCities = Object.keys(neighborhoodsData).join(', ')
      return {
        success: false,
        message: `I don't have detailed information about "${city}". I can tell you about: ${availableCities}. Which area would you like to know about?`,
        availableCities: Object.keys(neighborhoodsData),
      }
    }

    const cityData = neighborhoodsData[cityKey]

    // If specific neighborhood requested
    if (specificNeighborhood) {
      const neighborhood = cityData.neighborhoods.find(
        n => n.name.toLowerCase().includes(specificNeighborhood.toLowerCase())
      )

      if (neighborhood) {
        return {
          success: true,
          city: cityKey,
          neighborhood: neighborhood.name,
          message: `**${neighborhood.name}** in ${cityKey}:\n\n- **Character:** ${neighborhood.vibe}\n- **Average Price:** ${neighborhood.avgPrice}\n\nWould you like to see properties in ${neighborhood.name}?`,
          data: neighborhood,
          searchSuggestion: {
            city: cityKey,
            neighborhood: neighborhood.name,
          },
          // CRM integration data
          crmData: {
            preferredNeighborhoods: [neighborhood.name],
            preferredCity: cityKey,
          }
        }
      }
    }

    // Return full city info
    const topNeighborhoods = cityData.neighborhoods.slice(0, 4)
      .map(n => `- **${n.name}**: ${n.vibe} (avg ${n.avgPrice})`)
      .join('\n')

    const formattedInfo = `
## ${cityKey}

**Average Home Price:** ${cityData.avgPrice}
**Character:** ${cityData.vibe}

### Transit
- GO Stations: ${cityData.transit.goStations.join(', ')}
- Local Transit: ${'local' in cityData.transit ? cityData.transit.local : cityData.transit.ttc || 'Local bus service'}
- Commute to Union Station: ${cityData.transit.commuteToUnion}

### Schools
${cityData.schools.join(', ')}
Top schools: ${cityData.topSchools.slice(0, 3).join(', ')}

### Recreation & Attractions
${cityData.recreation.slice(0, 4).join(', ')}
${cityData.attractions.slice(0, 3).join(', ')}

### Popular Neighborhoods
${topNeighborhoods}

Would you like more details about a specific neighborhood, or shall I search for properties in ${cityKey}?
`.trim()

    console.error('[chatbot.neighborhoodInfo.success]', { city: cityKey })

    return {
      success: true,
      city: cityKey,
      message: formattedInfo,
      data: {
        avgPrice: cityData.avgPrice,
        priceRange: cityData.priceRange,
        vibe: cityData.vibe,
        transit: cityData.transit,
        neighborhoods: cityData.neighborhoods,
      },
      searchSuggestion: {
        city: cityKey,
        maxPrice: cityData.priceRange.max,
      },
      // CRM integration data
      crmData: {
        preferredCity: cityKey,
      }
    }
  }
}
