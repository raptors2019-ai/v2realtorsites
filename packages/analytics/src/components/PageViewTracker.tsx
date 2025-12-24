'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

/**
 * Tracks page views for client-side navigation in Next.js App Router.
 * Must be wrapped in Suspense boundary when used in layouts.
 *
 * @example
 * ```tsx
 * import { Suspense } from 'react'
 * import { PageViewTracker } from '@repo/analytics'
 *
 * <Suspense fallback={null}>
 *   <PageViewTracker />
 * </Suspense>
 * ```
 */
export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Construct full URL with search params
    const searchString = searchParams?.toString()
    const url = pathname + (searchString ? `?${searchString}` : '')

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [pathname, searchParams])

  return null
}
