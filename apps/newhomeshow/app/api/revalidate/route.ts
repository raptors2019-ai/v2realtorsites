import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

/**
 * Sanity webhook handler for on-demand revalidation
 *
 * Configure in Sanity:
 * - URL: https://your-domain.com/api/revalidate
 * - Secret: SANITY_REVALIDATE_SECRET env var
 * - Trigger on: Create, Update, Delete
 * - Filter: _type == "builderProject"
 */
export async function POST(request: Request) {
  try {
    // Verify the webhook secret
    const secret = request.headers.get('x-sanity-secret')
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      console.error('[api.revalidate.unauthorized]', {
        hasSecret: !!secret,
        expected: !!process.env.SANITY_REVALIDATE_SECRET
      })
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Parse the webhook payload
    const body = await request.json()
    const { _type, slug } = body

    console.log('[api.revalidate.received]', { _type, slug: slug?.current })

    // Revalidate based on document type
    if (_type === 'builderProject') {
      // Revalidate all projects list and specific project tag
      const tags = ['projects']
      if (slug?.current) {
        tags.push(`project-${slug.current}`)
      }

      tags.forEach(tag => revalidateTag(tag, {}))

      console.log('[api.revalidate.success]', {
        type: _type,
        tags
      })

      return NextResponse.json({
        revalidated: true,
        type: _type,
        slug: slug?.current || null,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle productType changes (revalidate all projects)
    if (_type === 'productType') {
      revalidateTag('projects', {})

      console.log('[api.revalidate.success]', { type: _type, tags: ['projects'] })

      return NextResponse.json({
        revalidated: true,
        type: _type,
        timestamp: new Date().toISOString(),
      })
    }

    // Unknown type - log but don't fail
    console.log('[api.revalidate.skipped]', { type: _type })
    return NextResponse.json({
      revalidated: false,
      message: `Unknown document type: ${_type}`,
    })

  } catch (error) {
    console.error('[api.revalidate.error]', { error })
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation endpoint ready',
    configured: !!process.env.SANITY_REVALIDATE_SECRET,
  })
}
