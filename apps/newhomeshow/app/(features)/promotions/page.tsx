import { Metadata } from 'next'
import Link from 'next/link'
import { getPromotions } from '@/lib/projects'
import { formatPrice } from '@repo/lib'

export const metadata: Metadata = {
  title: 'Current Promotions | NewHomeShow',
  description: 'Discover current promotions and incentives on pre-construction homes in the Greater Toronto Area.',
}

export default async function PromotionsPage() {
  const activeProjects = await getPromotions()

  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary dark:text-white mb-4">
              Current Promotions
            </h1>
            <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Take advantage of limited-time incentives and special offers
              on our pre-construction projects.
            </p>
          </div>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {activeProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <div
                  key={project.slug}
                  className="luxury-card-premium rounded-xl overflow-hidden"
                >
                  <div className="p-6">
                    {/* Promo Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 dark:bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 110 6h-1a1 1 0 100 2h1a5 5 0 000-10H8.414l1.293-1.293z" clipRule="evenodd" />
                      </svg>
                      Limited Time Offer
                    </div>

                    <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-text-secondary dark:text-gray-300 text-sm mb-4">
                      {project.intersection ? `${project.intersection}, ${project.city}` : project.city}
                    </p>

                    {/* Price Info */}
                    <div className="bg-cream dark:bg-secondary-light rounded-lg p-4 mb-4">
                      <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Starting from</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(project.startingPrice)}
                      </p>
                    </div>

                    {/* Incentives from Sanity */}
                    <div className="space-y-2 mb-6">
                      {(project.incentives && project.incentives.length > 0) ? (
                        project.incentives.slice(0, 3).map((incentive, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-300">
                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {incentive}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-300">
                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Special pricing available
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-300">
                            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Contact for details
                          </div>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/builder-projects/${project.slug}/register`}
                      className="block w-full py-3 bg-primary text-white text-center rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Get This Offer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-cream dark:bg-secondary-light rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-secondary dark:text-white mb-2">No Active Promotions</h3>
              <p className="text-text-secondary dark:text-gray-300 mb-6">
                Check back soon for new promotions and incentives.
              </p>
              <Link
                href="/builder-projects"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Browse All Projects
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cream dark:bg-secondary-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white mb-4">
            Want Exclusive Access to Future Promotions?
          </h2>
          <p className="text-text-secondary dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Join our VIP list to receive early notifications about new
            promotions and incentives before they're public.
          </p>
          <Link
            href="/connect-with-sales"
            className="inline-block px-8 py-3.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md"
          >
            Join VIP List
          </Link>
        </div>
      </section>
    </div>
  )
}
