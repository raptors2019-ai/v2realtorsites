'use client'

import { useState, useMemo } from 'react'
import { calculateClosingCosts, formatPrice, type ClosingCostsResult } from '@repo/lib'

interface ClosingCostsCalculatorProps {
  defaultHomePrice?: number
  defaultDownPayment?: number
}

export function ClosingCostsCalculator({
  defaultHomePrice = 800000,
  defaultDownPayment = 80000,
}: ClosingCostsCalculatorProps) {
  const [homePrice, setHomePrice] = useState(defaultHomePrice)
  const [downPayment, setDownPayment] = useState(defaultDownPayment)
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [isInToronto, setIsInToronto] = useState(true)
  const [includeHomeInspection, setIncludeHomeInspection] = useState(true)

  const result: ClosingCostsResult = useMemo(() => {
    return calculateClosingCosts({
      homePrice,
      downPayment,
      isFirstTimeBuyer,
      isInToronto,
      includeHomeInspection,
    })
  }, [homePrice, downPayment, isFirstTimeBuyer, isInToronto, includeHomeInspection])

  const downPaymentPercent = (downPayment / homePrice) * 100
  const minDownPayment = homePrice <= 500000
    ? homePrice * 0.05
    : 500000 * 0.05 + (homePrice - 500000) * 0.1

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-violet-600 p-4">
        <h2 className="text-xl font-semibold text-white">Closing Costs Calculator</h2>
        <p className="text-white/80 text-sm mt-1">Estimate all costs due on closing day</p>
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
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                min={100000}
                step={10000}
              />
            </div>
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
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                min={minDownPayment}
                step={5000}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors">
            <input
              type="checkbox"
              checked={isInToronto}
              onChange={(e) => setIsInToronto(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm">Toronto Property</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors">
            <input
              type="checkbox"
              checked={isFirstTimeBuyer}
              onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm">First-Time Buyer</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-300 transition-colors">
            <input
              type="checkbox"
              checked={includeHomeInspection}
              onChange={(e) => setIncludeHomeInspection(e.target.checked)}
              className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <span className="text-sm">Include Home Inspection</span>
          </label>
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-xl p-6 mt-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Estimated Closing Costs</p>
            <p className="text-4xl font-bold text-violet-600">
              {formatPrice(result.totalAvg)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Range: {formatPrice(result.totalMin)} - {formatPrice(result.totalMax)}
            </p>
          </div>

          <div className="space-y-3">
            {/* Land Transfer Tax */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Land Transfer Tax</p>
                  <p className="text-xs text-gray-500">
                    {isInToronto ? 'Provincial + Toronto Municipal' : 'Ontario Provincial only'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(result.landTransferTax.netLTT)}</p>
                  {isFirstTimeBuyer && result.landTransferTax.totalRebate > 0 && (
                    <p className="text-xs text-green-600">
                      Rebate applied: -{formatPrice(result.landTransferTax.totalRebate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Legal Fees */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Legal Fees</p>
                  <p className="text-xs text-gray-500">Real estate lawyer</p>
                </div>
                <p className="font-semibold">
                  {formatPrice(result.legalFees.min)} - {formatPrice(result.legalFees.max)}
                </p>
              </div>
            </div>

            {/* Title Insurance */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Title Insurance</p>
                  <p className="text-xs text-gray-500">Protects against title defects</p>
                </div>
                <p className="font-semibold">
                  {formatPrice(result.titleInsurance.min)} - {formatPrice(result.titleInsurance.max)}
                </p>
              </div>
            </div>

            {/* Home Inspection */}
            {result.homeInspection && (
              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Home Inspection</p>
                    <p className="text-xs text-gray-500">Pre-purchase inspection</p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(result.homeInspection.min)} - {formatPrice(result.homeInspection.max)}
                  </p>
                </div>
              </div>
            )}

            {/* Appraisal */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Appraisal</p>
                  <p className="text-xs text-gray-500">May be required by lender</p>
                </div>
                <p className="font-semibold">
                  {formatPrice(result.appraisal.min)} - {formatPrice(result.appraisal.max)}
                </p>
              </div>
            </div>

            {/* PST on CMHC */}
            {result.pstOnCMHC > 0 && (
              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">PST on CMHC Insurance</p>
                    <p className="text-xs text-gray-500">8% Ontario sales tax</p>
                  </div>
                  <p className="font-semibold text-amber-600">{formatPrice(result.pstOnCMHC)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Total Cash Needed */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-violet-100 rounded-lg p-4">
              <p className="text-sm text-violet-800 font-medium mb-2">Total Cash Needed at Closing</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Down Payment:</span>
                <span className="font-semibold">{formatPrice(downPayment)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Closing Costs (avg):</span>
                <span className="font-semibold">{formatPrice(result.totalAvg)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t border-violet-200">
                <span className="text-violet-800">Total:</span>
                <span className="text-violet-600">{formatPrice(downPayment + result.totalAvg)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Estimates based on typical Ontario closing costs. Actual costs may vary.
          Does not include moving expenses or immediate home repairs.
        </p>
      </div>
    </div>
  )
}
