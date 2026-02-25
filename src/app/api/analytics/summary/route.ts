import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import {
  getWebsiteIdForDomain,
  getWebsiteStats,
  getPageviewsByDay,
  getTopReferrers,
  getTopPages,
  getTopCountries,
  getTopDevices,
} from '@/lib/umami'

/**
 * GET /api/analytics/summary?clientId=xxx
 *
 * Returns Umami analytics data for a client's domain:
 * - Aggregate stats: pageviews, visitors, visits, bounces, totaltime
 * - Daily pageview/session breakdown (28 days)
 * - Top referrers, pages, countries, devices
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

    // Resolve domain to Umami website ID
    const domain = client.domain as string
    if (!domain) {
      return NextResponse.json({
        success: true,
        data: null,
        empty: true,
        message: 'No domain configured for this client',
      })
    }

    const websiteId = await getWebsiteIdForDomain(domain)
    if (!websiteId) {
      return NextResponse.json({
        success: true,
        data: null,
        empty: true,
        message: `No Umami tracking found for ${domain}`,
      })
    }

    // Date range: last 28 days
    const now = Date.now()
    const startAt = now - 28 * 24 * 60 * 60 * 1000
    const endAt = now

    // Fetch all analytics data in parallel
    const [stats, pageviews, referrers, pages, countries, devices] =
      await Promise.all([
        getWebsiteStats(websiteId, startAt, endAt),
        getPageviewsByDay(websiteId, startAt, endAt),
        getTopReferrers(websiteId, startAt, endAt, 10),
        getTopPages(websiteId, startAt, endAt, 10),
        getTopCountries(websiteId, startAt, endAt, 10),
        getTopDevices(websiteId, startAt, endAt, 5),
      ])

    // Calculate bounce rate
    const bounceRate =
      stats.visits > 0 ? stats.bounces / stats.visits : 0

    // Calculate avg session duration
    const avgDuration =
      stats.visits > 0 ? stats.totaltime / stats.visits : 0

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        domain,
        dateRange: {
          start: new Date(startAt).toISOString().split('T')[0],
          end: new Date(endAt).toISOString().split('T')[0],
        },
        summary: {
          pageviews: stats.pageviews,
          visitors: stats.visitors,
          visits: stats.visits,
          bounceRate: Math.round(bounceRate * 10000) / 10000,
          avgDuration: Math.round(avgDuration),
        },
        daily: {
          pageviews: pageviews.pageviews,
          sessions: pageviews.sessions,
        },
        topReferrers: referrers,
        topPages: pages,
        topCountries: countries,
        devices,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch analytics'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
