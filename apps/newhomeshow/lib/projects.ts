import type { CMSBuilderProject } from '@repo/types'
import { client, isSanityConfigured, allProjectsQuery, projectBySlugQuery, projectsBySectionQuery } from '@repo/sanity'
import mockProjects from '../data/mock-projects.json'

export type DisplaySection = 'projects' | 'quick-closings' | 'promotions' | 'assignments'

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
 * Fetch projects by display section
 * Use this to get projects for specific tabs (projects, quick-closings, promotions, assignments)
 */
export async function getProjectsBySection(section: DisplaySection): Promise<CMSBuilderProject[]> {
  if (isSanityConfigured()) {
    try {
      const projects = await client.fetch<CMSBuilderProject[]>(
        projectsBySectionQuery,
        { section },
        { next: { tags: ['projects', section] } }
      )

      if (projects && projects.length > 0) {
        console.log('[projects.getProjectsBySection]', { source: 'sanity', section, count: projects.length })
        return projects
      }
    } catch (error) {
      console.error('[projects.getProjectsBySection.error]', { section, error })
    }
  }

  // Fallback: Filter mock data by displaySections
  const projects = (mockProjects as (CMSBuilderProject & { displaySections?: string[] })[])
    .filter(p => p.displaySections?.includes(section))

  console.log('[projects.getProjectsBySection]', { source: 'mock', section, count: projects.length })
  return projects
}

/**
 * Fetch projects with quick closing dates
 * Now uses the displaySections field instead of date-based filtering
 */
export async function getQuickClosings(): Promise<CMSBuilderProject[]> {
  return getProjectsBySection('quick-closings')
}

/**
 * Fetch projects marked for promotions tab
 */
export async function getPromotions(): Promise<CMSBuilderProject[]> {
  return getProjectsBySection('promotions')
}

/**
 * Fetch projects marked for assignments tab
 */
export async function getAssignments(): Promise<CMSBuilderProject[]> {
  return getProjectsBySection('assignments')
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
