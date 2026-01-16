'use client'

import { useState, useMemo } from 'react'
import { calculateLandTransferTax, formatPrice, FIRST_TIME_BUYER_REBATES, type LandTransferTaxResult } from '@repo/lib'

interface LandTransferTaxCalculatorProps {
  defaultHomePrice?: number
}

export function LandTransferTaxCalculator({
  defaultHomePrice = 800000,
}: LandTransferTaxCalculatorProps) {
  const [homePrice, setHomePrice] = useState(defaultHomePrice)
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [isInToronto, setIsInToronto] = useState(true)

  const result: LandTransferTaxResult = useMemo(() => {
    return calculateLandTransferTax({
      homePrice,
      isFirstTimeBuyer,
      isInToronto,
    })
  }, [homePrice, isFirstTimeBuyer, isInToronto])

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-emerald-600 p-4">
        <h2 className="text-xl font-semibold text-white">Land Transfer Tax Calculator</h2>
        <p className="text-white/80 text-sm mt-1">Ontario Provincial &amp; Toronto Municipal LTT</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Info Box */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h3 className="font-medium text-emerald-800 mb-2">First-Time Buyer Rebates</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Ontario Provincial:</div>
            <div className="font-medium">Up to {formatPrice(FIRST_TIME_BUYER_REBATES.ONTARIO_LTT)}</div>
            <div className="text-gray-600">Toronto Municipal:</div>
            <div className="font-medium">Up to {formatPrice(FIRST_TIME_BUYER_REBATES.TORONTO_MLTT)}</div>
            <div className="text-gray-600 font-medium">Total Potential Savings:</div>
            <div className="font-medium text-emerald-600">
              Up to {formatPrice(FIRST_TIME_BUYER_REBATES.ONTARIO_LTT + FIRST_TIME_BUYER_REBATES.TORONTO_MLTT)}
            </div>
          </div>
        </div>

        {/* Inputs */}
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
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            className="w-full mt-2 accent-emerald-500"
          />
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
            <input
              type="checkbox"
              checked={isInToronto}
              onChange={(e) => setIsInToronto(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium">Property in Toronto</span>
              <p className="text-xs text-gray-500">Subject to Municipal LTT</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
            <input
              type="checkbox"
              checked={isFirstTimeBuyer}
              onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <div>
              <span className="text-sm font-medium">First-Time Home Buyer</span>
              <p className="text-xs text-gray-500">Eligible for rebates</p>
            </div>
          </label>
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-xl p-6 mt-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Total Land Transfer Tax</p>
            <p className="text-4xl font-bold text-emerald-600">{formatPrice(result.netLTT)}</p>
            {isFirstTimeBuyer && result.totalRebate > 0 && (
              <p className="text-sm text-green-600 mt-1">
                You save {formatPrice(result.totalRebate)} with rebates!
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Provincial LTT */}
            <div className="bg-white p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Ontario Provincial LTT</p>
                  <p className="text-lg font-semibold">{formatPrice(result.provincialLTT)}</p>
                </div>
                {isFirstTimeBuyer && result.provincialRebate > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-green-600">Rebate</p>
                    <p className="text-sm font-medium text-green-600">-{formatPrice(result.provincialRebate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Toronto MLTT */}
            {isInToronto && (
              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Toronto Municipal LTT</p>
                    <p className="text-lg font-semibold">{formatPrice(result.municipalLTT)}</p>
                  </div>
                  {isFirstTimeBuyer && result.municipalRebate > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-green-600">Rebate</p>
                      <p className="text-sm font-medium text-green-600">-{formatPrice(result.municipalRebate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gross Tax:</span>
                <span className="font-medium">{formatPrice(result.totalLTT)}</span>
              </div>
              {isFirstTimeBuyer && result.totalRebate > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Total Rebates:</span>
                  <span className="font-medium">-{formatPrice(result.totalRebate)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t">
                <span>Net Tax Payable:</span>
                <span className="text-emerald-600">{formatPrice(result.netLTT)}</span>
              </div>
            </div>
          </div>
        </div>

        {isInToronto && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>Note:</strong> Toronto properties pay BOTH provincial and municipal land transfer tax,
            effectively doubling the tax compared to other Ontario cities.
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Tax rates effective as of 2024. Additional taxes may apply to non-residents.
        </p>
      </div>
    </div>
  )
}
