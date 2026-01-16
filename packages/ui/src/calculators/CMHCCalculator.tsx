'use client'

import { useState, useMemo } from 'react'
import { calculateCMHC, formatPrice, CMHC_RATES, type CMHCCalculatorResult } from '@repo/lib'

interface CMHCCalculatorProps {
  defaultHomePrice?: number
  defaultDownPayment?: number
}

export function CMHCCalculator({
  defaultHomePrice = 600000,
  defaultDownPayment = 60000,
}: CMHCCalculatorProps) {
  const [homePrice, setHomePrice] = useState(defaultHomePrice)
  const [downPayment, setDownPayment] = useState(defaultDownPayment)
  const [amortization, setAmortization] = useState<25 | 30>(25)
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [isNewBuild, setIsNewBuild] = useState(false)

  const mortgageAmount = homePrice - downPayment
  const downPaymentPercent = (downPayment / homePrice) * 100

  const result: CMHCCalculatorResult = useMemo(() => {
    return calculateCMHC({
      mortgageAmount,
      downPaymentPercent,
      amortizationYears: amortization,
      isFirstTimeBuyer,
      isNewBuild,
    })
  }, [mortgageAmount, downPaymentPercent, amortization, isFirstTimeBuyer, isNewBuild])

  const minDownPayment = homePrice <= 500000
    ? homePrice * 0.05
    : 500000 * 0.05 + (homePrice - 500000) * 0.1

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-amber-500 p-4">
        <h2 className="text-xl font-semibold text-white">CMHC Insurance Calculator</h2>
        <p className="text-white/80 text-sm mt-1">Calculate mortgage default insurance premium</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Rate Reference Table */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-medium text-amber-800 mb-3">CMHC Premium Rates</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">5% - 9.99% down:</div>
            <div className="font-medium">{(CMHC_RATES.TIER_1.rate * 100).toFixed(2)}%</div>
            <div className="text-gray-600">10% - 14.99% down:</div>
            <div className="font-medium">{(CMHC_RATES.TIER_2.rate * 100).toFixed(2)}%</div>
            <div className="text-gray-600">15% - 19.99% down:</div>
            <div className="font-medium">{(CMHC_RATES.TIER_3.rate * 100).toFixed(2)}%</div>
            <div className="text-gray-600">20%+ down:</div>
            <div className="font-medium text-green-600">Not Required</div>
          </div>
        </div>

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
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                min={100000}
                step={10000}
              />
            </div>
            {homePrice > 1500000 && (
              <p className="text-red-600 text-xs mt-1">
                Homes over $1.5M require 20%+ down payment (not insurable)
              </p>
            )}
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
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                min={minDownPayment}
                step={5000}
              />
            </div>
            <input
              type="range"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              min={minDownPayment}
              max={homePrice * 0.25}
              step={5000}
              className="w-full mt-2 accent-amber-500"
            />
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amortization Period
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAmortization(25)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors text-sm ${
                  amortization === 25
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                25 Years
              </button>
              <button
                onClick={() => setAmortization(30)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors text-sm ${
                  amortization === 30
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                30 Years
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFirstTimeBuyer}
                onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
                className="w-5 h-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm">First-time home buyer</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewBuild}
                onChange={(e) => setIsNewBuild(e.target.checked)}
                className="w-5 h-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm">New construction</span>
            </label>
          </div>
        </div>

        {amortization === 30 && isFirstTimeBuyer && isNewBuild && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            A 0.20% surcharge applies to first-time buyers with 30-year amortization on new builds.
          </div>
        )}

        {/* Results */}
        <div className="bg-gray-50 rounded-xl p-6 mt-6">
          {result.isRequired ? (
            <>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-1">CMHC Premium</p>
                <p className="text-4xl font-bold text-amber-600">{formatPrice(result.premium)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Rate: {result.premiumRate.toFixed(2)}% ({result.tier})
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Mortgage Amount</p>
                  <p className="text-lg font-semibold">{formatPrice(mortgageAmount)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">PST on Premium (8%)</p>
                  <p className="text-lg font-semibold">{formatPrice(result.pstOnPremium)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Insurance Cost</p>
                  <p className="text-lg font-semibold text-amber-600">{formatPrice(result.totalInsuranceCost)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Mortgage</p>
                  <p className="text-lg font-semibold">{formatPrice(result.totalMortgageWithInsurance)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-green-600">No CMHC Insurance Required</p>
              <p className="text-gray-600 mt-2">
                With 20%+ down payment, you don&apos;t need mortgage default insurance.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          CMHC, Sagen, and Canada Guaranty all use the same premium rates.
        </p>
      </div>
    </div>
  )
}
