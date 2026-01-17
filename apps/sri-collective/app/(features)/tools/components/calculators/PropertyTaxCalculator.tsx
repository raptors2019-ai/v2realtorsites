'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  calculatePropertyTax,
  comparePropertyTaxes,
  getGTACities,
  formatCurrency,
  formatPercent,
} from '@repo/calculators'
import { CalculatorCard, InputField, SelectField, ResultRow, ResultCard, InfoBox } from '../CalculatorCard'

interface PropertyTaxCalculatorProps {
  onClose: () => void
}

export function PropertyTaxCalculator({ onClose }: PropertyTaxCalculatorProps) {
  const [homePrice, setHomePrice] = useState('500000')
  const [city, setCity] = useState('toronto')
  const [showComparison, setShowComparison] = useState(false)

  const cities = getGTACities()
  const cityOptions = cities.map((c) => ({
    value: c.city,
    label: c.displayName,
  }))

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    if (price <= 0) return null

    return calculatePropertyTax({
      homePrice: price,
      city,
    })
  }, [homePrice, city])

  const comparison = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    if (price <= 0) return []

    return comparePropertyTaxes(price)
  }, [homePrice])

  const selectedCityRank = comparison.findIndex((c) => c.city === result?.city) + 1

  return (
    <CalculatorCard title="Property Tax Calculator" onClose={onClose}>
      <div className="space-y-8">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Home Price"
            value={homePrice}
            onChange={setHomePrice}
            prefix="$"
            min={0}
          />
          <SelectField
            label="City / Municipality"
            value={city}
            onChange={setCity}
            options={cityOptions}
          />
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <ResultCard title="Annual Property Tax" variant="highlight">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tight">
                  {formatCurrency(result.annualTax)}
                </span>
                <span className="text-lg text-white/50">/year</span>
              </div>
              <p className="text-sm text-white/60 mt-2">
                {formatCurrency(result.monthlyTax)}/month
              </p>
            </ResultCard>

            <ResultCard title="Tax Details">
              <div className="divide-y divide-slate-100">
                <ResultRow
                  label="Municipality"
                  value={result.city}
                />
                <ResultRow
                  label="Tax Rate"
                  value={formatPercent(result.taxRate * 100, 2)}
                />
                <ResultRow
                  label="Home Value"
                  value={formatCurrency(parseFloat(homePrice))}
                />
                <ResultRow
                  label="Monthly Amount"
                  value={formatCurrency(result.monthlyTax)}
                  highlight
                />
              </div>
            </ResultCard>

            {/* Comparison Toggle */}
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="w-full py-3.5 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {showComparison ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Hide Comparison
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Compare All 16 GTA Cities
                </>
              )}
            </button>

            {/* City Comparison */}
            <AnimatePresence>
              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResultCard title={`Property Tax Comparison (${result.city} ranks #${selectedCityRank} lowest)`}>
                    <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
                      {comparison.map((item, idx) => {
                        const isSelected = item.city === result.city
                        const isLowest = idx === 0
                        const isHighest = idx === comparison.length - 1

                        return (
                          <motion.div
                            key={item.city}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`
                              flex justify-between items-center py-2.5 px-3 rounded-lg
                              ${isSelected
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-slate-50'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                ${isLowest
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : isHighest
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-slate-100 text-slate-600'
                                }
                              `}>
                                {idx + 1}
                              </span>
                              <span className={`font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                {item.city}
                              </span>
                              {isLowest && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                  Lowest
                                </span>
                              )}
                              {isHighest && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                  Highest
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                                {formatCurrency(item.annualTax)}
                              </span>
                              <span className="text-xs text-slate-400 ml-2">
                                ({formatPercent(item.rate * 100, 2)})
                              </span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </ResultCard>
                </motion.div>
              )}
            </AnimatePresence>

            <InfoBox variant="info">
              Property tax rates are approximate and based on 2025 municipal rates.
              Actual taxes depend on your property&apos;s assessed value by MPAC.
            </InfoBox>
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  )
}
