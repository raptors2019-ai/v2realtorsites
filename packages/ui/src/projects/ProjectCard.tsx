"use client"

import type { CMSBuilderProject } from '@repo/types'
import { formatPrice, cn } from '@repo/lib'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cardHoverVariants, staggerContainerVariants, staggerItemVariants } from '../motion'

interface ProjectCardProps {
  project: CMSBuilderProject
  className?: string
  index?: number
}

/**
 * Status badge colors and text
 */
const statusConfig = {
  'coming-soon': {
    badge: 'bg-blue-500/90 text-white',
    text: 'Coming Soon',
  },
  'selling': {
    badge: 'bg-emerald-500/90 text-white',
    text: 'Now Selling',
  },
  'sold-out': {
    badge: 'bg-gray-500/90 text-white',
    text: 'Sold Out',
  },
}

export function ProjectCard({ project, className, index = 0 }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig['selling']
  const projectUrl = `/builder-projects/${project.slug}`

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={cardHoverVariants}
      style={{ borderRadius: '0.75rem' }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={projectUrl}
        className={cn(
          'group block luxury-card-premium rounded-xl overflow-hidden',
          className
        )}
      >
        {/* Image */}
        <div className="relative h-56 md:h-64 bg-gradient-to-br from-cream to-cream-dark overflow-hidden">
          {project.featuredImage ? (
            <Image
              src={project.featuredImage}
              alt={project.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <svg
                className="w-16 h-16 text-primary/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

          {/* Status Badge */}
          <div className={cn(
            'absolute top-3 left-3 md:top-4 md:left-4 z-10 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm',
            status.badge
          )}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {status.text}
          </div>

          {/* City Badge */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
            <div className="px-3 py-1.5 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 bg-secondary/80 text-white backdrop-blur-sm">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {project.city}
            </div>
          </div>

          {/* View Details overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-sm text-secondary px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              View Project
            </span>
          </div>
        </div>

        {/* Content */}
        <motion.div
          className="p-5 md:p-6"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Project Name */}
          <motion.h3
            variants={staggerItemVariants}
            className="text-xl md:text-2xl font-bold text-secondary dark:text-white mb-2 group-hover:text-primary transition-colors duration-300"
          >
            {project.name}
          </motion.h3>

          {/* Intersection/Location */}
          {project.intersection && (
            <motion.p
              variants={staggerItemVariants}
              className="text-text-secondary dark:text-gray-300 text-sm mb-3 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 flex-shrink-0 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {project.intersection}
            </motion.p>
          )}

          {/* Product Types */}
          <motion.div variants={staggerItemVariants} className="flex flex-wrap gap-2 mb-4">
            {project.productTypes.map((type) => (
              <span
                key={type.name}
                className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full dark:bg-primary/20 dark:text-primary-light"
              >
                {type.name}
              </span>
            ))}
          </motion.div>

          {/* Closing Date */}
          <motion.div
            variants={staggerItemVariants}
            className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-300 mb-4"
          >
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              Closing: <span className="font-medium text-secondary dark:text-white">
                {project.closingDate
                  ? new Date(project.closingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'TBD'}
              </span>
            </span>
          </motion.div>

          {/* Price and CTA */}
          <motion.div
            variants={staggerItemVariants}
            className="flex items-center justify-between pt-4 border-t border-primary/20"
          >
            <div>
              <p className="text-xs text-text-muted dark:text-gray-400 mb-0.5">Starting from</p>
              <p className="text-xl font-bold text-gradient-primary">
                {formatPrice(project.startingPrice)}
              </p>
            </div>

            <span className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg group-hover:bg-primary/90 transition-colors">
              Register
            </span>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
