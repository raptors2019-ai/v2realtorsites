import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ContactForm } from './ContactForm'
import { ContactPageClient } from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact Us | Sri Collective Group',
  description: 'Get in touch with Sri Collective Group - Your trusted real estate team in the Greater Toronto Area.',
}

const agents = [
  {
    name: 'Sri Kathiravelu',
    title: 'Real Estate Agent',
    phone: '+1 (416) 786-0431',
    email: 'sri@sricollectivegroup.com',
  },
  {
    name: 'Niru Arulselvan',
    title: 'Real Estate Agent',
    phone: '+1 (416) 786-0431',
    email: 'niru@sricollectivegroup.com',
  },
]

const serviceAreas = [
  'Toronto',
  'Mississauga',
  'Brampton',
  'Vaughan',
  'Markham',
  'Richmond Hill',
  'Oakville',
  'Burlington',
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="accent-line mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Let&apos;s <span className="text-gradient-primary">Connect</span>
            </h1>
            <p className="text-text-secondary text-lg">
              Whether you&apos;re buying, selling, or just have questions about the GTA real estate market,
              we&apos;re here to help you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Left Column - Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Agent Cards */}
                <ContactPageClient agents={agents} />

                {/* Service Areas */}
                <div>
                  <h2 className="text-xl font-semibold text-secondary mb-6">Areas We Serve</h2>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1.5 bg-primary/5 text-primary text-sm rounded-full font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column - Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 shadow-sm">
                  <h2 className="text-2xl font-semibold text-secondary mb-2">Send Us a Message</h2>
                  <p className="text-text-secondary mb-8">
                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                  </p>
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }>
                    <ContactForm />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
