'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe,
  RefreshCw,
  Target,
  TrendingUp,
  Layers,
  Zap,
  ArrowUpRight,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SkeletonTable, SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { useClient } from '@/contexts/client-context'
import { formatNumber, formatPercent, getPositionColor, cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortField = 'position' | 'clicks' | 'impressions' | 'ctr'
type ViewMode = 'rankings' | 'discovery'

interface GscKeyword {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface LowHangingFruit extends GscKeyword {
  opportunityScore: number
}

interface KeywordCluster {
  name: string
  keywords: GscKeyword[]
  avgPosition: number
  totalClicks: number
  totalImpressions: number
}

const PAGE_SIZE = 20

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
// Discovery analysis helpers (pure functions, no mutation)
// ---------------------------------------------------------------------------

function findLowHangingFruit(keywords: GscKeyword[]): LowHangingFruit[] {
  return keywords
    .filter((k) => k.position >= 8 && k.position <= 20 && k.impressions >= 10)
    .map((k) => {
      // Score: higher impressions + closer to page 1 = better opportunity
      const positionFactor = (21 - k.position) / 13 // 1.0 at pos 8, ~0.08 at pos 20
      const impressionFactor = Math.min(1, Math.log10(Math.max(1, k.impressions)) / 4)
      const ctrGap = Math.max(0, 0.05 - k.ctr) // Potential CTR upside
      const opportunityScore = Math.round(
        (positionFactor * 40 + impressionFactor * 40 + ctrGap * 400) * 10
      ) / 10
      return { ...k, opportunityScore }
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
}

function findContentGaps(keywords: GscKeyword[]): GscKeyword[] {
  // Keywords with high impressions but very low CTR -- users see you but do not click
  return keywords
    .filter((k) => k.impressions >= 50 && k.ctr < 0.02 && k.position <= 30)
    .sort((a, b) => b.impressions - a.impressions)
}

function buildKeywordClusters(keywords: GscKeyword[]): KeywordCluster[] {
  // Extract meaningful root terms (2+ word phrases share a common head word)
  const clusterMap = new Map<string, GscKeyword[]>()

  for (const kw of keywords) {
    const words = kw.keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    // Use 1-gram and 2-gram roots
    const roots = new Set<string>()
    for (const word of words) {
      roots.add(word)
    }
    for (let i = 0; i < words.length - 1; i++) {
      roots.add(`${words[i]} ${words[i + 1]}`)
    }

    for (const root of roots) {
      const existing = clusterMap.get(root) ?? []
      clusterMap.set(root, [...existing, kw])
    }
  }

  // Only keep clusters with 3+ keywords, deduplicate by picking dominant cluster per keyword
  const clusters: KeywordCluster[] = []
  const seen = new Set<string>()

  const sorted = [...clusterMap.entries()]
    .filter(([, kws]) => kws.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)

  for (const [name, kws] of sorted) {
    // Only include keywords not yet claimed by a larger cluster
    const unique = kws.filter((k) => !seen.has(k.keyword))
    if (unique.length < 3) continue

    for (const k of unique) {
      seen.add(k.keyword)
    }

    const avgPosition = unique.reduce((sum, k) => sum + k.position, 0) / unique.length
    const totalClicks = unique.reduce((sum, k) => sum + k.clicks, 0)
    const totalImpressions = unique.reduce((sum, k) => sum + k.impressions, 0)

    clusters.push({
      name,
      keywords: unique,
      avgPosition: Math.round(avgPosition * 10) / 10,
      totalClicks,
      totalImpressions,
    })

    if (clusters.length >= 15) break
  }

  return clusters.sort((a, b) => b.totalImpressions - a.totalImpressions)
}

// ---------------------------------------------------------------------------
// Table columns
// ---------------------------------------------------------------------------
const columns: Column<GscKeyword>[] = [
  {
    key: 'keyword',
    label: 'Keyword',
    render: (row) => (
      <span
        className="max-w-[260px] truncate text-sm font-medium text-slate-800"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {row.keyword}
      </span>
    ),
  },
  {
    key: 'position',
    label: 'Position',
    align: 'center',
    render: (row) => (
      <span
        className={`min-w-[24px] text-right text-sm font-bold ${getPositionColor(row.position)}`}
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        #{Math.round(row.position * 10) / 10}
      </span>
    ),
  },
  {
    key: 'clicks',
    label: 'Clicks',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm font-medium text-slate-800"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(row.clicks)}
      </span>
    ),
  },
  {
    key: 'impressions',
    label: 'Impr.',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm text-slate-500"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(row.impressions)}
      </span>
    ),
  },
  {
    key: 'ctr',
    label: 'CTR',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm text-slate-500"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatPercent(row.ctr)}
      </span>
    ),
  },
]

const lowHangingColumns: Column<LowHangingFruit>[] = [
  {
    key: 'keyword',
    label: 'Keyword',
    render: (row) => (
      <span
        className="max-w-[240px] truncate text-sm font-medium text-slate-800"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {row.keyword}
      </span>
    ),
  },
  {
    key: 'position',
    label: 'Position',
    align: 'center',
    render: (row) => (
      <span
        className={`text-sm font-bold ${getPositionColor(row.position)}`}
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        #{Math.round(row.position * 10) / 10}
      </span>
    ),
  },
  {
    key: 'impressions',
    label: 'Impr.',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm text-slate-500"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(row.impressions)}
      </span>
    ),
  },
  {
    key: 'ctr',
    label: 'CTR',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm text-slate-500"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatPercent(row.ctr)}
      </span>
    ),
  },
  {
    key: 'opportunityScore',
    label: 'Score',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm font-bold text-amber-600"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {row.opportunityScore}
      </span>
    ),
  },
]

