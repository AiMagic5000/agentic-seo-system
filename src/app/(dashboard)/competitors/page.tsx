'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
  Shield,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
interface CompetitorIssues {
  critical: number
  high: number
  medium: number
  low: number
}

interface Competitor {
  clientId: string
  domain: string
  businessName: string
  score: number | null
  keywordCount: number
  issues: CompetitorIssues
  lastScanned: string | null
  color: string
}

interface CompetitorData {
  currentClientId: string
  competitors: Competitor[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getScoreColor(score: number | null): string {
  if (score === null) return 'text-slate-400'
  if (score >= 90) return 'text-emerald-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-slate-200'
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function getScoreDot(score: number | null): string {
  if (score === null) return '#94A3B8'
  if (score >= 90) return '#10B981'
  if (score >= 70) return '#3B82F6'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

const SEVERITY_BADGE: Record<keyof CompetitorIssues, BadgeVariant> = {
  critical: 'danger',
  high:     'warning',
  medium:   'gold',
  low:      'info',
}

function totalIssues(issues: CompetitorIssues): number {
  return issues.critical + issues.high + issues.medium + issues.low
}

// ---------------------------------------------------------------------------
// Table columns
// ---------------------------------------------------------------------------
const columns: Column<Competitor>[] = [
  {
    key: 'domain',
    label: 'Domain',
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: row.color }}
        />
        <div className="min-w-0">
          <p
            className="text-sm font-medium text-slate-800 truncate"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {row.businessName}
          </p>
          <p
            className="text-[11px] text-slate-400 truncate"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {row.domain}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'score',
    label: 'SEO Score',
    sortable: true,
    align: 'center',
    width: '100px',
    render: (row) => (
      <span
        className={cn('text-sm font-bold', getScoreColor(row.score))}
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {row.score !== null ? row.score : '--'}
      </span>
    ),
  },
  {
    key: 'keywordCount',
    label: 'Keywords',
    sortable: true,
    align: 'center',
    width: '90px',
    render: (row) => (
      <span
        className="text-sm text-slate-700"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {row.keywordCount}
      </span>
    ),
  },
  {
    key: 'issues' as string,
    label: 'Issues',
    width: '220px',
    render: (row) => {
      const total = totalIssues(row.issues)
      if (total === 0) {
        return (
          <span
            className="text-xs text-slate-400"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            No issues
          </span>
        )
      }
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {row.issues.critical > 0 && (
            <Badge variant={SEVERITY_BADGE.critical}>
              {row.issues.critical} Critical
            </Badge>
          )}
          {row.issues.high > 0 && (
            <Badge variant={SEVERITY_BADGE.high}>
              {row.issues.high} High
            </Badge>
          )}
          {row.issues.medium > 0 && (
            <Badge variant={SEVERITY_BADGE.medium}>
              {row.issues.medium} Med
            </Badge>
          )}
          {row.issues.low > 0 && (
            <Badge variant={SEVERITY_BADGE.low}>
              {row.issues.low} Low
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    key: 'lastScanned',
    label: 'Last Scanned',
    sortable: true,
    align: 'right',
    width: '120px',
    render: (row) => (
      <span
        className="text-xs text-slate-400"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {row.lastScanned ? timeAgo(row.lastScanned) : 'Never'}
      </span>
    ),
  },
]

// ---------------------------------------------------------------------------
// Score Bar component
// ---------------------------------------------------------------------------
function ScoreBar({ competitor, maxScore }: { competitor: Competitor; maxScore: number }) {
  const score = competitor.score ?? 0
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 min-w-[140px] shrink-0">
        <div
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: competitor.color }}
        />
        <span
          className="text-xs text-slate-700 truncate"
          style={{ fontFamily: 'var(--font-sans)' }}
          title={competitor.domain}
        >
          {competitor.domain}
        </span>
      </div>
      <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getScoreBg(competitor.score))}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span
        className={cn('text-xs font-bold min-w-[28px] text-right', getScoreColor(competitor.score))}
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {competitor.score !== null ? competitor.score : '--'}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CompetitorsPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [data, setData]       = useState<CompetitorData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetchCompetitors = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res  = await fetch(`/api/competitors?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data as CompetitorData)
      } else {
        setError(json.error || 'Failed to fetch competitor data.')
      }
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      fetchCompetitors(currentClient.id)
    }
  }, [currentClient?.id, fetchCompetitors])

  // Split current client from the rest
  const currentSite = useMemo(() => {
    if (!data) return null
    return data.competitors.find((c) => c.clientId === data.currentClientId) ?? null
  }, [data])

  const otherCompetitors = useMemo(() => {
    if (!data) return []
    return data.competitors.filter((c) => c.clientId !== data.currentClientId)
  }, [data])

  const allSorted = useMemo(() => {
    if (!data) return []
    return [...data.competitors].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }, [data])

  const maxScore = useMemo(() => {
    if (!allSorted.length) return 100
    return Math.max(...allSorted.map((c) => c.score ?? 0), 100)
  }, [allSorted])

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
        <SkeletonTable rows={6} columns={5} />
      </div>
    )
  }

  // --- No business ---
  if (hasNoBusiness) {
    return <EmptyDashboard />
  }

  const clientName = currentClient?.name ?? 'your account'

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-amber-500" />
            <h1
              className="text-base font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Competitor Analysis
            </h1>
          </div>
          <p
            className="mt-0.5 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Comparing all sites against{' '}
            <span className="font-medium text-blue-700">{clientName}</span>
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 shrink-0"
          disabled
          title="Coming soon"
        >
          <Plus size={13} />
          Add Competitor
        </Button>
      </div>

      {/* Data loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={6} columns={5} />
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

      {/* No data yet */}
      {!loading && !error && !data && (
        <EmptyState
          icon={<Eye className="h-6 w-6" />}
          title="No competitor data yet"
          description="Run a site audit first to generate comparison data across your clients."
          size="lg"
        />
      )}

      {/* Data loaded */}
      {!loading && !error && data && (
        <>
          {/* Current site summary card */}
          {currentSite && (
            <Card>
              <CardHeader className="border-b border-slate-200 pb-3 pt-3">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-600" />
                  <span
                    className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Your Site
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    {
                      label: 'SEO Score',
                      value: currentSite.score !== null ? `${currentSite.score}` : '--',
                      dot: getScoreDot(currentSite.score),
                      textCls: getScoreColor(currentSite.score),
                    },
                    {
                      label: 'Keywords',
                      value: `${currentSite.keywordCount}`,
                      dot: '#3B82F6',
                      textCls: 'text-slate-900',
                    },
                    {
                      label: 'Issues',
                      value: `${totalIssues(currentSite.issues)}`,
                      dot: currentSite.issues.critical > 0 ? '#EF4444' : currentSite.issues.high > 0 ? '#F59E0B' : '#10B981',
                      textCls: 'text-slate-900',
                    },
                    {
                      label: 'Domain',
                      value: currentSite.domain,
                      dot: currentSite.color,
                      textCls: 'text-slate-900',
                      isMono: false,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                    >
                      <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: s.dot }} />
                      <div className="min-w-0">
                        <p
                          className={cn('text-lg font-bold truncate', s.textCls)}
                          style={{
                            fontFamily: s.isMono === false ? 'var(--font-sans)' : 'var(--font-mono)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {s.value}
                        </p>
                        <p className="text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                          {s.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score comparison bar chart */}
          {allSorted.length > 1 && (
            <Card>
              <CardHeader className="border-b border-slate-200 pb-3 pt-3">
                <span
                  className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Score Comparison
                </span>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="space-y-2">
                  {allSorted.map((comp) => (
                    <ScoreBar
                      key={comp.clientId}
                      competitor={comp}
                      maxScore={maxScore}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitor table */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3 pt-3">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  All Sites
                </span>
                <span
                  className="text-xs text-slate-400"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {data.competitors.length} site{data.competitors.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <DataTable<any>
                columns={columns}
                data={data.competitors}
                keyExtractor={(row: Competitor) => row.clientId}
                emptyMessage="No competitor data available."
                className="border-none"
              />

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                <p
                  className="text-xs text-slate-500"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {data.competitors.length === 0 ? (
                    'No results'
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{data.competitors.length}</span>
                      {' '}site{data.competitors.length !== 1 ? 's' : ''} tracked
                    </>
                  )}
                </p>
                <p
                  className="text-xs text-slate-400"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {otherCompetitors.length} competitor{otherCompetitors.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Data loaded but no competitors at all */}
      {!loading && !error && data && data.competitors.length === 0 && (
        <EmptyState
          icon={<Eye className="h-6 w-6" />}
          title="No sites to compare"
          description="Add more clients or run audits to start comparing sites against each other."
          size="default"
        />
      )}
    </div>
  )
}
