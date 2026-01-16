'use client'

import { useState, useMemo } from 'react'
import { calculateMortgage, formatPrice, type MortgageCalculatorResult } from '@repo/lib'

interface MortgageCalculatorProps {
  defaultHomePrice?: number
  defaultDownPayment?: number
  defaultInterestRate?: number
}

export function MortgageCalculator({
  defaultHomePrice = 800000,
  defaultDownPayment = 80000,
  defaultInterestRate = 4.5,
}: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState(defaultHomePrice)
  const [downPayment, setDownPayment] = useState(defaultDownPayment)
  const [interestRate, setInterestRate] = useState(defaultInterestRate)
  const [amortization, setAmortization] = useState<25 | 30>(25)
  const [paymentFrequency, setPaymentFrequency] = useState<'monthly' | 'biweekly' | 'accelerated-biweekly'>('monthly')

  const result: MortgageCalculatorResult = useMemo(() => {
    return calculateMortgage({
      homePrice,
      downPayment,
      interestRate,
      amortizationYears: amortization,
      paymentFrequency,
    })
  }, [homePrice, downPayment, interestRate, amortization, paymentFrequency])

  const downPaymentPercent = (downPayment / homePrice) * 100
  const minDownPayment = homePrice <= 500000
    ? homePrice * 0.05
    : 500000 * 0.05 + (homePrice - 500000) * 0.1

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-primary p-4">
        <h2 className="text-xl font-semibold text-white">Mortgage Calculator</h2>
        <p className="text-primary-foreground/80 text-sm mt-1">Calculate your monthly mortgage payments</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Home Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                min={100000}
                step={10000}
              />
            </div>
            <input
              type="range"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              min={100000}
              max={3000000}
              step={10000}
              className="w-full mt-2 accent-primary"
            />
          </div>

          {/* Down Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment ({downPaymentPercent.toFixed(1)}%)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                min={minDownPayment}
                step={5000}
              />
            </div>
            <input
              type="range"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              min={minDownPayment}
              max={homePrice * 0.5}
              step={5000}
              className="w-full mt-2 accent-primary"
            />
            {downPaymentPercent < 20 && (
              <p className="text-amber-600 text-xs mt-1">CMHC insurance required (less than 20% down)</p>
            )}
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate
            </label>
            <div className="relative">
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full pr-8 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                min={1}
                max={15}
                step={0.1}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <input
              type="range"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              min={1}
              max={10}
              step={0.1}
              className="w-full mt-2 accent-primary"
            />
          </div>

          {/* Amortization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amortization Period
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAmortization(25)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  amortization === 25
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                25 Years
              </button>
              <button
                onClick={() => setAmortization(30)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                  amortization === 30
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                30 Years
              </button>
            </div>
          </div>
        </div>

        {/* Payment Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Frequency
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'monthly', label: 'Monthly' },
              { value: 'biweekly', label: 'Bi-weekly' },
              { value: 'accelerated-biweekly', label: 'Accelerated Bi-weekly' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPaymentFrequency(value as typeof paymentFrequency)}
                className={`py-2 px-4 rounded-lg border-2 font-medium transition-colors text-sm ${
                  paymentFrequency === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-xl p-6 mt-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">{result.paymentFrequency} Payment</p>
            <p className="text-4xl font-bold text-primary">{formatPrice(result.payment)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Mortgage Amount</p>
              <p className="text-lg font-semibold">{formatPrice(result.mortgageAmount)}</p>
            </div>
            {result.cmhcRequired && (
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">CMHC Premium</p>
                <p className="text-lg font-semibold text-amber-600">{formatPrice(result.cmhcPremium)}</p>
              </div>
            )}
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Interest</p>
              <p className="text-lg font-semibold">{formatPrice(result.totalInterest)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-lg font-semibold">{formatPrice(result.totalCost)}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          This calculator provides estimates only. Contact a mortgage professional for accurate quotes.
        </p>
      </div>
    </div>
  )
}
