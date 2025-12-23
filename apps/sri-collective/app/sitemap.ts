import type { MetadataRoute } from 'next'
import { generateAllFilterCombinations } from '@repo/lib'
import { IDXClient } from '@repo/crm'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sricollective.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/properties`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/builder-projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // SEO filter combination pages
  const filterUrls = generateAllFilterCombinations()
  const filterPages: MetadataRoute.Sitemap = filterUrls.map(url => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Individual property pages (fetch from IDX)
  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const client = new IDXClient()
    if (client.isConfigured) {
      // Fetch first 500 listings for sitemap (can paginate for more)
      const response = await client.searchListings({ limit: 500 })
      if (response.success) {
        propertyPages = response.listings.map(listing => ({
          url: `${BASE_URL}/properties/${listing.ListingKey}`,
          lastModified: new Date(listing.ModificationTimestamp),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }))
      }
    }
  } catch (error) {
    console.error('[sitemap] Error fetching properties:', error)
  }

  return [...staticPages, ...filterPages, ...propertyPages]
}
