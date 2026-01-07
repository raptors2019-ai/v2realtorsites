import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = imageUrlBuilder(client)

/**
 * Generate optimized image URLs from Sanity
 * @example urlFor(project.featuredImage).width(800).height(600).url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
