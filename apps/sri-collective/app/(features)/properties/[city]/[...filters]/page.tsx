import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getCityBySlug,
  parseFilterSegments,
  validateFilters,
  generateFilterMetadata,
  seoFiltersToIDXParams,
  getNeighborhoodBySlug,
  getPriceRangeBySlug,
  getPropertyTypeBySlug,
  getBedroomsBySlug,
} from '@repo/lib'
import { SearchResultsJsonLd, PropertiesPageClient } from '@repo/ui'
import { getAllPropertiesWithTotal } from '@/lib/data'

interface PageProps {
  params: Promise<{ city: string; filters: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, filters } = await params
  const cityConfig = getCityBySlug(city)

  if (!cityConfig) {
    return { title: 'Not Found | Sri Collective Group' }
  }

  const parsedFilters = parseFilterSegments(filters)

  if (!validateFilters(city, parsedFilters)) {
    return { title: 'Not Found | Sri Collective Group' }
  }

  const seo = generateFilterMetadata(city, parsedFilters)

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: seo.openGraph.url,
      type: 'website',
    },
  }
}

export default async function FilteredPropertiesPage({ params }: PageProps) {
  const { city, filters } = await params
  const cityConfig = getCityBySlug(city)

  if (!cityConfig) {
    notFound()
  }

  const parsedFilters = parseFilterSegments(filters)

  if (!validateFilters(city, parsedFilters)) {
    notFound()
  }

  const idxParams = seoFiltersToIDXParams(city, parsedFilters)
  const { properties, total, cities } = await getAllPropertiesWithTotal({
    ...idxParams,
    limit: 20,
  } as Parameters<typeof getAllPropertiesWithTotal>[0])

  const seo = generateFilterMetadata(city, parsedFilters)

  // Build page title from filters
  const neighborhood = parsedFilters.neighborhood
    ? getNeighborhoodBySlug(city, parsedFilters.neighborhood)
    : undefined
  const priceRange = parsedFilters.priceRange
    ? getPriceRangeBySlug(parsedFilters.priceRange)
    : undefined
  const propertyType = parsedFilters.propertyType
    ? getPropertyTypeBySlug(parsedFilters.propertyType)
    : undefined
  const bedrooms = parsedFilters.bedrooms
    ? getBedroomsBySlug(parsedFilters.bedrooms)
    : undefined

  const titleParts: string[] = []
  if (bedrooms) titleParts.push(bedrooms.label)
  if (propertyType) titleParts.push(propertyType.label)
  else titleParts.push('Properties')
  titleParts.push('for Sale')
  if (neighborhood) titleParts.push(`in ${neighborhood.name},`)
  titleParts.push(cityConfig.name)
  if (priceRange) titleParts.push(`- ${priceRange.label}`)

  const pageTitle = titleParts.join(' ')

  return (
    <>
      <SearchResultsJsonLd
        title={seo.title}
        description={seo.description}
        url={seo.canonical}
        propertyCount={total}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground">
              {total.toLocaleString()} properties match your criteria
            </p>
          </div>

          <PropertiesPageClient
            initialProperties={properties}
            initialCities={cities}
            total={total}
          />
        </div>
      </div>
    </>
  )
}
