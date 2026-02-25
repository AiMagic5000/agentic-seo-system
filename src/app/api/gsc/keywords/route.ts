import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getSearchConsoleData } from '@/lib/maton'

/**
 * GET /api/gsc/keywords?clientId=xxx
 *
 * Returns top 100 keywords from Google Search Console for a specific client.
 * Each keyword includes clicks, impressions, ctr, and position.
 *
 * Access control: admin sees all, regular users only their own clients.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientId = request.nextUrl.searchParams.get('clientId')
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId query parameter is required' },
        { status: 400 }
      )
    }

    // Fetch client and verify ownership
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Access control: admin sees all, users only their own
    if (!user.isAdmin && client.owner_clerk_id !== user.clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if GSC property URL is configured
    if (!client.gsc_property_url) {
      return NextResponse.json({
        success: true,
        data: null,
        empty: true,
        message: 'No GSC property configured for this client',
      })
    }

    // Calculate date range (last 28 days)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 1) // GSC data lags by ~1 day
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 27) // 28 day window

    const formatDate = (d: Date): string => d.toISOString().split('T')[0]
    const start = formatDate(startDate)
    const end = formatDate(endDate)

    // Fetch top 100 keywords by query dimension
    const keywordResponse = await getSearchConsoleData(
      client.gsc_property_url,
      start,
      end,
      ['query'],
      100
    )

    // Map keyword rows
    const keywords = (keywordResponse.rows || []).map((row) => ({
      keyword: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }))

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        domain: client.domain,
        dateRange: { start, end },
        keywords,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch GSC keywords'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
