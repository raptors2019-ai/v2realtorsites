'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { RegistrationSurvey } from '@repo/ui'
import type { CMSBuilderProject } from '@repo/types'

export default function RegisterPage() {
  const params = useParams()
  const slug = params.slug as string

  const [project, setProject] = useState<CMSBuilderProject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProject() {
      try {
        // Fetch project data from API or directly import mock data
        const response = await fetch(`/api/projects/${slug}`)
        if (!response.ok) {
          throw new Error('Project not found')
        }
        const data = await response.json()
        setProject(data)
      } catch {
        // Fallback: try to load from mock data directly
        try {
          const mockData = await import('@/data/mock-projects.json')
          const foundProject = mockData.default.find((p: { slug: string }) => p.slug === slug)
          if (foundProject) {
            setProject(foundProject as unknown as CMSBuilderProject)
          } else {
            setError('Project not found')
          }
        } catch {
          setError('Failed to load project')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-secondary flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white dark:bg-secondary flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-secondary dark:text-white mb-4">Project Not Found</h1>
          <Link
            href="/builder-projects"
            className="text-primary hover:underline"
          >
            Browse all projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href={`/builder-projects/${project.slug}`}
          className="inline-flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {project.name}
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Project Card */}
          <div className="bg-white dark:bg-secondary-light rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-48 md:h-auto">
                {project.featuredImage ? (
                  <Image
                    src={project.featuredImage}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
              </div>
              <div className="p-6 md:w-2/3">
                <h1 className="text-2xl font-bold text-secondary dark:text-white mb-2">
                  Register for {project.name}
                </h1>
                <p className="text-text-secondary dark:text-gray-300 mb-4">
                  {project.intersection}, {project.city}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.productTypes.map((type) => (
                    <span
                      key={type.name}
                      className="px-3 py-1 text-sm bg-cream dark:bg-secondary text-secondary dark:text-gray-300 rounded-full"
                    >
                      {type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-secondary dark:text-white mb-2">
              Complete Your Registration
            </h2>
            <p className="text-text-secondary dark:text-gray-300">
              Fill out the form below to receive exclusive pricing and updates.
            </p>
          </div>

          <RegistrationSurvey project={project} />
        </div>
      </div>
    </div>
  )
}
