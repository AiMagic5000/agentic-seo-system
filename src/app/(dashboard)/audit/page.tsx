'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Shield,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SearchInput } from '@/components/ui/search-input'
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'
import { useClient } from '@/contexts/client-context'
import { cn, truncateUrl, timeAgo } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuditStats {
  critical: number
  high: number
  medium: number
  low: number
  info: number
  totalChecks: number
  passedChecks: number
}

interface AuditIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: string
  title: string
  description: string
  recommendation: string
  url: string
  is_fixed: boolean
  created_at: string
}

interface AuditData {
  score: number
  lastScanAt: string
  stats: AuditStats
  issues: AuditIssue[]
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

function getScoreDot(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 70) return '#3B82F6'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

const SEVERITY_BADGE: Record<AuditIssue['severity'], BadgeVariant> = {
  critical: 'danger',
  high:     'warning',
  medium:   'gold',
  low:      'info',
  info:     'muted',
}

const SEVERITY_LABEL: Record<AuditIssue['severity'], string> = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
  info:     'Info',
}

const SEVERITY_ORDER: AuditIssue['severity'][] = ['critical', 'high', 'medium', 'low', 'info']

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'SEO',            value: 'seo' },
  { label: 'Performance',    value: 'performance' },
  { label: 'Accessibility',  value: 'accessibility' },
  { label: 'Links',          value: 'links' },
  { label: 'Schema',         value: 'schema' },
  { label: 'Security',       value: 'security' },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
interface SelectProps {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  className?: string
}

