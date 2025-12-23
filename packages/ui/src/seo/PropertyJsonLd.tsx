import type { Property } from '@repo/types'

interface PropertyJsonLdProps {
  property: Property
  agentName?: string
  agentPhone?: string
  organizationName?: string
  baseUrl?: string
}

export function PropertyJsonLd({
  property,
  agentName = 'Sri Kathiravelu',
  agentPhone = '+1-416-786-0431',
  organizationName = 'Sri Collective Group',
  baseUrl = 'https://sricollective.com',
}: PropertyJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || `${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType} in ${property.city}`,
    url: `${baseUrl}/properties/${property.id}`,
    datePosted: property.listingDate ? new Date(property.listingDate).toISOString() : new Date().toISOString(),

    image: property.images.slice(0, 5),

    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.province || 'ON',
      postalCode: property.postalCode,
      addressCountry: 'CA',
    },

    offers: {
      '@type': 'Offer',
      price: property.price.toString(),
      priceCurrency: 'CAD',
      availability: property.status === 'active'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'RealEstateAgent',
        name: agentName,
        telephone: agentPhone,
        worksFor: {
          '@type': 'Organization',
          name: organizationName,
          url: baseUrl,
        },
      },
    },

    containsPlace: {
      '@type': property.propertyType === 'condo' ? 'Apartment' : 'SingleFamilyResidence',
      numberOfRooms: property.bedrooms + property.bathrooms,
      numberOfBedrooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      floorSize: property.sqft ? {
        '@type': 'QuantitativeValue',
        value: property.sqft,
        unitCode: 'FTK',
      } : undefined,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * JSON-LD for filter/search result pages
 */
interface SearchResultsJsonLdProps {
  title: string
  description: string
  url: string
  propertyCount: number
}

export function SearchResultsJsonLd({
  title,
  description,
  url,
  propertyCount,
}: SearchResultsJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description,
    url: url,
    numberOfItems: propertyCount,
    itemListElement: [], // Can be populated with property references
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
