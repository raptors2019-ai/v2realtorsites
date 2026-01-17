'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  calculateAffordability,
  calculateMortgage,
  calculateCMHC,
  formatCurrency,
  formatPercent,
  getStressTestRate,
  STRESS_TEST_FLOOR,
} from '@repo/calculators'
import { InputField, ResultCard, ResultRow, InfoBox } from '../components/CalculatorCard'

export function MortgageCalculatorClient() {
  const searchParams = useSearchParams()

  // Initialize from URL params or defaults
  const [annualIncome, setAnnualIncome] = useState(
    searchParams.get('income') || '100000'
  )
  const [downPayment, setDownPayment] = useState(
    searchParams.get('downPayment') || '50000'
  )
  const [monthlyDebts, setMonthlyDebts] = useState(
    searchParams.get('debts') || '0'
  )
  const [interestRate, setInterestRate] = useState('4.5')
  const [amortization, setAmortization] = useState('25')

  // Track if we've loaded from URL params
  const [hasLoadedParams, setHasLoadedParams] = useState(false)

  useEffect(() => {
    if (!hasLoadedParams) {
      const incomeParam = searchParams.get('income')
      const downPaymentParam = searchParams.get('downPayment')
      const debtsParam = searchParams.get('debts')

      if (incomeParam) setAnnualIncome(incomeParam)
      if (downPaymentParam) setDownPayment(downPaymentParam)
      if (debtsParam) setMonthlyDebts(debtsParam)

      setHasLoadedParams(true)
    }
  }, [searchParams, hasLoadedParams])

  const affordability = useMemo(() => {
    const income = parseFloat(annualIncome) || 0
    const down = parseFloat(downPayment) || 0
    const debts = parseFloat(monthlyDebts) || 0
    const rate = parseFloat(interestRate) || 4.5

    if (income <= 0) return null

    return calculateAffordability({
      annualIncome: income,
      downPayment: down,
      monthlyDebts: debts,
      interestRate: rate,
    })
  }, [annualIncome, downPayment, monthlyDebts, interestRate])

  const mortgageDetails = useMemo(() => {
    if (!affordability) return null

    const rate = parseFloat(interestRate) || 4.5
    const years = parseInt(amortization) || 25

    return calculateMortgage({
      homePrice: affordability.maxHomePrice,
      downPayment: parseFloat(downPayment) || 0,
      interestRate: rate,
      amortizationYears: years,
    })
  }, [affordability, interestRate, amortization, downPayment])

  const cmhcDetails = useMemo(() => {
    if (!affordability) return null

    return calculateCMHC({
      homePrice: affordability.maxHomePrice,
      downPayment: parseFloat(downPayment) || 0,
    })
  }, [affordability, downPayment])

  const stressTestRate = useMemo(() => {
    const rate = parseFloat(interestRate) || 4.5
    return getStressTestRate(rate)
  }, [interestRate])

  // Build search URL with budget
  const searchUrl = affordability
    ? `/properties?budgetMax=${affordability.maxHomePrice}`
    : '/properties'

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Financial Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Annual Household Income"
            value={annualIncome}
            onChange={setAnnualIncome}
            prefix="$"
            min={0}
            helpText="Combined gross income before taxes"
          />
          <InputField
            label="Down Payment Saved"
            value={downPayment}
            onChange={setDownPayment}
            prefix="$"
            min={0}
            helpText="Total savings for down payment"
          />
          <InputField
            label="Monthly Debt Payments"
            value={monthlyDebts}
            onChange={setMonthlyDebts}
            prefix="$"
            min={0}
            helpText="Car loans, credit cards, etc."
          />
          <InputField
            label="Interest Rate"
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            step={0.1}
            min={0}
            max={15}
            helpText="Current mortgage rates"
          />
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Stress Test Rate: {formatPercent(stressTestRate)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Canadian lenders qualify you at the higher of {formatPercent(STRESS_TEST_FLOOR)} or your rate + 2%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {affordability && mortgageDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Main Result Card */}
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-8 text-white shadow-xl">
            <h3 className="text-lg font-medium text-white/80 mb-2">You Can Afford Up To</h3>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-5xl md:text-6xl font-bold">
                {formatCurrency(affordability.maxHomePrice)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <p className="text-sm text-white/60">Monthly Payment</p>
                <p className="text-xl font-semibold">{formatCurrency(affordability.monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Mortgage Amount</p>
                <p className="text-xl font-semibold">{formatCurrency(affordability.mortgageAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Down Payment</p>
                <p className="text-xl font-semibold">{formatPercent(affordability.downPaymentPercent)}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">GDS Ratio</p>
                <p className="text-xl font-semibold">{affordability.gdsRatio}%</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Ready to Find Your Home?</h3>
              <p className="text-slate-600">Search properties within your budget</p>
            </div>
            <Link
              href={searchUrl}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Search Properties Up to {formatCurrency(affordability.maxHomePrice)}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Costs */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Housing Costs</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Mortgage Payment</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(affordability.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Property Tax (est.)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(affordability.monthlyPropertyTax)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Heating (est.)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(affordability.monthlyHeating)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-slate-50 -mx-6 px-6 rounded-lg">
                  <span className="font-semibold text-slate-900">Total Monthly</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(affordability.totalMonthlyHousing)}</span>
                </div>
              </div>
            </div>

            {/* Mortgage Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Mortgage Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Interest</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(mortgageDetails.totalInterest)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Total Cost of Home</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(mortgageDetails.totalCost)}</span>
                </div>
                {cmhcDetails?.isRequired && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">CMHC Premium</span>
                      <span className="font-semibold text-amber-600">{formatCurrency(cmhcDetails.premium)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">CMHC PST (due at closing)</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(cmhcDetails.pstOnPremium)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center py-2 bg-slate-50 -mx-6 px-6 rounded-lg">
                  <span className="font-semibold text-slate-900">Amortization</span>
                  <span className="font-bold text-primary">{amortization} years</span>
                </div>
              </div>
            </div>
          </div>

          {/* CMHC Notice */}
          {cmhcDetails?.isRequired && (
            <InfoBox variant="warning">
              <strong>CMHC Insurance Required:</strong> With {formatPercent(affordability.downPaymentPercent)} down payment,
              mortgage default insurance of {formatCurrency(cmhcDetails.premium)} will be added to your mortgage.
              The PST of {formatCurrency(cmhcDetails.pstOnPremium)} is due at closing.
            </InfoBox>
          )}

          {/* Disclaimer */}
          <p className="text-sm text-slate-500 text-center">
            These calculations are estimates based on standard Canadian mortgage rules.
            Actual qualification depends on your credit score, employment, and lender requirements.
          </p>
        </motion.div>
      )}
    </div>
  )
}
