"use client"

import type { CMSBuilderProject } from '@repo/types'
import { cn } from '@repo/lib'
import { ProjectCard } from './ProjectCard'

interface ProjectGridProps {
  projects: CMSBuilderProject[]
  className?: string
  emptyMessage?: string
}

export function ProjectGrid({
  projects,
  className,
  emptyMessage = 'No projects available at this time.',
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 mb-4 rounded-xl border border-primary/20 bg-cream dark:bg-secondary-light flex items-center justify-center">
          <svg
            className="w-12 h-12 text-primary/40"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-secondary dark:text-white mb-2">
          No Projects Found
        </h3>
        <p className="text-text-secondary dark:text-gray-300">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {projects.map((project, index) => (
        <ProjectCard key={project.id || project.slug} project={project} index={index} />
      ))}
    </div>
  )
}
