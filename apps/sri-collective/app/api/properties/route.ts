import { NextRequest, NextResponse } from 'next/server'
import { IDXClient } from '@repo/crm'
import { convertIDXToProperty } from '@repo/lib'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Pagination
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Filters
  const city = searchParams.get('city') || undefined
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined
  const bathrooms = searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined

  // Parse property type - support comma-separated values for multi-select
  const propertyTypeParam = searchParams.get('propertyType')
  const propertyTypes = propertyTypeParam ? propertyTypeParam.split(',').filter(Boolean) : undefined

  const listingType = searchParams.get('listingType') || undefined // 'sale' or 'lease'

  // Advanced filters
  const keywords = searchParams.get('keywords') || undefined
  const minSqft = searchParams.get('minSqft') ? parseInt(searchParams.get('minSqft')!) : undefined
  const maxSqft = searchParams.get('maxSqft') ? parseInt(searchParams.get('maxSqft')!) : undefined
  const minLotSize = searchParams.get('minLotSize') ? parseInt(searchParams.get('minLotSize')!) : undefined
  const maxLotSize = searchParams.get('maxLotSize') ? parseInt(searchParams.get('maxLotSize')!) : undefined
  const maxDaysOnMarket = searchParams.get('maxDaysOnMarket') ? parseInt(searchParams.get('maxDaysOnMarket')!) : undefined

  // Options
  const includeCities = searchParams.get('includeCities') === 'true'

  try {
    const client = new IDXClient()

    if (!client.isConfigured) {
      return NextResponse.json(
        { success: false, error: 'IDX not configured', properties: [], total: 0, cities: [] },
        { status: 500 }
      )
    }

    // Parse cities array if provided (for multi-city/region filter)
    const citiesParam = searchParams.get('cities')
    const filterCities = citiesParam ? citiesParam.split(',').filter(Boolean) : undefined

    // Build search params for IDX
    const idxParams: Parameters<typeof client.searchListings>[0] = {
      limit,
      offset,
      city: filterCities ? undefined : city, // Use single city only if no cities array
      cities: filterCities,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyTypes, // Use array for multi-select support
      listingType: listingType as 'sale' | 'lease' | undefined, // Now filtered at IDX level
      status: 'Active', // Always active listings
      // Advanced filters
      keywords,
      minSqft,
      maxSqft,
      minLotSize,
      maxLotSize,
      maxDaysOnMarket,
    }

    // Log the search params for debugging
    console.log('[api.properties] Search params:', {
      limit,
      offset,
      city,
      cities: filterCities,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyTypes,
      listingType,
      keywords,
      minSqft,
      maxSqft,
      minLotSize,
      maxLotSize,
      maxDaysOnMarket,
    })

    const response = await client.searchListings(idxParams)

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error, properties: [], total: 0, cities: [] },
        { status: 500 }
      )
    }

    // Fetch media for these listings
    const listingKeys = response.listings.map(l => l.ListingKey)
    const mediaMap = await client.fetchMediaForListings(listingKeys)

    const listingsWithMedia = response.listings.map(listing => ({
      ...listing,
      Media: mediaMap.get(listing.ListingKey) || [],
    }))

    const properties = listingsWithMedia.map(convertIDXToProperty)
    // listingType filtering now happens at IDX API level via price threshold

    // Extract unique cities from all listings if requested
    let cities: string[] = []
    if (includeCities) {
      const citySet = new Set<string>()
      response.listings.forEach(listing => {
        if (listing.City) {
          citySet.add(listing.City)
        }
      })
      cities = Array.from(citySet).sort()
    }

    console.log('[api.properties] Returning', properties.length, 'properties, total:', response.total)

    return NextResponse.json({
      success: true,
      properties,
      total: response.total,
      offset: offset + properties.length,
      cities,
    })
  } catch (error) {
    console.error('[api.properties.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties', properties: [], total: 0, cities: [] },
      { status: 500 }
    )
  }
}
