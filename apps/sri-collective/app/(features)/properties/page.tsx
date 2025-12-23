import { Metadata } from 'next'
import { PropertiesPageClient } from '@repo/ui'
import { getAllPropertiesWithTotal } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Browse Properties | Sri Collective Group',
  description: 'Find your perfect home in the Greater Toronto Area. Browse our curated selection of houses, condos, townhouses, and more.',
}

export default async function PropertiesPage() {
  // Fetch more initially since we filter client-side (For Sale by default)
  const { properties, total, cities } = await getAllPropertiesWithTotal({ limit: 50 })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Browse Properties
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Explore our curated selection of homes across the Greater Toronto Area.
              From luxury condos to spacious family homes, find your perfect match.
            </p>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <PropertiesPageClient initialProperties={properties} initialCities={cities} total={total} />
        </div>
      </section>
    </div>
  )
}
