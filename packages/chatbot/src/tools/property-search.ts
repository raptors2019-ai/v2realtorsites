import { z } from 'zod'
import type { CoreTool } from 'ai'
import { IDXClient } from '@repo/crm'
import { formatPrice } from '@repo/lib'

export const propertySearchTool: CoreTool = {
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
    propertyType: z.enum(['Residential', 'Condo', 'Townhouse']).optional()
      .describe('Type of property'),
  }),

  execute: async ({ city, minPrice, maxPrice, bedrooms, bathrooms, propertyType }) => {
    console.error('[chatbot.propertySearch.execute]', {
      city, minPrice, maxPrice, bedrooms, bathrooms, propertyType,
    })

    try {
      const client = new IDXClient()
      const result = await client.searchListings({
        city,
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        propertyType,
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

      return {
        success: true,
        message,
        listings: formattedListings,
        total: result.total,
        searchParams: { city, minPrice, maxPrice, bedrooms, bathrooms, propertyType },
        viewAllUrl: `/properties?city=${city || ''}&minPrice=${minPrice || ''}&maxPrice=${maxPrice || ''}&bedrooms=${bedrooms || ''}`,
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
}
