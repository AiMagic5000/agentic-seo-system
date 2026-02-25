import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type ScanDepth = 'quick' | 'standard' | 'deep'

interface ScanRequestBody {
  clientId: string
  url: string
  depth: ScanDepth
}

const VALID_DEPTHS: ScanDepth[] = ['quick', 'standard', 'deep']

const DEPTH_PAGE_LIMITS: Record<ScanDepth, number> = {
  quick: 50,
  standard: 250,
  deep: 1000,
}

export async function POST(request: NextRequest) {
  try {
    const body: ScanRequestBody = await request.json()
    const { clientId, url, depth } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'url is required' },
        { status: 400 }
      )
    }
    if (!depth || !VALID_DEPTHS.includes(depth)) {
      return NextResponse.json(
        { success: false, error: `depth must be one of: ${VALID_DEPTHS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: 'url must be a valid URL (e.g. https://example.com)' },
        { status: 400 }
      )
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Create an audit record to track this scan
    const { data: scan, error } = await supabaseAdmin
      .from('site_audits')
      .insert({
        client_id: clientId,
        status: 'pending',
        issues_critical: 0,
        issues_warning: 0,
        issues_info: 0,
        issues: [],
        raw_data: {
          scan_type: 'onboarding',
          target_url: url,
          depth,
          page_limit: DEPTH_PAGE_LIMITS[depth],
          queued_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      scanId: scan.id,
      clientId,
      url,
      depth,
      pageLimit: DEPTH_PAGE_LIMITS[depth],
      status: 'pending',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start website scan'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
