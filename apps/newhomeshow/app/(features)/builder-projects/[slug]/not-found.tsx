import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-secondary mb-4">
          Project Not Found
        </h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          The project you're looking for may no longer be available or the link may be incorrect.
        </p>
        <Link
          href="/builder-projects"
          className="inline-block px-8 py-3.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md"
        >
          Browse All Projects
        </Link>
      </div>
    </div>
  )
}
