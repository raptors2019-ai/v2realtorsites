'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  calculateClosingCosts,
  formatCurrency,
} from '@repo/calculators'
import { CalculatorCard, InputField, CheckboxField, ResultRow, ResultCard, InfoBox } from '../CalculatorCard'

interface ClosingCostsCalculatorProps {
  onClose: () => void
}

export function ClosingCostsCalculator({ onClose }: ClosingCostsCalculatorProps) {
  const [homePrice, setHomePrice] = useState('500000')
  const [downPayment, setDownPayment] = useState('50000')
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [isTorontoProperty, setIsTorontoProperty] = useState(false)

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    const down = parseFloat(downPayment) || 0
    if (price <= 0 || down < 0) return null

    return calculateClosingCosts({
      homePrice: price,
      downPayment: down,
      isFirstTimeBuyer,
      isTorontoProperty,
    })
  }, [homePrice, downPayment, isFirstTimeBuyer, isTorontoProperty])

  return (
    <CalculatorCard title="Closing Costs Calculator" onClose={onClose}>
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
            />
          </div>

          <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Property Details
            </p>
            <CheckboxField
              label="I am a first-time home buyer"
              checked={isFirstTimeBuyer}
              onChange={setIsFirstTimeBuyer}
              description="Eligible for LTT rebates"
            />
            <CheckboxField
              label="This property is in Toronto"
              checked={isTorontoProperty}
              onChange={setIsTorontoProperty}
              description="Includes Toronto Municipal LTT"
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

            <ResultCard title="Total Cash Needed at Closing" variant="highlight">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tight">
                  {formatCurrency(result.cashNeeded)}
                </span>
              </div>
              <p className="text-sm text-white/60 mt-2">
                Down payment ({formatCurrency(parseFloat(downPayment))}) + closing costs ({formatCurrency(result.totalClosingCosts)})
              </p>
            </ResultCard>

            <ResultCard title="Closing Costs Breakdown">
              <div className="divide-y divide-slate-100">
                <ResultRow
                  label="Land Transfer Tax"
                  value={formatCurrency(result.landTransferTax.netLTT)}
                  subtext={isFirstTimeBuyer ? 'After first-time buyer rebates' : undefined}
                />
                {result.cmhc.isRequired && (
                  <ResultRow
                    label="CMHC PST"
                    value={formatCurrency(result.cmhc.pstOnPremium)}
                    subtext={`Premium of ${formatCurrency(result.cmhc.premium)} added to mortgage`}
                  />
                )}
                <ResultRow
                  label="Legal Fees"
                  value={formatCurrency(result.legalFees)}
                />
                <ResultRow
                  label="Title Insurance"
                  value={formatCurrency(result.titleInsurance)}
                />
                <ResultRow
                  label="Home Inspection"
                  value={formatCurrency(result.homeInspection)}
                />
                <ResultRow
                  label="Appraisal"
                  value={formatCurrency(result.appraisal)}
                />
                <ResultRow
                  label="Adjustments"
                  value={formatCurrency(result.adjustments)}
                  subtext="Prepaid property tax, utilities, etc."
                />
                <ResultRow
                  label="Total Closing Costs"
                  value={formatCurrency(result.totalClosingCosts)}
                  highlight
                />
              </div>
            </ResultCard>

            <ResultCard title="Summary" variant="default">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Down Payment</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(parseFloat(downPayment))}</p>
                </div>
                <div className="text-center p-4 bg-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Closing Costs</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(result.totalClosingCosts)}</p>
                </div>
              </div>
            </ResultCard>

            {result.cmhc.isRequired && (
              <InfoBox variant="info">
                <strong>CMHC Note:</strong> The insurance premium of {formatCurrency(result.cmhc.premium)} is
                added to your mortgage, but the PST of {formatCurrency(result.cmhc.pstOnPremium)} must be
                paid at closing.
              </InfoBox>
            )}
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  )
}
