import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getSearchConsoleData } from '@/lib/maton'

/**
 * GET /api/gsc/summary?clientId=xxx
 *
 * Returns GSC summary data for a specific client:
 * - Summary stats: clicks, impressions, avgPosition, avgCtr
 * - Top 10 keywords by clicks
 * - Traffic by date (last 28 days)
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

    // Fetch keyword data and date data in parallel
    const [keywordResponse, dateResponse] = await Promise.all([
      getSearchConsoleData(
        client.gsc_property_url,
        start,
        end,
        ['query'],
        10
      ),
      getSearchConsoleData(
        client.gsc_property_url,
        start,
        end,
        ['date'],
        28
      ),
    ])

    // Calculate summary stats from date response
    const dateRows = dateResponse.rows || []
    const totalClicks = dateRows.reduce((sum, row) => sum + row.clicks, 0)
    const totalImpressions = dateRows.reduce(
      (sum, row) => sum + row.impressions,
      0
    )
    const avgPosition =
      dateRows.length > 0
        ? dateRows.reduce((sum, row) => sum + row.position, 0) /
          dateRows.length
        : 0
    const avgCtr =
      totalImpressions > 0 ? totalClicks / totalImpressions : 0

    // Map keyword rows
    const topKeywords = (keywordResponse.rows || []).map((row) => ({
      keyword: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }))

    // Map traffic by date
    const trafficByDate = dateRows
      .map((row) => ({
        date: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        domain: client.domain,
        dateRange: { start, end },
        summary: {
          clicks: totalClicks,
          impressions: totalImpressions,
          avgPosition: Math.round(avgPosition * 10) / 10,
          avgCtr: Math.round(avgCtr * 10000) / 10000,
        },
        topKeywords,
        trafficByDate,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch GSC summary'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
