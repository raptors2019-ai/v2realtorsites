import type { CMSBuilderProject } from '@repo/types'
import { client, isSanityConfigured, allProjectsQuery, projectBySlugQuery, quickClosingsQuery } from '@repo/sanity'
import mockProjects from '../data/mock-projects.json'

/**
 * Fetch all builder projects
 * Falls back to mock data when Sanity is not configured
 */
export async function getAllProjects(): Promise<CMSBuilderProject[]> {
  if (isSanityConfigured()) {
    try {
      const projects = await client.fetch<CMSBuilderProject[]>(
        allProjectsQuery,
        {},
        { next: { tags: ['projects'] } }
      )

      if (projects && projects.length > 0) {
        console.log('[projects.getAllProjects]', { source: 'sanity', count: projects.length })
        return projects
      }
    } catch (error) {
      console.error('[projects.getAllProjects.error]', { error })
    }
  }

  // Fallback to mock data
  console.log('[projects.getAllProjects]', { source: 'mock', count: mockProjects.length })
  return mockProjects as CMSBuilderProject[]
}

/**
 * Fetch a single project by slug
 * Falls back to mock data when Sanity is not configured
 */
export async function getProjectBySlug(slug: string): Promise<CMSBuilderProject | null> {
  if (isSanityConfigured()) {
    try {
      const project = await client.fetch<CMSBuilderProject | null>(
        projectBySlugQuery,
        { slug },
        { next: { tags: [`project-${slug}`] } }
      )

      if (project) {
        console.log('[projects.getProjectBySlug]', { source: 'sanity', slug })
        return project
      }
    } catch (error) {
      console.error('[projects.getProjectBySlug.error]', { slug, error })
    }
  }

  // Fallback to mock data
  const project = (mockProjects as CMSBuilderProject[]).find(p => p.slug === slug) || null
  console.log('[projects.getProjectBySlug]', { source: 'mock', slug, found: !!project })
  return project
}

/**
 * Fetch projects with quick closing dates
 * Falls back to filtering mock data when Sanity is not configured
 */
export async function getQuickClosings(): Promise<CMSBuilderProject[]> {
  if (isSanityConfigured()) {
    try {
      const projects = await client.fetch<CMSBuilderProject[]>(
        quickClosingsQuery,
        {},
        { next: { tags: ['projects', 'quick-closings'] } }
      )

      if (projects && projects.length > 0) {
        console.log('[projects.getQuickClosings]', { source: 'sanity', count: projects.length })
        return projects
      }
    } catch (error) {
      console.error('[projects.getQuickClosings.error]', { error })
    }
  }

  // Fallback: Filter mock data for projects with closing dates
  const now = new Date()
  const sixMonthsFromNow = new Date()
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

  const projects = (mockProjects as CMSBuilderProject[])
    .filter(p => {
      if (!p.closingDate || p.status !== 'selling') return false
      const closingDate = new Date(p.closingDate)
      return closingDate >= now && closingDate <= sixMonthsFromNow
    })
    .sort((a, b) => new Date(a.closingDate!).getTime() - new Date(b.closingDate!).getTime())

  console.log('[projects.getQuickClosings]', { source: 'mock', count: projects.length })
  return projects
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(status: 'coming-soon' | 'selling' | 'sold-out'): Promise<CMSBuilderProject[]> {
  const allProjects = await getAllProjects()
  return allProjects.filter(p => p.status === status)
}

/**
 * Get similar projects (same city or price range)
 */
export async function getSimilarProjects(project: CMSBuilderProject, limit = 3): Promise<CMSBuilderProject[]> {
  const allProjects = await getAllProjects()

  return allProjects
    .filter(p =>
      p.slug !== project.slug &&
      (p.city === project.city ||
       Math.abs(p.startingPrice - project.startingPrice) < 200000)
    )
    .slice(0, limit)
}
