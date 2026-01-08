import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PropertiesPageClient } from '@repo/ui'
import { getAllPropertiesWithTotal } from '@/lib/data'
import Link from 'next/link'
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

  // Get filter config objects for display
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

  // Convert SEO filters to IDX params
  const idxParams = seoFiltersToIDXParams(city, parsedFilters)

  const { properties, total, cities } = await getAllPropertiesWithTotal({
    city: idxParams.city as string,
    minPrice: idxParams.minPrice as number | undefined,
    maxPrice: idxParams.maxPrice as number | undefined,
    propertyType: idxParams.propertyType as string | undefined,
    bedrooms: idxParams.bedrooms as number | undefined,
    limit: 50,
  })

  // Build page title from filters
  const titleParts: string[] = []
  if (bedrooms) titleParts.push(bedrooms.label)
  if (propertyType) titleParts.push(propertyType.label)
  else titleParts.push('Properties')
  titleParts.push('for Sale')
  if (neighborhood) titleParts.push(`in ${neighborhood.name},`)
  titleParts.push(cityConfig.name)
  if (priceRange) titleParts.push(`- ${priceRange.label}`)

  const pageTitle = titleParts.join(' ')

  // Build initial filters for the filter component
  const initialFilters = {
    listingType: ['sale' as const],
    locations: [cityConfig.name],
    ...(idxParams.minPrice || idxParams.maxPrice ? {
      priceRange: {
        min: idxParams.minPrice as number | undefined,
        max: idxParams.maxPrice as number | undefined,
      }
    } : {}),
    ...(propertyType ? { type: [propertyType.slug as 'detached' | 'semi-detached' | 'townhouse' | 'condo'] } : {}),
    ...(bedrooms ? { bedrooms: [bedrooms.min] } : {}),
  }

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Properties', href: '/properties' },
    { label: cityConfig.name, href: `/properties/${city}` },
  ]
  if (neighborhood) {
    breadcrumbItems.push({
      label: neighborhood.name,
      href: `/properties/${city}/${parsedFilters.neighborhood}`
    })
  }
  if (priceRange) {
    const priceHref = neighborhood
      ? `/properties/${city}/${parsedFilters.neighborhood}/${parsedFilters.priceRange}`
      : `/properties/${city}/${parsedFilters.priceRange}`
    breadcrumbItems.push({ label: priceRange.label, href: priceHref })
  }
  if (propertyType) {
    breadcrumbItems.push({ label: propertyType.label, href: '#' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-secondary flex-wrap">
          {breadcrumbItems.map((item, index) => (
            <span key={item.href} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {index === breadcrumbItems.length - 1 ? (
                <span className="text-secondary">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              {pageTitle}
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto mb-6">
              {total > 0
                ? `Found ${total.toLocaleString()} ${total === 1 ? 'property' : 'properties'} matching your criteria.`
                : 'No properties found matching your criteria. Try adjusting your filters.'}
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
            initialCities={cities}
            total={total}
            initialFilters={initialFilters}
          />
        </div>
      </section>
    </div>
  )
}
