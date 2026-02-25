import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAgentById } from '@/lib/agents'
import type { AgentRun } from '@/types'

interface AgentRunRequestBody {
  clientId: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const body: AgentRunRequestBody = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
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
      .insert({
        agent_id: agentId,
        client_id: clientId,
        status: 'queued',
        trigger: 'manual',
        log_lines: [`[${new Date().toISOString()}] Run queued by manual trigger`],
        input: { clientId },
      } satisfies Partial<AgentRun>)
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
      runId: run.id,
      agentId,
      status: 'started',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start agent run'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
