import { Metadata } from 'next'
import Link from 'next/link'
import { PropertiesPageClient, PropertySurvey } from '@repo/ui'
import { getAllPropertiesWithTotal } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Browse Properties | Sri Collective Group',
  description: 'Find your perfect home in the Greater Toronto Area. Browse our curated selection of houses, condos, townhouses, and more.',
}

interface SearchParams {
  listingType?: string
  propertyClass?: string
  budgetMin?: string
  budgetMax?: string
  cities?: string
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const hasSearchParams = Boolean(
    params.listingType || params.propertyClass || params.budgetMin || params.budgetMax || params.cities
  )

  // If no search params, show survey landing
  if (!hasSearchParams) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white relative overflow-hidden">
        {/* Subtle luxury background accent */}
        <div
          className="absolute inset-0 opacity-[0.03] bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80')",
          }}
        />
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className="text-center mb-8">
            <div className="accent-line mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Find Your Perfect Home
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto text-sm md:text-base">
              Answer 3 quick questions to see properties that match your criteria.
            </p>
          </div>

          <PropertySurvey />
        </div>
      </div>
    )
  }

  // Parse search params and fetch filtered properties
  const filters = {
    listingType: params.listingType as 'sale' | 'lease' | undefined,
    propertyClass: params.propertyClass as 'residential' | 'commercial' | undefined,
    minPrice: params.budgetMin ? parseInt(params.budgetMin) : undefined,
    maxPrice: params.budgetMax ? parseInt(params.budgetMax) : undefined,
    cities: params.cities?.split(','),
    limit: 20,
  }

  // Build initial filters for the client component
  const initialFilters = {
    listingType: params.listingType ? [params.listingType as 'sale' | 'lease'] : undefined,
    propertyClass: params.propertyClass ? [params.propertyClass as 'residential' | 'commercial'] : ['residential' as const],
    priceRange: {
      min: params.budgetMin ? parseInt(params.budgetMin) : undefined,
      max: params.budgetMax ? parseInt(params.budgetMax) : undefined,
    },
    locations: params.cities?.split(','),
  }

  const { properties, total } = await getAllPropertiesWithTotal(filters)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Refine Button */}
      <section className="py-16 bg-gradient-to-b from-cream to-white relative overflow-hidden">
        {/* Subtle luxury background accent */}
        <div
          className="absolute inset-0 opacity-[0.03] bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80')",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              {total.toLocaleString()} Properties Found
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto mb-6">
              {params.cities && `Showing properties in ${params.cities}`}
            </p>
            <Link
              href="/properties?reset=true"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Change Preferences
            </Link>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <PropertiesPageClient
            initialProperties={properties}
            total={total}
            initialFilters={initialFilters}
          />
        </div>
      </section>
    </div>
  )
}
