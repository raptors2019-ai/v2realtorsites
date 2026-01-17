'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  calculateRequiredIncome,
  formatCurrency,
  formatPercent,
  DEFAULT_INTEREST_RATE,
} from '@repo/calculators'
import { CalculatorCard, InputField, ResultRow, ResultCard, InfoBox, ProgressBar } from '../CalculatorCard'

interface RequiredIncomeCalculatorProps {
  onClose: () => void
}

export function RequiredIncomeCalculator({ onClose }: RequiredIncomeCalculatorProps) {
  const [homePrice, setHomePrice] = useState('500000')
  const [downPayment, setDownPayment] = useState('50000')
  const [monthlyDebts, setMonthlyDebts] = useState('0')
  const [interestRate, setInterestRate] = useState(DEFAULT_INTEREST_RATE.toString())

  const result = useMemo(() => {
    const price = parseFloat(homePrice) || 0
    const down = parseFloat(downPayment) || 0
    const debts = parseFloat(monthlyDebts) || 0
    const rate = parseFloat(interestRate) || DEFAULT_INTEREST_RATE

    if (price <= 0 || down < 0 || down >= price) return null

    return calculateRequiredIncome({
      homePrice: price,
      downPayment: down,
      monthlyDebts: debts,
      interestRate: rate,
    })
  }, [homePrice, downPayment, monthlyDebts, interestRate])

  return (
    <CalculatorCard title="Required Income Calculator" onClose={onClose}>
      <div className="space-y-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Target Home Price"
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
              label="Monthly Debts"
              value={monthlyDebts}
              onChange={setMonthlyDebts}
              prefix="$"
              min={0}
              helpText="Car, student loans, credit cards, etc."
            />
            <InputField
              label="Interest Rate"
              value={interestRate}
              onChange={setInterestRate}
              suffix="% / year"
              step={0.01}
              min={0}
              max={20}
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

            <ResultCard title="Required Annual Income" variant="highlight">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tight">
                  {formatCurrency(result.requiredAnnualIncome)}
                </span>
                <span className="text-lg text-white/50">/year</span>
              </div>
              <p className="text-sm text-white/60 mt-2">
                {formatCurrency(result.requiredMonthlyIncome)}/month gross household income
              </p>
            </ResultCard>

            <ResultCard title="Monthly Housing Costs">
              <div className="divide-y divide-slate-100">
                <ResultRow
                  label="Mortgage Payment"
                  value={formatCurrency(result.monthlyPayment)}
                  subtext="Calculated at stress test rate"
                />
                <ResultRow
                  label="Property Tax (est.)"
                  value={formatCurrency(result.monthlyPropertyTax)}
                />
                <ResultRow
                  label="Heating (est.)"
                  value={formatCurrency(result.monthlyHeating)}
                />
                <ResultRow
                  label="Total Housing Costs"
                  value={formatCurrency(result.totalMonthlyHousing)}
                  highlight
                />
              </div>
            </ResultCard>

            <ResultCard title="Debt Service Ratios">
              <div className="space-y-5">
                <ProgressBar
                  label="GDS Ratio (Gross Debt Service)"
                  value={result.gdsRatio}
                  max={39}
                  color={result.gdsRatio > 39 ? 'danger' : 'primary'}
                />
                <ProgressBar
                  label="TDS Ratio (Total Debt Service)"
                  value={result.tdsRatio}
                  max={44}
                  color={result.tdsRatio > 44 ? 'danger' : 'primary'}
                />
              </div>
            </ResultCard>

            <InfoBox variant="info">
              <strong>How this works:</strong> Canadian lenders use GDS (housing costs / income)
              and TDS (housing + debts / income) ratios to determine affordability. Maximum limits
              are typically 39% and 44% respectively.
            </InfoBox>
          </motion.div>
        )}
      </div>
    </CalculatorCard>
  )
}
