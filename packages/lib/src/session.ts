import { cookies } from 'next/headers'

export const SESSION_COOKIE_NAME = 'sri_session_id'
export const CONTACT_COOKIE_NAME = 'sri_contact_id'
export const PHONE_COOKIE_NAME = 'sri_phone' // Primary identifier
export const SESSION_DURATION = 60 * 60 * 24 * 30 // 30 days

/**
 * Get or create anonymous session ID (server-side)
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies()
  const existing = cookieStore.get(SESSION_COOKIE_NAME)

  if (existing?.value) {
    return existing.value
  }

  // Generate new session ID
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

  // Set cookie with secure options
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return sessionId
}

/**
 * Get session ID if exists (server-side)
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null
}

/**
 * Set contact cookies when user is identified
 * Phone is the primary identifier
 */
export async function setContactCookies(
  contactId: string,
  phone: string
): Promise<void> {
  const cookieStore = await cookies()
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION,
    path: '/',
  }

  cookieStore.set(CONTACT_COOKIE_NAME, contactId, cookieOptions)
  cookieStore.set(PHONE_COOKIE_NAME, phone, cookieOptions)
}

/**
 * Get contact ID if exists (returning user)
 */
export async function getContactId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CONTACT_COOKIE_NAME)?.value || null
}

/**
 * Get phone if exists (returning user - primary identifier)
 */
export async function getStoredPhone(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(PHONE_COOKIE_NAME)?.value || null
}

/**
 * Clear session cookies
 */
export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(CONTACT_COOKIE_NAME)
  cookieStore.delete(PHONE_COOKIE_NAME)
}
