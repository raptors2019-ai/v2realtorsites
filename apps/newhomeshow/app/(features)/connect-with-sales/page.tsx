'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BUDGET_RANGES, TIMELINE_OPTIONS } from '@repo/types'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  interest: string
  budgetRange: string
  timeline: string
  message: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  interest: '',
  budgetRange: '',
  timeline: '',
  message: '',
}

const PREFERENCES_KEY = 'newhomeshow_preferences'

const VIP_MESSAGE = "I'm interested in getting VIP access to upcoming pre-construction projects. Please add me to your priority list for early access, platinum pricing, and exclusive incentives."

const getProjectMessage = (projectName: string) =>
  `I'm interested in learning more about ${projectName}. Please send me information about available units, pricing, and floor plans.`

// Inner component that uses useSearchParams
function ConnectWithSalesContent() {
  const searchParams = useSearchParams()
  const isVipRequest = searchParams.get('vip') === 'true'
  const projectName = searchParams.get('project')

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [hasPreferences, setHasPreferences] = useState(false)

  // Check for existing preferences from questionnaire or registration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (stored) {
        const prefs = JSON.parse(stored)
        setHasPreferences(true)
        // Pre-fill budget and timeline from stored preferences
        setFormData(prev => ({
          ...prev,
          budgetRange: prefs.budgetRange || '',
          timeline: prefs.timeline || '',
        }))
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  // Pre-populate form based on query params
  useEffect(() => {
    if (isVipRequest) {
      setFormData(prev => ({
        ...prev,
        interest: 'buying',
        message: VIP_MESSAGE,
      }))
    } else if (projectName) {
      setFormData(prev => ({
        ...prev,
        interest: 'buying',
        message: getProjectMessage(projectName),
      }))
    }
  }, [isVipRequest, projectName])

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Find labels for budget/timeline values
      const budgetLabel = BUDGET_RANGES.find(r => r.value === formData.budgetRange)?.label
      const timelineLabel = TIMELINE_OPTIONS.find(t => t.value === formData.timeline)?.label

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budgetRange: budgetLabel || formData.budgetRange || undefined,
          timeline: timelineLabel || formData.timeline || undefined,
          source: 'NewHomeShow - Connect with Sales',
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData(initialFormData)
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = formData.firstName && formData.lastName && formData.email && formData.interest && formData.message

  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-12 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary dark:text-white mb-4">
              Connect with Sales
            </h1>
            <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto text-lg">
              {projectName ? (
                <>Interested in <span className="text-primary font-semibold">{projectName}</span>? Our team is here to help you learn more.</>
              ) : (
                <>Have questions about our pre-construction projects? Our team is here to help you find the perfect home.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="luxury-card-premium rounded-xl p-6">
                <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Phone</p>
                      <a href="tel:+14167860431" className="text-secondary dark:text-white hover:text-primary transition-colors font-medium">
                        +1 (416) 786-0431
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Email</p>
                      <a href="mailto:info@newhomeshow.ca" className="text-secondary dark:text-white hover:text-primary transition-colors font-medium">
                        info@newhomeshow.ca
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Links */}
              <div className="luxury-card-premium rounded-xl p-6">
                <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    href="/builder-projects"
                    className="flex items-center gap-2 text-text-secondary dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Browse Projects
                  </Link>
                  <Link
                    href="/quick-closings"
                    className="flex items-center gap-2 text-text-secondary dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Quick Closings
                  </Link>
                  <Link
                    href="/promotions"
                    className="flex items-center gap-2 text-text-secondary dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Current Promotions
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="luxury-card-premium rounded-xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-secondary dark:text-white mb-6">Send Us a Message</h3>

                {submitStatus === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-secondary dark:text-white mb-2">Message Sent!</h4>
                    <p className="text-text-secondary dark:text-gray-300 mb-6">
                      Thank you for reaching out. Our team will get back to you shortly.
                    </p>
                    <button
                      onClick={() => setSubmitStatus('idle')}
                      className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white dark:bg-secondary-light dark:text-white"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white dark:bg-secondary-light dark:text-white"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white dark:bg-secondary-light dark:text-white"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white dark:bg-secondary-light dark:text-white"
                          placeholder="(416) 555-0123"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                        I'm Interested In *
                      </label>
                      <select
                        value={formData.interest}
                        onChange={(e) => updateField('interest', e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white dark:bg-secondary-light dark:text-white"
                      >
                        <option value="">Select an option</option>
                        <option value="buying">Buying a Pre-Construction Home</option>
                        <option value="investing">Investment Properties</option>
                        <option value="assignment">Assignment Sales</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>

                    {/* Show budget & timeline if user hasn't completed questionnaire and interest is buying/investing */}
                    {!hasPreferences && (formData.interest === 'buying' || formData.interest === 'investing') && (
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                            Budget Range
                          </label>
                          <select
                            value={formData.budgetRange}
                            onChange={(e) => updateField('budgetRange', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white dark:bg-secondary-light dark:text-white"
                          >
                            <option value="">Select budget</option>
                            {BUDGET_RANGES.map(range => (
                              <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                            Timeline
                          </label>
                          <select
                            value={formData.timeline}
                            onChange={(e) => updateField('timeline', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors bg-white dark:bg-secondary-light dark:text-white"
                          >
                            <option value="">Select timeline</option>
                            {TIMELINE_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Show saved preferences summary if user completed questionnaire */}
                    {hasPreferences && formData.budgetRange && (
                      <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                        <p className="text-sm text-text-secondary dark:text-gray-300">
                          <span className="font-medium text-primary">Your preferences:</span>{' '}
                          {BUDGET_RANGES.find(r => r.value === formData.budgetRange)?.label || formData.budgetRange}
                          {formData.timeline && (
                            <> &bull; {TIMELINE_OPTIONS.find(t => t.value === formData.timeline)?.label || formData.timeline}</>
                          )}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => updateField('message', e.target.value)}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:outline-none transition-colors resize-none bg-white dark:bg-secondary-light dark:text-white"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    {submitStatus === 'error' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        Something went wrong. Please try again or call us directly.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className={`w-full py-3.5 rounded-lg font-medium transition-all duration-200 ${
                        isValid && !isSubmitting
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Loading fallback for Suspense
function ConnectWithSalesLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary flex items-center justify-center">
      <div className="animate-pulse text-text-secondary">Loading...</div>
    </div>
  )
}

// Default export wrapped in Suspense for useSearchParams
export default function ConnectWithSalesPage() {
  return (
    <Suspense fallback={<ConnectWithSalesLoading />}>
      <ConnectWithSalesContent />
    </Suspense>
  )
}
