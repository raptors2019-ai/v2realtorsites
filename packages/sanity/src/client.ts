import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'

/**
 * Sanity client for fetching content
 * Falls back gracefully when Sanity is not configured
 */
export const client = createClient({
  projectId: projectId || 'not-configured',
  dataset: dataset || 'production',
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

/**
 * Preview client for draft content (requires token)
 */
export const previewClient = createClient({
  projectId: projectId || 'not-configured',
  dataset: dataset || 'production',
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

/**
 * Check if Sanity is properly configured
 */
export function isSanityConfigured(): boolean {
  return !!(projectId && projectId !== 'not-configured')
}
