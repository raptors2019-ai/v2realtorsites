'use client'

import { useEffect, useState } from 'react'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setShowBanner(true)
    } else if (consent === 'accepted') {
      updateConsent(true)
    }
  }, [])

  const updateConsent = (granted: boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied',
      })
    }
  }

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    updateConsent(true)
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected')
    updateConsent(false)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          We use cookies to analyze site traffic and improve your experience.
        </p>
        <div className="flex gap-4">
          <button onClick={handleReject} className="px-4 py-2 border rounded">
            Reject
          </button>
          <button onClick={handleAccept} className="px-4 py-2 bg-white text-gray-900 rounded">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
