import { Metadata } from 'next'
import { PropertiesPageClient } from '@repo/ui'
import { getAllPropertiesWithTotal } from '@/lib/data'
import Link from 'next/link'

// Map URL slugs to display names and filter values
const CITY_MAP: Record<string, { display: string; filter: string }> = {
  'toronto': { display: 'Toronto', filter: 'Toronto' },
  'toronto-central': { display: 'Toronto Central', filter: 'Toronto C' },
  'toronto-east': { display: 'Toronto East', filter: 'Toronto E' },
  'toronto-west': { display: 'Toronto West', filter: 'Toronto W' },
  'north-york': { display: 'North York', filter: 'North York' },
  'scarborough': { display: 'Scarborough', filter: 'Scarborough' },
  'etobicoke': { display: 'Etobicoke', filter: 'Etobicoke' },
  'mississauga': { display: 'Mississauga', filter: 'Mississauga' },
  'brampton': { display: 'Brampton', filter: 'Brampton' },
  'markham': { display: 'Markham', filter: 'Markham' },
  'vaughan': { display: 'Vaughan', filter: 'Vaughan' },
  'richmond-hill': { display: 'Richmond Hill', filter: 'Richmond Hill' },
  'oakville': { display: 'Oakville', filter: 'Oakville' },
  'burlington': { display: 'Burlington', filter: 'Burlington' },
  'hamilton': { display: 'Hamilton', filter: 'Hamilton' },
  'ajax': { display: 'Ajax', filter: 'Ajax' },
  'pickering': { display: 'Pickering', filter: 'Pickering' },
  'oshawa': { display: 'Oshawa', filter: 'Oshawa' },
  'whitby': { display: 'Whitby', filter: 'Whitby' },
  'aurora': { display: 'Aurora', filter: 'Aurora' },
  'newmarket': { display: 'Newmarket', filter: 'Newmarket' },
  'milton': { display: 'Milton', filter: 'Milton' },
}

interface SearchParams {
  listingType?: string
  propertyClass?: string
  budgetMin?: string
  budgetMax?: string
  propertyType?: string
  bedrooms?: string
  bathrooms?: string
}

interface PageProps {
  params: Promise<{ city: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params
  const cityInfo = CITY_MAP[city.toLowerCase()]
  const displayName = cityInfo?.display || city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return {
    title: `Properties in ${displayName} | Sri Collective Group`,
    description: `Browse homes for sale in ${displayName}. Find houses, condos, and townhouses in the Greater Toronto Area with Sri Collective Group.`,
  }
}

export default async function CityPropertiesPage({ params, searchParams }: PageProps) {
  const { city } = await params
  const urlParams = await searchParams
  const cityInfo = CITY_MAP[city.toLowerCase()]
  const displayName = cityInfo?.display || city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  // Fetch properties for this city with optional price filters
  // Default to 'sale' listing type unless explicitly requesting 'lease'
  const cityFilter = cityInfo?.filter || displayName
  const listingType = (urlParams.listingType as 'sale' | 'lease') || 'sale'
  const { properties, total, cities } = await getAllPropertiesWithTotal({
    city: cityFilter,
    listingType: listingType,
    minPrice: urlParams.budgetMin ? parseInt(urlParams.budgetMin) : undefined,
    maxPrice: urlParams.budgetMax ? parseInt(urlParams.budgetMax) : undefined,
    limit: 50,
  })

  // Build initial filters to show the selected city in the filter dropdown
  // Include price range from URL params if present
  const initialFilters = {
    listingType: [listingType] as ('sale' | 'lease')[],
    locations: [cityFilter],
    priceRange: (urlParams.budgetMin || urlParams.budgetMax) ? {
      min: urlParams.budgetMin ? parseInt(urlParams.budgetMin) : undefined,
      max: urlParams.budgetMax ? parseInt(urlParams.budgetMax) : undefined,
    } : undefined,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-secondary">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-primary transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-secondary">{displayName}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Properties in {displayName}
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto mb-6">
              Discover your perfect home in {displayName}. Browse our curated selection of houses, condos, and townhouses.
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
