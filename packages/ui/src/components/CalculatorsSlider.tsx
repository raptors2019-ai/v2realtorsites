'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCarousel } from '../hooks/useCarousel'

interface Calculator {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const calculators: Calculator[] = [
  {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    description: 'Calculate monthly payments',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'ltt',
    title: 'Land Transfer Tax',
    description: 'Ontario & Toronto LTT',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'closing-costs',
    title: 'Closing Costs',
    description: 'Total purchase costs',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'cmhc',
    title: 'CMHC Insurance',
    description: 'Mortgage insurance premium',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'required-income',
    title: 'Required Income',
    description: 'Income to qualify',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'stress-test',
    title: 'Stress Test',
    description: 'Qualification rate',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'property-tax',
    title: 'Property Tax',
    description: 'Compare GTA rates',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

// Split into 2 pages: 4 and 3 calculators
const pages = [
  calculators.slice(0, 4),
  calculators.slice(4),
]

interface CalculatorsSliderProps {
  className?: string
}

export function CalculatorsSlider({ className = '' }: CalculatorsSliderProps) {
  const { currentPage, goToPage, pause, resume } = useCarousel({
    totalPages: pages.length,
    autoAdvanceInterval: 6000,
  })

  return (
    <section
      className={`py-16 md:py-20 bg-white ${className}`}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="accent-line mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Free Real Estate <span className="text-gradient-primary">Calculators</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Plan your home purchase with confidence using our suite of calculators.
          </p>
        </div>

        {/* Paginated Cards */}
        <div className="relative min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center max-w-4xl mx-auto"
            >
              {pages[currentPage].map((calc) => (
                <CalculatorCard key={calc.id} calculator={calc} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentPage === index
                  ? 'bg-primary w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Explore All Calculators
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

function CalculatorCard({ calculator }: { calculator: Calculator }) {
  return (
    <Link
      href="/tools"
      className="group flex flex-col items-center text-center w-full max-w-[180px] p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
    >
      {/* Icon - using theme primary color */}
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
        {calculator.icon}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-secondary text-sm mb-1 group-hover:text-primary transition-colors">
        {calculator.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-text-secondary leading-tight">{calculator.description}</p>
    </Link>
  )
}
