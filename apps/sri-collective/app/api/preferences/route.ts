import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@repo/lib/session'

export const runtime = 'edge'

/**
 * Save anonymous preferences
 */
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId()
    const { preferences, viewedProperties } = await req.json()

    // In production, store to database (Redis, Prisma, etc.)
    // For now, log and acknowledge
    console.error('[api.preferences.save]', {
      sessionId,
      preferencesCount: Object.keys(preferences || {}).length,
      viewedPropertiesCount: (viewedProperties || []).length,
    })

    // TODO: Store to database
    // await db.anonymousPreferences.upsert({
    //   where: { sessionId },
    //   create: { sessionId, preferences, viewedProperties },
    //   update: { preferences, viewedProperties },
    // })

    return NextResponse.json({
      success: true,
      sessionId,
    })
  } catch (error) {
    console.error('[api.preferences.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

/**
 * Get preferences for session
 */
export async function GET() {
  try {
    const sessionId = await getOrCreateSessionId()

    // TODO: Fetch from database
    // const stored = await db.anonymousPreferences.findUnique({
    //   where: { sessionId },
    // })

    return NextResponse.json({
      success: true,
      sessionId,
      preferences: {},
      viewedProperties: [],
    })
  } catch (error) {
    console.error('[api.preferences.get.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}
