import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSearchConsoleData } from '@/lib/maton'
import type { Keyword } from '@/types'

type KeywordIntent = Keyword['intent']

const VALID_INTENTS: KeywordIntent[] = [
  'informational',
  'navigational',
  'transactional',
  'commercial',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const limit = parseInt(searchParams.get('limit') ?? '50', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const sort = searchParams.get('sort') ?? 'created_at'
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'
    const intent = searchParams.get('intent') as KeywordIntent | null
    const source = searchParams.get('source')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId query parameter is required' },
        { status: 400 }
      )
    }

    if (intent && !VALID_INTENTS.includes(intent)) {
      return NextResponse.json(
        { success: false, error: `intent must be one of: ${VALID_INTENTS.join(', ')}` },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('keywords')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)

    if (intent) {
      query = query.eq('intent', intent)
    }

    if (source) {
      query = query.contains('tags', [source])
    }

    const { data: keywords, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: keywords,
      meta: { total: count ?? 0, limit, offset },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch keywords'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

interface AddKeywordsBody {
  clientId: string
  keywords?: string[]
  action?: 'add' | 'gsc-sync'
}

/**
 * POST /api/keywords
 *
 * Two modes:
 * 1. action: 'add' (default) -- manually add keywords by string list
 * 2. action: 'gsc-sync' -- pull fresh keywords from Google Search Console
 *
 * Body: { clientId, keywords?: string[], action?: 'add' | 'gsc-sync' }
 */
export async function POST(request: NextRequest) {
  try {
    const body: AddKeywordsBody = await request.json()
    const { clientId, action = 'add' } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }

    // ----- GSC SYNC MODE -----
    if (action === 'gsc-sync') {
      return handleGscSync(clientId)
    }

    // ----- MANUAL ADD MODE -----
    const { keywords } = body
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'keywords must be a non-empty array of strings' },
        { status: 400 }
      )
    }

    // Deduplicate and sanitize
    const unique = [...new Set(keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))]

    const rows = unique.map((keyword) => ({
      client_id: clientId,
      keyword,
      is_tracked: true,
      tags: ['manual'],
    }))

    const { data: created, error } = await supabaseAdmin
      .from('keywords')
      .upsert(rows, { onConflict: 'client_id,keyword', ignoreDuplicates: true })
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: created, meta: { added: created?.length ?? 0 } },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add keywords'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// GSC sync helper
// ---------------------------------------------------------------------------
async function handleGscSync(clientId: string) {
  // Fetch client to get GSC property URL
  const { data: client, error: clientError } = await supabaseAdmin
    .from('seo_clients')
    .select('id, gsc_property_url, domain')
    .eq('id', clientId)
    .single()

  if (clientError || !client) {
    return NextResponse.json(
      { success: false, error: 'Client not found' },
      { status: 404 }
    )
  }

  if (!client.gsc_property_url) {
    return NextResponse.json(
      { success: false, error: 'No GSC property URL configured. Set it in Settings.' },
      { status: 400 }
    )
  }

  // Date range: last 28 days, lagging 1 day
  const endDate = new Date()
  endDate.setDate(endDate.getDate() - 1)
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 27)
  const fmt = (d: Date): string => d.toISOString().split('T')[0]

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
      data: [],
      meta: { synced: 0 },
      message: 'GSC returned no keyword data for this date range.',
    })
  }

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

  // Batch upsert
  const BATCH_SIZE = 200
  let totalUpserted = 0

  for (let i = 0; i < upsertRows.length; i += BATCH_SIZE) {
    const batch = upsertRows.slice(i, i + BATCH_SIZE)
    const { error: upsertError } = await supabaseAdmin
      .from('keywords')
      .upsert(batch, { onConflict: 'client_id,keyword', ignoreDuplicates: false })

    if (upsertError) {
      return NextResponse.json(
        { success: false, error: `DB upsert failed: ${upsertError.message}` },
        { status: 500 }
      )
    }
    totalUpserted += batch.length
  }

  return NextResponse.json({
    success: true,
    data: rows.map((row) => ({
      keyword: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })),
    meta: { synced: totalUpserted },
    message: `Synced ${totalUpserted} keywords from Google Search Console.`,
  }, { status: 201 })
}
