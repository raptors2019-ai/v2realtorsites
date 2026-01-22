import { renderHook } from '@testing-library/react'
import { useWelcomeMessage } from '../../chatbot/hooks/useWelcomeMessage'
import type { StoredContext } from '../../chatbot/hooks/useStoredContext'
import type { Message } from '../../chatbot/chatbot-store'

describe('useWelcomeMessage', () => {
  const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'msg-1',
    role: 'assistant',
    content: 'Default message',
    ...overrides,
  })

  const createWelcomeMessage = (content = 'Welcome to our chat!'): Message => ({
    id: 'welcome',
    role: 'assistant',
    content,
  })

  describe('isReturningVisitor', () => {
    it('should return false when storedContext is null', () => {
      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext: null,
          messages: [],
        })
      )

      expect(result.current.isReturningVisitor).toBe(false)
    })

    it('should return false when contact has no name', () => {
      const storedContext: StoredContext = {
        contact: { phone: '555-1234' },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.isReturningVisitor).toBe(false)
    })

    it('should return false when contact has no phone', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John' },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.isReturningVisitor).toBe(false)
    })

    it('should return true when contact has both name and phone', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.isReturningVisitor).toBe(true)
    })
  })

  describe('welcomeMessage generation', () => {
    it('should return null when not hydrated', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: false,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toBeNull()
    })

    it('should return null when not returning visitor', () => {
      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext: null,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toBeNull()
    })

    it('should return null when contact has no name', () => {
      const storedContext: StoredContext = {
        contact: { phone: '555-1234' },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toBeNull()
    })

    it('should generate message with propertyType and location', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
        preferences: {
          propertyType: 'condo',
          locations: ['Toronto'],
        },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toBe(
        'Welcome back, John! Last time you were looking at condo homes in Toronto. Want to continue your search or explore something new?'
      )
    })

    it('should generate message with only propertyType', () => {
      const storedContext: StoredContext = {
        contact: { name: 'Jane', phone: '555-5678' },
        preferences: {
          propertyType: 'townhouse',
        },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toBe(
        'Welcome back, Jane! Last time you were looking at townhouse homes. Want to continue your search or look at something different?'
      )
    })

    it('should generate message with only location', () => {
      const storedContext: StoredContext = {
        contact: { name: 'Bob', phone: '555-9999' },
        preferences: {
          locations: ['Mississauga'],
        },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toBe(
        'Welcome back, Bob! Last time you were interested in Mississauga. Want to continue exploring or search somewhere new?'
      )
    })

    it('should generate generic message when no preferences', () => {
      const storedContext: StoredContext = {
        contact: { name: 'Alice', phone: '555-0000' },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toBe(
        'Welcome back, Alice! Great to see you again. What can I help you find today?'
      )
    })

    it('should use first location when multiple locations exist', () => {
      const storedContext: StoredContext = {
        contact: { name: 'Tom', phone: '555-1111' },
        preferences: {
          locations: ['Oakville', 'Burlington', 'Hamilton'],
        },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.welcomeMessage).toContain('Oakville')
      expect(result.current.welcomeMessage).not.toContain('Burlington')
    })
  })

  describe('displayMessages', () => {
    it('should return original messages when no welcomeMessage', () => {
      const messages = [createMessage({ content: 'Hello' })]

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext: null,
          messages,
        })
      )

      expect(result.current.displayMessages).toEqual(messages)
    })

    it('should return original messages when messages array is empty', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages: [],
        })
      )

      expect(result.current.displayMessages).toEqual([])
    })

    it('should replace welcome message with personalized one', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const messages = [createWelcomeMessage('Default welcome')]

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages,
        })
      )

      expect(result.current.displayMessages[0].content).toBe(
        'Welcome back, John! Great to see you again. What can I help you find today?'
      )
      expect(result.current.displayMessages[0].id).toBe('welcome')
    })

    it('should not replace non-welcome messages', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const messages = [
        createMessage({ id: 'not-welcome', content: 'Regular message' }),
      ]

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages,
        })
      )

      expect(result.current.displayMessages[0].content).toBe('Regular message')
    })

    it('should only replace first message with id "welcome"', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const messages = [
        createWelcomeMessage('First welcome'),
        createMessage({ content: 'User response' }),
        createMessage({ id: 'welcome', content: 'Should not be replaced' }),
      ]

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages,
        })
      )

      expect(result.current.displayMessages[0].content).toContain('Welcome back, John')
      expect(result.current.displayMessages[2].content).toBe('Should not be replaced')
    })

    it('should not replace welcome message if role is user', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const messages = [
        { id: 'welcome', role: 'user' as const, content: 'User message with welcome id' },
      ]

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages,
        })
      )

      expect(result.current.displayMessages[0].content).toBe('User message with welcome id')
    })

    it('should preserve other message properties when replacing', () => {
      const storedContext: StoredContext = {
        contact: { name: 'John', phone: '555-1234' },
      }

      const messages = [
        {
          ...createWelcomeMessage(),
          toolResult: { type: 'mortgageEstimate' as const, data: {} },
          cta: { type: 'url' as const, url: '/test', text: 'Test' },
        },
      ]

      const { result } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext,
          messages,
        })
      )

      expect(result.current.displayMessages[0].toolResult).toBeDefined()
      expect(result.current.displayMessages[0].cta).toBeDefined()
    })
  })

  describe('memoization', () => {
    it('should return same displayMessages reference when inputs unchanged', () => {
      const messages = [createWelcomeMessage()]

      const { result, rerender } = renderHook(() =>
        useWelcomeMessage({
          isHydrated: true,
          storedContext: null,
          messages,
        })
      )

      const firstResult = result.current.displayMessages

      rerender()

      expect(result.current.displayMessages).toBe(firstResult)
    })
  })
})
