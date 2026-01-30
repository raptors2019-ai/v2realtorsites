import { NextRequest, NextResponse } from 'next/server'
import { BoldTrailClient } from '@repo/crm'
import type { ContactData } from '@repo/crm'

export const runtime = 'edge'

/**
 * Contact form submission endpoint
 * Creates a lead in BoldTrail CRM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { firstName, lastName, email, phone, interest, city, timeline, budget, message } = body

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
      selling: 'seller',
      renting: 'buyer',
      valuation: 'seller',
      general: 'general',
    }

    const leadType = leadTypeMap[interest] || 'general'

    // Build hashtags for CRM
    // Available hashtags must be pre-created in BoldTrail: Marketing > Hashtag Management
    const hashtags: string[] = [
      'website',
      'sri-collective',
      leadType, // buyer, seller, general, investor
    ]

    // Add city hashtag (lowercase, hyphenated)
    if (city) {
      const cityTag = city.toLowerCase().replace(/\s+/g, '-')
      hashtags.push(cityTag)
    }

    // Add timeline hashtag
    if (timeline) {
      hashtags.push(`timeline-${timeline}`)
    }

    // Add budget hashtag
    if (budget) {
      hashtags.push(`budget-${budget}`)
    }

    // Build detailed notes for the CRM (stored in notes field, may not show in activity)
    const notesLines = [
      `=== Lead from Sri Collective Website ===`,
      ``,
      `Interest: ${interest}`,
      city ? `City: ${city}` : null,
      timeline ? `Timeline: ${timeline}` : null,
      budget ? `Budget: ${budget}` : null,
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
      source: 'sri-collective',
      leadType,
      customFields: {
        hashtags,
        notes: notesLines,
        interest_type: interest,
        city: city || undefined,
      },
    }

    // Create contact in BoldTrail
    // The client will attempt to:
    // 1. Create contact with basic info
    // 2. Add hashtags via separate endpoint (if available)
    // 3. Add note to activity timeline (if available)
    const client = new BoldTrailClient()
    const result = await client.createContact(contactData)

    if (!result.success) {
      console.error('[api.contact.failed]', result.error)
      return NextResponse.json(
        { success: false, error: 'Failed to submit form. Please try again or call us directly.' },
        { status: 500 }
      )
    }

    // Log success with hashtag info for debugging
    console.log('[api.contact.success]', {
      contactId: result.contactId,
      fallback: result.fallback,
      leadType,
      hashtags,
      noteLength: notesLines.length,
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
