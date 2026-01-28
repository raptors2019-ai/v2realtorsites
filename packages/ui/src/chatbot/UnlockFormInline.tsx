'use client'

import { useState } from 'react'
import { cn } from '../lib/utils'

interface UnlockFormInlineProps {
  /** Title displayed above the form */
  title: string
  /** Subtitle/description text */
  subtitle: string
  /** Text for the submit button */
  buttonText: string
  /** Callback when form is submitted with valid contact info */
  onSubmit: (contact: { name: string; phone: string; email?: string }) => void
  /** Optional callback when user skips the form */
  onSkip?: () => void
  /** Number of skips remaining (if 0, skip button is hidden) */
  remainingSkips?: number
  /** Visual variant - dark has white text on dark bg, light has dark text on white bg */
  variant?: 'dark' | 'light'
  /** Optional footer text below buttons */
  footerText?: string
  /** Optional class name for container */
  className?: string
}

export function UnlockFormInline({
  title,
  subtitle,
  buttonText,
  onSubmit,
  onSkip,
  remainingSkips,
  variant = 'dark',
  footerText = "We'll save your results and an agent may follow up",
  className,
}: UnlockFormInlineProps) {
  // If remainingSkips is undefined, allow unlimited skips (backwards compatible)
  // If remainingSkips is 0, hide skip button (must provide contact)
  const canSkip = onSkip && (remainingSkips === undefined || remainingSkips > 0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Name validation
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    // Basic phone validation (10+ digits)
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    onSubmit({ name: name.trim(), phone, email: email || undefined })
  }

  const isDark = variant === 'dark'

  return (
    <div className={cn(
      'rounded-xl p-4 border',
      isDark
        ? 'bg-white/5 border-[#c9a962]/30'
        : 'bg-stone-50 border-stone-200',
      className
    )}>
      <div className="text-center mb-4">
        <div className={cn(
          'inline-flex items-center justify-center w-10 h-10 rounded-full mb-2',
          isDark ? 'bg-[#c9a962]/20' : 'bg-[#c9a962]/10'
        )}>
          <svg className="w-5 h-5 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className={cn(
          'text-sm font-semibold',
          isDark ? 'text-white' : 'text-stone-800'
        )}>{title}</p>
        <p className={cn(
          'text-xs mt-2 leading-relaxed',
          isDark ? 'text-white/60' : 'text-stone-500'
        )}>{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={cn(
            'block text-xs mb-1.5',
            isDark ? 'text-white/70' : 'text-stone-600'
          )}>
            Your Name <span className="text-[#c9a962]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            className={cn(
              'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]',
              isDark
                ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40'
                : 'bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400'
            )}
            required
          />
        </div>
        <div>
          <label className={cn(
            'block text-xs mb-1.5',
            isDark ? 'text-white/70' : 'text-stone-600'
          )}>
            Phone Number <span className="text-[#c9a962]">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(416) 555-1234"
            className={cn(
              'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]',
              isDark
                ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40'
                : 'bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400'
            )}
            required
          />
        </div>
        <div>
          <label className={cn(
            'block text-xs mb-1.5',
            isDark ? 'text-white/70' : 'text-stone-600'
          )}>
            Email <span className={isDark ? 'text-white/40' : 'text-stone-400'}>(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              'w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50 focus:border-[#c9a962]',
              isDark
                ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40'
                : 'bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400'
            )}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className={cn(
              'flex-1 py-2.5 font-semibold text-sm rounded-lg transition-colors',
              isDark
                ? 'bg-[#c9a962] hover:bg-[#d4b872] text-[#0a1628]'
                : 'bg-[#0a1628] hover:bg-[#1a2d4d] text-white'
            )}
          >
            {buttonText}
          </button>
          {canSkip && (
            <button
              type="button"
              onClick={onSkip}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors',
                isDark
                  ? 'text-white/70 hover:text-white'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              Skip{remainingSkips !== undefined && ` (${remainingSkips})`}
            </button>
          )}
        </div>
        {footerText && (
          <p className={cn(
            'text-xs text-center',
            isDark ? 'text-white/50' : 'text-stone-400'
          )}>{footerText}</p>
        )}
      </form>
    </div>
  )
}
