import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { ContentBrief } from '@/types'

type ContentStatus = ContentBrief['status']

const VALID_STATUSES: ContentStatus[] = [
  'pending',
  'in_progress',
  'ready',
  'published',
  'archived',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status') as ContentStatus | null

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId query parameter is required' },
        { status: 400 }
      )
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('content_briefs')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: briefs, error, count } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: briefs,
      meta: { total: count ?? 0 },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch content briefs'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

interface GenerateBriefBody {
  clientId: string
  keywordId: string
  targetUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateBriefBody = await request.json()
    const { clientId, keywordId, targetUrl } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }
    if (!keywordId) {
      return NextResponse.json(
        { success: false, error: 'keywordId is required' },
        { status: 400 }
      )
    }

    // Fetch the keyword to get its text
    const { data: keyword, error: kwError } = await supabaseAdmin
      .from('keywords')
      .select('keyword')
      .eq('id', keywordId)
      .single()

    if (kwError || !keyword) {
      return NextResponse.json(
        { success: false, error: 'Keyword not found' },
        { status: 404 }
      )
    }

    const { data: brief, error } = await supabaseAdmin
      .from('content_briefs')
      .insert({
        client_id: clientId,
        keyword_id: keywordId,
        target_keyword: keyword.keyword,
        title: `Draft: ${keyword.keyword}`,
        secondary_keywords: [],
        competitor_urls: [],
        status: 'pending',
        published_url: targetUrl ?? null,
        ai_brief: null,
        notes: null,
        assigned_to: null,
        due_date: null,
        word_count_target: null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: brief }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate content brief'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
