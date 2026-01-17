'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MortgageCalculator } from './calculators/MortgageCalculator'
import { LandTransferTaxCalculator } from './calculators/LandTransferTaxCalculator'
import { ClosingCostsCalculator } from './calculators/ClosingCostsCalculator'
import { CMHCCalculator } from './calculators/CMHCCalculator'
import { RequiredIncomeCalculator } from './calculators/RequiredIncomeCalculator'
import { StressTestCalculator } from './calculators/StressTestCalculator'
import { PropertyTaxCalculator } from './calculators/PropertyTaxCalculator'

type CalculatorType =
  | 'mortgage'
  | 'ltt'
  | 'closing-costs'
  | 'cmhc'
  | 'required-income'
  | 'stress-test'
  | 'property-tax'
  | null

interface CalculatorConfig {
  id: CalculatorType
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  iconBg: string
}

const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const CashIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const calculators: CalculatorConfig[] = [
  {
    id: 'mortgage',
    title: 'Mortgage Calculator',
    description: 'Calculate monthly payments based on home price, down payment, and interest rate.',
    icon: <HomeIcon />,
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'ltt',
    title: 'Land Transfer Tax',
    description: 'Calculate Ontario and Toronto land transfer taxes with first-time buyer rebates.',
    icon: <DocumentIcon />,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/10 text-violet-600',
  },
  {
    id: 'closing-costs',
    title: 'Closing Costs',
    description: 'Estimate total closing costs including LTT, legal fees, and other expenses.',
    icon: <CashIcon />,
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    id: 'cmhc',
    title: 'CMHC Insurance',
    description: 'Calculate mortgage insurance premium for down payments under 20%.',
    icon: <ShieldIcon />,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
  {
    id: 'required-income',
    title: 'Required Income',
    description: 'Find out how much income you need to qualify for your target home.',
    icon: <ChartIcon />,
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-500/10 text-rose-600',
  },
  {
    id: 'stress-test',
    title: 'Stress Test',
    description: 'See how the mortgage stress test affects your qualification rate.',
    icon: <TrendingIcon />,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/10 text-cyan-600',
  },
  {
    id: 'property-tax',
    title: 'Property Tax',
    description: 'Compare property tax rates across GTA municipalities.',
    icon: <BuildingIcon />,
    gradient: 'from-slate-500 to-slate-700',
    iconBg: 'bg-slate-500/10 text-slate-600',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
}

export function ToolsPageClient() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(null)

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'mortgage':
        return <MortgageCalculator onClose={() => setActiveCalculator(null)} />
      case 'ltt':
        return <LandTransferTaxCalculator onClose={() => setActiveCalculator(null)} />
      case 'closing-costs':
        return <ClosingCostsCalculator onClose={() => setActiveCalculator(null)} />
      case 'cmhc':
        return <CMHCCalculator onClose={() => setActiveCalculator(null)} />
      case 'required-income':
        return <RequiredIncomeCalculator onClose={() => setActiveCalculator(null)} />
      case 'stress-test':
        return <StressTestCalculator onClose={() => setActiveCalculator(null)} />
      case 'property-tax':
        return <PropertyTaxCalculator onClose={() => setActiveCalculator(null)} />
      default:
        return null
    }
  }

  const activeCalc = calculators.find((c) => c.id === activeCalculator)

  return (
    <AnimatePresence mode="wait">
      {activeCalculator ? (
        <motion.div
          key="calculator"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-2xl mx-auto"
        >
          {renderCalculator()}
        </motion.div>
      ) : (
        <motion.div
          key="grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Choose a Calculator
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Select a tool below to get started with your home buying calculations
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {calculators.map((calc) => (
              <motion.button
                key={calc.id}
                variants={cardVariants}
                onClick={() => setActiveCalculator(calc.id)}
                className="group relative bg-white rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 hover:border-slate-200 overflow-hidden"
              >
                {/* Gradient Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${calc.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

                {/* Top Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${calc.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${calc.iconBg} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  {calc.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
                  {calc.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {calc.description}
                </p>

                {/* CTA */}
                <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Open Calculator
                  <svg
                    className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>

                {/* Arrow Icon (visible by default on mobile) */}
                <div className="absolute top-6 right-6 text-slate-300 group-hover:text-primary transition-colors md:opacity-0 md:group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Help Text */}
          <motion.p
            variants={cardVariants}
            className="text-center text-sm text-slate-400 mt-10"
          >
            All calculations are estimates based on standard Canadian mortgage rules
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
