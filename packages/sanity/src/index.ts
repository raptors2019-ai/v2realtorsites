// Client
export { client, previewClient, isSanityConfigured } from './client'

// Schemas (for reference - deploy these to Sanity Studio)
export { builderProjectSchema, productTypeSchema, schemas } from './schemas'

// Queries
export {
  allProjectsQuery,
  projectBySlugQuery,
  projectsByStatusQuery,
  quickClosingsQuery,
} from './queries/projects'

// Image utilities
export { urlFor } from './image'
