'use client'

import { useState, useMemo } from 'react'
import { calculatePropertyTax, formatPrice, PROPERTY_TAX_RATES, type PropertyTaxResult } from '@repo/lib'

interface PropertyTaxCalculatorProps {
  defaultHomePrice?: number
  defaultMunicipality?: string
}

const MUNICIPALITIES = [
  { value: 'toronto', label: 'Toronto', rate: PROPERTY_TAX_RATES['toronto'] },
  { value: 'mississauga', label: 'Mississauga', rate: PROPERTY_TAX_RATES['mississauga'] },
  { value: 'brampton', label: 'Brampton', rate: PROPERTY_TAX_RATES['brampton'] },
  { value: 'vaughan', label: 'Vaughan', rate: PROPERTY_TAX_RATES['vaughan'] },
  { value: 'markham', label: 'Markham', rate: PROPERTY_TAX_RATES['markham'] },
  { value: 'richmond-hill', label: 'Richmond Hill', rate: PROPERTY_TAX_RATES['richmond-hill'] },
  { value: 'oakville', label: 'Oakville', rate: PROPERTY_TAX_RATES['oakville'] },
  { value: 'burlington', label: 'Burlington', rate: PROPERTY_TAX_RATES['burlington'] },
  { value: 'hamilton', label: 'Hamilton', rate: PROPERTY_TAX_RATES['hamilton'] },
  { value: 'ajax', label: 'Ajax', rate: PROPERTY_TAX_RATES['ajax'] },
  { value: 'pickering', label: 'Pickering', rate: PROPERTY_TAX_RATES['pickering'] },
  { value: 'oshawa', label: 'Oshawa', rate: PROPERTY_TAX_RATES['oshawa'] },
  { value: 'whitby', label: 'Whitby', rate: PROPERTY_TAX_RATES['whitby'] },
  { value: 'newmarket', label: 'Newmarket', rate: PROPERTY_TAX_RATES['newmarket'] },
  { value: 'aurora', label: 'Aurora', rate: PROPERTY_TAX_RATES['aurora'] },
].sort((a, b) => a.label.localeCompare(b.label))

export function PropertyTaxCalculator({
  defaultHomePrice = 800000,
  defaultMunicipality = 'toronto',
}: PropertyTaxCalculatorProps) {
  const [homePrice, setHomePrice] = useState(defaultHomePrice)
  const [municipality, setMunicipality] = useState(defaultMunicipality)
  const [useCustomRate, setUseCustomRate] = useState(false)
  const [customRate, setCustomRate] = useState(1.0)

  const result: PropertyTaxResult = useMemo(() => {
    return calculatePropertyTax({
      homePrice,
      municipality,
      customRate: useCustomRate ? customRate / 100 : undefined,
    })
  }, [homePrice, municipality, useCustomRate, customRate])

  const selectedMunicipality = MUNICIPALITIES.find(m => m.value === municipality)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-sky-600 p-4">
        <h2 className="text-xl font-semibold text-white">Property Tax Calculator</h2>
        <p className="text-white/80 text-sm mt-1">Estimate annual property taxes by municipality</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Tax Rate Reference */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <h3 className="font-medium text-sky-800 mb-3">GTA Property Tax Rates (Approx.)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {MUNICIPALITIES.slice(0, 9).map(m => (
              <div key={m.value} className="flex justify-between">
                <span className="text-gray-600">{m.label}:</span>
                <span className="font-medium">{(m.rate * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Toronto has the lowest rate but highest home prices. Rates are approximate and may vary.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Home Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Value (Assessment)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
              className="w-full mt-2 accent-sky-500"
            />
          </div>

          {/* Municipality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Municipality
            </label>
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              disabled={useCustomRate}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {MUNICIPALITIES.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label} ({(m.rate * 100).toFixed(2)}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Rate Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomRate}
              onChange={(e) => setUseCustomRate(e.target.checked)}
              className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <span className="text-sm font-medium">Use custom tax rate</span>
          </label>

          {useCustomRate && (
            <div className="relative flex-1 max-w-[150px]">
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                min={0.1}
                max={5}
                step={0.01}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-xl p-6 mt-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Annual Property Tax</p>
            <p className="text-4xl font-bold text-sky-600">{formatPrice(result.annualTax)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {useCustomRate ? 'Custom rate' : selectedMunicipality?.label || municipality}: {result.taxRate.toFixed(2)}%
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Monthly Amount</p>
              <p className="text-2xl font-semibold text-sky-600">{formatPrice(result.monthlyTax)}</p>
              <p className="text-xs text-gray-500 mt-1">Budget this in your housing costs</p>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tax Rate</p>
              <p className="text-2xl font-semibold">{result.taxRate.toFixed(3)}%</p>
              <p className="text-xs text-gray-500 mt-1">Of assessed home value</p>
            </div>
          </div>

          {/* Comparison */}
          {!useCustomRate && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Compare with other cities</h4>
              <div className="space-y-2">
                {MUNICIPALITIES.filter(m => m.value !== municipality).slice(0, 4).map(m => {
                  const tax = homePrice * m.rate
                  const diff = tax - result.annualTax
                  return (
                    <div key={m.value} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{m.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatPrice(tax)}/yr</span>
                        <span className={`text-xs ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {diff > 0 ? '+' : ''}{formatPrice(diff)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Property taxes are based on MPAC assessed value, which may differ from market value.
          Rates are approximate and subject to annual changes.
        </p>
      </div>
    </div>
  )
}
