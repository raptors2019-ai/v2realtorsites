'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  calculateStressTest,
  formatCurrency,
  formatPercent,
  STRESS_TEST_FLOOR,
} from '@repo/calculators'
import { CalculatorCard, InputField, SelectField, ResultRow, ResultCard, InfoBox } from '../CalculatorCard'

interface StressTestCalculatorProps {
  onClose: () => void
}

export function StressTestCalculator({ onClose }: StressTestCalculatorProps) {
  const [homePrice, setHomePrice] = useState('500000')
  const [downPayment, setDownPayment] = useState('50000')
  const [contractRate, setContractRate] = useState('4.5')
  const [amortization, setAmortization] = useState('25')

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    const down = parseFloat(downPayment) || 0
    const rate = parseFloat(contractRate) || 4.5
    const years = parseInt(amortization) || 25

    if (price <= 0 || down < 0 || down >= price) return null

    return calculateStressTest({
      homePrice: price,
      downPayment: down,
      contractRate: rate,
      amortizationYears: years,
    })
  }, [homePrice, downPayment, contractRate, amortization])

  const amortizationOptions = [
    { value: '15', label: '15 years' },
    { value: '20', label: '20 years' },
    { value: '25', label: '25 years' },
    { value: '30', label: '30 years' },
  ]

  return (
    <CalculatorCard title="Stress Test Calculator" onClose={onClose}>
      <div className="space-y-8">
        {/* Info Box */}
        <InfoBox variant="info">
          <strong>What is the stress test?</strong> Canadian lenders must qualify
          you at the higher of your contract rate + 2% or the floor rate of{' '}
          {formatPercent(STRESS_TEST_FLOOR)}. This ensures you can afford payments
          if rates rise.
        </InfoBox>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Contract Rate (Offered by Lender)"
              value={contractRate}
              onChange={setContractRate}
              suffix="% / year"
              step={0.01}
              min={0}
              max={20}
            />
            <SelectField
              label="Amortization Period"
              value={amortization}
              onChange={setAmortization}
              options={amortizationOptions}
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

            {/* Rate Comparison */}
            <ResultCard title="Rate Comparison" variant="highlight">
              <div className="flex items-center justify-between gap-4">
                <div className="text-center flex-1">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Contract Rate</p>
                  <p className="text-3xl font-bold text-white">{formatPercent(result.contractRate)}</p>
                  <p className="text-xs text-white/50 mt-1">What you&apos;ll pay</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
                  <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-primary-light uppercase tracking-wider mb-1">Stress Test Rate</p>
                  <p className="text-3xl font-bold text-primary-light">{formatPercent(result.stressTestRate)}</p>
                  <p className="text-xs text-white/50 mt-1">Qualification rate</p>
                </div>
              </div>
            </ResultCard>

            <ResultCard title="Payment Comparison">
              <div className="divide-y divide-slate-100">
                <ResultRow
                  label="Payment at Contract Rate"
                  value={formatCurrency(result.contractPayment)}
                  subtext={`Your actual monthly payment at ${formatPercent(result.contractRate)}`}
                />
                <ResultRow
                  label="Payment at Stress Test Rate"
                  value={formatCurrency(result.stressTestPayment)}
                  subtext={`What lenders qualify you at (${formatPercent(result.stressTestRate)})`}
                />
                <ResultRow
                  label="Payment Increase"
                  value={`+${formatCurrency(result.paymentIncrease)}`}
                  subtext={`${formatPercent(result.paymentIncreasePercent)} higher`}
                  highlight
                />
              </div>
            </ResultCard>

            <ResultCard title="Income Required to Qualify" variant="default">
              <div className="text-center py-3">
                <p className="text-4xl font-bold text-slate-900">
                  {formatCurrency(result.qualifyingIncome)}
                </p>
                <p className="text-sm text-slate-600 mt-2">Annual household income needed</p>
              </div>
            </ResultCard>

            <InfoBox variant="tip">
              <strong>Good news:</strong> You&apos;ll actually pay the lower contract rate
              ({formatCurrency(result.contractPayment)}/month), not the stress test rate.
              The stress test just ensures you can handle potential rate increases.
            </InfoBox>
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  )
}
