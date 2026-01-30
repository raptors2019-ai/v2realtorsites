import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPropertyById, getSimilarProperties, formatPrice } from '@/lib/data'
import {
  PropertyGallery,
  CopyButton,
  PropertyJsonLd,
  BackButton,
  SimilarProperties,
  PropertyHighlights,
  StickyMobileCTA,
} from '@repo/ui'
import { PropertyDetailTracker } from '@repo/analytics'
import { PropertyDetailClient } from './PropertyDetailClient'

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
  const { city, id } = await params
  const property = await getPropertyById(id)

  if (!property) {
    return { title: 'Property Not Found | Sri Collective Group' }
  }

  const title = `${property.title} | Sri Collective Group`
  const description = property.description?.slice(0, 160) || `${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType} in ${property.city} for ${formatPrice(property.price)}`
  const canonicalUrl = `https://sricollective.ca/properties/${city}/${id}`
  const ogImage = property.images?.[0] || '/images/og-default.jpg'

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: 'Sri Collective Group',
      locale: 'en_CA',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { city, id } = await params
  const property = await getPropertyById(id)

  if (!property) {
    notFound()
  }

  const similarProperties = await getSimilarProperties(property)
  const citySlug = createCitySlug(property.city)
  const formattedPrice = formatPrice(property.price)

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
            <BackButton />
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

        {/* Mobile: Full-bleed Gallery */}
        <div className="lg:hidden -mx-0">
          <PropertyGallery
            images={property.images}
            alt={property.title}
            priceOverlay={formattedPrice}
            fullBleed={true}
          />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-full">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8 w-full max-w-full min-w-0">
              {/* Desktop: Gallery with container */}
              <div className="hidden lg:block">
                <PropertyGallery images={property.images} alt={property.title} />
              </div>

              {/* Mobile: Horizontal Scroll Stats Bar */}
              <div className="lg:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4 w-max py-2">
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-cream rounded-xl">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div>
                      <p className="text-lg font-bold text-primary">{property.bedrooms}</p>
                      <p className="text-xs text-text-secondary">Beds</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-cream rounded-xl">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <div>
                      <p className="text-lg font-bold text-primary">{property.bathrooms}</p>
                      <p className="text-xs text-text-secondary">Baths</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-cream rounded-xl">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <div>
                      <p className="text-lg font-bold text-primary">{property.sqft.toLocaleString()}</p>
                      <p className="text-xs text-text-secondary">Sq Ft</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-cream rounded-xl">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-primary capitalize">{property.propertyType.replace('-', ' ')}</p>
                      <p className="text-xs text-text-secondary">Type</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile CTA Card */}
              <div className="lg:hidden luxury-card-premium rounded-xl p-5 w-full max-w-full">
                <Link
                  href={`/contact?type=viewing&address=${encodeURIComponent(property.address)}&mls=${property.mlsNumber || property.id}`}
                  className="btn-primary w-full py-4 rounded-lg text-center font-semibold block mb-3 transition-transform active:scale-[0.98]"
                >
                  Schedule a Viewing
                </Link>
                <Link
                  href={`/contact?type=question&address=${encodeURIComponent(property.address)}&mls=${property.mlsNumber || property.id}`}
                  className="btn-outline w-full py-4 rounded-lg text-center font-medium block transition-transform active:scale-[0.98]"
                >
                  Ask a Question
                </Link>
              </div>

              {/* Property Details */}
              <div className="luxury-card-premium rounded-xl p-5 md:p-8 w-full max-w-full">
                <div className="flex items-start gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-secondary break-words flex-1">
                    {property.title}
                  </h1>
                  <CopyButton
                    text={`https://sricollective.ca/properties/${citySlug}/${property.id}`}
                    variant="link"
                  />
                </div>
                <div className="flex items-center gap-2 mb-5 md:mb-6">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-text-secondary text-sm md:text-base break-words">
                    {property.address}, {property.city}, {property.province} {property.postalCode}
                  </p>
                  <CopyButton
                    text={`${property.address}, ${property.city}, ${property.province} ${property.postalCode}`}
                    variant="clipboard"
                  />
                </div>

                {/* Property Highlights (extracted from description) */}
                <PropertyHighlights description={property.description} className="mb-5 md:mb-6" />

                {/* Desktop Stats Grid */}
                <div className="hidden lg:grid grid-cols-4 gap-4 py-5 md:py-6 border-y border-primary/20">
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

                {/* Description - Expandable on mobile */}
                <div className="mt-5 md:mt-6">
                  <h2 className="text-lg md:text-xl font-semibold text-secondary mb-3 md:mb-4">About This Property</h2>
                  <PropertyDetailClient
                    description={property.description || 'Contact us for more information about this beautiful property.'}
                  />
                </div>

                {/* Listing Details Grid */}
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Listing Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.mlsNumber && (
                      <div>
                        <p className="text-xs text-text-muted">MLS#</p>
                        <p className="text-sm font-medium text-secondary">{property.mlsNumber}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-text-muted">Status</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Property Type</p>
                      <p className="text-sm font-medium text-secondary capitalize">{property.propertyType.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Listing Type</p>
                      <p className="text-sm font-medium text-secondary capitalize">{property.listingType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Agent Contact Card */}
              <div className="lg:hidden luxury-card-premium rounded-xl p-5 w-full">
                <h3 className="text-lg font-semibold text-secondary mb-4">Contact Our Team</h3>
                <a
                  href="tel:+14167860431"
                  className="flex items-center gap-3 p-3 bg-cream rounded-lg hover:bg-cream/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Call us</p>
                    <p className="font-semibold text-secondary">+1 (416) 786-0431</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column - Pricing & Contact (Desktop Only) */}
            <div className="hidden lg:block space-y-6">
              <div className="luxury-card-premium rounded-xl p-6 lg:sticky lg:top-24">
                <p className="text-sm text-text-secondary mb-1">Listed Price</p>
                <p className="text-4xl font-bold text-gradient-primary mb-6">
                  {formattedPrice}
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

        {/* Similar Properties */}
        <SimilarProperties
          currentProperty={property}
          initialSimilar={similarProperties}
          citySlug={citySlug}
        />

        {/* Sticky Mobile CTA */}
        <StickyMobileCTA
          address={property.address}
          mlsNumber={property.mlsNumber}
          propertyId={property.id}
          price={formattedPrice}
        />
      </div>
    </>
  )
}
