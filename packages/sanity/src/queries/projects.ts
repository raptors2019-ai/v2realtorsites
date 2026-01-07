import { groq } from 'next-sanity'

/**
 * Query all builder projects with essential fields
 */
export const allProjectsQuery = groq`
  *[_type == "builderProject"] | order(status asc, name asc) {
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
    description,
    closingDate
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
    closingDate,
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
    }
  }
`

/**
 * Query projects with quick closing dates (within 6 months)
 */
export const quickClosingsQuery = groq`
  *[_type == "builderProject" && status == "selling" && closingDate != null] | order(closingDate asc) {
    _id,
    name,
    "slug": slug.current,
    status,
    intersection,
    city,
    startingPrice,
    closingDate,
    "featuredImage": featuredImage.asset->url,
    productTypes[]-> {
      name,
      "priceRange": {
        "min": priceFrom,
        "max": priceTo
      }
    }
  }
`
