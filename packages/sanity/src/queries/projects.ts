import { groq } from 'next-sanity'

/**
 * Common fields to select for project queries
 */
const projectFields = `
  _id,
  name,
  "slug": slug.current,
  status,
  intersection,
  city,
  startingPrice,
  "featuredImage": featuredImage.asset->url,
  productTypes[]-> {
    name,
    "priceRange": {
      "min": priceFrom,
      "max": priceTo
    }
  },
  features,
  incentives,
  description,
  closingDate,
  displaySections
`

/**
 * Query all builder projects with essential fields
 */
export const allProjectsQuery = groq`
  *[_type == "builderProject"] | order(status asc, name asc) {
    ${projectFields}
  }
`

/**
 * Query projects by display section
 * Use this to get projects for specific tabs (projects, quick-closings, promotions, assignments)
 */
export const projectsBySectionQuery = groq`
  *[_type == "builderProject" && $section in displaySections] | order(status asc, name asc) {
    ${projectFields}
  }
`

/**
 * Query single project by slug with full details
 */
export const projectBySlugQuery = groq`
  *[_type == "builderProject" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    status,
    intersection,
    city,
    startingPrice,
    description,
    features,
    incentives,
    closingDate,
    displaySections,
    depositStructure,
    totalDeposit,
    builder,
    "featuredImage": featuredImage.asset->url,
    "gallery": gallery[].asset->url,
    productTypes[]-> {
      name,
      "priceRange": {
        "min": priceFrom,
        "max": priceTo
      },
      "sqftRange": {
        "min": sqftFrom,
        "max": sqftTo
      },
      bedrooms,
      bathrooms,
      garages
    }
  }
`

/**
 * Query projects by status
 */
export const projectsByStatusQuery = groq`
  *[_type == "builderProject" && status == $status] | order(name asc) {
    ${projectFields}
  }
`
