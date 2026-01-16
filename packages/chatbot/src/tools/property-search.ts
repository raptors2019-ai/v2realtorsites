import { z } from 'zod'
import { tool } from 'ai'
import { IDXClient } from '@repo/crm'
import { formatPrice, matchCity } from '@repo/lib'

/**
 * Normalize city name using the shared city matcher
 * Returns proper capitalized city name or title-cased input
 */
function normalizeCity(input: string | undefined): string | undefined {
  if (!input) return undefined
  const match = matchCity(input)
  if (match.confidence !== 'none') {
    return match.name
  }
  // Return title-cased version if no match
  return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()
}

export const propertySearchTool = tool({
  description: `Search for properties based on buyer criteria.
Use this tool when the user describes what they're looking for.
Returns up to 5 matching listings with photos, price, and details.
Always use this BEFORE asking for contact information to provide value first.`,

  parameters: z.object({
    city: z.string().optional().describe('City name (e.g., "Toronto", "Mississauga")'),
    minPrice: z.number().optional().describe('Minimum price in CAD'),
    maxPrice: z.number().optional().describe('Maximum price in CAD'),
    bedrooms: z.number().optional().describe('Minimum number of bedrooms'),
    bathrooms: z.number().optional().describe('Minimum number of bathrooms'),
    propertyType: z.string().optional()
      .describe('Type of property. Use exact values: "Detached", "Semi-Detached", "Townhouse", or "Condo". For generic terms like "house", omit this parameter.'),
    listingType: z.enum(['sale', 'lease']).optional()
      .describe('Listing type - defaults to "sale". Only use "lease" if user explicitly asks for rentals.'),
  }),

  execute: async ({ city, minPrice, maxPrice, bedrooms, bathrooms, propertyType, listingType }) => {
    // Normalize city name to handle typos
    const normalizedCity = normalizeCity(city)
    // Default to 'sale' - only use 'lease' if user explicitly asks for rentals
    const effectiveListingType = listingType || 'sale'

    // Normalize property type - ignore generic terms like "house"
    // Only pass specific types that map to IDX PropertySubType
    const validPropertyTypes = ['Detached', 'Semi-Detached', 'Townhouse', 'Condo']
    const normalizedPropertyType = propertyType && validPropertyTypes.includes(propertyType)
      ? propertyType
      : undefined

    console.error('[chatbot.propertySearch.execute]', {
      city, normalizedCity, minPrice, maxPrice, bedrooms, bathrooms,
      propertyType, normalizedPropertyType, listingType: effectiveListingType,
    })

    try {
      const client = new IDXClient()
      const result = await client.searchListings({
        city: normalizedCity,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        propertyType: normalizedPropertyType,
        listingType: effectiveListingType,
        limit: 5, // Show 3-5 in chat
      })

      if (!result.success || result.listings.length === 0) {
        return {
          success: false,
          message: "I couldn't find any properties matching those criteria. Would you like to adjust your search?",
          listings: [],
          searchParams: { city, minPrice, maxPrice, bedrooms, bathrooms, propertyType },
        }
      }

      // Format listings for display
      const formattedListings = result.listings.map(listing => ({
        id: listing.ListingKey,
        price: formatPrice(listing.ListPrice),
        priceNumber: listing.ListPrice,
        address: listing.UnparsedAddress,
        city: listing.City,
        bedrooms: listing.BedroomsTotal,
        bathrooms: listing.BathroomsTotalInteger,
        sqft: listing.LivingArea || 0,
        propertyType: listing.PropertyType,
        image: listing.Media?.[0]?.MediaURL || null,
        description: listing.PublicRemarks?.slice(0, 100) || '',
        url: `/properties/${listing.ListingKey}`,
      }))

      const message = result.total === 1
        ? "I found 1 property that matches your criteria:"
        : `I found ${result.total} properties. Here are the top ${formattedListings.length}:`

      console.error('[chatbot.propertySearch.success]', {
        found: result.total,
        returned: formattedListings.length,
      })

      // Build viewAllUrl with proper parameter format matching the survey
      const urlParams = new URLSearchParams()
      if (normalizedCity) urlParams.set('cities', normalizedCity)
      if (minPrice) urlParams.set('budgetMin', String(minPrice))
      if (maxPrice) urlParams.set('budgetMax', String(maxPrice))
      if (bedrooms) urlParams.set('bedrooms', String(bedrooms))
      if (bathrooms) urlParams.set('bathrooms', String(bathrooms))
      urlParams.set('listingType', effectiveListingType)

      return {
        success: true,
        message,
        listings: formattedListings,
        total: result.total,
        searchParams: { city, minPrice, maxPrice, bedrooms, bathrooms, propertyType },
        viewAllUrl: `/properties?${urlParams.toString()}`,
      }
    } catch (error) {
      console.error('[chatbot.propertySearch.error]', error)
      return {
        success: false,
        message: "I'm having trouble searching right now. Let me try again in a moment.",
        listings: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
})
