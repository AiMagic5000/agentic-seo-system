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
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { AGENTS, type AgentDefinition } from '@/lib/agents'
import { useClient } from '@/contexts/client-context'
import { timeAgo } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ElementType> = {
  Search, TrendingUp, FileText, Shield, Eye, BarChart3,
}

function AgentIcon({ name, color, size = 18 }: { name: string; color: string; size?: number }) {
  const Icon = ICON_MAP[name] ?? Bot
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{ width: 40, height: 40, backgroundColor: `${color}1a`, border: `1px solid ${color}33` }}
    >
      <Icon size={size} style={{ color }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Agent run state
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
    'keyword-scout':      { status: 'completed', lastRun: new Date(now.getTime() - 1000 * 60 * 47),        runCount: 14 },
    'rank-tracker':       { status: 'completed', lastRun: new Date(now.getTime() - 1000 * 60 * 112),       runCount: 21 },
    'content-optimizer':  { status: 'idle',      lastRun: new Date(now.getTime() - 1000 * 60 * 60 * 72),   runCount: 6  },
    'technical-auditor':  { status: 'failed',    lastRun: new Date(now.getTime() - 1000 * 60 * 60 * 24),   runCount: 3  },
    'competitor-watcher': { status: 'completed', lastRun: new Date(now.getTime() - 1000 * 60 * 23),        runCount: 18 },
    'report-generator':   { status: 'idle',      lastRun: new Date(now.getTime() - 1000 * 60 * 60 * 168),  runCount: 4  },
  }
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: RunStatus }) {
  if (status === 'running') return (
    <Badge variant="info" className="gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
      </span>
      Running
    </Badge>
  )
  if (status === 'completed') return (
    <Badge variant="success"><CheckCircle2 size={10} />Completed</Badge>
  )
  if (status === 'failed') return (
    <Badge variant="danger"><XCircle size={10} />Failed</Badge>
  )
  return <Badge variant="outline"><Clock size={10} />Idle</Badge>
}

// ---------------------------------------------------------------------------
// Agent card
// ---------------------------------------------------------------------------
function AgentCard({ agent, state, onRun }: { agent: AgentDefinition; state: AgentState; onRun: (id: string) => void }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <AgentIcon name={agent.icon} color={agent.color} />
            <div>
              <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>
                {agent.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                {agent.schedule}
              </p>
            </div>
          </div>
          <StatusBadge status={state.status} />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
          {agent.description}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {/* Last run info */}
        <div className="flex items-center gap-2 text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
          <Clock size={11} />
          <span>
            Last run:{' '}
            <span className="text-slate-600">{state.lastRun ? timeAgo(state.lastRun) : 'Never'}</span>
          </span>
          <span
            className="ml-auto text-slate-500"
            style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
          >
            {state.runCount} runs
          </span>
        </div>

        {/* Capability tags */}
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {cap.split(' ').slice(0, 5).join(' ')}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-1.5 border-t border-slate-100 pt-3">
          <Button
            size="sm"
            variant="default"
            className="flex-1 gap-1.5"
            disabled={state.status === 'running'}
            onClick={() => onRun(agent.id)}
          >
            {state.status === 'running' ? (
              <><Loader2 size={12} className="animate-spin" />Running...</>
            ) : (
              <><Play size={12} />Run Now</>
            )}
          </Button>
          <Button size="sm" variant="outline" className="gap-1 px-2.5">
            <ScrollText size={12} />
            <span className="hidden sm:inline text-xs">Logs</span>
          </Button>
          <Button size="sm" variant="ghost" className="gap-1 px-2.5">
            <Settings size={12} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Activity log data
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
    { id: '1',  agentId: 'keyword-scout',      agentName: 'Keyword Scout',      agentIcon: 'Search',    agentColor: '#3B82F6', status: 'completed', duration: '1m 23s', timestamp: new Date(now.getTime() - 1000 * 60 * 47),               summary: 'Discovered 38 new keyword opportunities across 4 clients' },
    { id: '2',  agentId: 'rank-tracker',        agentName: 'Rank Tracker',        agentIcon: 'TrendingUp',agentColor: '#10B981', status: 'completed', duration: '2m 08s', timestamp: new Date(now.getTime() - 1000 * 60 * 112),              summary: 'Updated 1,284 keyword positions; 14 significant changes detected' },
    { id: '3',  agentId: 'competitor-watcher',  agentName: 'Competitor Watcher',  agentIcon: 'Eye',       agentColor: '#EF4444', status: 'completed', duration: '3m 45s', timestamp: new Date(now.getTime() - 1000 * 60 * 23),               summary: 'Detected 6 competitor rank changes; 2 entered top-3 positions' },
    { id: '4',  agentId: 'technical-auditor',   agentName: 'Technical Auditor',   agentIcon: 'Shield',    agentColor: '#F59E0B', status: 'failed',    duration: '0m 12s', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24),          summary: 'Error: target site returned 503 during crawl. Will retry.' },
    { id: '5',  agentId: 'content-optimizer',   agentName: 'Content Optimizer',   agentIcon: 'FileText',  agentColor: '#8B5CF6', status: 'completed', duration: '4m 02s', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 72),          summary: 'Generated 7 content briefs; 3 pages flagged for refresh' },
    { id: '6',  agentId: 'keyword-scout',       agentName: 'Keyword Scout',       agentIcon: 'Search',    agentColor: '#3B82F6', status: 'completed', duration: '1m 31s', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 - 1000 * 60 * 47), summary: 'Processed 52 seed terms via Answer The Public; 19 added to queue' },
    { id: '7',  agentId: 'rank-tracker',        agentName: 'Rank Tracker',        agentIcon: 'TrendingUp',agentColor: '#10B981', status: 'completed', duration: '1m 55s', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 25),          summary: 'Tracked 1,284 keywords; avg position improved to 14.2 from 15.1' },
    { id: '8',  agentId: 'report-generator',    agentName: 'Report Generator',    agentIcon: 'BarChart3', agentColor: '#F59E0B', status: 'completed', duration: '5m 14s', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 168),         summary: '6 weekly reports generated and emailed to clients' },
    { id: '9',  agentId: 'competitor-watcher',  agentName: 'Competitor Watcher',  agentIcon: 'Eye',       agentColor: '#EF4444', status: 'failed',    duration: '0m 08s', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 26),          summary: 'Rate limit hit on external rank API. Retried successfully 2h later.' },
    { id: '10', agentId: 'technical-auditor',   agentName: 'Technical Auditor',   agentIcon: 'Shield',    agentColor: '#F59E0B', status: 'completed', duration: '8m 33s', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48),          summary: 'Full crawl complete: 3 critical issues, 11 warnings, 24 info items' },
  ]
}

