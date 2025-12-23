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

interface PageProps {
  params: Promise<{ city: string }>
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

export default async function CityPropertiesPage({ params }: PageProps) {
  const { city } = await params
  const cityInfo = CITY_MAP[city.toLowerCase()]
  const displayName = cityInfo?.display || city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  // Fetch properties for this city
  const { properties, total, cities } = await getAllPropertiesWithTotal({
    city: cityInfo?.filter || displayName,
    limit: 50,
  })

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
            <p className="text-text-secondary max-w-2xl mx-auto">
              Discover your perfect home in {displayName}. Browse our curated selection of houses, condos, and townhouses.
            </p>
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
          />
        </div>
      </section>
    </div>
  )
}
