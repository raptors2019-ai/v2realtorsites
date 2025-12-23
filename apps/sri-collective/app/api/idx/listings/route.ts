import { NextRequest, NextResponse } from 'next/server'
import { IDXClient } from '@repo/crm'
import type { IDXSearchParams } from '@repo/types'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params: IDXSearchParams = {
    city: searchParams.get('city') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
    propertyType: searchParams.get('propertyType') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
  }

  try {
    const client = new IDXClient()
    const result = await client.searchListings(params)

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('[api.idx.listings.error]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings', listings: [], total: 0 },
      { status: 500 }
    )
  }
}
