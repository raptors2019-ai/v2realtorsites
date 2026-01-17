'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  calculateCMHC,
  getCMHCRateDescription,
  getMinimumDownPayment,
  formatCurrency,
  formatPercent,
} from '@repo/calculators'
import { CalculatorCard, InputField, ResultRow, ResultCard, InfoBox } from '../CalculatorCard'

interface CMHCCalculatorProps {
  onClose: () => void
}

export function CMHCCalculator({ onClose }: CMHCCalculatorProps) {
  const [homePrice, setHomePrice] = useState('500000')
  const [downPayment, setDownPayment] = useState('50000')

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    const down = parseFloat(downPayment) || 0
    if (price <= 0 || down < 0) return null

    return calculateCMHC({
      homePrice: price,
      downPayment: down,
    })
  }, [homePrice, downPayment])

  const downPaymentPercent = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    const down = parseFloat(downPayment) || 0
    if (price <= 0) return 0
    return (down / price) * 100
  }, [homePrice, downPayment])

  const minimumDown = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    return getMinimumDownPayment(price)
  }, [homePrice])

  return (
    <CalculatorCard title="CMHC Insurance Calculator" onClose={onClose}>
      <div className="space-y-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Home Price"
              value={homePrice}
              onChange={setHomePrice}
              prefix="$"
              min={0}
            />
            <InputField
              label="Down Payment"
              value={downPayment}
              onChange={setDownPayment}
              prefix="$"
              min={0}
              helpText={`${formatPercent(downPaymentPercent)} of home price`}
            />
          </div>

          {/* Minimum Down Payment Info */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Minimum down payment: {formatCurrency(minimumDown)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  5% on first $500K, 10% on $500K-$1M, 20% over $1M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {result.isRequired ? (
              <>
                <ResultCard title="CMHC Premium Required" variant="highlight">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white tracking-tight">
                      {formatCurrency(result.premium)}
                    </span>
                  </div>
                  <p className="text-sm text-primary-light mt-2">
                    {getCMHCRateDescription(downPaymentPercent)}
                  </p>
                </ResultCard>

                <ResultCard title="Premium Details">
                  <div className="divide-y divide-slate-100">
                    <ResultRow
                      label="Mortgage Amount"
                      value={formatCurrency(result.mortgageAmount)}
                    />
                    <ResultRow
                      label="Down Payment"
                      value={`${formatCurrency(parseFloat(downPayment))} (${formatPercent(downPaymentPercent)})`}
                    />
                    <ResultRow
                      label="Premium Rate"
                      value={formatPercent(result.premiumRate * 100)}
                    />
                    <ResultRow
                      label="CMHC Premium"
                      value={formatCurrency(result.premium)}
                      subtext="Added to your mortgage"
                    />
                    <ResultRow
                      label="PST on Premium (8%)"
                      value={formatCurrency(result.pstOnPremium)}
                      subtext="Paid at closing"
                    />
                    <ResultRow
                      label="Total Insurance Cost"
                      value={formatCurrency(result.totalWithPST)}
                      highlight
                    />
                  </div>
                </ResultCard>

                {/* CMHC Rate Tiers */}
                <ResultCard title="CMHC Rate Tiers">
                  <div className="space-y-2">
                    {[
                      { range: '5% - 9.99%', rate: '4.00%', active: downPaymentPercent >= 5 && downPaymentPercent < 10 },
                      { range: '10% - 14.99%', rate: '3.10%', active: downPaymentPercent >= 10 && downPaymentPercent < 15 },
                      { range: '15% - 19.99%', rate: '2.80%', active: downPaymentPercent >= 15 && downPaymentPercent < 20 },
                      { range: '20%+', rate: 'Not Required', active: downPaymentPercent >= 20 },
                    ].map((tier) => (
                      <div
                        key={tier.range}
                        className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                          tier.active
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-slate-50'
                        }`}
                      >
                        <span className={`text-sm ${tier.active ? 'font-semibold text-primary' : 'text-slate-600'}`}>
                          {tier.range} down
                        </span>
                        <span className={`text-sm font-semibold ${tier.active ? 'text-primary' : 'text-slate-900'}`}>
                          {tier.rate}
                        </span>
                      </div>
                    ))}
                  </div>
                </ResultCard>

                <InfoBox variant="warning">
                  <strong>Payment Note:</strong> The CMHC premium ({formatCurrency(result.premium)}) is typically
                  added to your mortgage, but the PST ({formatCurrency(result.pstOnPremium)}) is paid
                  at closing.
                </InfoBox>
              </>
            ) : (
              <ResultCard title="No Insurance Required" variant="success">
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No CMHC Insurance Required
                  </h3>
                  <p className="text-slate-600">
                    With {formatPercent(downPaymentPercent)} down, you have a conventional
                    mortgage and don&apos;t need mortgage default insurance.
                  </p>
                </div>
              </ResultCard>
            )}
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  )
}
