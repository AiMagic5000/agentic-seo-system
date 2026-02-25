import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// ---------------------------------------------------------------------------
// Default agent configurations
// ---------------------------------------------------------------------------

interface AgentConfigEntry {
  type: string
  name: string
  description: string
  schedule: 'daily' | 'weekly' | 'monthly'
  enabled: boolean
}

const DEFAULT_AGENTS: AgentConfigEntry[] = [
  {
    type: 'keyword-scout',
    name: 'Keyword Scout',
    description:
      'Discovers new keyword opportunities from GSC data',
    schedule: 'daily',
    enabled: true,
  },
  {
    type: 'rank-tracker',
    name: 'Rank Tracker',
    description:
      'Monitors daily position changes for tracked keywords',
    schedule: 'daily',
    enabled: true,
  },
  {
    type: 'audit-runner',
    name: 'Audit Runner',
    description: 'Runs weekly technical SEO audits',
    schedule: 'weekly',
    enabled: true,
  },
  {
    type: 'content-optimizer',
    name: 'Content Optimizer',
    description:
      'Analyzes content quality and suggests improvements',
    schedule: 'weekly',
    enabled: true,
  },
  {
    type: 'competitor-monitor',
    name: 'Competitor Monitor',
    description:
      'Tracks competitor ranking changes and new content',
    schedule: 'daily',
    enabled: false,
  },
]

// ---------------------------------------------------------------------------
// Agent type → display name mapping
// ---------------------------------------------------------------------------
const AGENT_NAMES: Record<string, string> = {
  'keyword-scout': 'Keyword Scout',
  'rank-tracker': 'Rank Tracker',
  'audit-runner': 'Audit Runner',
  'content-optimizer': 'Content Optimizer',
  'competitor-monitor': 'Competitor Monitor',
}

// ---------------------------------------------------------------------------
// GET /api/agents/config?clientId=xxx
//
// Returns the agent configuration and recent runs for a given client.
// If no configuration exists yet, returns the defaults.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId query parameter is required' },
        { status: 400 }
      )
    }

    // Verify client exists and user has access
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, domain, business_name, agent_config, owner_clerk_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!user.isAdmin && client.owner_clerk_id !== user.clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Return stored config or defaults
    const storedConfig = client.agent_config as Record<string, unknown> | null
    const hasConfig =
      storedConfig &&
      typeof storedConfig === 'object' &&
      Array.isArray((storedConfig as { agents?: unknown }).agents)

    const agents: AgentConfigEntry[] = hasConfig
      ? ((storedConfig as { agents: AgentConfigEntry[] }).agents)
      : DEFAULT_AGENTS

    // Fetch recent agent runs for this client (last 20)
    const { data: runs } = await supabaseAdmin
      .from('agent_runs')
      .select('id, agent_type, status, started_at, completed_at, duration_ms, results, triggered_by')
      .eq('client_id', clientId)
      .order('started_at', { ascending: false })
      .limit(20)

    const recentRuns = (runs ?? []).map((run) => ({
      ...run,
      agent_name: AGENT_NAMES[run.agent_type] ?? run.agent_type,
    }))

    return NextResponse.json({
      success: true,
      data: {
        clientId: client.id,
        domain: client.domain,
        businessName: client.business_name,
        isDefault: !hasConfig,
        agents,
        recentRuns,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch agent configuration'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/agents/config
//
// Saves agent configuration for a client.
// Body: { clientId: string, agents: AgentConfigEntry[] }
// Stored in seo_clients.agent_config JSONB column.
// ---------------------------------------------------------------------------

interface SaveConfigBody {
  clientId: string
  agents: AgentConfigEntry[]
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SaveConfigBody = await request.json()
    const { clientId, agents } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }

    if (!agents || !Array.isArray(agents)) {
      return NextResponse.json(
        { success: false, error: 'agents must be an array of agent configuration objects' },
        { status: 400 }
      )
    }

    // Validate each agent entry
    for (const agent of agents) {
      if (!agent.type || typeof agent.type !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Each agent must have a "type" string field' },
          { status: 400 }
        )
      }
      if (!agent.name || typeof agent.name !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Each agent must have a "name" string field' },
          { status: 400 }
        )
      }
      if (typeof agent.enabled !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            error: `Agent "${agent.type}" must have an "enabled" boolean field`,
          },
          { status: 400 }
        )
      }
      const validSchedules = ['daily', 'weekly', 'monthly']
      if (!validSchedules.includes(agent.schedule)) {
        return NextResponse.json(
          {
            success: false,
            error: `Agent "${agent.type}" schedule must be one of: ${validSchedules.join(', ')}`,
          },
          { status: 400 }
        )
      }
    }

    // Verify client exists and user has access
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, owner_clerk_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!user.isAdmin && client.owner_clerk_id !== user.clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Save the agent configuration
    const agentConfig = {
      agents,
      updatedAt: new Date().toISOString(),
      updatedBy: user.clerkUserId,
    }

    const { error: updateError } = await supabaseAdmin
      .from('seo_clients')
      .update({ agent_config: agentConfig })
      .eq('id', clientId)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        agents,
        savedAt: agentConfig.updatedAt,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to save agent configuration'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
