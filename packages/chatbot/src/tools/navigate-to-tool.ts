import { z } from 'zod'
import type { CoreTool } from 'ai'

/**
 * Navigation Tool
 *
 * Instead of executing tools inline, this tool directs users to dedicated tool pages
 * with pre-filled parameters. This provides a better UX by utilizing the full page
 * real estate for tool interactions.
 */

const toolConfigs = {
  'mortgage-calculator': {
    title: 'Mortgage Calculator',
    description: 'See your full affordability breakdown with detailed estimates',
    buttonText: 'Open Mortgage Calculator',
    basePath: '/tools/mortgage-calculator',
    paramMapping: {
      income: 'income',
      downPayment: 'downPayment',
      debts: 'debts',
    },
  },
  'neighborhood-explorer': {
    title: 'Neighborhood Explorer',
    description: 'Discover everything about this GTA neighborhood',
    buttonText: 'Explore Neighborhood',
    basePath: '/tools/neighborhoods',
    paramMapping: {
      city: 'city',
    },
  },
  'first-time-buyer': {
    title: 'First-Time Buyer Guide',
    description: 'Learn about rebates, incentives, and the home buying process',
    buttonText: 'View First-Time Buyer Guide',
    basePath: '/tools/first-time-buyer',
    paramMapping: {},
  },
  'property-search': {
    title: 'Property Search',
    description: 'Browse available properties matching your criteria',
    buttonText: 'Search Properties',
    basePath: '/properties',
    paramMapping: {
      city: 'cities',
      maxPrice: 'budgetMax',
      minPrice: 'budgetMin',
      bedrooms: 'bedrooms',
      propertyType: 'propertyType',
    },
  },
  'home-valuation': {
    title: 'Home Valuation',
    description: 'Get a free estimate of your home\'s current market value',
    buttonText: 'Get Home Valuation',
    basePath: 'https://srikathiravelu.remaxexperts.net/seller/valuation/',
    external: true,
    paramMapping: {},
  },
} as const

type ToolType = keyof typeof toolConfigs

function buildUrl(
  toolType: ToolType,
  params: Record<string, string | number | undefined>
): string {
  const config = toolConfigs[toolType]
  const url = new URL(config.basePath, 'https://placeholder.com')

  // Map provided params to URL query params
  const paramMapping = config.paramMapping as Record<string, string>
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      const mappedKey = paramMapping[key]
      if (mappedKey) {
        url.searchParams.set(mappedKey, String(value))
      }
    }
  }

  // Return relative path for internal URLs, full URL for external
  if ('external' in config && config.external) {
    return config.basePath // External URLs don't need params
  }

  return `${url.pathname}${url.search}`
}

export const navigateToToolTool: CoreTool = {
  description: `[PURPOSE] Navigate users to dedicated tool pages instead of showing tool results inline in chat.
[WHEN TO USE] When the user wants to use a calculator, explore neighborhoods, or access other tools.
After gathering necessary inputs through conversation, use this to direct them to the full-featured tool page.
[AVAILABLE TOOLS]
- mortgage-calculator: Affordability calculator. Params: income, downPayment, debts
- neighborhood-explorer: Explore GTA cities. Params: city
- first-time-buyer: Guide for first-time buyers. No params needed.
- property-search: Search listings. Params: city, maxPrice, minPrice, bedrooms, propertyType
- home-valuation: Get home value estimate. No params (external site).
[OUTPUT] Returns a navigation CTA with URL and button text to render in chat.`,

  parameters: z.object({
    toolType: z.enum([
      'mortgage-calculator',
      'neighborhood-explorer',
      'first-time-buyer',
      'property-search',
      'home-valuation',
    ]).describe('The type of tool page to navigate to'),
    params: z.record(z.union([z.string(), z.number()]))
      .optional()
      .default({})
      .describe('Parameters to pre-fill on the tool page (e.g., { income: 100000, downPayment: 50000 })'),
    customMessage: z.string()
      .optional()
      .describe('Optional custom message to display with the navigation CTA'),
  }),

  execute: async ({ toolType, params = {}, customMessage }) => {
    console.error('[chatbot.navigateToTool.execute]', { toolType, params })

    try {
      const tool = toolType as ToolType
      const config = toolConfigs[tool]
      const url = buildUrl(tool, params)
      const isExternal = 'external' in config && config.external

      const result = {
        success: true,
        displayType: 'navigation-cta',
        navigation: {
          url,
          title: config.title,
          description: customMessage || config.description,
          buttonText: config.buttonText,
          external: isExternal,
        },
        // Brief text response for the chat
        message: customMessage ||
          `I've set up the ${config.title} for you. Click below to access the full tool.`,
      }

      console.error('[chatbot.navigateToTool.success]', { url, toolType })

      return result
    } catch (error) {
      console.error('[chatbot.navigateToTool.error]', error)
      return {
        success: false,
        message: `I couldn't set up that tool. You can visit the tools page directly at /tools`,
        error: error instanceof Error ? error.message : 'Navigation error',
      }
    }
  },
}
