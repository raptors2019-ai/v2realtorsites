'use client'

import { useState } from 'react'
import { cn } from '../lib/utils'

interface ChatMortgageCardProps {
  maxHomePrice: number
  downPayment: number
  downPaymentPercent: number
  mortgageAmount: number
  monthlyPayment: number
  monthlyPropertyTax: number
  monthlyHeating: number
  totalMonthlyHousing: number
  cmhcPremium?: number | null
  className?: string
  /** Whether to show locked state with blur */
  isLocked?: boolean
  /** Callback when user unlocks with contact info */
  onUnlock?: (contact: { phone: string; email?: string }) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Inline unlock form for gated content */
function UnlockForm({ onSubmit }: { onSubmit: (contact: { phone: string; email?: string }) => void }) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic phone validation (10+ digits)
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    onSubmit({ phone, email: email || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-white/70 mb-1.5">
          Phone Number <span className="text-[#c9a962]">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(416) 555-1234"
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-white/70 mb-1.5">
          Email <span className="text-white/40">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]"
        />
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      <button
        type="submit"
        className="w-full py-2.5 bg-[#c9a962] hover:bg-[#d4b872] text-[#0a1628] font-semibold text-sm rounded-lg transition-colors"
      >
        Unlock Full Results
      </button>
      <p className="text-xs text-white/50 text-center">
        We'll save your estimate and an agent may follow up
      </p>
    </form>
  )
}

export function ChatMortgageCard({
  maxHomePrice,
  downPayment,
  downPaymentPercent,
  mortgageAmount,
  monthlyPayment,
  monthlyPropertyTax,
  monthlyHeating,
  totalMonthlyHousing,
  cmhcPremium,
  className,
  isLocked = false,
  onUnlock,
}: ChatMortgageCardProps) {
  const [unlocked, setUnlocked] = useState(!isLocked)

  const handleUnlock = (contact: { phone: string; email?: string }) => {
    setUnlocked(true)
    onUnlock?.(contact)
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] rounded-2xl p-5 shadow-lg text-white space-y-4',
        className
      )}
    >
      {/* Header - Always visible */}
      <div className="text-center pb-3 border-b border-white/10">
        <p className="text-xs text-[#c9a962] font-semibold uppercase tracking-wider mb-1">
          Your Affordability Estimate
        </p>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(maxHomePrice)}
        </p>
        <p className="text-xs text-white/60 mt-1">Maximum Home Price</p>
      </div>

      {/* Locked state - show blurred preview with unlock form */}
      {!unlocked && (
        <>
          {/* Blurred preview of details */}
          <div className="relative">
            <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Down Payment</p>
                  <p className="text-lg font-bold">{formatCurrency(downPayment)}</p>
                  <p className="text-xs text-[#c9a962]">{Math.round(downPaymentPercent)}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Mortgage Amount</p>
                  <p className="text-lg font-bold">{formatCurrency(mortgageAmount)}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mt-3">
                <p className="text-xs text-white/60 mb-2">Monthly Payment</p>
                <p className="text-lg font-bold">{formatCurrency(monthlyPayment)}</p>
              </div>
            </div>
          </div>

          {/* Unlock form */}
          <div className="bg-white/5 rounded-xl p-4 border border-[#c9a962]/30">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#c9a962]/20 mb-2">
                <svg className="w-5 h-5 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Unlock Your Full Results</p>
              <p className="text-xs text-white/60 mt-1">Enter your phone to see the complete breakdown</p>
            </div>
            <UnlockForm onSubmit={handleUnlock} />
          </div>
        </>
      )}

      {/* Unlocked state - show all details */}
      {unlocked && (
        <>
          {/* Key Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-white/60 mb-1">Down Payment</p>
              <p className="text-lg font-bold">{formatCurrency(downPayment)}</p>
              <p className="text-xs text-[#c9a962]">{Math.round(downPaymentPercent)}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-white/60 mb-1">Mortgage Amount</p>
              <p className="text-lg font-bold">{formatCurrency(mortgageAmount)}</p>
              {cmhcPremium && cmhcPremium > 0 && (
                <p className="text-xs text-white/60">+{formatCurrency(cmhcPremium)} CMHC</p>
              )}
            </div>
          </div>

          {/* Monthly Costs */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2.5">
            <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">
              Estimated Monthly Costs
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Mortgage Payment</span>
                <span className="font-semibold">{formatCurrency(monthlyPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Property Tax</span>
                <span className="font-semibold">{formatCurrency(monthlyPropertyTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Heating</span>
                <span className="font-semibold">{formatCurrency(monthlyHeating)}</span>
              </div>

              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#c9a962]">Total Monthly</span>
                  <span className="font-bold text-lg text-[#c9a962]">
                    {formatCurrency(totalMonthlyHousing)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold">Important:</span> This is an estimate only, not financial advice.
              Actual approval depends on your credit history, employment stability, and lender policies.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
