import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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
  keywords: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: AddKeywordsBody = await request.json()
    const { clientId, keywords } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }
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
