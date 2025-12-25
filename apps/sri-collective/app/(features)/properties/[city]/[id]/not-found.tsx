import Link from 'next/link'

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <svg className="w-24 h-24 text-primary/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-secondary mb-4">
          Property No Longer Available
        </h1>

        <p className="text-text-secondary mb-8 leading-relaxed">
          This property has been sold, removed from the market, or the listing has expired.
          Browse our other available properties below.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/properties"
            className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium"
          >
            View All Properties
          </Link>
          <Link
            href="/contact"
            className="btn-outline px-8 py-3.5 rounded-lg text-sm"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
