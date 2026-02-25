import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAgentById } from '@/lib/agents'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')

    if (!runId) {
      return NextResponse.json(
        { success: false, error: 'runId query parameter is required' },
        { status: 400 }
      )
    }

    const agentDef = getAgentById(agentId)
    if (!agentDef) {
      return NextResponse.json(
        { success: false, error: `Agent '${agentId}' does not exist` },
        { status: 404 }
      )
    }

    const { data: run, error } = await supabaseAdmin
      .from('agent_runs')
      .select('*')
      .eq('id', runId)
      .eq('agent_id', agentId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Agent run not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: run })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch agent run status'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
