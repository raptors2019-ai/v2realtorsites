import { Metadata } from 'next'
import { getAllProjects } from '@/lib/projects'
import { ProjectGrid } from '@repo/ui'

export const metadata: Metadata = {
  title: 'Pre-Construction Homes | NewHomeShow',
  description: 'Browse our selection of new pre-construction homes and developments in the Greater Toronto Area. Find townhomes, detached homes, and more from top builders.',
}

export default async function BuilderProjectsPage() {
  const projects = await getAllProjects()

  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary dark:text-white mb-4">
              Pre-Construction Projects
            </h1>
            <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Discover new home developments across the Greater Toronto Area.
              Register today to receive exclusive pricing and incentives.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{projects.length}</p>
              <p className="text-sm text-text-muted dark:text-gray-400">Active Projects</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {projects.filter(p => p.status === 'selling').length}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-400">Now Selling</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {projects.filter(p => p.status === 'coming-soon').length}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-400">Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <ProjectGrid
            projects={projects}
            emptyMessage="No projects available at this time. Check back soon for new developments."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cream dark:bg-secondary-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary dark:text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-text-secondary dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Let us know your preferences and we'll notify you when matching projects become available.
          </p>
          <a
            href="/connect-with-sales"
            className="inline-block px-8 py-3.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
          >
            Connect with Sales
          </a>
        </div>
      </section>
    </div>
  )
}
