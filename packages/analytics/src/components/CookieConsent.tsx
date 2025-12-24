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
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
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
    <div
      className="fixed bottom-6 left-6 max-w-sm rounded-2xl shadow-2xl overflow-hidden"
      style={{
        zIndex: 9998,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
      }}
    >
      <div className="p-5">
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: '#e5e5e5' }}
        >
          We use cookies to analyze site traffic and improve your experience.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              background: 'transparent'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              background: '#c9a962',
              color: '#1a1a2e'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#d4b978'}
            onMouseOut={(e) => e.currentTarget.style.background = '#c9a962'}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
