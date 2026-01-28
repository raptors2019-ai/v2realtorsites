'use client'

import { cn } from '../lib/utils'
import { UnlockFormInline } from './UnlockFormInline'
import { useCardUnlock } from './hooks'
import type { FirstTimeBuyerInfo } from './chatbot-store'

interface ChatFirstTimeBuyerCardProps extends FirstTimeBuyerInfo {
  className?: string
  /** Whether to show locked state with blur */
  isLocked?: boolean
  /** Callback when user unlocks with contact info */
  onUnlock?: (contact: { name: string; phone: string; email?: string }) => void
  /** Callback when user skips the unlock form */
  onSkip?: () => void
  /** Number of skips remaining (if 0, skip button is hidden) */
  remainingSkips?: number
  /** Callback when user clicks "Calculate Your Affordability" button */
  onMortgageCalculator?: () => void
  /** Callback when user clicks on a related topic */
  onRelatedTopicClick?: (topic: string) => void
}

// Get display name for topic slugs
function getTopicDisplayName(topic: string): string {
  const names: Record<string, string> = {
    'home-buying-process': 'Buying Process',
    'closing-costs': 'Closing Costs',
    'first-time-buyer-incentives': 'Incentives & Rebates',
    'pre-approval': 'Pre-Approval',
    'down-payment': 'Down Payment',
  }
  return names[topic] || topic.replace(/-/g, ' ')
}

export function ChatFirstTimeBuyerCard({
  topic: _topic,
  question,
  answer,
  programs,
  totalPotentialSavings,
  steps,
  breakdown,
  benefits,
  requirements,
  example,
  relatedTopics,
  className,
  isLocked = false,
  onUnlock,
  onSkip,
  remainingSkips,
  onMortgageCalculator,
  onRelatedTopicClick,
}: ChatFirstTimeBuyerCardProps) {
  const { unlocked, isFlipping, handleUnlock, handleSkip, flipStyles } = useCardUnlock({
    isLocked,
    onUnlock,
    onSkip,
  })

  const firstSentence = answer.split(/[.!?]/)[0] + '.'
  const hasPrograms = programs && programs.length > 0

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] rounded-2xl p-5 shadow-lg text-white space-y-4 transition-all duration-300',
        className
      )}
      style={flipStyles}
    >
      {/* Header - Always visible */}
      <div className="pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#c9a962]/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-[#c9a962] font-semibold uppercase tracking-wider">
            First-Time Buyer Info
          </p>
        </div>
        <p className="text-lg font-semibold text-white leading-tight">
          {question}
        </p>
      </div>

      {/* Hook text - Always visible */}
      <div className="text-sm text-white/80 leading-relaxed">
        {firstSentence}
      </div>

      {/* Programs chips as hook - Always visible if has programs */}
      {hasPrograms && (
        <div className="flex flex-wrap gap-2">
          {programs.slice(0, 3).map((program) => (
            <span
              key={program.name}
              className="px-2.5 py-1 bg-[#c9a962]/20 border border-[#c9a962]/40 rounded-full text-xs font-medium text-[#c9a962]"
            >
              {program.name.split(' ').slice(0, 3).join(' ')}
            </span>
          ))}
          {programs.length > 3 && (
            <span className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/60">
              +{programs.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Savings hook - Always visible if available */}
      {totalPotentialSavings && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-xs text-green-400/70 uppercase tracking-wider mb-1">Potential Savings</p>
          <p className="text-lg font-bold text-green-400">{totalPotentialSavings}</p>
        </div>
      )}

      {/* Locked state - show unlock form */}
      {!unlocked && !isFlipping && (
        <UnlockFormInline
          title="See Full Details & Eligibility"
          subtitle={hasPrograms ? "Unlock program details, eligibility requirements, and how to apply" : "Get the complete breakdown and personalized guidance"}
          buttonText="Unlock Details"
          onSubmit={handleUnlock}
          onSkip={handleSkip}
          remainingSkips={remainingSkips}
          variant="dark"
          footerText="We'll connect you with a first-time buyer specialist"
        />
      )}

      {/* Unlocked state - show all details */}
      {unlocked && (
        <>
          {/* Full answer */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">{answer}</p>
          </div>

          {/* Steps if available */}
          {steps && steps.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">Steps</p>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#c9a962]/20 text-[#c9a962] text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Programs details if available */}
          {hasPrograms && (
            <div className="space-y-3">
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">Available Programs</p>
              {programs.map((program) => (
                <div key={program.name} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="font-semibold text-[#c9a962] text-sm mb-2">{program.name}</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-white/60 flex-shrink-0">Benefit:</span>
                      <span className="text-white/90">{program.benefit}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-white/60 flex-shrink-0">Eligibility:</span>
                      <span className="text-white/90">{program.eligibility}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Breakdown if available */}
          {breakdown && Object.keys(breakdown).length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">Cost Breakdown</p>
              <div className="space-y-2">
                {Object.entries(breakdown).map(([key, value]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-white/80">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Benefits if available */}
          {benefits && benefits.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">Benefits</p>
              <ul className="space-y-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements if available */}
          {requirements && Object.keys(requirements).length > 0 && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-3">Requirements</p>
              <div className="space-y-2">
                {Object.entries(requirements).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-white/60">{key}:</span>{' '}
                    <span className="text-white/90">{value}</span>
                  </div>
                ))}
              </div>
              {example && (
                <p className="text-xs text-white/60 mt-3 italic">Example: {example}</p>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-xs text-amber-200/90 leading-relaxed">
              This information is for general guidance. For personalized advice, consult with our agents or a mortgage professional.
            </p>
          </div>

          {/* Calculate Affordability CTA */}
          {onMortgageCalculator && (
            <button
              onClick={onMortgageCalculator}
              className="w-full py-3 bg-[#c9a962] hover:bg-[#d4b872] text-[#0a1628] font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Your Affordability
            </button>
          )}

          {/* Related Topics */}
          {relatedTopics && relatedTopics.length > 0 && (
            <div>
              <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-2">Related Topics</p>
              <div className="flex flex-wrap gap-2">
                {relatedTopics.slice(0, 3).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => onRelatedTopicClick?.(topic)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-medium transition-colors"
                  >
                    {getTopicDisplayName(topic)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
