import { NextRequest, NextResponse } from 'next/server'
import { BoldTrailClient } from '@repo/crm'
import { setContactCookies } from '@repo/lib/session'

export const runtime = 'edge'

/**
 * Sync anonymous preferences to CRM contact
 * Phone is the primary identifier (more valuable for real estate leads)
 */
export async function POST(req: NextRequest) {
  try {
    const {
      sessionId,
      contactId,
      phone, // Primary identifier - REQUIRED
      email, // Optional secondary
      firstName,
      preferences,
      viewedProperties,
    } = await req.json()

    // Phone is required as primary identifier
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone format (10-11 digits)
    const cleanedPhone = phone.replace(/\D/g, '')
    if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 10-digit phone number' },
        { status: 400 }
      )
    }

    console.error('[api.preferences.sync]', {
      sessionId,
      contactId,
      phone: cleanedPhone,
      email,
      preferencesKeys: Object.keys(preferences || {}),
      viewedCount: (viewedProperties || []).length,
    })

    // Build notes JSON with preferences and viewed properties
    const notesData = {
      syncedAt: new Date().toISOString(),
      sourceSessionId: sessionId,
      preferences: preferences || {},
      viewedProperties: (viewedProperties || []).map((p: { listingId: string; address: string; viewedAt: string }) => ({
        listingId: p.listingId,
        address: p.address,
        viewedAt: p.viewedAt,
      })),
    }

    let finalContactId = contactId

    // If no contactId, create new contact in BoldTrail
    if (!contactId && phone) {
      const client = new BoldTrailClient()

      const response = await client.createContact({
        firstName: firstName || 'Lead',
        lastName: '',
        email: email || '',
        phone: cleanedPhone,
        source: 'chatbot',
        leadType: preferences?.leadType || 'buyer',
        customFields: {
          average_price: preferences?.budget?.max,
          average_beds: preferences?.bedrooms,
          city: preferences?.locations?.[0],
          notes: JSON.stringify(notesData),
        },
      })

      if (response.success && response.contactId) {
        finalContactId = response.contactId
      }
    }

    // Set cookies for returning user recognition (phone is primary)
    if (finalContactId && cleanedPhone) {
      await setContactCookies(finalContactId, cleanedPhone)
    }

    // TODO: Delete anonymous session data after successful sync
    // await db.anonymousPreferences.delete({ where: { sessionId } })

    return NextResponse.json({
      success: true,
      contactId: finalContactId,
      message: `Thanks! An agent will call you at ${phone} shortly.`,
    })
  } catch (error) {
    console.error('[api.preferences.sync.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync preferences' },
      { status: 500 }
    )
  }
}
