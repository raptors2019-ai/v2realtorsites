import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Assignment Sales | NewHomeShow',
  description: 'Find assignment sales opportunities in the Greater Toronto Area. Purchase pre-construction contracts from original buyers.',
}

export default function AssignmentsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary dark:text-white mb-4">
              Assignment Sales
            </h1>
            <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Looking for assignment opportunities? We help connect buyers with
              sellers looking to assign their pre-construction contracts.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="luxury-card-premium rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2">For Buyers</h3>
                <p className="text-text-secondary dark:text-gray-300 text-sm">
                  Purchase at original pricing, skip the waitlist, and potentially
                  get into sold-out projects.
                </p>
              </div>

              <div className="luxury-card-premium rounded-xl p-6">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2">For Sellers</h3>
                <p className="text-text-secondary dark:text-gray-300 text-sm">
                  Need to assign your contract? We can help you find qualified
                  buyers and navigate the process.
                </p>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="text-center py-12 bg-cream dark:bg-secondary-light rounded-xl">
              <div className="w-16 h-16 bg-white dark:bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary dark:text-white mb-2">
                Assignment Listings Coming Soon
              </h3>
              <p className="text-text-secondary dark:text-gray-300 mb-6 max-w-md mx-auto">
                We're building a comprehensive assignment marketplace.
                Connect with us to be notified when listings become available.
              </p>
              <Link
                href="/connect-with-sales"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Notified
              </Link>
            </div>

            {/* How It Works */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-secondary dark:text-white mb-6 text-center">
                How Assignments Work
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: '1',
                    title: 'Original Purchase',
                    description: 'Buyer purchases a pre-construction unit from a developer.',
                  },
                  {
                    step: '2',
                    title: 'Decision to Sell',
                    description: 'Original buyer decides to sell their purchase agreement before closing.',
                  },
                  {
                    step: '3',
                    title: 'Assignment Agreement',
                    description: 'New buyer takes over the contract with developer approval.',
                  },
                  {
                    step: '4',
                    title: 'Final Closing',
                    description: 'New buyer completes the purchase directly with the developer.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary dark:text-white">{item.title}</h4>
                      <p className="text-text-secondary dark:text-gray-300 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
