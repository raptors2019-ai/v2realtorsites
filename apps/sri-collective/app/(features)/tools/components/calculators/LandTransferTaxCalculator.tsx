'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  calculateLandTransferTax,
  formatCurrency,
} from '@repo/calculators'
import { CalculatorCard, InputField, CheckboxField, ResultRow, ResultCard, InfoBox } from '../CalculatorCard'

interface LandTransferTaxCalculatorProps {
  onClose: () => void
}

export function LandTransferTaxCalculator({ onClose }: LandTransferTaxCalculatorProps) {
  const [homePrice, setHomePrice] = useState('500000')
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [isTorontoProperty, setIsTorontoProperty] = useState(false)

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    if (price <= 0) return null

    return calculateLandTransferTax({
      homePrice: price,
      isFirstTimeBuyer,
      isTorontoProperty,
    })
  }, [homePrice, isFirstTimeBuyer, isTorontoProperty])

  return (
    <CalculatorCard title="Land Transfer Tax Calculator" onClose={onClose}>
      <div className="space-y-8">
        {/* Inputs */}
        <div className="space-y-5">
          <InputField
            label="Home Price"
            value={homePrice}
            onChange={setHomePrice}
            prefix="$"
            min={0}
          />

          <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Eligibility
            </p>
            <CheckboxField
              label="I am a first-time home buyer"
              checked={isFirstTimeBuyer}
              onChange={setIsFirstTimeBuyer}
              description="Eligible for Ontario rebate (up to $4,000) and Toronto rebate (up to $4,475)"
            />
            <CheckboxField
              label="This property is in Toronto"
              checked={isTorontoProperty}
              onChange={setIsTorontoProperty}
              description="Toronto has an additional Municipal Land Transfer Tax"
            />
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

            <ResultCard
              title={result.totalRebate > 0 ? "Net Land Transfer Tax" : "Total Land Transfer Tax"}
              variant="highlight"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tight">
                  {formatCurrency(result.netLTT)}
                </span>
              </div>
              {result.totalRebate > 0 && (
                <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You save {formatCurrency(result.totalRebate)} with first-time buyer rebates
                </p>
              )}
            </ResultCard>

            <ResultCard title="Tax Breakdown">
              <div className="divide-y divide-slate-100">
                <ResultRow
                  label="Ontario Land Transfer Tax"
                  value={formatCurrency(result.ontarioLTT)}
                />
                {isTorontoProperty && (
                  <ResultRow
                    label="Toronto Municipal LTT"
                    value={formatCurrency(result.torontoLTT)}
                  />
                )}
                {!isFirstTimeBuyer && (
                  <ResultRow
                    label="Total"
                    value={formatCurrency(result.totalLTT)}
                    highlight
                  />
                )}

                {isFirstTimeBuyer && (
                  <>
                    <ResultRow
                      label="Total Before Rebates"
                      value={formatCurrency(result.totalLTT)}
                    />
                    <div className="py-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
                        First-Time Buyer Rebates
                      </p>
                    </div>
                    <ResultRow
                      label="Ontario Rebate"
                      value={`-${formatCurrency(result.ontarioRebate)}`}
                    />
                    {isTorontoProperty && result.torontoRebate > 0 && (
                      <ResultRow
                        label="Toronto Rebate"
                        value={`-${formatCurrency(result.torontoRebate)}`}
                      />
                    )}
                    <ResultRow
                      label="Net Amount Payable"
                      value={formatCurrency(result.netLTT)}
                      highlight
                    />
                  </>
                )}
              </div>
            </ResultCard>

            {!isFirstTimeBuyer && (
              <InfoBox variant="tip">
                <strong>First-time buyer?</strong> You could save up to{' '}
                {formatCurrency(isTorontoProperty ? 8475 : 4000)} in rebates.
                Check the box above to see your savings!
              </InfoBox>
            )}
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  )
}
