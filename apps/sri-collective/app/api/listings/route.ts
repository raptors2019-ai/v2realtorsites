import { NextResponse } from 'next/server'
import { BoldTrailClient } from '@repo/crm'
import type { ListingFilters } from '@repo/crm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const filters: ListingFilters = {
    limit: parseInt(searchParams.get('limit') || '25'),
    status: (searchParams.get('status') as any) || 'active',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
  }

  try {
    if (!process.env.BOLDTRAIL_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'BoldTrail API not configured'
      }, { status: 500 })
    }

    const client = new BoldTrailClient()
    const result = await client.getListings(filters)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to fetch listings'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data || [],
      total: result.total || 0
    })
  } catch (error) {
    console.error('BoldTrail API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch listings'
    }, { status: 500 })
  }
}
