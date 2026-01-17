import type { Metadata } from 'next'
import { ToolsPageClient } from './components/ToolsPageClient'

export const metadata: Metadata = {
  title: 'Real Estate Calculators | Sri Collective Group',
  description:
    'Free real estate calculators for home buyers in the GTA. Calculate mortgage payments, land transfer tax, closing costs, CMHC insurance, and more.',
  keywords: [
    'mortgage calculator',
    'land transfer tax calculator',
    'closing costs calculator',
    'CMHC calculator',
    'Toronto real estate',
    'GTA home buyers',
  ],
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#1a2d4d] to-[#0a1628]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-accent/10 to-transparent blur-3xl" />
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-white/5 to-transparent blur-2xl" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-white/90">Free Calculators</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Real Estate{' '}
              <span className="text-gradient-primary bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                Calculators
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Plan your home purchase with confidence. Our suite of calculators helps you
              estimate costs, understand taxes, and make informed decisions.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {[
                { value: '7', label: 'Calculators' },
                { value: '16+', label: 'GTA Cities' },
                { value: '100%', label: 'Free to Use' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path
              d="M0 60V30C240 10 480 0 720 0C960 0 1200 10 1440 30V60H0Z"
              fill="#faf9f7"
            />
          </svg>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="py-12 md:py-20 -mt-1">
        <div className="container mx-auto px-4">
          <ToolsPageClient />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-slate-600 mb-8">
              Our team of experts is here to guide you through every step of the home buying process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/properties"
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl"
              >
                Browse Properties
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/contact"
                className="btn-outline-primary inline-flex items-center justify-center gap-2 rounded-xl"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-slate-500 leading-relaxed text-center">
              <strong className="text-slate-600">Disclaimer:</strong> These calculators provide estimates for
              informational purposes only and do not constitute financial advice.
              Actual costs may vary based on your specific situation, lender
              requirements, and market conditions. Please consult with a mortgage
              professional for accurate pre-approval and financial planning.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
