import { Metadata } from 'next'
import { MortgageCalculatorClient } from './MortgageCalculatorClient'

export const metadata: Metadata = {
  title: 'Mortgage Calculator | Sri Collective',
  description:
    'Calculate your mortgage affordability, monthly payments, and see how much home you can afford based on your income and down payment.',
}

export default function MortgageCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mortgage Calculator
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            How Much Home Can You Afford?
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Use our mortgage calculator to estimate your monthly payments and see what you can afford based on Canadian lending rules.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="relative pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MortgageCalculatorClient />
        </div>
      </section>
    </div>
  )
}
