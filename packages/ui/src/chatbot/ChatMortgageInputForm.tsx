'use client'

import { useState } from 'react'
import { cn } from '../lib/utils'

interface ChatMortgageInputFormProps {
  className?: string
  onSubmit: (data: { annualIncome: number; downPayment: number; monthlyDebts: number }) => void
  isLoading?: boolean
}

export function ChatMortgageInputForm({ className, onSubmit, isLoading }: ChatMortgageInputFormProps) {
  const [annualIncome, setAnnualIncome] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [monthlyDebts, setMonthlyDebts] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const parseNumber = (value: string): number => {
    // Remove currency symbols, commas, and 'k' suffix
    const cleaned = value.replace(/[$,]/g, '').trim().toLowerCase()
    if (cleaned.endsWith('k')) {
      return parseFloat(cleaned.slice(0, -1)) * 1000
    }
    return parseFloat(cleaned) || 0
  }

  const formatForDisplay = (value: string): string => {
    const num = parseNumber(value)
    if (num > 0) {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0,
      }).format(num)
    }
    return value
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const income = parseNumber(annualIncome)
    const savings = parseNumber(downPayment)
    const debts = parseNumber(monthlyDebts)

    if (!income || income < 20000) {
      newErrors.annualIncome = 'Please enter a valid annual income'
    }
    if (!savings || savings < 5000) {
      newErrors.downPayment = 'Please enter a valid down payment amount'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit({
      annualIncome: income,
      downPayment: savings,
      monthlyDebts: debts || 0,
    })
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] rounded-2xl p-5 shadow-lg text-white',
        className
      )}
    >
      {/* Header */}
      <div className="text-center pb-4 border-b border-white/10 mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#c9a962]/20 mb-3">
          <svg className="w-6 h-6 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-white">Affordability Calculator</p>
        <p className="text-xs text-white/60 mt-1">See how much home you can afford</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Annual Income */}
        <div>
          <label className="block text-xs text-white/70 mb-1.5">
            What's your annual household income?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
            <input
              type="text"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              onBlur={() => annualIncome && setAnnualIncome(formatForDisplay(annualIncome))}
              placeholder="120,000"
              className={cn(
                'w-full pl-7 pr-3 py-2.5 bg-white/10 border rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]',
                errors.annualIncome ? 'border-red-400' : 'border-white/20'
              )}
            />
          </div>
          {errors.annualIncome && (
            <p className="text-xs text-red-400 mt-1">{errors.annualIncome}</p>
          )}
        </div>

        {/* Down Payment */}
        <div>
          <label className="block text-xs text-white/70 mb-1.5">
            How much have you saved for a down payment?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
            <input
              type="text"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              onBlur={() => downPayment && setDownPayment(formatForDisplay(downPayment))}
              placeholder="50,000"
              className={cn(
                'w-full pl-7 pr-3 py-2.5 bg-white/10 border rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]',
                errors.downPayment ? 'border-red-400' : 'border-white/20'
              )}
            />
          </div>
          {errors.downPayment && (
            <p className="text-xs text-red-400 mt-1">{errors.downPayment}</p>
          )}
        </div>

        {/* Monthly Debts */}
        <div>
          <label className="block text-xs text-white/70 mb-1.5">
            Monthly debt payments <span className="text-white/40">(car, credit cards, etc.)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
            <input
              type="text"
              value={monthlyDebts}
              onChange={(e) => setMonthlyDebts(e.target.value)}
              onBlur={() => monthlyDebts && setMonthlyDebts(formatForDisplay(monthlyDebts))}
              placeholder="0"
              className="w-full pl-7 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]"
            />
          </div>
          <p className="text-xs text-white/40 mt-1">Enter 0 if no monthly debts</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'w-full py-3 bg-[#c9a962] text-[#0a1628] font-semibold text-sm rounded-lg transition-all',
            isLoading
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-[#d4b872] hover:shadow-lg'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Calculating...
            </span>
          ) : (
            'Calculate My Affordability'
          )}
        </button>

        <p className="text-xs text-white/50 text-center">
          Based on Canadian mortgage lending rules
        </p>
      </form>
    </div>
  )
}
