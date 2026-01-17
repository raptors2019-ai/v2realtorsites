'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  calculateMortgage,
  formatCurrency,
  formatPercent,
  DEFAULT_INTEREST_RATE,
  DEFAULT_AMORTIZATION_YEARS,
} from '@repo/calculators'
import { CalculatorCard, InputField, SelectField, ResultRow, ResultCard, InfoBox } from '../CalculatorCard'

interface MortgageCalculatorProps {
  onClose: () => void
}

export function MortgageCalculator({ onClose }: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState('500000')
  const [downPayment, setDownPayment] = useState('50000')
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE.toString())
  const [amortization, setAmortization] = useState(DEFAULT_AMORTIZATION_YEARS.toString())

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    const down = parseFloat(downPayment) || 0
    const rate = parseFloat(interestRate) || DEFAULT_INTEREST_RATE
    const years = parseInt(amortization) || DEFAULT_AMORTIZATION_YEARS

    if (price <= 0 || down < 0 || down >= price) return null

    return calculateMortgage({
      homePrice: price,
      downPayment: down,
      interestRate: rate,
      amortizationYears: years,
    })
  }, [homePrice, downPayment, interestRate, amortization])

  const amortizationOptions = [
    { value: '15', label: '15 years' },
    { value: '20', label: '20 years' },
    { value: '25', label: '25 years (most common)' },
    { value: '30', label: '30 years' },
  ]

  return (
    <CalculatorCard title="Mortgage Calculator" onClose={onClose}>
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
              helpText={result ? `${formatPercent(result.downPaymentPercent)} of home price` : undefined}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Interest Rate"
              value={interestRate}
              onChange={setInterestRate}
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

            <ResultCard title="Your Monthly Payment" variant="highlight">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tight">
                  {formatCurrency(result.monthlyPayment)}
                </span>
                <span className="text-lg text-white/50">/month</span>
              </div>
              <p className="text-sm text-white/60 mt-3">
                Principal & Interest only. Property taxes and insurance not included.
              </p>
            </ResultCard>

            <ResultCard title="Mortgage Details">
              <div className="divide-y divide-slate-100">
                <ResultRow
                  label="Mortgage Amount"
                  value={formatCurrency(result.mortgageAmount)}
                />
                <ResultRow
                  label="Down Payment"
                  value={`${formatCurrency(parseFloat(downPayment))} (${formatPercent(result.downPaymentPercent)})`}
                />
                <ResultRow
                  label="Total Interest Paid"
                  value={formatCurrency(result.totalInterest)}
                  subtext={`Over ${amortization} years`}
                />
                <ResultRow
                  label="Total Cost of Mortgage"
                  value={formatCurrency(result.totalCost)}
                  highlight
                />
              </div>
            </ResultCard>

            {result.downPaymentPercent < 20 && (
              <InfoBox variant="warning">
                <strong>CMHC Insurance Required:</strong> With less than 20% down,
                you&apos;ll need mortgage default insurance. Use our CMHC Calculator
                to see the premium amount.
              </InfoBox>
            )}
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  )
}
