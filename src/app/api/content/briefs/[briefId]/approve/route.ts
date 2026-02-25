import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ briefId: string }> }
) {
  try {
    const { briefId } = await params

    // Verify the brief exists and is in an approvable state
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('content_briefs')
      .select('id, status')
      .eq('id', briefId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Content brief not found' },
        { status: 404 }
      )
    }

    if (existing.status === 'published' || existing.status === 'archived') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot approve a brief with status '${existing.status}'`,
        },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()

    const { data: brief, error } = await supabaseAdmin
      .from('content_briefs')
      .update({
        status: 'ready',
        updated_at: now,
        // Store approval timestamp in notes if no dedicated column exists yet
        notes: `Approved at ${now}`,
      })
      .eq('id', briefId)
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
      data: brief,
      approved_at: now,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve content brief'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
