'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Bot,
  Search,
  TrendingUp,
  Shield,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'
import { useClient } from '@/contexts/client-context'
import { cn, timeAgo } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AgentType =
  | 'keyword-scout'
  | 'rank-tracker'
  | 'audit-runner'
  | 'content-optimizer'
  | 'competitor-monitor'

type RunStatus = 'completed' | 'running' | 'failed'

interface Agent {
  type: AgentType
  name: string
  description: string
  schedule: 'daily' | 'weekly' | 'monthly'
  enabled: boolean
}

interface AgentRun {
  id: string
  agent_type: AgentType
  agent_name: string
  status: RunStatus
  started_at: string
  completed_at: string
  duration_ms: number
  results: Record<string, unknown>
  triggered_by: 'schedule' | 'manual'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const AGENT_ICONS: Record<AgentType, React.ReactNode> = {
  'keyword-scout':      <Search size={16} />,
  'rank-tracker':       <TrendingUp size={16} />,
  'audit-runner':       <Shield size={16} />,
  'content-optimizer':  <FileText size={16} />,
  'competitor-monitor': <Eye size={16} />,
}

const AGENT_COLORS: Record<AgentType, { bg: string; color: string }> = {
  'keyword-scout':      { bg: '#DBEAFE', color: '#2563EB' },
  'rank-tracker':       { bg: '#D1FAE5', color: '#059669' },
  'audit-runner':       { bg: '#EDE9FE', color: '#7C3AED' },
  'content-optimizer':  { bg: '#FEF3C7', color: '#D97706' },
  'competitor-monitor': { bg: '#FEE2E2', color: '#DC2626' },
}

const RUN_STATUS_BADGE: Record<RunStatus, BadgeVariant> = {
  completed: 'success',
  running:   'info',
  failed:    'danger',
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms / 60_000)}m`
}

// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------
function AgentCard({ agent }: { agent: Agent }) {
  const colors = AGENT_COLORS[agent.type] ?? { bg: '#F1F5F9', color: '#64748B' }
  const icon   = AGENT_ICONS[agent.type] ?? <Bot size={16} />

  return (
    <Card className="flex flex-col gap-3 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.bg, color: colors.color }}
        >
          {icon}
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <div
            className={cn(
              'h-2 w-2 rounded-full flex-shrink-0',
              agent.enabled ? 'bg-emerald-400' : 'bg-slate-300'
            )}
          />
          <span
            className={cn(
              'text-[10px] font-medium',
              agent.enabled ? 'text-emerald-600' : 'text-slate-400'
            )}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {agent.enabled ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Name + description */}
      <div>
        <p
          className="text-sm font-semibold text-slate-900"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {agent.name}
        </p>
        <p
          className="mt-0.5 text-xs text-slate-500 leading-relaxed"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {agent.description}
        </p>
      </div>

      {/* Schedule badge */}
      <div className="mt-auto">
        <Badge variant="outline" className="capitalize">
          {agent.schedule === 'daily' ? 'Daily' : agent.schedule === 'weekly' ? 'Weekly' : 'Monthly'}
        </Badge>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Table columns for recent runs
// ---------------------------------------------------------------------------
const runColumns: Column<AgentRun>[] = [
  {
    key: 'agent_name',
    label: 'Agent',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
          style={{
            backgroundColor: AGENT_COLORS[row.agent_type]?.bg ?? '#F1F5F9',
            color:           AGENT_COLORS[row.agent_type]?.color ?? '#64748B',
          }}
        >
          {AGENT_ICONS[row.agent_type] ?? <Bot size={11} />}
        </div>
        <span
          className="text-sm font-medium text-slate-800"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {row.agent_name}
        </span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <div className="flex items-center gap-1.5">
        {row.status === 'completed' && <CheckCircle2 size={12} className="text-emerald-500" />}
        {row.status === 'failed'    && <XCircle size={12} className="text-red-500" />}
        {row.status === 'running'   && <div className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />}
        <Badge variant={RUN_STATUS_BADGE[row.status]} className="capitalize">
          {row.status}
        </Badge>
      </div>
    ),
  },
  {
    key: 'triggered_by',
    label: 'Triggered',
    render: (row) => (
      <Badge variant={row.triggered_by === 'manual' ? 'purple' : 'muted'} className="capitalize">
        {row.triggered_by}
      </Badge>
    ),
  },
  {
    key: 'duration_ms',
    label: 'Duration',
    align: 'right',
    render: (row) => (
      <span
        className="text-xs text-slate-500"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {row.completed_at ? formatDuration(row.duration_ms) : '--'}
      </span>
    ),
  },
  {
    key: 'started_at',
    label: 'Date',
    align: 'right',
    render: (row) => (
      <span
        className="text-xs text-slate-400"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {timeAgo(row.started_at)}
      </span>
    ),
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AgentsPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [agents, setAgents]         = useState<Agent[]>([])
  const [recentRuns, setRecentRuns] = useState<AgentRun[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const fetchConfig = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    setAgents([])
    setRecentRuns([])
    try {
      const res  = await fetch(`/api/agents/config?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setAgents(json.data.agents ?? [])
        setRecentRuns(json.data.recentRuns ?? [])
      } else {
        setError(json.error || 'Failed to fetch agent configuration.')
      }
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      fetchConfig(currentClient.id)
    }
  }, [currentClient?.id, fetchConfig])

  // --- Client loading state ---
  if (clientLoading) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-5 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} className="h-40" />
          ))}
        </div>
        <SkeletonTable rows={5} columns={5} />
      </div>
    )
  }

  // --- No business ---
  if (hasNoBusiness) {
    return <EmptyDashboard />
  }

  const clientName    = currentClient?.name ?? 'your account'
  const activeCount   = agents.filter((a) => a.enabled).length
  const disabledCount = agents.filter((a) => !a.enabled).length

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-amber-500" />
          <h1
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Agent Console
          </h1>
        </div>
        <p
          className="mt-0.5 text-xs text-slate-500"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Autonomous SEO agents for{' '}
          <span className="font-medium text-blue-700">{clientName}</span>
          {!loading && agents.length > 0 && (
            <span>
              {' '}&mdash;{' '}
              <span className="text-emerald-600 font-medium">{activeCount} active</span>
              {disabledCount > 0 && (
                <span className="text-slate-400">, {disabledCount} paused</span>
              )}
            </span>
          )}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} className="h-40" />
            ))}
          </div>
          <SkeletonTable rows={5} columns={5} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {error}
        </div>
      )}

      {/* No agents */}
      {!loading && !error && agents.length === 0 && (
        <EmptyState
          icon={<Bot className="h-6 w-6" />}
          title="No agents configured"
          description="Autonomous agents will continuously monitor, analyze, and optimize your SEO. Agent configuration is coming soon."
          size="lg"
        />
      )}

      {/* Agents grid */}
      {!loading && !error && agents.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.type} agent={agent} />
            ))}
          </div>

          {/* Recent Runs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2
                className="text-sm font-semibold text-slate-800"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Recent Runs
              </h2>
              {recentRuns.length > 0 && (
                <span
                  className="text-xs text-slate-400"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {recentRuns.length} run{recentRuns.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {recentRuns.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p
                    className="text-sm text-slate-400"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    No runs recorded yet. Agents will execute on their configured schedule.
                  </p>
                </CardContent>
              </Card>
            ) : (
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              <DataTable<any>
                columns={runColumns}
                data={recentRuns}
                keyExtractor={(row: AgentRun) => row.id}
                emptyMessage="No recent runs."
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
