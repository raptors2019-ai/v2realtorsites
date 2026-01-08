import { NextRequest, NextResponse } from 'next/server'
import { BoldTrailClient } from '@repo/crm'
import type { ContactData } from '@repo/crm'

export const runtime = 'edge'

/**
 * Contact form submission endpoint for NewHomeShow
 * Creates a lead in BoldTrail CRM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { firstName, lastName, email, phone, interest, message, source } = body

    if (!firstName || !lastName || !email || !interest || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Map interest to leadType
    const leadTypeMap: Record<string, 'buyer' | 'seller' | 'investor' | 'general'> = {
      buying: 'buyer',
      investing: 'investor',
      assignment: 'buyer',
      general: 'general',
    }

    const leadType = leadTypeMap[interest] || 'general'

    // Build detailed notes for the CRM
    const notesLines = [
      `=== Lead from NewHomeShow Website ===`,
      ``,
      `Interest Type: ${interest}`,
      `Form: ${source || 'Connect with Sales'}`,
      ``,
      `--- Customer Message ---`,
      message,
      ``,
      `--- Contact Details ---`,
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      ``,
      `Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })}`,
    ].filter(Boolean).join('\n')

    // Prepare contact data for BoldTrail
    const contactData: ContactData = {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      source: 'newhomeshow',
      leadType,
      customFields: {
        notes: notesLines,
        interest_type: interest,
      },
    }

    // Create contact in BoldTrail
    const client = new BoldTrailClient()
    const result = await client.createContact(contactData)

    if (!result.success) {
      console.error('[api.contact.failed]', result.error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit form. Please try again or call us directly.' },
        { status: 500 }
      )
    }

    console.log('[api.contact.success]', {
      contactId: result.contactId,
      fallback: result.fallback,
      leadType,
      source: source || 'NewHomeShow',
    })

    return NextResponse.json({
      success: true,
      contactId: result.contactId,
      fallback: result.fallback,
    })
  } catch (error) {
    console.error('[api.contact.error]', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
