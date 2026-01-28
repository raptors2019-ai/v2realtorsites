'use client'

import { cn } from '../lib/utils'
import { UnlockFormInline } from './UnlockFormInline'
import { ChatMortgageCityPicker } from './ChatMortgageCityPicker'
import { useCardUnlock } from './hooks'

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
  onUnlock?: (contact: { name: string; phone: string; email?: string }) => void
  /** Callback when user skips the unlock form */
  onSkip?: () => void
  /** Number of skips remaining (if 0, skip button is hidden) */
  remainingSkips?: number
  /** Callback when user selects a city from the picker */
  onCitySelect?: (citySlug: string, cityName: string, maxPrice: number) => void
  /** Callback when user clicks "Search All GTA" */
  onSearchAll?: (maxPrice: number) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
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
  onSkip,
  remainingSkips,
  onCitySelect,
  onSearchAll,
}: ChatMortgageCardProps) {
  const { unlocked, isFlipping, handleUnlock, handleSkip, flipStyles } = useCardUnlock({
    isLocked,
    onUnlock,
    onSkip,
  })

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] rounded-2xl p-5 shadow-lg text-white space-y-4 transition-all duration-300',
        className
      )}
      style={flipStyles}
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

      {/* Locked state - show teaser text with unlock form */}
      {!unlocked && !isFlipping && (
        <UnlockFormInline
          title="Unlock Your Full Results"
          subtitle="See your monthly breakdown, down payment details, property taxes, and more"
          buttonText="Unlock Full Results"
          onSubmit={handleUnlock}
          onSkip={handleSkip}
          remainingSkips={remainingSkips}
          variant="dark"
          footerText="We'll save your estimate and an agent may follow up"
        />
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

          {/* City picker for search */}
          {onCitySelect && onSearchAll && (
            <ChatMortgageCityPicker
              maxPrice={maxHomePrice}
              onCitySelect={onCitySelect}
              onSearchAll={onSearchAll}
            />
          )}
        </>
      )}
    </div>
  )
}
