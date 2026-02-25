import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getSearchConsoleData } from '@/lib/maton'

/**
 * POST /api/gsc/keywords/scan
 *
 * Triggers a fresh GSC keyword scan for a client:
 * 1. Pulls up to 1000 keywords from Google Search Console (last 28 days)
 * 2. Upserts them into the keywords table with GSC metrics
 * 3. Returns the full updated keyword list
 *
 * Body: { clientId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { clientId } = body as { clientId?: string }

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required in request body' },
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

    // Access control
    if (!user.isAdmin && client.owner_clerk_id !== user.clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!client.gsc_property_url) {
      return NextResponse.json({
        success: false,
        error: 'No GSC property URL configured for this client. Set it in Settings first.',
      }, { status: 400 })
    }

    // Calculate date range (last 28 days, lagging 1 day)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 1)
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 27)

    const fmt = (d: Date): string => d.toISOString().split('T')[0]

    // Pull up to 1000 keywords from GSC
    const gscResponse = await getSearchConsoleData(
      client.gsc_property_url,
      fmt(startDate),
      fmt(endDate),
      ['query'],
      1000
    )

    const rows = gscResponse.rows ?? []

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: { synced: 0, keywords: [] },
        message: 'GSC returned no keyword data for this date range.',
      })
    }

    // Build upsert payload -- merge GSC metrics into the keywords table
    const now = new Date().toISOString()
    const upsertRows = rows.map((row) => ({
      client_id: clientId,
      keyword: row.keys[0].trim().toLowerCase(),
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      current_position: Math.round(row.position * 10) / 10,
      last_checked: now,
      is_tracked: true,
      tags: ['gsc'],
    }))

    // Upsert in batches of 200 to avoid payload size limits
    const BATCH_SIZE = 200
    let totalUpserted = 0

    for (let i = 0; i < upsertRows.length; i += BATCH_SIZE) {
      const batch = upsertRows.slice(i, i + BATCH_SIZE)
      const { error: upsertError } = await supabaseAdmin
        .from('keywords')
        .upsert(batch, {
          onConflict: 'client_id,keyword',
          ignoreDuplicates: false,
        })

      if (upsertError) {
        return NextResponse.json(
          { success: false, error: `DB upsert failed: ${upsertError.message}` },
          { status: 500 }
        )
      }
      totalUpserted += batch.length
    }

    // Return the freshly synced keywords for the frontend
    const keywords = rows.map((row) => ({
      keyword: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }))

    return NextResponse.json({
      success: true,
      data: {
        synced: totalUpserted,
        dateRange: { start: fmt(startDate), end: fmt(endDate) },
        keywords,
      },
      message: `Synced ${totalUpserted} keywords from Google Search Console.`,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to scan GSC keywords'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
