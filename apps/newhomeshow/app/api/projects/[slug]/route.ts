import { NextResponse } from 'next/server'
import { getProjectBySlug } from '@/lib/projects'

interface RouteParams {
  params: Promise<{ slug: string }>
}

/**
 * Get a single project by slug
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params

  try {
    const project = await getProjectBySlug(slug)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('[api.projects.get.error]', { slug, error })
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}
