import type { Metadata } from 'next'
import { ToolsPageClient } from './ToolsPageClient'

export const metadata: Metadata = {
  title: 'Home Buyer Tools & Calculators | Sri Collective Group',
  description: 'Free mortgage calculator, CMHC insurance calculator, land transfer tax calculator, closing costs estimator, and property tax calculator for Ontario home buyers.',
  keywords: [
    'mortgage calculator',
    'CMHC calculator',
    'land transfer tax calculator Ontario',
    'Toronto land transfer tax',
    'closing costs Ontario',
    'property tax calculator',
    'first time home buyer',
    'home buying tools',
  ],
  openGraph: {
    title: 'Home Buyer Tools & Calculators | Sri Collective Group',
    description: 'Calculate your mortgage payments, CMHC insurance, land transfer taxes, closing costs, and property taxes. Free tools for Ontario home buyers.',
    type: 'website',
  },
}

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Home Buyer Tools
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Plan your home purchase with our free calculators. Estimate your mortgage payments,
              understand CMHC insurance, calculate land transfer taxes, and know exactly what
              you&apos;ll need on closing day.
            </p>
          </div>
        </div>
      </section>

      {/* Calculators */}
      <ToolsPageClient />

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Home Search?
            </h2>
            <p className="text-gray-600 mb-8">
              Now that you know your numbers, let us help you find the perfect home.
              Our team is here to guide you through every step of the buying process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/properties"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Properties
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* External Resources */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Additional Resources
          </h3>
          <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
            <a
              href="https://www.housesigma.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <p className="font-medium text-gray-900">HouseSigma</p>
              <p className="text-sm text-gray-500">View sold prices &amp; history</p>
            </a>
            <a
              href="https://www.ratehub.ca/best-mortgage-rates"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <p className="font-medium text-gray-900">RateHub</p>
              <p className="text-sm text-gray-500">Compare mortgage rates</p>
            </a>
            <a
              href="https://www.cmhc-schl.gc.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <p className="font-medium text-gray-900">CMHC</p>
              <p className="text-sm text-gray-500">Official insurance info</p>
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white py-8 border-t">
        <div className="container mx-auto px-4">
          <p className="text-xs text-gray-500 text-center max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> These calculators provide estimates for informational purposes only
            and should not be relied upon for financial decisions. Actual costs may vary based on your
            specific situation. Mortgage rates, tax rates, and fees are subject to change. We recommend
            consulting with a mortgage professional, real estate lawyer, and accountant before making
            any home purchase decisions.
          </p>
        </div>
      </section>
    </main>
  )
}
