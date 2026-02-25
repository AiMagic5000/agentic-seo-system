import { NextRequest, NextResponse } from 'next/server'
import { getSearchConsoleData, type GSCDimension } from '@/lib/maton'

interface GSCDataRequestBody {
  siteUrl: string
  startDate: string
  endDate: string
  dimensions?: GSCDimension[]
  rowLimit?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GSCDataRequestBody = await request.json()
    const { siteUrl, startDate, endDate, dimensions, rowLimit } = body

    if (!siteUrl) {
      return NextResponse.json(
        { success: false, error: 'siteUrl is required' },
        { status: 400 }
      )
    }
    if (!startDate) {
      return NextResponse.json(
        { success: false, error: 'startDate is required' },
        { status: 400 }
      )
    }
    if (!endDate) {
      return NextResponse.json(
        { success: false, error: 'endDate is required' },
        { status: 400 }
      )
    }

    const data = await getSearchConsoleData(
      siteUrl,
      startDate,
      endDate,
      dimensions ?? ['query'],
      rowLimit ?? 1000
    )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch GSC data'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
