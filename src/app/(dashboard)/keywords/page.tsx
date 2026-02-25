'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SkeletonTable, SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useClient } from '@/contexts/client-context'
import { formatNumber, formatPercent, getPositionColor, cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortField = 'position' | 'clicks' | 'impressions' | 'ctr'

interface GscKeyword {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function KeywordsPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [keywords, setKeywords] = useState<GscKeyword[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gscEmpty, setGscEmpty] = useState(false)

  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('position')
  const [page, setPage] = useState(1)

  const fetchKeywords = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    setGscEmpty(false)
    setKeywords([])
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

  useEffect(() => {
    if (currentClient?.id) {
      fetchKeywords(currentClient.id)
    }
  }, [currentClient?.id, fetchKeywords])

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
              <span> &mdash; {keywords.length} keywords tracked</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Upload size={13} />
            Import
          </Button>
          <Button variant="amber" size="sm" className="gap-1.5">
            <Sparkles size={13} />
            Discovery
          </Button>
        </div>
      </div>

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

          {/* Main table card */}
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
        </>
      )}

      {/* Data loaded but no keywords */}
      {!loading && !gscEmpty && !error && keywords.length === 0 && (
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No keyword data yet"
          description="GSC is connected but no keyword data is available for the selected date range. Data may take 24-48 hours to appear."
        />
      )}
    </div>
  )
}
