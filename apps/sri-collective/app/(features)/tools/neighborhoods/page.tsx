import { Metadata } from 'next'
import { NeighborhoodsClient } from './NeighborhoodsClient'

export const metadata: Metadata = {
  title: 'Neighborhood Explorer | Sri Collective',
  description:
    'Explore GTA neighborhoods and cities. Discover average home prices, transit options, schools, and local attractions in Toronto, Mississauga, Vaughan, and more.',
}

export default function NeighborhoodsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Neighborhood Explorer
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Discover GTA Neighborhoods
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Explore cities and neighborhoods across the Greater Toronto Area. Find the perfect community that matches your lifestyle.
          </p>
        </div>
      </section>

      {/* Explorer Section */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <NeighborhoodsClient />
        </div>
      </section>
    </div>
  )
}
