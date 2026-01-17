'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// FAQ data from chatbot package
const faqs = [
  {
    id: 'home-buying-process',
    question: 'What are the steps to buying a home in Ontario?',
    answer: 'The home buying process in Ontario typically takes 3-6 months from start to finish.',
    steps: [
      'Get mortgage pre-approval (shows you\'re a serious buyer and locks in your rate)',
      'Find a real estate agent (their commission is paid by the seller)',
      'Search for homes and attend viewings',
      'Make an offer (Agreement of Purchase and Sale)',
      'Complete conditions (financing approval, home inspection)',
      'Finalize mortgage and hire a real estate lawyer',
      'Closing day (sign documents, get your keys!)',
    ],
  },
  {
    id: 'closing-costs',
    question: 'What are closing costs and how much should I budget?',
    answer: 'Closing costs in Ontario typically range from 1.5-4% of the purchase price, not including your down payment.',
    breakdown: [
      { item: 'Land Transfer Tax', amount: '0.5-2.5% of purchase price (doubled in Toronto)' },
      { item: 'Legal Fees', amount: '$1,500-$2,500' },
      { item: 'Title Insurance', amount: '$250-$400' },
      { item: 'Home Inspection', amount: '$500-$800' },
      { item: 'Appraisal', amount: '$400-$600 (sometimes covered by lender)' },
      { item: 'Moving Costs', amount: '$500-$2,000' },
      { item: 'PST on CMHC', amount: '8% of CMHC premium (if applicable)' },
    ],
  },
  {
    id: 'pre-approval',
    question: 'Do I need mortgage pre-approval?',
    answer: 'Yes! Getting pre-approved is one of the most important first steps in the home buying process. It\'s free and gives you a significant advantage.',
    benefits: [
      'Know your exact budget before you start searching',
      'Sellers take your offer more seriously (shows you\'re qualified)',
      'Lock in your interest rate for 90-120 days (protection against rate increases)',
      'Identify any credit issues early so you have time to address them',
      'Faster closing process since financing is already reviewed',
    ],
  },
  {
    id: 'down-payment',
    question: 'How much down payment do I need?',
    answer: 'The minimum down payment in Canada depends on the purchase price. Lower down payments require CMHC mortgage insurance.',
    requirements: [
      { range: 'Under $500K', amount: '5% minimum ($25,000 on a $500K home)' },
      { range: '$500K to $1M', amount: '5% of first $500K + 10% of amount above $500K' },
      { range: 'Over $1M', amount: '20% minimum (CMHC insurance not available)' },
    ],
    example: 'For a $750,000 home: $25,000 (5% of $500K) + $25,000 (10% of $250K) = $50,000 minimum down payment',
  },
]

const incentives = [
  {
    name: 'Ontario Land Transfer Tax Rebate',
    benefit: 'Up to $4,000 rebate',
    eligibility: 'Never owned a home anywhere in the world',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Toronto Municipal LTT Rebate',
    benefit: 'Up to $4,475 additional rebate',
    eligibility: 'Purchasing in Toronto only',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'First Home Savings Account (FHSA)',
    benefit: '$8,000/year tax-deductible, tax-free withdrawal',
    eligibility: 'Canadian resident, 18+, haven\'t owned a home in past 4 years',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Home Buyers\' Plan (HBP)',
    benefit: 'Withdraw up to $60,000 from RRSP tax-free',
    eligibility: 'First-time buyer, 15-year repayment period',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Federal First-Time Home Buyers\' Tax Credit',
    benefit: '$1,500 non-refundable tax credit',
    eligibility: 'First-time home buyers',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
]

const steps = [
  {
    number: 1,
    title: 'Get Pre-Approved',
    description: 'Lock in your rate and know your exact budget before you start searching.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Find Your Agent',
    description: 'A good agent guides you through the process. Their commission is paid by the seller.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Search & View',
    description: 'Explore properties that match your criteria and attend viewings.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Make an Offer',
    description: 'Submit your Agreement of Purchase and Sale with your terms and conditions.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: 5,
    title: 'Complete Conditions',
    description: 'Fulfill your conditions: financing approval, home inspection, etc.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: 6,
    title: 'Close & Get Keys',
    description: 'Sign the final documents with your lawyer and receive your keys!',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
]

function AccordionItem({ faq, isOpen, onToggle }: { faq: typeof faqs[0], isOpen: boolean, onToggle: () => void }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900">{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4 text-slate-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-slate-600 mb-4">{faq.answer}</p>

              {faq.steps && (
                <ol className="space-y-2">
                  {faq.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {faq.breakdown && (
                <div className="space-y-2">
                  {faq.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                      <span className="text-slate-700">{item.item}</span>
                      <span className="font-medium text-slate-900">{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}

              {faq.benefits && (
                <ul className="space-y-2">
                  {faq.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}

              {faq.requirements && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {faq.requirements.map((req, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                        <span className="text-slate-700">{req.range}</span>
                        <span className="font-medium text-slate-900 text-right">{req.amount}</span>
                      </div>
                    ))}
                  </div>
                  {faq.example && (
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Example:</strong> {faq.example}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FirstTimeBuyerClient() {
  const [openFaq, setOpenFaq] = useState<string | null>('home-buying-process')

  return (
    <div className="space-y-12">
      {/* Incentives Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">First-Time Buyer Incentives</h2>
        </div>
        <p className="text-white/80 mb-6">Save up to $10,000+ with these programs (even more in Toronto!)</p>

        <div className="grid gap-4">
          {incentives.map((incentive, index) => (
            <motion.div
              key={incentive.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  {incentive.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{incentive.name}</h3>
                  <p className="text-amber-100 font-medium">{incentive.benefit}</p>
                  <p className="text-white/70 text-sm mt-1">{incentive.eligibility}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Step-by-Step Process */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-6">The Home Buying Process</h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200 hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex gap-4 md:gap-6"
              >
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25">
                  {step.icon}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-slate-900">
                    <span className="text-primary mr-2">Step {step.number}:</span>
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mt-1">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* FAQ Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openFaq === faq.id}
              onToggle={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-50 rounded-2xl p-6 md:p-8"
      >
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Ready to Start Your Journey?</h2>
          <p className="text-slate-600 mb-6">
            Calculate your affordability or explore available properties in the GTA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/mortgage-calculator"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Affordability
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Properties
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
