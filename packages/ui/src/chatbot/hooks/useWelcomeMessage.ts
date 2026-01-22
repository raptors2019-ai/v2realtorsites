'use client'

import { useMemo } from 'react'
import type { Message } from '../chatbot-store'
import type { StoredContext } from './useStoredContext'

interface UseWelcomeMessageOptions {
  isHydrated: boolean
  storedContext: StoredContext | null
  messages: Message[]
}

interface UseWelcomeMessageReturn {
  isReturningVisitor: boolean
  welcomeMessage: string | null
  displayMessages: Message[]
}

export function useWelcomeMessage({
  isHydrated,
  storedContext,
  messages,
}: UseWelcomeMessageOptions): UseWelcomeMessageReturn {
  const isReturningVisitor = Boolean(storedContext?.contact?.name && storedContext?.contact?.phone)

  const welcomeMessage = useMemo(() => {
    if (!isHydrated || !isReturningVisitor || !storedContext?.contact?.name) {
      return null
    }

    const name = storedContext.contact.name
    const propertyType = storedContext.preferences?.propertyType
    const location = storedContext.preferences?.locations?.[0]

    if (propertyType && location) {
      return `Welcome back, ${name}! Last time you were looking at ${propertyType} homes in ${location}. Want to continue your search or explore something new?`
    } else if (propertyType) {
      return `Welcome back, ${name}! Last time you were looking at ${propertyType} homes. Want to continue your search or look at something different?`
    } else if (location) {
      return `Welcome back, ${name}! Last time you were interested in ${location}. Want to continue exploring or search somewhere new?`
    }

    return `Welcome back, ${name}! Great to see you again. What can I help you find today?`
  }, [isHydrated, isReturningVisitor, storedContext])

  const displayMessages = useMemo(() => {
    if (!welcomeMessage || messages.length === 0) {
      return messages
    }

    return messages.map((msg, index) => {
      if (index === 0 && msg.id === 'welcome' && msg.role === 'assistant') {
        return { ...msg, content: welcomeMessage }
      }
      return msg
    })
  }, [messages, welcomeMessage])

  return { isReturningVisitor, welcomeMessage, displayMessages }
}
