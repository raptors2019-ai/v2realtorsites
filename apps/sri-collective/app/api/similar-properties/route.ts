import { NextRequest, NextResponse } from 'next/server'
import { getPropertyById, getSimilarProperties } from '@/lib/data'

export const runtime = 'edge'

/**
 * Get similar properties with user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const propertyId = searchParams.get('propertyId')
    const limit = parseInt(searchParams.get('limit') || '3')

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID required' },
        { status: 400 }
      )
    }

    // Get the current property
    const property = await getPropertyById(propertyId)
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    // Parse user preferences from query params
    const preferences = {
      cities: searchParams.get('cities')?.split(','),
      priceMin: searchParams.get('priceMin')
        ? parseInt(searchParams.get('priceMin')!)
        : undefined,
      priceMax: searchParams.get('priceMax')
        ? parseInt(searchParams.get('priceMax')!)
        : undefined,
      listingType: searchParams.get('listingType')?.split(','),
      propertyTypes: searchParams.get('propertyTypes')?.split(','),
      bedrooms: searchParams.get('bedrooms')?.split(',').map(Number),
      bathrooms: searchParams.get('bathrooms')?.split(',').map(Number),
    }

    // Get similar properties with preferences
    const similar = await getSimilarProperties(property, limit, preferences)

    console.log('[api.similar-properties]', {
      propertyId,
      limit,
      preferences,
      resultCount: similar.length,
    })

    return NextResponse.json({
      success: true,
      properties: similar,
      count: similar.length,
    })
  } catch (error) {
    console.error('[api.similar-properties.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch similar properties' },
      { status: 500 }
    )
  }
}