function Select({ value, onChange, options, className = '' }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800',
        'focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 focus:bg-white',
        'transition-colors duration-150 cursor-pointer',
        className
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Table columns
// ---------------------------------------------------------------------------
const columns: Column<AuditIssue>[] = [
  {
    key: 'severity',
    label: 'Severity',
    width: '90px',
    render: (row) => (
      <Badge variant={SEVERITY_BADGE[row.severity]}>
        {SEVERITY_LABEL[row.severity]}
      </Badge>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    width: '100px',
    render: (row) => (
      <span
        className="text-xs font-medium capitalize text-slate-500"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {row.category}
      </span>
    ),
  },
  {
    key: 'title',
    label: 'Issue',
    render: (row) => (
      <span
        className="text-sm font-medium text-slate-800"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {row.title}
      </span>
    ),
  },
  {
    key: 'url',
    label: 'URL',
    render: (row) => (
      <span
        className="max-w-[200px] truncate block text-xs text-slate-400"
        style={{ fontFamily: 'var(--font-mono)' }}
        title={row.url}
      >
        {truncateUrl(row.url, 40)}
      </span>
    ),
  },
  {
    key: 'is_fixed',
    label: 'Status',
    align: 'center',
    width: '80px',
    render: (row) => (
      <Badge variant={row.is_fixed ? 'success' : 'outline'}>
        {row.is_fixed ? 'Fixed' : 'Open'}
      </Badge>
    ),
  },
  {
    key: 'created_at',
    label: 'Found',
    align: 'right',
    width: '100px',
    render: (row) => (
      <span
        className="text-xs text-slate-400"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {timeAgo(row.created_at)}
      </span>
    ),
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AuditPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [data, setData]         = useState<AuditData | null>(null)
  const [loading, setLoading]   = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const [search, setSearch]         = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchResults = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res  = await fetch(`/api/audit/results?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        const summary = d.summary ?? {}
        const totalIssues = summary.totalIssues ?? 0
        // Map API response shape to the page's expected shape
        const auditData: AuditData = {
          score: d.score ?? 0,
          lastScanAt: d.lastScanDate ?? '',
          stats: {
            critical: summary.critical ?? 0,
            high: summary.high ?? 0,
            medium: summary.medium ?? 0,
            low: summary.low ?? 0,
            info: summary.info ?? 0,
            totalChecks: totalIssues + (summary.fixedIssues ?? 0) + 18, // base checks count
            passedChecks: 18 - totalIssues + (summary.fixedIssues ?? 0),
          },
          issues: (d.issues ?? []).map((i: Record<string, unknown>) => ({
            id: i.id,
            severity: i.severity,
            category: i.category,
            title: i.title,
            description: i.description,
            recommendation: i.recommendation,
            url: i.url,
            is_fixed: i.isFixed ?? i.is_fixed ?? false,
            created_at: i.createdAt ?? i.created_at ?? '',
          })),
        }
        setData(auditData)
      } else {
        setError(json.error || 'Failed to fetch audit results.')
      }
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      fetchResults(currentClient.id)
    }
  }, [currentClient?.id, fetchResults])

  const handleScan = async () => {
    if (!currentClient?.id || scanning) return
    setScanning(true)
    try {
      await fetch('/api/audit/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: currentClient.id }),
      })
      // Refetch results after scan completes
      await fetchResults(currentClient.id)
    } catch {
      setError('Scan request failed.')
    } finally {
      setScanning(false)
    }
  }

  const filtered = useMemo(() => {
    if (!data?.issues) return []
    let rows = [...data.issues]
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.url.toLowerCase().includes(q)
      )
    }
    if (severityFilter) {
      rows = rows.filter((r) => r.severity === severityFilter)
    }
    if (categoryFilter) {
      rows = rows.filter((r) => r.category === categoryFilter)
    }
    // Sort by severity order
    rows.sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    )
    return rows
  }, [data, search, severityFilter, categoryFilter])

  // --- Client loading state ---
  if (clientLoading) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-5 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={8} columns={6} />
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
          <h1
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Site Audit
          </h1>
          <p
            className="mt-0.5 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Technical SEO for{' '}
            <span className="font-medium text-blue-700">{clientName}</span>
            {data?.lastScanAt && (
              <span className="text-slate-400">
                {' '}&mdash; last scanned {timeAgo(data.lastScanAt)}
              </span>
            )}
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={handleScan}
          disabled={scanning || loading}
        >
          <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Scanning...' : 'Scan Now'}
        </Button>
      </div>

      {/* Data loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={8} columns={6} />
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
          icon={<Shield className="h-6 w-6" />}
          title="No audit data yet"
          description="Click Scan Now to run a technical SEO audit for this site."
          size="lg"
          action={
            <Button variant="default" size="sm" onClick={handleScan} disabled={scanning}>
              <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Scanning...' : 'Start Scan'}
            </Button>
          }
        />
      )}

      {/* Data loaded */}
      {!loading && !error && data && (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { label: 'Score',    value: `${data.score}`,                                        dot: getScoreDot(data.score),  textCls: getScoreColor(data.score) },
              { label: 'Critical', value: `${data.stats.critical}`,                               dot: '#EF4444', textCls: 'text-slate-900' },
              { label: 'High',     value: `${data.stats.high}`,                                   dot: '#F59E0B', textCls: 'text-slate-900' },
              { label: 'Medium',   value: `${data.stats.medium}`,                                 dot: '#FCD34D', textCls: 'text-slate-900' },
              { label: 'Passed',   value: `${data.stats.passedChecks}/${data.stats.totalChecks}`, dot: '#10B981', textCls: 'text-slate-900' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
              >
                <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: s.dot }} />
                <div>
                  <p
                    className={cn('text-lg font-bold', s.textCls)}
                    style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
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

          {/* Issues table */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3 pt-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchInput
                  placeholder="Filter issues..."
                  value={search}
                  onChange={(v) => setSearch(v)}
                  wrapperClassName="flex-1 max-w-xs"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={severityFilter}
                    onChange={setSeverityFilter}
                    options={[
                      { label: 'All Severities', value: '' },
                      { label: 'Critical',       value: 'critical' },
                      { label: 'High',           value: 'high' },
                      { label: 'Medium',         value: 'medium' },
                      { label: 'Low',            value: 'low' },
                      { label: 'Info',           value: 'info' },
                    ]}
                  />
                  <Select
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={CATEGORY_OPTIONS}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <DataTable<any>
                columns={columns}
                data={filtered}
                keyExtractor={(row: AuditIssue) => row.id}
                emptyMessage="No issues match your filters."
                className="border-none"
              />

              {/* Footer count */}
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                <p
                  className="text-xs text-slate-500"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {filtered.length === 0 ? (
                    'No results'
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{filtered.length}</span>
                      {' '}issue{filtered.length !== 1 ? 's' : ''} found
                      {(severityFilter || categoryFilter || search) && (
                        <span className="text-slate-400"> (filtered)</span>
                      )}
                    </>
                  )}
                </p>
                <p
                  className="text-xs text-slate-400"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {data.stats.totalChecks - data.stats.passedChecks} total issues
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Data loaded but no issues */}
      {!loading && !error && data && data.issues.length === 0 && (
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title="No issues found"
          description="Great work! Your site passed all audit checks. Run a new scan anytime to re-check."
          size="default"
        />
      )}
    </div>
  )
}
