import type { LeadEmailData } from './types'
import { buildLeadEmailHtml } from './templates'

const RESEND_API_URL = 'https://api.resend.com/emails'

export async function sendLeadNotificationEmail(data: LeadEmailData): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email.send.noApiKey] RESEND_API_KEY not configured, skipping email')
    return { success: false, error: 'No API key' }
  }

  const recipients = (process.env.LEAD_NOTIFICATION_EMAILS || 'contact@newhouseshow.ca,info@newhouseshow.ca')
    .split(',').map(e => e.trim())

  const from = process.env.LEAD_NOTIFICATION_FROM || 'leads@newhomeshow.ca'

  const { subject, html } = buildLeadEmailHtml(data)

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: recipients, subject, html }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[email.send.error]', { status: response.status, error: errorText })
      return { success: false, error: errorText }
    }

    console.log('[email.send.success]', { to: recipients, subject })
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[email.send.fetchError]', { error: message })
    return { success: false, error: message }
  }
}
