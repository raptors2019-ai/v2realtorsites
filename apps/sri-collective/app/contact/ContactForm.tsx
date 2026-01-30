'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackLeadFormSubmit, trackFormStart, trackFormSubmit } from '@repo/analytics'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  interest: string
  city: string
  timeline: string
  budget: string
  message: string
  // Property-specific fields (populated from URL when coming from property page)
  inquiryType: string  // 'viewing' | 'question' | ''
  propertyAddress: string
  propertyMls: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  interest: '',
  city: '',
  timeline: '',
  budget: '',
  message: '',
  inquiryType: '',
  propertyAddress: '',
  propertyMls: '',
}

// GTA cities for dropdown (users can also type their own)
const GTA_CITIES = [
  'Toronto',
  'North York',
  'Scarborough',
  'Etobicoke',
  'Mississauga',
  'Brampton',
  'Vaughan',
  'Markham',
  'Richmond Hill',
  'Oakville',
  'Burlington',
  'Milton',
  'Hamilton',
  'Ajax',
  'Pickering',
  'Whitby',
  'Oshawa',
  'Newmarket',
  'Aurora',
  'King City',
  'Stouffville',
  'Caledon',
  'Georgetown',
  'Halton Hills',
  'Grimsby',
  'St. Catharines',
  'Niagara Falls',
]

// Timeline options
const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3-months', label: '1-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-plus-months', label: '6+ months' },
  { value: 'just-exploring', label: 'Just exploring' },
]

// Budget ranges (aligned with BoldTrail hashtags)
const BUDGET_OPTIONS = [
  { value: 'under-500k', label: 'Under $500K' },
  { value: '500k-750k', label: '$500K - $750K' },
  { value: '750k-1m', label: '$750K - $1M' },
  { value: '1m-2m', label: '$1M - $2M' },
  { value: '2m-plus', label: '$2M+' },
]

export function ContactForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [formStarted, setFormStarted] = useState(false)

  // Track form start when user focuses on the first field
  const handleFormStart = () => {
    if (!formStarted) {
      setFormStarted(true)
      trackFormStart('contact')
    }
  }

  // Pre-fill form based on URL params
  useEffect(() => {
    const interest = searchParams.get('interest')
    const type = searchParams.get('type')  // 'viewing' or 'question'
    const address = searchParams.get('address')
    const mls = searchParams.get('mls')
    const cityParam = searchParams.get('city')
    const priceParam = searchParams.get('price')

    // Helper to determine budget range from price (aligned with BoldTrail hashtags)
    const getBudgetFromPrice = (price: number): string => {
      if (price < 500000) return 'under-500k'
      if (price < 750000) return '500k-750k'
      if (price < 1000000) return '750k-1m'
      if (price < 2000000) return '1m-2m'
      return '2m-plus'
    }

    // Handle property-specific inquiries (viewing or question)
    if (type && address) {
      let message = ''
      if (type === 'viewing') {
        message = `Hi, I'm interested in scheduling a viewing for the property at ${address}`
        if (mls) message += ` (MLS# ${mls})`
        message += `. Please let me know your available times.`
      } else if (type === 'question') {
        message = `Hi, I had a question about the property at ${address}`
        if (mls) message += ` (MLS# ${mls})`
        message += `.\n\nMy question is: `
      }

      // Pre-populate city and budget from property data
      const cityValue = cityParam && GTA_CITIES.includes(cityParam) ? cityParam : ''
      const budgetValue = priceParam ? getBudgetFromPrice(parseInt(priceParam, 10)) : ''

      setFormData((prev) => ({
        ...prev,
        interest: 'buying',  // Property inquiries are typically buyers
        city: cityValue,
        budget: budgetValue,
        message,
        // Property-specific fields for CRM handling
        inquiryType: type,  // 'viewing' or 'question'
        propertyAddress: address,
        propertyMls: mls || '',
      }))
      return  // Don't process other interest params
    }

    // Handle general interest params
    if (interest) {
      const messageMap: Record<string, string> = {
        selling: "I'm interested in selling a house. ",
        valuation: "I'm interested in getting a free home valuation. ",
        buying: "I'm interested in buying a property. ",
        renting: "I'm looking to rent a property. ",
      }

      // Map valuation to selling in dropdown (valuation option removed)
      const dropdownInterest = interest === 'valuation' ? 'selling' : interest

      setFormData((prev) => ({
        ...prev,
        interest: dropdownInterest,
        message: messageMap[interest] || prev.message,
      }))
    }
  }, [searchParams])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit form')
      }

      console.log('[contact.form.success]', {
        contactId: result.contactId,
        fallback: result.fallback,
      })

      // Track successful form submission
      trackFormSubmit('contact', true)
      trackLeadFormSubmit('contact')

      setStatus('success')
      setFormData(initialFormData)
      setFormStarted(false) // Reset for potential future submissions

      // Reset status after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      console.error('[contact.form.error]', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      trackFormSubmit('contact', false, undefined, errorMessage)
      setStatus('error')

      // Reset error status after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-secondary mb-2">Message Sent!</h3>
        <p className="text-text-secondary">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-secondary mb-2">Oops! Something went wrong</h3>
        <p className="text-text-secondary mb-6">
          We couldn&apos;t send your message. Please try again or contact us directly.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-secondary mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onFocus={handleFormStart}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-secondary mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          placeholder="john@example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
          placeholder="+1 (416) 000-0000"
        />
      </div>

      {/* Interest */}
      <div>
        <label htmlFor="interest" className="block text-sm font-medium text-secondary mb-2">
          I&apos;m Interested In <span className="text-red-500">*</span>
        </label>
        <select
          id="interest"
          name="interest"
          value={formData.interest}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
        >
          <option value="">Select an option</option>
          <option value="buying">Buying a Property</option>
          <option value="selling">Selling a Property</option>
          <option value="renting">Renting a Property</option>
          <option value="general">General Inquiry</option>
        </select>
      </div>

      {/* Buyer/Renter specific fields */}
      {(formData.interest === 'buying' || formData.interest === 'renting') && (
        <>
          {/* City and Timeline Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* City - Searchable input with datalist */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-secondary mb-2">
                Preferred City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                list="city-options"
                value={formData.city}
                onChange={handleChange}
                placeholder="Type or select a city"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
                autoComplete="off"
              />
              <datalist id="city-options">
                {GTA_CITIES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>

            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-secondary mb-2">
                Timeline
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
              >
                <option value="">When are you looking?</option>
                {TIMELINE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-secondary mb-2">
              Budget Range
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
            >
              <option value="">Select your budget</option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-secondary mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 resize-none"
          placeholder="Tell us about what you're looking for..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full btn-primary px-8 py-4 rounded-lg text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {status === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </button>

      <p className="text-xs text-text-secondary text-center">
        By submitting this form, you agree to be contacted by Sri Collective Group regarding your inquiry.
      </p>
    </form>
  )
}