const gapColumns: Column<GscKeyword>[] = [
  {
    key: 'keyword',
    label: 'Keyword',
    render: (row) => (
      <span
        className="max-w-[240px] truncate text-sm font-medium text-slate-800"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {row.keyword}
      </span>
    ),
  },
  {
    key: 'position',
    label: 'Position',
    align: 'center',
    render: (row) => (
      <span
        className={`text-sm font-bold ${getPositionColor(row.position)}`}
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        #{Math.round(row.position * 10) / 10}
      </span>
    ),
  },
  {
    key: 'impressions',
    label: 'Impressions',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm font-medium text-slate-800"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(row.impressions)}
      </span>
    ),
  },
  {
    key: 'clicks',
    label: 'Clicks',
    align: 'right',
    render: (row) => (
      <span
        className="text-sm text-slate-500"
        style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(row.clicks)}
      </span>
    ),
  },
  {
    key: 'ctr',
    label: 'CTR',
    align: 'right',
    render: (row) => (
      <span className="text-sm font-medium text-red-500" style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
        {formatPercent(row.ctr)}
      </span>
    ),
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function KeywordsPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [keywords, setKeywords] = useState<GscKeyword[]>([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanMessage, setScanMessage] = useState<string | null>(null)
  const [gscEmpty, setGscEmpty] = useState(false)

  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('position')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('rankings')

  // Discovery sub-tab
  const [discoveryTab, setDiscoveryTab] = useState<'low-hanging' | 'gaps' | 'clusters'>('low-hanging')

  const fetchKeywords = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    setGscEmpty(false)
    setKeywords([])
    setScanMessage(null)
    try {
      const res = await fetch(`/api/gsc/keywords?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setKeywords(json.data.keywords ?? [])
      } else if (json.empty) {
        setGscEmpty(true)
      } else {
        setError(json.error || 'Failed to fetch keywords')
      }
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleScanNow = useCallback(async () => {
    if (!currentClient?.id || scanning) return
    setScanning(true)
    setError(null)
    setScanMessage(null)
    try {
      const res = await fetch('/api/gsc/keywords/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: currentClient.id }),
      })
      const json = await res.json()

      if (!res.ok || !json.success) {
        setError(json.error || 'Scan failed. Check your GSC configuration in Settings.')
        return
      }

      // Update keywords from the scan response
      if (json.data?.keywords && json.data.keywords.length > 0) {
        setKeywords(json.data.keywords)
        setGscEmpty(false)
        setScanMessage(json.message || `Synced ${json.data.synced} keywords.`)
      } else {
        setScanMessage('Scan completed but no keywords were returned from GSC.')
      }
    } catch {
      setError('Failed to connect to the server during scan.')
    } finally {
      setScanning(false)
    }
  }, [currentClient?.id, scanning])

  useEffect(() => {
    if (currentClient?.id) {
      fetchKeywords(currentClient.id)
    }
  }, [currentClient?.id, fetchKeywords])

  // Discovery data (derived from keywords -- no extra API call needed)
  const lowHangingFruit = useMemo(() => findLowHangingFruit(keywords), [keywords])
  const contentGaps = useMemo(() => findContentGaps(keywords), [keywords])
  const keywordClusters = useMemo(() => buildKeywordClusters(keywords), [keywords])

  // Rankings table: filtered + sorted + paginated
  const filtered = useMemo(() => {
    let rows = [...keywords]
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.keyword.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      if (sortField === 'position')    return a.position - b.position
      if (sortField === 'clicks')      return b.clicks - a.clicks
      if (sortField === 'impressions') return b.impressions - a.impressions
      if (sortField === 'ctr')         return b.ctr - a.ctr
      return 0
    })
    return rows
  }, [keywords, search, sortField])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const startItem   = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endItem     = Math.min(currentPage * PAGE_SIZE, filtered.length)

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
        <SkeletonTable rows={10} columns={5} />
      </div>
    )
  }

  // --- No business (new user) ---
  if (hasNoBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-5">
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No website connected"
          description="Add your first website to start tracking keyword rankings and performance."
          size="lg"
        />
      </div>
    )
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
            Keyword Intelligence
          </h1>
          <p
            className="mt-0.5 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <span className="font-medium text-blue-700">{clientName}</span>
            {!loading && !gscEmpty && (
              <span> -- {keywords.length} keywords tracked</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={handleScanNow}
            disabled={scanning || loading}
          >
            <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Scanning...' : 'Scan Now'}
          </Button>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Upload size={13} />
            Import
          </Button>
        </div>
      </div>

      {/* View mode tabs */}
      {!loading && !gscEmpty && keywords.length > 0 && (
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
          <button
            onClick={() => setViewMode('rankings')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
              viewMode === 'rankings'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            )}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Search size={12} />
            Rankings
          </button>
          <button
            onClick={() => setViewMode('discovery')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
              viewMode === 'discovery'
                ? 'bg-amber-500 text-white shadow-sm border border-amber-500'
                : 'text-slate-500 hover:text-slate-700'
            )}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Sparkles size={12} />
            Discovery
          </button>
        </div>
      )}

      {/* Scan success message */}
      {scanMessage && !loading && (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <Zap size={14} className="text-emerald-600 flex-shrink-0" />
          {scanMessage}
          <button
            onClick={() => setScanMessage(null)}
            className="ml-auto text-emerald-600 hover:text-emerald-800 cursor-pointer text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* GSC loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={10} columns={5} />
        </div>
      )}

      {/* GSC error */}
      {error && !loading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800" style={{ fontFamily: 'var(--font-sans)' }}>
          {error}
        </div>
      )}

      {/* GSC not configured */}
      {gscEmpty && !loading && (
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="Connect Google Search Console"
          description="Add your GSC property URL in Settings to start seeing real keyword data."
          action={
            <a href="/settings" className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
              Go to Settings
            </a>
          }
        />
      )}

      {/* Data loaded with keywords */}
      {!loading && !gscEmpty && !error && keywords.length > 0 && (
        <>
          {/* Summary stat mini-row */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Tracked',  value: keywords.length,                                color: '#3B82F6' },
              { label: 'Top 3',    value: keywords.filter((k) => k.position <= 3).length,  color: '#10B981' },
              { label: 'Top 10',   value: keywords.filter((k) => k.position <= 10).length, color: '#F59E0B' },
              { label: 'Top 20',   value: keywords.filter((k) => k.position <= 20).length, color: '#8B5CF6' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
              >
                <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: stat.color }} />
                <div>
                  <p
                    className="text-lg font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-[11px] text-slate-500"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ============================================================ */}
          {/* RANKINGS VIEW                                                */}
          {/* ============================================================ */}
          {viewMode === 'rankings' && (
            <Card>
              {/* Filter bar */}
              <CardHeader className="border-b border-slate-200 pb-3 pt-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <SearchInput
                    placeholder="Filter keywords..."
                    value={search}
                    onChange={(v) => { setSearch(v); setPage(1) }}
                    wrapperClassName="flex-1 max-w-xs"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={sortField}
                      onChange={(v) => { setSortField(v as SortField); setPage(1) }}
                      options={[
                        { label: 'Sort: Position',    value: 'position' },
                        { label: 'Sort: Clicks',      value: 'clicks' },
                        { label: 'Sort: Impressions', value: 'impressions' },
                        { label: 'Sort: CTR',          value: 'ctr' },
                      ]}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <DataTable<any>
                  columns={columns}
                  data={paginated}
                  keyExtractor={(row: GscKeyword) => row.keyword}
                  showRowNumbers
                  emptyMessage="No keywords match your filters."
                  className="border-none"
                />

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                  <p
                    className="text-xs text-slate-500"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {filtered.length === 0 ? 'No results' : (
                      <>
                        Showing{' '}
                        <span className="font-medium text-slate-700">{startItem}-{endItem}</span>
                        {' '}of{' '}
                        <span className="font-medium text-slate-700">{filtered.length}</span>
                        {' '}keywords
                      </>
                    )}
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft size={13} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 5) return true
                        if (p === 1 || p === totalPages) return true
                        if (Math.abs(p - currentPage) <= 1) return true
                        return false
                      })
                      .reduce<(number | '...')[]>((acc, p, i, arr) => {
                        if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) {
                          acc.push('...')
                        }
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`e-${i}`} className="px-1 text-xs text-slate-400">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className={cn(
                              'inline-flex h-7 min-w-[28px] items-center justify-center rounded border px-1.5 text-xs transition-colors cursor-pointer',
                              currentPage === p
                                ? 'border-blue-600 bg-blue-600 font-semibold text-white'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                            )}
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================================ */}
          {/* DISCOVERY VIEW                                               */}
          {/* ============================================================ */}
          {viewMode === 'discovery' && (
            <div className="space-y-4">
              {/* Discovery sub-tabs */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 w-fit">
                {([
                  { id: 'low-hanging' as const, icon: Target, label: 'Low-Hanging Fruit', count: lowHangingFruit.length },
                  { id: 'gaps' as const, icon: TrendingUp, label: 'Content Gaps', count: contentGaps.length },
                  { id: 'clusters' as const, icon: Layers, label: 'Clusters', count: keywordClusters.length },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDiscoveryTab(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
                      discoveryTab === tab.id
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    )}
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    <tab.icon size={12} />
                    {tab.label}
                    <Badge variant={discoveryTab === tab.id ? 'gold' : 'muted'} className="ml-0.5 text-[10px] px-1.5 py-0">
                      {tab.count}
                    </Badge>
                  </button>
                ))}
              </div>

              {/* LOW-HANGING FRUIT */}
              {discoveryTab === 'low-hanging' && (
                <Card>
                  <CardHeader className="border-b border-slate-200 pb-3 pt-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2
                          className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          <Target size={14} className="text-amber-500" />
                          Low-Hanging Fruit
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                          Keywords ranking position 8-20 with decent impressions. A small push could move these to page 1.
                        </p>
                      </div>
                      <Badge variant="gold">{lowHangingFruit.length} opportunities</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {lowHangingFruit.length > 0 ? (
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      <DataTable<any>
                        columns={lowHangingColumns}
                        data={lowHangingFruit.slice(0, 50)}
                        keyExtractor={(row: LowHangingFruit) => row.keyword}
                        showRowNumbers
                        emptyMessage="No low-hanging fruit found."
                        className="border-none"
                      />
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                          No keywords found in position 8-20 with meaningful impressions.
                        </p>
                        <p className="mt-1 text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                          Try running a scan to pull the latest data from Google Search Console.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* CONTENT GAPS */}
              {discoveryTab === 'gaps' && (
                <Card>
                  <CardHeader className="border-b border-slate-200 pb-3 pt-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2
                          className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"
                          style={{ fontFamily: 'var(--font-sans)' }}
                        >
                          <TrendingUp size={14} className="text-red-500" />
                          Content Gaps
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                          High-impression keywords with very low CTR (under 2%). Users see you in results but are not clicking through -- your title or meta description needs work.
                        </p>
                      </div>
                      <Badge variant="danger">{contentGaps.length} gaps</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {contentGaps.length > 0 ? (
                      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                      <DataTable<any>
                        columns={gapColumns}
                        data={contentGaps.slice(0, 50)}
                        keyExtractor={(row: GscKeyword) => row.keyword}
                        showRowNumbers
                        emptyMessage="No content gaps found."
                        className="border-none"
                      />
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                          No obvious content gaps detected. Your CTR looks healthy across the board.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* KEYWORD CLUSTERS */}
              {discoveryTab === 'clusters' && (
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="border-b border-slate-200 pb-3 pt-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2
                            className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            <Layers size={14} className="text-violet-500" />
                            Keyword Clusters
                          </h2>
                          <p className="mt-0.5 text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                            Related keywords grouped by common terms. Each cluster represents a content topic you can target with a single authoritative page.
                          </p>
                        </div>
                        <Badge variant="purple">{keywordClusters.length} clusters</Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {keywordClusters.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {keywordClusters.map((cluster) => (
                        <div
                          key={cluster.name}
                          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3
                              className="text-sm font-semibold text-slate-900 capitalize"
                              style={{ fontFamily: 'var(--font-sans)' }}
                            >
                              {cluster.name}
                            </h3>
                            <Badge variant="purple" className="text-[10px] flex-shrink-0">
                              {cluster.keywords.length} kw
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div>
                              <p className="text-[10px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>Avg Pos</p>
                              <p
                                className={`text-sm font-bold ${getPositionColor(cluster.avgPosition)}`}
                                style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                              >
                                #{cluster.avgPosition}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>Clicks</p>
                              <p
                                className="text-sm font-bold text-slate-800"
                                style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatNumber(cluster.totalClicks)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>Impr.</p>
                              <p
                                className="text-sm font-bold text-slate-800"
                                style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatNumber(cluster.totalImpressions)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            {cluster.keywords.slice(0, 5).map((kw) => (
                              <div
                                key={kw.keyword}
                                className="flex items-center justify-between text-xs"
                              >
                                <span
                                  className="truncate max-w-[160px] text-slate-600"
                                  style={{ fontFamily: 'var(--font-sans)' }}
                                >
                                  {kw.keyword}
                                </span>
                                <span
                                  className={`font-mono text-[11px] font-medium ${getPositionColor(kw.position)}`}
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  #{Math.round(kw.position * 10) / 10}
                                </span>
                              </div>
                            ))}
                            {cluster.keywords.length > 5 && (
                              <p
                                className="text-[10px] text-slate-400 flex items-center gap-0.5 pt-0.5"
                                style={{ fontFamily: 'var(--font-sans)' }}
                              >
                                <ArrowUpRight size={10} />
                                +{cluster.keywords.length - 5} more keywords
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                          Not enough keywords to form meaningful clusters. You need at least 10-15 keywords from GSC to see cluster analysis.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Data loaded but no keywords */}
      {!loading && !gscEmpty && !error && keywords.length === 0 && (
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No keyword data yet"
          description="GSC is connected but no keyword data is available. Click 'Scan Now' to pull fresh data from Google Search Console."
          action={
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 mt-2"
              onClick={handleScanNow}
              disabled={scanning}
            >
              <RefreshCw size={13} className={scanning ? 'animate-spin' : ''} />
              {scanning ? 'Scanning...' : 'Scan Now'}
            </Button>
          }
        />
      )}
    </div>
  )
}
