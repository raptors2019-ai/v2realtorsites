'use client'

import { useState } from 'react'
import {
  MortgageCalculator,
  CMHCCalculator,
  LandTransferTaxCalculator,
  ClosingCostsCalculator,
  PropertyTaxCalculator,
} from '@repo/ui'

type CalculatorTab = 'mortgage' | 'cmhc' | 'ltt' | 'closing' | 'property-tax'

const TABS: { id: CalculatorTab; label: string; shortLabel: string; icon: string }[] = [
  { id: 'mortgage', label: 'Mortgage Calculator', shortLabel: 'Mortgage', icon: '🏠' },
  { id: 'cmhc', label: 'CMHC Insurance', shortLabel: 'CMHC', icon: '🛡️' },
  { id: 'ltt', label: 'Land Transfer Tax', shortLabel: 'LTT', icon: '📋' },
  { id: 'closing', label: 'Closing Costs', shortLabel: 'Closing', icon: '💰' },
  { id: 'property-tax', label: 'Property Tax', shortLabel: 'Tax', icon: '🏛️' },
]

export function ToolsPageClient() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('mortgage')

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex flex-wrap justify-center gap-2 p-2 bg-white rounded-xl shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Content */}
        <div className="max-w-3xl mx-auto">
          {activeTab === 'mortgage' && <MortgageCalculator />}
          {activeTab === 'cmhc' && <CMHCCalculator />}
          {activeTab === 'ltt' && <LandTransferTaxCalculator />}
          {activeTab === 'closing' && <ClosingCostsCalculator />}
          {activeTab === 'property-tax' && <PropertyTaxCalculator />}
        </div>

        {/* Quick Tips */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Tips for {TABS.find(t => t.id === activeTab)?.label}
            </h3>

            {activeTab === 'mortgage' && (
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Accelerated bi-weekly payments can save you thousands in interest and pay off your mortgage faster</li>
                <li>• The stress test requires you to qualify at a rate 2% higher than your contract rate (minimum 5.25%)</li>
                <li>• Consider making a 20% down payment to avoid CMHC insurance</li>
              </ul>
            )}

            {activeTab === 'cmhc' && (
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• CMHC insurance protects the lender, not you - but it allows you to buy with less than 20% down</li>
                <li>• The premium is added to your mortgage and paid over the life of the loan</li>
                <li>• First-time buyers can get 30-year amortization on new builds (with a 0.20% premium increase)</li>
              </ul>
            )}

            {activeTab === 'ltt' && (
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Toronto buyers pay BOTH provincial and municipal land transfer tax</li>
                <li>• First-time buyers can save up to $8,475 with combined rebates in Toronto</li>
                <li>• You must occupy the home within 9 months to qualify for rebates</li>
              </ul>
            )}

            {activeTab === 'closing' && (
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Budget 1.5-4% of the purchase price for closing costs</li>
                <li>• Don&apos;t skip the home inspection - it could save you from costly surprises</li>
                <li>• Your lawyer will handle title search, registration, and fund transfers</li>
              </ul>
            )}

            {activeTab === 'property-tax' && (
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Property taxes are based on MPAC assessed value, not market value</li>
                <li>• Toronto has the lowest rate but highest home prices - the dollar amount can still be high</li>
                <li>• You can pay monthly or in installments throughout the year</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
