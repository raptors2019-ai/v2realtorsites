import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProjectBySlug, getSimilarProjects } from '@/lib/projects'
import { formatPrice } from '@repo/lib'
import { ProjectCard } from '@repo/ui'

// Helper function to get icon for a feature based on keywords
function getFeatureIcon(feature: string): React.ReactNode {
  const lowerFeature = feature.toLowerCase()

  // Bedroom icon
  if (lowerFeature.includes('bedroom')) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )
  }

  // Bathroom icon
  if (lowerFeature.includes('bathroom')) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5h15M6 16.5v3M18 16.5v3M7.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
    )
  }

  // Garage/Car icon
  if (lowerFeature.includes('garage') || lowerFeature.includes('car') || lowerFeature.includes('parking')) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    )
  }

  // Backyard/Outdoor icon
  if (lowerFeature.includes('backyard') || lowerFeature.includes('yard') || lowerFeature.includes('outdoor') || lowerFeature.includes('patio')) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    )
  }

  // Open concept/living icon
  if (lowerFeature.includes('open concept') || lowerFeature.includes('living')) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    )
  }

  // Kitchen icon
  if (lowerFeature.includes('kitchen')) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
      </svg>
    )
  }

  // Default checkmark icon
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

// Helper to generate features from individual fields if features array is empty
function getProductFeatures(type: {
  features?: string[] | null
  bedrooms?: string | null
  bathrooms?: string | null
  garages?: string | null
}): string[] {
  // If features array exists and has items, use it
  if (type.features && type.features.length > 0) {
    return type.features
  }

  // Otherwise, generate features from individual fields
  const generatedFeatures: string[] = []

  if (type.bedrooms) {
    generatedFeatures.push(`${type.bedrooms} Bedrooms`)
  }
  if (type.bathrooms) {
    generatedFeatures.push(`${type.bathrooms} Bathrooms`)
  }
  if (type.garages) {
    generatedFeatures.push(`${type.garages} Garage`)
  }

  return generatedFeatures
}

// Fallback images for projects without a featured image
const fallbackImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&h=800&fit=crop&q=80',
];

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return { title: 'Project Not Found' }
  }

  return {
    title: `${project.name} | Pre-Construction Homes | NewHomeShow`,
    description: project.description?.slice(0, 160) || `${project.name} - New homes starting from ${formatPrice(project.startingPrice)} in ${project.city}`,
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const similarProjects = await getSimilarProjects(project, 3)

  const statusConfig = {
    'coming-soon': { badge: 'bg-blue-500 text-white', text: 'Coming Soon' },
    'selling': { badge: 'bg-emerald-500 text-white', text: 'Now Selling' },
    'sold-out': { badge: 'bg-gray-500 text-white', text: 'Sold Out' },
  }

  const status = statusConfig[project.status] || statusConfig['selling']
  // Use a consistent fallback based on project slug hash
  const slugHash = project.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const heroImage = project.featuredImage || fallbackImages[slugHash % fallbackImages.length]

  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/builder-projects" className="hover:text-primary transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-secondary dark:text-white font-medium">{project.name}</span>
        </nav>
      </div>

      {/* Hero Image */}
      <section className="relative h-[400px] md:h-[500px]">
        <Image
          src={heroImage}
          alt={project.name}
          fill
          className="object-cover"
          priority
          unoptimized={!project.featuredImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${status.badge}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {status.text}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-white/90 text-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {project.intersection ? `${project.intersection}, ${project.city}` : project.city}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price & Quick Info */}
            <div className="luxury-card-premium rounded-xl p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Starting from</p>
                    <p className="text-3xl md:text-4xl font-bold text-gradient-primary">
                      {formatPrice(project.startingPrice)}
                    </p>
                  </div>
                  <div className="pl-6 border-l border-primary/20">
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Est. Closing</p>
                    <p className="text-lg font-semibold text-secondary dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {project.closingDate
                        ? new Date(project.closingDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : 'TBD'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/builder-projects/${project.slug}/register`}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md"
                >
                  Register Now
                </Link>
              </div>

              {/* Description */}
              <p className="text-text-secondary dark:text-gray-300 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Product Types */}
            <div className="luxury-card-premium rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-secondary dark:text-white mb-6">Available Home Types</h2>
              <div className="space-y-4">
                {project.productTypes.map((type) => (
                  <div
                    key={type.name}
                    className="p-4 bg-cream dark:bg-secondary-light rounded-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-secondary dark:text-white text-lg">{type.name}</h3>
                        {type.sqftRange && (
                          <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                            {type.sqftRange.min.toLocaleString()} - {type.sqftRange.max.toLocaleString()} sq ft
                          </p>
                        )}
                      </div>
                      {type.priceRange && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(type.priceRange.min)} - {formatPrice(type.priceRange.max)}
                          </p>
                        </div>
                      )}
                    </div>
                    {(() => {
                      const features = getProductFeatures(type)
                      return features.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-secondary text-secondary dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                            >
                              <span className="text-primary">{getFeatureIcon(feature)}</span>
                              {feature}
                            </span>
                          ))}
                        </div>
                      ) : null
                    })()}
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="luxury-card-premium rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-secondary dark:text-white mb-6">Community Highlights</h2>
                <ul className="grid md:grid-cols-2 gap-3">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-text-secondary dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="luxury-card-premium rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-secondary dark:text-white mb-6">Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {project.gallery.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${project.name} gallery ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - CTA Sidebar */}
          <div className="space-y-6">
            {/* Register Card */}
            <div className="luxury-card-premium rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-secondary dark:text-white mb-4">Interested in {project.name}?</h3>
              <p className="text-text-secondary dark:text-gray-300 text-sm mb-6">
                Register today to receive exclusive pricing, floor plans, and be first to know about new releases.
              </p>
              <Link
                href={`/builder-projects/${project.slug}/register`}
                className="block w-full py-3.5 bg-primary text-white rounded-lg text-center font-medium hover:bg-primary/90 transition-colors shadow-md mb-4"
              >
                Register for Updates
              </Link>
              <Link
                href={`/connect-with-sales?project=${encodeURIComponent(project.name)}`}
                className="block w-full py-3.5 border-2 border-primary text-primary rounded-lg text-center font-medium hover:bg-primary/5 transition-colors"
              >
                Speak with Sales
              </Link>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-primary/20">
                <p className="text-sm text-text-muted dark:text-gray-400 mb-3">Questions? Call us</p>
                <a
                  href="tel:+14167860431"
                  className="flex items-center gap-3 text-secondary dark:text-white hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="font-medium">+1 (416) 786-0431</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Projects */}
      {similarProjects.length > 0 && (
        <section className="py-16 bg-cream dark:bg-secondary-light">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-secondary dark:text-white mb-8">Similar Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProjects.map((p, index) => (
                <ProjectCard key={p.slug} project={p} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
