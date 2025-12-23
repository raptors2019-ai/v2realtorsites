import { NextRequest, NextResponse } from 'next/server'
import { IDXClient } from '@repo/crm'
import { convertIDXToProperty } from '@repo/lib'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const city = searchParams.get('city') || undefined
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined

  try {
    const client = new IDXClient()

    if (!client.isConfigured) {
      return NextResponse.json(
        { success: false, error: 'IDX not configured', properties: [], total: 0 },
        { status: 500 }
      )
    }

    const response = await client.searchListings({
      limit,
      offset,
      city,
      minPrice,
      maxPrice,
      bedrooms,
    })

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error, properties: [], total: 0 },
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

    console.log('[api.properties] Returning', properties.length, 'properties, offset:', offset)

    return NextResponse.json({
      success: true,
      properties,
      total: response.total,
      offset: offset + properties.length,
    })
  } catch (error) {
    console.error('[api.properties.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties', properties: [], total: 0 },
      { status: 500 }
    )
  }
}
