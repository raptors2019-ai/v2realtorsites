import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPropertyById, getSimilarProperties, formatPrice } from '@/lib/data'
import { PropertyCard, PropertyGallery, CopyButton, PropertyJsonLd } from '@repo/ui'

interface PageProps {
  params: Promise<{ id: string }>
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
  const { id } = await params
  const property = await getPropertyById(id)

  if (!property) {
    notFound()
  }

  const similarProperties = await getSimilarProperties(property, 6)

  return (
    <>
      <PropertyJsonLd property={property} />
      <div className="min-h-screen bg-white">
        {/* Breadcrumb & Back Button */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm text-text-secondary flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-primary transition-colors">Properties</Link>
            <span>/</span>
            <span className="text-secondary">{property.address}, {property.city}, {property.province} {property.postalCode}</span>
          </nav>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Properties
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <PropertyGallery images={property.images} alt={property.title} />

            {/* Property Details */}
            <div className="luxury-card-premium rounded-xl p-8">
              <h1 className="text-3xl font-bold text-secondary mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-text-secondary">
                  {property.address}, {property.city}, {property.province} {property.postalCode}
                </p>
                <CopyButton text={`${property.address}, ${property.city}, ${property.province} ${property.postalCode}`} />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-primary/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{property.bedrooms}</p>
                  <p className="text-sm text-text-secondary">Bedrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{property.bathrooms}</p>
                  <p className="text-sm text-text-secondary">Bathrooms</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{property.sqft.toLocaleString()}</p>
                  <p className="text-sm text-text-secondary">Sq Ft</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary capitalize">{property.propertyType.replace('-', ' ')}</p>
                  <p className="text-sm text-text-secondary">Type</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-secondary mb-4">About This Property</h2>
                <p className="text-text-secondary leading-relaxed">
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
            {/* Pricing Card */}
            <div className="luxury-card-premium rounded-xl p-6 sticky top-24">
              <p className="text-sm text-text-secondary mb-1">Listed Price</p>
              <p className="text-4xl font-bold text-gradient-primary mb-6">
                {formatPrice(property.price)}
              </p>

              <Link
                href="/contact"
                className="btn-primary w-full py-4 rounded-lg text-center font-semibold block mb-4 transition-transform hover:scale-[1.02]"
              >
                Schedule a Viewing
              </Link>
              <Link
                href="/contact"
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
      {similarProperties.length > 0 && (
        <section className="py-16 bg-cream">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-secondary mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      </div>
    </>
  )
}
