'use client'

import { useEffect, useState } from 'react'
import { useChatbotStore } from './chatbot-store'

/**
 * Hook to safely use chatbot store in Next.js with SSR
 * Prevents hydration mismatches by manually triggering rehydration
 */
export function useChatbotHydration() {
  const [hydrated, setHydrated] = useState(false)
  const store = useChatbotStore()

  useEffect(() => {
    // Manually trigger rehydration from localStorage
    useChatbotStore.persist.rehydrate()

    // Generate session ID if doesn't exist
    if (!store.sessionId) {
      const sessionId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      store.setSessionId(sessionId)
    }

    setHydrated(true)
  }, [store])

  return { ...store, hydrated }
}

/**
 * Get session ID synchronously (for API calls)
 * Falls back to generating a new one
 */
export function getClientSessionId(): string {
  if (typeof window === 'undefined') return ''

  try {
    const stored = localStorage.getItem('sri-chatbot-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.state?.sessionId) {
        return parsed.state.sessionId
      }
    }
  } catch {
    // Ignore parse errors
  }

  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
