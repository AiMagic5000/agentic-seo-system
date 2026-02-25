'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Bot,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'
import { useClient } from '@/contexts/client-context'
import { cn, timeAgo, formatNumber } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

interface ReportData {
  clientId: string
  domain: string
  businessName: string
  gscPropertyUrl: string | null
  generatedAt: string
  score: number | null
  lastScanDate: string | null
  issues: {
    total: number
    fixed: number
    bySeverity: Record<Severity, number>
    byCategory: { category: string; count: number }[]
  }
  keywords: {
    totalTracked: number
    positionDistribution: {
      top3: number
      top10: number
      top20: number
      beyond20: number
    }
    topKeywords: {
      keyword: string
      clicks: number
      impressions: number
      position: number | null
      ctr: number | null
    }[]
  }
  agents: {
    totalRuns: number
    successCount: number
    failCount: number
    lastRunByAgent: {
      agentType: string
      agentName: string
      status: string
      completedAt: string | null
      startedAt: string | null
    }[]
  }
  recommendations: {
    severity: string
    title: string
    recommendation: string
    url: string
  }[]
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SEVERITY_BADGE: Record<Severity, BadgeVariant> = {
  critical: 'danger',
  high:     'warning',
  medium:   'gold',
  low:      'info',
  info:     'muted',
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#FCD34D',
  low:      '#3B82F6',
  info:     '#94A3B8',
}

const SEVERITY_ICON: Record<Severity, React.ReactNode> = {
  critical: <AlertCircle size={12} className="text-red-500" />,
  high:     <AlertTriangle size={12} className="text-amber-500" />,
  medium:   <AlertTriangle size={12} className="text-yellow-500" />,
  low:      <Info size={12} className="text-blue-400" />,
  info:     <Info size={12} className="text-slate-400" />,
}

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info']

const CATEGORY_LABELS: Record<string, string> = {
  seo:           'SEO',
  performance:   'Performance',
  accessibility: 'Accessibility',
  links:         'Links',
  schema:        'Structured Data',
  security:      'Security',
  content:       'Content',
  meta:          'Meta Tags',
  speed:         'Speed',
  mobile:        'Mobile',
  other:         'Other',
}

const AGENT_STATUS_BADGE: Record<string, BadgeVariant> = {
  completed: 'success',
  running:   'default',
  failed:    'danger',
  queued:    'muted',
  cancelled: 'outline',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-50 border-emerald-200'
  if (score >= 70) return 'bg-blue-50 border-blue-200'
  if (score >= 50) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

function getPositionColor(pos: number | null): string {
  if (pos === null) return 'text-slate-400'
  if (pos <= 3) return 'text-emerald-600'
  if (pos <= 10) return 'text-blue-600'
  if (pos <= 20) return 'text-amber-600'
  return 'text-red-500'
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReportsPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [data, setData]       = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetchReport = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res  = await fetch(`/api/reports/summary?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data as ReportData)
      } else {
        setError(json.error || 'Failed to load report data.')
      }
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      fetchReport(currentClient.id)
    }
  }, [currentClient?.id, fetchReport])

  // --- Client loading state ---
  if (clientLoading) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-5 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={6} columns={4} />
      </div>
    )
  }

  // --- No business ---
  if (hasNoBusiness) {
    return <EmptyDashboard />
  }

  const clientName = currentClient?.name ?? 'your account'

  // Derive totals for the executive summary metric row
  const issueTotal     = data?.issues.total ?? 0
  const keywordsTotal  = data?.keywords.totalTracked ?? 0
  const agentRunTotal  = data?.agents.totalRuns ?? 0
  const score          = data?.score ?? null

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div>
        <h1
          className="text-base font-semibold text-slate-900"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          SEO Report
        </h1>
        <p
          className="mt-0.5 text-xs text-slate-500"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Aggregated report for{' '}
          <span className="font-medium text-blue-700">{clientName}</span>
          {data?.domain && (
            <span className="text-slate-400">
              {' '}({data.domain})
            </span>
          )}
          {data?.generatedAt && (
            <span className="text-slate-400">
              {' '}-- generated {timeAgo(data.generatedAt)}
            </span>
          )}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={6} columns={4} />
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

      {/* No data */}
      {!loading && !error && !data && (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="No report data yet"
          description="Run a site audit and let the SEO agents collect data to generate your first report."
          size="lg"
          action={
            <a
              href="/audit"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Go to Site Audit
              <ArrowRight size={12} />
            </a>
          }
        />
      )}

      {/* Data loaded */}
      {!loading && !error && data && (
        <>
          {/* ================================================================
              EXECUTIVE SUMMARY
              ================================================================ */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3">
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Score big number */}
                <div
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border p-4 min-w-[120px]',
                    score !== null ? getScoreBg(score) : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      score !== null ? getScoreColor(score) : 'text-slate-400'
                    )}
                    style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {score !== null ? score : '--'}
                  </p>
                  <p
                    className="text-[11px] text-slate-500 mt-0.5"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    SEO Score
                  </p>
                </div>

                {/* Key metrics row */}
                <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: 'Keywords Tracked', value: keywordsTotal,  dot: '#3B82F6', icon: Search },
                    { label: 'Issues Found',     value: issueTotal,     dot: '#EF4444', icon: AlertCircle },
                    { label: 'Agent Runs',        value: agentRunTotal, dot: '#8B5CF6', icon: Bot },
                    { label: 'Issues Fixed',      value: data.issues.fixed, dot: '#10B981', icon: CheckCircle2 },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                    >
                      <div
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: m.dot }}
                      />
                      <div>
                        <p
                          className="text-lg font-bold text-slate-900"
                          style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatNumber(m.value)}
                        </p>
                        <p
                          className="text-[11px] text-slate-500"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {m.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ================================================================
              SEO HEALTH
              ================================================================ */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>SEO Health</CardTitle>
                <span
                  className="text-xs text-slate-400"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {issueTotal} open issue{issueTotal !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Issues by severity -- horizontal bars */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Issues by Severity
                </p>
                <div className="space-y-1.5">
                  {SEVERITY_ORDER.map((sev) => {
                    const count = data.issues.bySeverity[sev] ?? 0
                    const maxCount = Math.max(
                      1,
                      ...SEVERITY_ORDER.map((s) => data.issues.bySeverity[s] ?? 0)
                    )
                    const widthPct = Math.max(2, (count / maxCount) * 100)

                    return (
                      <div key={sev} className="flex items-center gap-2">
                        <span
                          className="w-16 text-xs text-slate-600 capitalize text-right"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {sev}
                        </span>
                        <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${widthPct}%`,
                              backgroundColor: SEVERITY_COLORS[sev],
                              opacity: count === 0 ? 0.3 : 1,
                            }}
                          />
                        </div>
                        <span
                          className="w-8 text-xs font-medium text-slate-700 text-right"
                          style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Issues by category */}
              {data.issues.byCategory.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Issues by Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.issues.byCategory.map(({ category, count }) => (
                      <div
                        key={category}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5"
                      >
                        <span
                          className="text-xs text-slate-700"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {CATEGORY_LABELS[category] ?? category}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================================================================
              KEYWORD PERFORMANCE
              ================================================================ */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Keyword Performance</CardTitle>
                <span
                  className="text-xs text-slate-400"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {keywordsTotal} keyword{keywordsTotal !== 1 ? 's' : ''} tracked
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Position distribution stat cards */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Top 3',  value: data.keywords.positionDistribution.top3,     dot: '#10B981' },
                  { label: 'Top 10', value: data.keywords.positionDistribution.top10,    dot: '#3B82F6' },
                  { label: 'Top 20', value: data.keywords.positionDistribution.top20,    dot: '#F59E0B' },
                  { label: '20+',    value: data.keywords.positionDistribution.beyond20, dot: '#EF4444' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                  >
                    <div
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: s.dot }}
                    />
                    <div>
                      <p
                        className="text-lg font-bold text-slate-900"
                        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {s.value}
                      </p>
                      <p
                        className="text-[11px] text-slate-500"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top 10 keywords table */}
              {data.keywords.topKeywords.length > 0 && (
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <span
                      className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Keyword
                    </span>
                    <span
                      className="w-16 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Clicks
                    </span>
                    <span
                      className="w-20 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right hidden sm:block"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Impressions
                    </span>
                    <span
                      className="w-14 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Position
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {data.keywords.topKeywords.map((kw, idx) => (
                      <div
                        key={`${kw.keyword}-${idx}`}
                        className="flex items-center gap-4 px-3 py-2 hover:bg-slate-50/60 transition-colors"
                      >
                        <span
                          className="flex-1 text-sm text-slate-800 truncate"
                          style={{ fontFamily: 'var(--font-sans)' }}
                          title={kw.keyword}
                        >
                          {kw.keyword}
                        </span>
                        <span
                          className="w-16 text-xs font-medium text-slate-700 text-right"
                          style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatNumber(kw.clicks)}
                        </span>
                        <span
                          className="w-20 text-xs text-slate-500 text-right hidden sm:block"
                          style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatNumber(kw.impressions)}
                        </span>
                        <span
                          className={cn(
                            'w-14 text-xs font-medium text-right',
                            getPositionColor(kw.position)
                          )}
                          style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                        >
                          {kw.position !== null ? `#${kw.position.toFixed(1)}` : '--'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.keywords.topKeywords.length === 0 && keywordsTotal === 0 && (
                <EmptyState
                  icon={<Search className="h-5 w-5" />}
                  title="No keywords tracked"
                  description="Add keywords to start tracking their performance."
                  size="sm"
                  action={
                    <a
                      href="/keywords"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Go to Keywords
                      <ArrowRight size={12} />
                    </a>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* ================================================================
              AGENT ACTIVITY
              ================================================================ */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Agent Activity</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px]">
                    {data.agents.successCount} passed
                  </Badge>
                  {data.agents.failCount > 0 && (
                    <Badge variant="danger" className="text-[10px]">
                      {data.agents.failCount} failed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {data.agents.lastRunByAgent.length > 0 ? (
                <div className="space-y-1.5">
                  {data.agents.lastRunByAgent.map((agent) => (
                    <div
                      key={agent.agentType}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Bot size={14} className="text-slate-400" />
                        <span
                          className="text-sm font-medium text-slate-800"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {agent.agentName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={AGENT_STATUS_BADGE[agent.status] ?? 'muted'}
                          className="text-[10px]"
                        >
                          {agent.status}
                        </Badge>
                        <span
                          className="text-xs text-slate-400"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          {agent.completedAt
                            ? timeAgo(agent.completedAt)
                            : agent.startedAt
                              ? `started ${timeAgo(agent.startedAt)}`
                              : 'never'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Bot className="h-5 w-5" />}
                  title="No agent activity"
                  description="SEO agents haven't run yet for this site."
                  size="sm"
                />
              )}

              {/* Total runs footer */}
              {agentRunTotal > 0 && (
                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  <p
                    className="text-xs text-slate-500"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    <span className="font-medium text-slate-700">{agentRunTotal}</span>
                    {' '}total agent run{agentRunTotal !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ================================================================
              RECOMMENDATIONS
              ================================================================ */}
          {data.recommendations.length > 0 && (
            <Card>
              <CardHeader className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Priority Recommendations</CardTitle>
                  <span
                    className="text-xs text-slate-400"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Top {data.recommendations.length} action item{data.recommendations.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {data.recommendations.map((rec, idx) => {
                    const sev = rec.severity as Severity
                    return (
                      <div
                        key={`${rec.title}-${idx}`}
                        className="flex items-start gap-3 px-4 py-3"
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {SEVERITY_ICON[sev] ?? SEVERITY_ICON.info}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="text-sm font-medium text-slate-800"
                              style={{ fontFamily: 'var(--font-sans)' }}
                            >
                              {rec.title}
                            </span>
                            <Badge
                              variant={SEVERITY_BADGE[sev] ?? 'muted'}
                              className="text-[10px]"
                            >
                              {sev}
                            </Badge>
                          </div>
                          {rec.recommendation && (
                            <div className="mt-1.5 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50/60 p-2">
                              <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
                              <p
                                className="text-xs text-blue-700 leading-relaxed"
                                style={{ fontFamily: 'var(--font-sans)' }}
                              >
                                {rec.recommendation}
                              </p>
                            </div>
                          )}
                          {rec.url && (
                            <p
                              className="mt-1 text-[10px] text-slate-400 truncate"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {rec.url}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No recommendations but data exists */}
          {data.recommendations.length === 0 && issueTotal === 0 && (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  title="No critical issues found"
                  description="Your site passed all high-priority checks. Keep up the work!"
                  size="default"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
