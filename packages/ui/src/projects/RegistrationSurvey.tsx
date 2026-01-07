"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CMSBuilderProject, RegistrationData } from '@repo/types'
import { BUDGET_RANGES, TIMELINE_OPTIONS } from '@repo/types'
import { cn } from '@repo/lib'

interface RegistrationSurveyProps {
  project: CMSBuilderProject
  onSuccess?: () => void
}

type Step = 1 | 2 | 3 | 4

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  budgetRange: string
  timeline: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  budgetRange: '',
  timeline: '',
}

export function RegistrationSurvey({ project, onSuccess }: RegistrationSurveyProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const totalSteps = 4

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        return formData.firstName.trim().length > 0 && formData.lastName.trim().length > 0
      case 2:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/
        return emailRegex.test(formData.email) && phoneRegex.test(formData.phone.replace(/\s/g, ''))
      case 3:
        return formData.budgetRange.length > 0
      case 4:
        return formData.timeline.length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!validateStep(step)) return

    if (step < totalSteps) {
      setStep((step + 1) as Step)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    const registrationData: RegistrationData = {
      projectSlug: project.slug,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      budgetRange: formData.budgetRange,
      timeline: formData.timeline,
      source: `NewHomeShow - ${project.name}`,
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed')
      }

      setIsComplete(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-secondary mb-2">Thank You!</h3>
        <p className="text-text-secondary mb-6">
          Your registration for {project.name} has been received. A sales representative will contact you shortly.
        </p>
        <button
          onClick={() => router.push(`/builder-projects/${project.slug}`)}
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Project
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-secondary">Step {step} of {totalSteps}</span>
          <span className="text-sm text-text-muted">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary mb-4">What's your name?</h3>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="Doe"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary mb-4">How can we reach you?</h3>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="(416) 555-0123"
              />
              <p className="mt-1 text-xs text-text-muted">We'll use this to reach you about your registration</p>
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">What's your budget range?</h3>
            <div className="space-y-2">
              {BUDGET_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => updateField('budgetRange', range.value)}
                  className={cn(
                    'w-full px-4 py-3 border-2 rounded-lg text-left transition-all duration-200',
                    formData.budgetRange === range.value
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-gray-200 hover:border-primary/50'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Timeline */}
        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-4">When are you looking to move?</h3>
            <div className="space-y-2">
              {TIMELINE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateField('timeline', option.value)}
                  className={cn(
                    'w-full px-4 py-3 border-2 rounded-lg text-left transition-all duration-200',
                    formData.timeline === option.value
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-gray-200 hover:border-primary/50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 py-3 border-2 border-gray-200 rounded-lg font-medium text-secondary hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!validateStep(step) || isSubmitting}
            className={cn(
              'flex-1 py-3 rounded-lg font-medium transition-all duration-200',
              validateStep(step) && !isSubmitting
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : step === totalSteps ? (
              'Submit Registration'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
