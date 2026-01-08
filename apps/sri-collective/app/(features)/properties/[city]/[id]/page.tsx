import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPropertyById, getSimilarProperties, formatPrice } from '@/lib/data'
import { PropertyGallery, CopyButton, PropertyJsonLd, BackButton, SimilarProperties } from '@repo/ui'
import { PropertyDetailTracker } from '@repo/analytics'

interface PageProps {
  params: Promise<{ city: string; id: string }>
}

// Helper to format city slug to display name
function formatCityName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper to create city slug from city name
function createCitySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const property = await getPropertyById(id)

  if (!property) {
    return { title: 'Property Not Found | Sri Collective Group' }
  }

  return {
    title: `${property.title} | Sri Collective Group`,
    description: property.description?.slice(0, 160) || `${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType} in ${property.city}`,
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { city, id } = await params
  const property = await getPropertyById(id)

  if (!property) {
    notFound()
  }

  const similarProperties = await getSimilarProperties(property) // Default: 3-5 properties
  const citySlug = createCitySlug(property.city)
  const cityDisplay = formatCityName(city)

  return (
    <>
      <PropertyJsonLd property={property} />
      <PropertyDetailTracker
        property={{
          id: property.id,
          price: property.price,
          address: property.address,
          propertyType: property.propertyType,
          city: property.city,
          listingType: property.listingType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          sqft: property.sqft,
        }}
      />
      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Breadcrumb & Back Button */}
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-full">
          <div className="flex flex-col gap-3">
            {/* Back Button - Left aligned */}
            <BackButton />
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href="/properties" className="hover:text-primary transition-colors">Properties</Link>
              <span>/</span>
              <Link href={`/properties/${citySlug}`} className="hover:text-primary transition-colors">{property.city}</Link>
              <span>/</span>
              <span className="text-secondary truncate max-w-[250px] sm:max-w-none">{property.address}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-full">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8 w-full max-w-full min-w-0">
              {/* Image Gallery */}
              <PropertyGallery images={property.images} alt={property.title} />

              {/* Mobile Pricing CTA */}
              <div className="lg:hidden luxury-card-premium rounded-xl p-5 md:p-6 w-full max-w-full">
                <p className="text-sm text-text-secondary mb-1">Listed Price</p>
                <p className="text-3xl md:text-4xl font-bold text-gradient-primary mb-5 md:mb-6 break-words">
                  {formatPrice(property.price)}
                </p>
                <Link
                  href={`/contact?type=viewing&address=${encodeURIComponent(property.address)}&mls=${property.mlsNumber || property.id}`}
                  className="btn-primary w-full py-4 rounded-lg text-center font-semibold block mb-4 transition-transform hover:scale-[1.02] max-w-full"
                >
                  Schedule a Viewing
                </Link>
                <Link
                  href={`/contact?type=question&address=${encodeURIComponent(property.address)}&mls=${property.mlsNumber || property.id}`}
                  className="btn-outline w-full py-4 rounded-lg text-center font-medium block transition-transform hover:scale-[1.02] max-w-full"
                >
                  Ask a Question
                </Link>
              </div>

              {/* Property Details */}
              <div className="luxury-card-premium rounded-xl p-5 md:p-8 w-full max-w-full">
                <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-2 break-words">
                  {property.title}
                </h1>
                <div className="flex items-start gap-2 mb-5 md:mb-6 flex-wrap">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-text-secondary text-sm md:text-base break-words flex-1 min-w-0">
                    {property.address}, {property.city}, {property.province} {property.postalCode}
                  </p>
                  <CopyButton text={`${property.address}, ${property.city}, ${property.province} ${property.postalCode}`} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-5 md:py-6 border-y border-primary/20">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{property.bedrooms}</p>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">Bedrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{property.bathrooms}</p>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">Bathrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{property.sqft.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">Sq Ft</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-primary capitalize">{property.propertyType.replace('-', ' ')}</p>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">Type</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-5 md:mt-6">
                  <h2 className="text-lg md:text-xl font-semibold text-secondary mb-3 md:mb-4">About This Property</h2>
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed break-words">
                    {property.description || 'Contact us for more information about this beautiful property.'}
                  </p>
                </div>

                {property.mlsNumber && (
                  <p className="mt-6 text-sm text-text-muted">
                    MLS# {property.mlsNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Pricing & Contact */}
            <div className="space-y-6">
              {/* Pricing Card - Desktop Sticky */}
              <div className="luxury-card-premium rounded-xl p-6 hidden lg:block lg:sticky lg:top-24">
                <p className="text-sm text-text-secondary mb-1">Listed Price</p>
                <p className="text-4xl font-bold text-gradient-primary mb-6">
                  {formatPrice(property.price)}
                </p>

                <Link
                  href={`/contact?type=viewing&address=${encodeURIComponent(property.address)}&mls=${property.mlsNumber || property.id}`}
                  className="btn-primary w-full py-4 rounded-lg text-center font-semibold block mb-4 transition-transform hover:scale-[1.02]"
                >
                  Schedule a Viewing
                </Link>
                <Link
                  href={`/contact?type=question&address=${encodeURIComponent(property.address)}&mls=${property.mlsNumber || property.id}`}
                  className="btn-outline w-full py-4 rounded-lg text-center font-medium block transition-transform hover:scale-[1.02]"
                >
                  Ask a Question
                </Link>

                <div className="mt-6 pt-6 border-t border-primary/20">
                  <p className="text-sm text-text-secondary mb-4">Contact Our Team</p>
                  <a
                    href="tel:+14167860431"
                    className="flex items-center gap-3 text-secondary hover:text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    +1 (416) 786-0431
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties - Smart Recommendations */}
        <SimilarProperties
          currentProperty={property}
          initialSimilar={similarProperties}
          citySlug={citySlug}
        />
      </div>
    </>
  )
}