// ---------------------------------------------------------------------------
// Overall status dot
// ---------------------------------------------------------------------------
function OverallStatusDot({ states }: { states: Record<string, AgentState> }) {
  const values  = Object.values(states)
  const running = values.filter((s) => s.status === 'running').length
  const failed  = values.filter((s) => s.status === 'failed').length

  if (running > 0) return (
    <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
      </span>
      <span className="text-xs font-medium text-blue-700" style={{ fontFamily: 'var(--font-sans)' }}>
        {running} running
      </span>
    </div>
  )
  if (failed > 0) return (
    <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5">
      <XCircle size={12} className="text-red-500" />
      <span className="text-xs font-medium text-red-600" style={{ fontFamily: 'var(--font-sans)' }}>
        {failed} failed
      </span>
    </div>
  )
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
      <CheckCircle2 size={12} className="text-emerald-500" />
      <span className="text-xs font-medium text-emerald-700" style={{ fontFamily: 'var(--font-sans)' }}>
        All systems nominal
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AgentsPage() {
  const { isLoading: clientLoading, hasNoBusiness } = useClient()
  const [agentStates, setAgentStates] = React.useState<Record<string, AgentState>>(buildInitialState)
  const [activityLog] = React.useState<ActivityEntry[]>(buildActivityLog)

  function handleRunAgent(id: string) {
    setAgentStates((prev) => ({ ...prev, [id]: { ...prev[id], status: 'running' } }))
    setTimeout(() => {
      setAgentStates((prev) => ({
        ...prev,
        [id]: { status: 'completed', lastRun: new Date(), runCount: (prev[id]?.runCount ?? 0) + 1 },
      }))
    }, 3000)
  }

  function handleRunAll() {
    AGENTS.forEach((agent) => {
      setAgentStates((prev) => ({ ...prev, [agent.id]: { ...prev[agent.id], status: 'running' } }))
    })
    AGENTS.forEach((agent, i) => {
      setTimeout(() => {
        setAgentStates((prev) => ({
          ...prev,
          [agent.id]: { status: 'completed', lastRun: new Date(), runCount: (prev[agent.id]?.runCount ?? 0) + 1 },
        }))
      }, 3000 + i * 600)
    })
  }

  const runningCount = Object.values(agentStates).filter((s) => s.status === 'running').length

  if (hasNoBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-5">
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No website connected"
          description="Add your first website to activate the AI agent fleet."
          size="lg"
        />
      </div>
    )
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            Autonomous agents that continuously monitor, analyze, and optimize your SEO.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OverallStatusDot states={agentStates} />
          <Button
            variant="amber"
            size="sm"
            className="gap-1.5"
            onClick={handleRunAll}
            disabled={runningCount > 0}
          >
            {runningCount > 0 ? (
              <><Loader2 size={13} className="animate-spin" />Running {runningCount}...</>
            ) : (
              <><Zap size={13} />Run All</>
            )}
          </Button>
        </div>
      </div>

      {/* Agent cards */}
      {clientLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0,1,2,3,4,5].map((i) => <SkeletonCard key={i} className="h-44" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              state={agentStates[agent.id] ?? { status: 'idle', lastRun: null, runCount: 0 }}
              onRun={handleRunAgent}
            />
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>
            Recent Activity
          </h2>
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-500">
            View all<ChevronRight size={12} />
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {activityLog.map((entry, idx) => {
            const Icon = ICON_MAP[entry.agentIcon] ?? Bot
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                {/* Icon with optional connector line */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${entry.agentColor}1a`, border: `1px solid ${entry.agentColor}33` }}
                  >
                    <Icon size={13} style={{ color: entry.agentColor }} />
                  </div>
                  {idx < activityLog.length - 1 && (
                    <div className="mt-1 h-full min-h-[8px] w-px bg-slate-100" />
                  )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>
                      {entry.agentName}
                    </span>
                    {entry.status === 'completed' ? (
                      <Badge variant="success" className="text-[10px]"><CheckCircle2 size={9} />Done</Badge>
                    ) : entry.status === 'failed' ? (
                      <Badge variant="danger"  className="text-[10px]"><XCircle size={9} />Failed</Badge>
                    ) : (
                      <Badge variant="info"    className="text-[10px]">Running</Badge>
                    )}
                    <span className="text-[11px] text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
                      {entry.duration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                    {entry.summary}
                  </p>
                </div>

                <span className="shrink-0 text-[11px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
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
