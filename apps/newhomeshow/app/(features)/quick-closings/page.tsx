import { Metadata } from 'next'
import Link from 'next/link'
import { getQuickClosings } from '@/lib/projects'
import { ProjectGrid } from '@repo/ui'

export const metadata: Metadata = {
  title: 'Quick Closings | NewHomeShow',
  description: 'Find pre-construction homes with quick closing dates. Move in sooner with our selection of ready-to-close properties.',
}

export default async function QuickClosingsPage() {
  const projects = await getQuickClosings()

  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary dark:text-white mb-4">
              Quick Closings
            </h1>
            <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Ready to move sooner? Browse our selection of pre-construction homes
              with closing dates within the next 6 months.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-secondary dark:text-white">Move In Sooner</h3>
              <p className="text-sm text-text-muted dark:text-gray-400">Closing within 6 months</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-secondary dark:text-white">What You See</h3>
              <p className="text-sm text-text-muted dark:text-gray-400">Near-complete homes</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-secondary dark:text-white">Special Pricing</h3>
              <p className="text-sm text-text-muted dark:text-gray-400">Exclusive incentives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {projects.length > 0 ? (
            <ProjectGrid projects={projects} />
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-cream dark:bg-secondary-light rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-secondary dark:text-white mb-2">No Quick Closings Available</h3>
              <p className="text-text-secondary dark:text-gray-300 mb-6">
                Check back soon for new inventory with quick closing dates.
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
    </div>
  )
}
