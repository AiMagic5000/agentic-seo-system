import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type AuditDepth = 'quick' | 'standard' | 'deep'

interface AuditRunRequestBody {
  clientId: string
  depth: AuditDepth
}

const VALID_DEPTHS: AuditDepth[] = ['quick', 'standard', 'deep']

export async function POST(request: NextRequest) {
  try {
    const body: AuditRunRequestBody = await request.json()
    const { clientId, depth } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }
    if (!depth || !VALID_DEPTHS.includes(depth)) {
      return NextResponse.json(
        { success: false, error: `depth must be one of: ${VALID_DEPTHS.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, url')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    const { data: audit, error } = await supabaseAdmin
      .from('site_audits')
      .insert({
        client_id: clientId,
        status: 'pending',
        issues_critical: 0,
        issues_warning: 0,
        issues_info: 0,
        issues: [],
        raw_data: { depth, target_url: client.url },
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
      auditId: audit.id,
      clientId,
      depth,
      status: 'pending',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start audit'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
