'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Tool {
  id: string
  title: string
  description: string
  href: string
  external?: boolean
  icon: React.ReactNode
}

const tools: Tool[] = [
  {
    id: 'neighborhoods',
    title: 'Neighborhood Explorer',
    description: 'Discover GTA cities and neighborhoods',
    href: '/tools/neighborhoods',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'first-time-buyer',
    title: 'First-Time Buyer Guide',
    description: 'Rebates, incentives & buying process',
    href: '/tools/first-time-buyer',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'home-valuation',
    title: 'Home Valuation',
    description: "Find out what your home is worth",
    href: 'https://srikathiravelu.remaxexperts.net/seller/valuation/',
    external: true,
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'mortgage-calculator',
    title: 'Affordability Calculator',
    description: 'See how much home you can afford',
    href: '/tools/mortgage-calculator',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
]

// Split into 2 pages: 2 tools each
const pages = [
  tools.slice(0, 2),
  tools.slice(2),
]

const AUTO_ADVANCE_INTERVAL = 5000 // 5 seconds per page

export function MoreToolsSlider() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % pages.length)
  }, [])

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      nextPage()
    }, AUTO_ADVANCE_INTERVAL)

    return () => clearInterval(timer)
  }, [isPaused, nextPage])

  return (
    <section
      className="py-12 bg-[#faf9f7]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            More Resources
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Explore neighborhoods, learn about first-time buyer programs, or get a home valuation
          </p>
        </div>

        {/* Paginated Cards */}
        <div className="relative min-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center max-w-2xl mx-auto"
            >
              {pages[currentPage].map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentPage === index
                  ? 'bg-primary w-6'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  const LinkComponent = tool.external ? 'a' : Link
  const linkProps = tool.external
    ? { href: tool.href, target: '_blank', rel: 'noopener noreferrer' }
    : { href: tool.href }

  return (
    <LinkComponent
      {...linkProps}
      className="group flex items-center gap-4 w-full max-w-[300px] p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {tool.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-primary transition-colors flex items-center gap-1">
          {tool.title}
          {tool.external && (
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          )}
        </h3>
        <p className="text-xs text-slate-500 leading-tight mt-0.5">{tool.description}</p>
      </div>

      {/* Arrow */}
      <svg className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </LinkComponent>
  )
}
