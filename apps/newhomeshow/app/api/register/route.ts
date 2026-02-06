import { NextResponse } from 'next/server'
import { BoldTrailClient, sendLeadNotificationEmail } from '@repo/crm'
import type { ContactData } from '@repo/crm'
import { calculateLeadQuality } from '@repo/types'
import type { RegistrationData } from '@repo/types'
import { z } from 'zod'

export const runtime = 'edge'

/**
 * Registration form validation schema
 */
const registrationSchema = z.object({
  projectSlug: z.string().min(1),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  budgetRange: z.string().min(1, 'Budget range is required'),
  timeline: z.string().min(1, 'Timeline is required'),
  source: z.string().optional(),
})

/**
 * Map budget range to readable format
 */
function formatBudgetRange(value: string): string {
  const budgetMap: Record<string, string> = {
    'under-500k': 'Under $500K',
    '500k-750k': '$500K - $750K',
    '750k-1m': '$750K - $1M',
    '1m-1.5m': '$1M - $1.5M',
    'over-1.5m': 'Over $1.5M',
  }
  return budgetMap[value] || value
}

/**
 * Map timeline to readable format
 */
function formatTimeline(value: string): string {
  const timelineMap: Record<string, string> = {
    'immediately': 'Immediately',
    '1-3-months': '1-3 Months',
    '3-6-months': '3-6 Months',
    '6-12-months': '6-12 Months',
    'just-browsing': 'Just Browsing',
  }
  return timelineMap[value] || value
}

/**
 * Registration API endpoint
 * Creates a lead in BoldTrail CRM
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = registrationSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[api.register.validation-failed]', {
        errors: validationResult.error.flatten(),
      })
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data as RegistrationData

    // Calculate lead quality
    const leadQuality = calculateLeadQuality(data)

    // Prepare notes with formatted data
    const notes = [
      `Pre-Construction Registration: ${data.projectSlug}`,
      `Budget: ${formatBudgetRange(data.budgetRange)}`,
      `Timeline: ${formatTimeline(data.timeline)}`,
      `Lead Quality: ${leadQuality.toUpperCase()}`,
      '',
      `Source: ${data.source || 'NewHomeShow Registration'}`,
    ].join('\n')

    // Map lead quality to lead type
    const leadTypeMap: Record<string, 'buyer' | 'investor' | 'general'> = {
      'hot': 'buyer',
      'warm': 'buyer',
      'cold': 'general',
    }

    // Prepare contact data for BoldTrail
    const contactData: ContactData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      source: 'newhomeshow',
      leadType: leadTypeMap[leadQuality],
      customFields: {
        notes,
        project: data.projectSlug,
        project_source: `newhomeshow-${data.projectSlug}`,
        budget_range: data.budgetRange,
        timeline: data.timeline,
        lead_quality: leadQuality,
      },
    }

    // Create contact in BoldTrail
    const client = new BoldTrailClient()
    const result = await client.createContact(contactData)

    if (!result.success) {
      console.error('[api.register.crm-failed]', { error: result.error })
      return NextResponse.json(
        { success: false, error: 'Failed to complete registration. Please try again.' },
        { status: 500 }
      )
    }

    // Fire-and-forget email notification
    sendLeadNotificationEmail({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      source: 'newhomeshow',
      leadSource: 'registration',
      leadType: leadTypeMap[leadQuality],
      leadQuality,
      budget: formatBudgetRange(data.budgetRange),
      timeline: formatTimeline(data.timeline),
      projectSlug: data.projectSlug,
    }).catch(err => console.error('[api.register.email.error]', err))

    console.log('[api.register.success]', {
      project: data.projectSlug,
      leadQuality,
      contactId: result.contactId,
      fallback: result.fallback,
    })

    return NextResponse.json({
      success: true,
      contactId: result.contactId,
      leadQuality,
      fallback: result.fallback,
    })
  } catch (error) {
    console.error('[api.register.error]', { error })
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
