'use client'

import * as React from 'react'
import {
  Search,
  TrendingUp,
  FileText,
  Shield,
  Eye,
  BarChart3,
  Play,
  ScrollText,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Zap,
  Bot,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AGENTS, type AgentDefinition } from '@/lib/agents'
import { timeAgo } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Icon map – resolves agent icon string -> Lucide component
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ElementType> = {
  Search,
  TrendingUp,
  FileText,
  Shield,
  Eye,
  BarChart3,
}

function AgentIcon({
  name,
  color,
  size = 20,
}: {
  name: string
  color: string
  size?: number
}) {
  const Icon = ICON_MAP[name] ?? Bot
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: 44,
        height: 44,
        backgroundColor: `${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      <Icon size={size} style={{ color }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent run state per agent
// ---------------------------------------------------------------------------
type RunStatus = 'idle' | 'running' | 'completed' | 'failed'

interface AgentState {
  status: RunStatus
  lastRun: Date | null
  runCount: number
}

function buildInitialState(): Record<string, AgentState> {
  const now = new Date()
  return {
    'keyword-scout': {
      status: 'completed',
      lastRun: new Date(now.getTime() - 1000 * 60 * 47),
      runCount: 14,
    },
    'rank-tracker': {
      status: 'completed',
      lastRun: new Date(now.getTime() - 1000 * 60 * 112),
      runCount: 21,
    },
    'content-optimizer': {
      status: 'idle',
      lastRun: new Date(now.getTime() - 1000 * 60 * 60 * 72),
      runCount: 6,
    },
    'technical-auditor': {
      status: 'failed',
      lastRun: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      runCount: 3,
    },
    'competitor-watcher': {
      status: 'completed',
      lastRun: new Date(now.getTime() - 1000 * 60 * 23),
      runCount: 18,
    },
    'report-generator': {
      status: 'idle',
      lastRun: new Date(now.getTime() - 1000 * 60 * 60 * 168),
      runCount: 4,
    },
  }
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: RunStatus }) {
  if (status === 'running') {
    return (
      <Badge variant="info" className="gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
        Running
      </Badge>
    )
  }
  if (status === 'completed') {
    return (
      <Badge variant="success">
        <CheckCircle2 size={11} />
        Completed
      </Badge>
    )
  }
  if (status === 'failed') {
    return (
      <Badge variant="danger">
        <XCircle size={11} />
        Failed
      </Badge>
    )
  }
  return (
    <Badge variant="outline">
      <Clock size={11} />
      Idle
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Individual agent card
// ---------------------------------------------------------------------------
interface AgentCardProps {
  agent: AgentDefinition
  state: AgentState
  onRun: (id: string) => void
}

function AgentCard({ agent, state, onRun }: AgentCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        {/* Top row: icon + name + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <AgentIcon name={agent.icon} color={agent.color} />
            <div>
              <p className="text-sm font-semibold text-[#202124]">{agent.name}</p>
              <p className="mt-0.5 text-xs text-[#80868b]">{agent.schedule}</p>
            </div>
          </div>
          <StatusBadge status={state.status} />
        </div>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-[#5f6368]">
          {agent.description}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        {/* Last run */}
        <div className="flex items-center gap-2 text-xs text-[#80868b]">
          <Clock size={12} />
          <span>
            Last run:{' '}
            <span className="text-[#5f6368]">
              {state.lastRun ? timeAgo(state.lastRun) : 'Never'}
            </span>
          </span>
          <span className="ml-auto text-[#5f6368]">
            {state.runCount} total runs
          </span>
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.slice(0, 3).map((cap) => {
            // Take only first 5 words for a compact tag
            const label = cap.split(' ').slice(0, 5).join(' ')
            return (
              <span
                key={cap}
                className="rounded-md border border-[#dadce0] bg-[#f8f9fa] px-2 py-0.5 text-[10px] text-[#80868b]"
              >
                {label}
              </span>
            )
          })}
          {agent.capabilities.length > 3 && (
            <span className="rounded-md border border-[#dadce0] bg-[#f8f9fa] px-2 py-0.5 text-[10px] text-[#5f6368]">
              +{agent.capabilities.length - 3} more
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2 border-t border-[#dadce0] pt-4">
          <Button
            size="sm"
            variant="default"
            className="flex-1 gap-1.5"
            disabled={state.status === 'running'}
            onClick={() => onRun(agent.id)}
          >
            {state.status === 'running' ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={13} />
                Run Now
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 px-3">
            <ScrollText size={13} />
            <span className="hidden sm:inline">Logs</span>
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5 px-3">
            <Settings size={13} />
            <span className="hidden sm:inline">Config</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Recent activity log data
// ---------------------------------------------------------------------------
interface ActivityEntry {
  id: string
  agentId: string
  agentName: string
  agentIcon: string
  agentColor: string
  status: 'completed' | 'failed' | 'running'
  duration: string
  timestamp: Date
  summary: string
}

function buildActivityLog(): ActivityEntry[] {
  const now = new Date()
  return [
    {
      id: '1',
      agentId: 'keyword-scout',
      agentName: 'Keyword Scout',
      agentIcon: 'Search',
      agentColor: '#1a73e8',
      status: 'completed',
      duration: '1m 23s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 47),
      summary: 'Discovered 38 new keyword opportunities across 4 clients',
    },
    {
      id: '2',
      agentId: 'rank-tracker',
      agentName: 'Rank Tracker',
      agentIcon: 'TrendingUp',
      agentColor: '#1e8e3e',
      status: 'completed',
      duration: '2m 08s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 112),
      summary: 'Updated 1,284 keyword positions; 14 significant changes detected',
    },
    {
      id: '3',
      agentId: 'competitor-watcher',
      agentName: 'Competitor Watcher',
      agentIcon: 'Eye',
      agentColor: '#d93025',
      status: 'completed',
      duration: '3m 45s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 23),
      summary: 'Detected 6 competitor rank changes; 2 entered top-3 positions',
    },
    {
      id: '4',
      agentId: 'technical-auditor',
      agentName: 'Technical Auditor',
      agentIcon: 'Shield',
      agentColor: '#f9ab00',
      status: 'failed',
      duration: '0m 12s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      summary: 'Error: target site returned 503 during crawl. Will retry.',
    },
    {
      id: '5',
      agentId: 'content-optimizer',
      agentName: 'Content Optimizer',
      agentIcon: 'FileText',
      agentColor: '#9334e6',
      status: 'completed',
      duration: '4m 02s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 72),
      summary: 'Generated 7 content briefs; 3 pages flagged for refresh',
    },
    {
      id: '6',
      agentId: 'keyword-scout',
      agentName: 'Keyword Scout',
      agentIcon: 'Search',
      agentColor: '#1a73e8',
      status: 'completed',
      duration: '1m 31s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 - 1000 * 60 * 47),
      summary: 'Processed 52 seed terms via Answer The Public; 19 added to queue',
    },
    {
      id: '7',
      agentId: 'rank-tracker',
      agentName: 'Rank Tracker',
      agentIcon: 'TrendingUp',
      agentColor: '#1e8e3e',
      status: 'completed',
      duration: '1m 55s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 25),
      summary: 'Tracked 1,284 keywords; avg position improved to 14.2 from 15.1',
    },
    {
      id: '8',
      agentId: 'report-generator',
      agentName: 'Report Generator',
      agentIcon: 'BarChart3',
      agentColor: '#f9ab00',
      status: 'completed',
      duration: '5m 14s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 168),
      summary: '6 weekly reports generated and emailed to clients',
    },
    {
      id: '9',
      agentId: 'competitor-watcher',
      agentName: 'Competitor Watcher',
      agentIcon: 'Eye',
      agentColor: '#d93025',
      status: 'failed',
      duration: '0m 08s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 26),
      summary: 'Rate limit hit on external rank API. Retried successfully 2h later.',
    },
    {
      id: '10',
      agentId: 'technical-auditor',
      agentName: 'Technical Auditor',
      agentIcon: 'Shield',
      agentColor: '#f9ab00',
      status: 'completed',
      duration: '8m 33s',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48),
      summary: 'Full crawl complete: 3 critical issues, 11 warnings, 24 info items',
    },
  ]
}

// ---------------------------------------------------------------------------
// Overall status indicator
// ---------------------------------------------------------------------------
function OverallStatusDot({ states }: { states: Record<string, AgentState> }) {
  const values = Object.values(states)
  const running = values.filter((s) => s.status === 'running').length
  const failed = values.filter((s) => s.status === 'failed').length

  if (running > 0) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
        </span>
        <span className="text-xs font-medium text-[#1a73e8]">
          {running} agent{running > 1 ? 's' : ''} running
        </span>
      </div>
    )
  }
  if (failed > 0) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5">
        <XCircle size={13} className="text-red-400" />
        <span className="text-xs font-medium text-red-400">
          {failed} agent{failed > 1 ? 's' : ''} failed
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5">
      <CheckCircle2 size={13} className="text-green-400" />
      <span className="text-xs font-medium text-green-400">All systems nominal</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function AgentsPage() {
  const [agentStates, setAgentStates] = React.useState<Record<string, AgentState>>(
    buildInitialState
  )
  const [activityLog] = React.useState<ActivityEntry[]>(buildActivityLog)

  function handleRunAgent(id: string) {
    setAgentStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: 'running' },
    }))

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        [id]: {
          status: 'completed',
          lastRun: new Date(),
          runCount: (prev[id]?.runCount ?? 0) + 1,
        },
      }))
    }, 3000)
  }

  function handleRunAll() {
    AGENTS.forEach((agent) => {
      setAgentStates((prev) => ({
        ...prev,
        [agent.id]: { ...prev[agent.id], status: 'running' },
      }))
    })

    // Stagger completions so they don't all finish simultaneously
    AGENTS.forEach((agent, i) => {
      setTimeout(() => {
        setAgentStates((prev) => ({
          ...prev,
          [agent.id]: {
            status: 'completed',
            lastRun: new Date(),
            runCount: (prev[agent.id]?.runCount ?? 0) + 1,
          },
        }))
      }, 3000 + i * 600)
    })
  }

  const runningCount = Object.values(agentStates).filter(
    (s) => s.status === 'running'
  ).length

  return (
    <div className="p-6 lg:p-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot size={22} className="text-[#f9ab00]" />
            <h1 className="text-2xl font-bold text-[#202124]">Agent Console</h1>
          </div>
          <p className="mt-1 text-sm text-[#80868b]">
            Autonomous agents that continuously monitor, analyze, and optimize your SEO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OverallStatusDot states={agentStates} />
          <Button
            variant="gold"
            className="gap-2"
            onClick={handleRunAll}
            disabled={runningCount > 0}
          >
            {runningCount > 0 ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Running {runningCount}...
              </>
            ) : (
              <>
                <Zap size={15} />
                Run All Agents
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Agent cards grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            state={agentStates[agent.id] ?? { status: 'idle', lastRun: null, runCount: 0 }}
            onRun={handleRunAgent}
          />
        ))}
      </div>

      {/* ── Recent Agent Activity ────────────────────────────────────── */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#202124]">
            Recent Agent Activity
          </h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#80868b]">
            View all logs
            <ChevronRight size={13} />
          </Button>
        </div>

        <div className="rounded-xl border border-[#dadce0] bg-[#ffffff] divide-y divide-[#dadce0]">
          {activityLog.map((entry, idx) => {
            const Icon = ICON_MAP[entry.agentIcon] ?? Bot
            return (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-[#f8f9fa] transition-colors"
              >
                {/* Timeline line */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${entry.agentColor}1a`,
                      border: `1px solid ${entry.agentColor}33`,
                    }}
                  >
                    <Icon size={14} style={{ color: entry.agentColor }} />
                  </div>
                  {idx < activityLog.length - 1 && (
                    <div className="mt-1 h-full w-px bg-[#dadce0]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[#202124]">
                      {entry.agentName}
                    </span>
                    {entry.status === 'completed' ? (
                      <Badge variant="success" className="text-[10px]">
                        <CheckCircle2 size={10} />
                        Completed
                      </Badge>
                    ) : entry.status === 'failed' ? (
                      <Badge variant="danger" className="text-[10px]">
                        <XCircle size={10} />
                        Failed
                      </Badge>
                    ) : (
                      <Badge variant="info" className="text-[10px]">
                        Running
                      </Badge>
                    )}
                    <span className="text-[11px] text-[#5f6368]">
                      {entry.duration}
                    </span>
                  </div>
                  <p className="text-xs text-[#80868b]">{entry.summary}</p>
                </div>

                {/* Timestamp */}
                <span className="shrink-0 text-[11px] text-[#5f6368]">
                  {timeAgo(entry.timestamp)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
