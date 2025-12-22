import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-primary/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-secondary mb-4">
          Property Not Found
        </h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The property you&apos;re looking for may have been sold or is no longer available.
          Browse our current listings to find your perfect home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/properties"
            className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium inline-block"
          >
            Browse All Properties
          </Link>
          <Link
            href="/contact"
            className="btn-outline px-8 py-3.5 rounded-lg text-sm font-medium inline-block"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
