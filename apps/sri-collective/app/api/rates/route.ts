import { NextResponse } from 'next/server'
import { getMortgageRates } from '@repo/lib'

export const revalidate = 21600 // 6 hours

export async function GET() {
  try {
    const rates = await getMortgageRates()

    if (!rates) {
      return NextResponse.json(
        { error: 'Unable to fetch rates' },
        { status: 503 }
      )
    }

    return NextResponse.json(rates)
  } catch (error) {
    console.error('[api.rates] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
