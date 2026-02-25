import { NextResponse } from 'next/server'
import { getSearchConsoleSites } from '@/lib/maton'

export async function GET() {
  try {
    const sites = await getSearchConsoleSites()
    return NextResponse.json({ success: true, data: sites })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch GSC sites'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
