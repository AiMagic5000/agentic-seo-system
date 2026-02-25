'use client'

import { useState, useMemo } from 'react'
import {
  Upload,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkline } from '@/components/ui/sparkline'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useClient } from '@/contexts/client-context'
import { formatNumber, formatPercent, getPositionColor, cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Intent = 'informational' | 'transactional' | 'navigational' | 'commercial'
type Source = 'gsc' | 'atp' | 'manual'
type SortField = 'position' | 'clicks' | 'impressions' | 'priority'

interface KeywordRow {
  id: string
  keyword: string
  intent: Intent
  source: Source
  position: number
  positionChange: number
  positionTrend: number[]
  clicks: number
  impressions: number
  ctr: number
  priority: number
}

// ---------------------------------------------------------------------------
// Mock keyword data
// ---------------------------------------------------------------------------
const ALL_KEYWORDS: KeywordRow[] = [
  { id: 'k1',  keyword: 'business credit cards no personal guarantee',   intent: 'commercial',     source: 'gsc',    position: 3,  positionChange: 2,  positionTrend: [8,7,6,5,4,4,3],     clicks: 1842, impressions: 24300, ctr: 0.076, priority: 94 },
  { id: 'k2',  keyword: 'how to build business credit fast',             intent: 'informational',  source: 'gsc',    position: 5,  positionChange: 3,  positionTrend: [9,8,7,6,6,5,5],     clicks: 1204, impressions: 18900, ctr: 0.064, priority: 87 },
  { id: 'k3',  keyword: 'net 30 accounts for small business',           intent: 'commercial',     source: 'gsc',    position: 7,  positionChange: 4,  positionTrend: [12,11,10,9,8,7,7],  clicks: 893,  impressions: 14600, ctr: 0.061, priority: 82 },
  { id: 'k4',  keyword: 'business bank account requirements',           intent: 'informational',  source: 'gsc',    position: 4,  positionChange: 1,  positionTrend: [7,6,6,5,5,4,4],     clicks: 1567, impressions: 21800, ctr: 0.072, priority: 88 },
  { id: 'k5',  keyword: 'paydex score how to improve',                  intent: 'informational',  source: 'atp',    position: 6,  positionChange: -1, positionTrend: [5,5,6,7,7,6,6],     clicks: 944,  impressions: 15700, ctr: 0.060, priority: 79 },
  { id: 'k6',  keyword: 'business tradeline vendors list',              intent: 'commercial',     source: 'gsc',    position: 8,  positionChange: 2,  positionTrend: [13,12,11,10,9,8,8],  clicks: 781,  impressions: 13200, ctr: 0.059, priority: 76 },
  { id: 'k7',  keyword: 'invoice factoring companies small business',   intent: 'commercial',     source: 'gsc',    position: 11, positionChange: -2, positionTrend: [9,9,10,11,12,12,11], clicks: 538,  impressions: 9800,  ctr: 0.055, priority: 70 },
  { id: 'k8',  keyword: 'merchant cash advance requirements',           intent: 'informational',  source: 'atp',    position: 14, positionChange: 3,  positionTrend: [18,17,16,16,15,14,14],clicks: 312,  impressions: 7400,  ctr: 0.042, priority: 63 },
  { id: 'k9',  keyword: 'best business line of credit 2025',            intent: 'commercial',     source: 'gsc',    position: 9,  positionChange: 0,  positionTrend: [9,9,9,9,9,9,9],     clicks: 712,  impressions: 12400, ctr: 0.057, priority: 75 },
  { id: 'k10', keyword: 'equipment financing for startups',             intent: 'transactional',  source: 'manual', position: 17, positionChange: -3, positionTrend: [14,14,15,16,17,18,17],clicks: 248,  impressions: 6100,  ctr: 0.041, priority: 58 },
  { id: 'k11', keyword: 'llc formation guide step by step',             intent: 'informational',  source: 'gsc',    position: 2,  positionChange: 1,  positionTrend: [4,4,3,3,2,2,2],     clicks: 2310, impressions: 31200, ctr: 0.074, priority: 96 },
  { id: 'k12', keyword: 'ein number application online free',           intent: 'transactional',  source: 'gsc',    position: 1,  positionChange: 0,  positionTrend: [1,1,1,1,1,1,1],     clicks: 3420, impressions: 38500, ctr: 0.089, priority: 99 },
  { id: 'k13', keyword: 'how to file a dba',                            intent: 'informational',  source: 'atp',    position: 11, positionChange: 2,  positionTrend: [14,13,13,12,12,11,11],clicks: 538,  impressions: 9800,  ctr: 0.055, priority: 68 },
  { id: 'k14', keyword: 'llc vs corporation differences',               intent: 'informational',  source: 'gsc',    position: 6,  positionChange: 1,  positionTrend: [8,8,7,7,7,6,6],     clicks: 1023, impressions: 16800, ctr: 0.061, priority: 81 },
  { id: 'k15', keyword: 'wyoming llc benefits',                         intent: 'informational',  source: 'atp',    position: 13, positionChange: 4,  positionTrend: [18,17,16,15,14,14,13],clicks: 421,  impressions: 8300,  ctr: 0.051, priority: 66 },
  { id: 'k16', keyword: 'delaware llc registered agent',                intent: 'navigational',   source: 'gsc',    position: 5,  positionChange: -1, positionTrend: [4,4,5,5,5,5,5],     clicks: 1187, impressions: 18200, ctr: 0.065, priority: 80 },
  { id: 'k17', keyword: 'sic naics code lookup tool',                   intent: 'navigational',   source: 'manual', position: 8,  positionChange: 0,  positionTrend: [8,8,8,8,8,8,8],     clicks: 634,  impressions: 10900, ctr: 0.058, priority: 72 },
  { id: 'k18', keyword: 'sba loan requirements 2025',                   intent: 'informational',  source: 'gsc',    position: 9,  positionChange: 2,  positionTrend: [12,11,11,10,10,9,9], clicks: 712,  impressions: 12400, ctr: 0.057, priority: 77 },
  { id: 'k19', keyword: 'small business grants women owned',            intent: 'transactional',  source: 'atp',    position: 15, positionChange: -4, positionTrend: [11,11,12,13,14,15,15],clicks: 293,  impressions: 6800,  ctr: 0.043, priority: 61 },
  { id: 'k20', keyword: 'government grants small business apply',       intent: 'transactional',  source: 'atp',    position: 19, positionChange: 1,  positionTrend: [21,21,20,20,20,19,19],clicks: 164,  impressions: 4900,  ctr: 0.033, priority: 54 },
  { id: 'k21', keyword: 'duns number free registration',                intent: 'transactional',  source: 'gsc',    position: 4,  positionChange: 3,  positionTrend: [8,7,7,6,5,4,4],     clicks: 1621, impressions: 22400, ctr: 0.072, priority: 90 },
  { id: 'k22', keyword: 'equifax business credit report',               intent: 'informational',  source: 'gsc',    position: 7,  positionChange: 1,  positionTrend: [9,8,8,8,7,7,7],     clicks: 847,  impressions: 13800, ctr: 0.061, priority: 74 },
  { id: 'k23', keyword: 'experian business credit score check',         intent: 'navigational',   source: 'gsc',    position: 6,  positionChange: -2, positionTrend: [4,4,5,5,6,7,6],     clicks: 932,  impressions: 15100, ctr: 0.062, priority: 73 },
  { id: 'k24', keyword: 'business credit monitoring services',          intent: 'commercial',     source: 'manual', position: 12, positionChange: 5,  positionTrend: [18,17,16,15,14,13,12],clicks: 489,  impressions: 9200,  ctr: 0.053, priority: 69 },
  { id: 'k25', keyword: 'quill net 30 account approval',                intent: 'commercial',     source: 'atp',    position: 10, positionChange: 3,  positionTrend: [14,13,13,12,11,10,10],clicks: 621,  impressions: 11300, ctr: 0.055, priority: 71 },
  { id: 'k26', keyword: 'uline net 30 credit account',                  intent: 'commercial',     source: 'atp',    position: 16, positionChange: 2,  positionTrend: [19,18,18,17,17,16,16],clicks: 274,  impressions: 6400,  ctr: 0.043, priority: 60 },
  { id: 'k27', keyword: 'grainger business account apply',              intent: 'transactional',  source: 'manual', position: 18, positionChange: -1, positionTrend: [17,18,18,19,18,18,18],clicks: 201,  impressions: 5300,  ctr: 0.038, priority: 56 },
]

const PAGE_SIZE = 20

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------
const intentConfig: Record<Intent, { label: string; variant: 'default' | 'success' | 'warning' | 'gold' | 'info' | 'outline' }> = {
  informational: { label: 'Info',  variant: 'info' },
  transactional: { label: 'Trans', variant: 'success' },
  navigational:  { label: 'Nav',   variant: 'outline' },
  commercial:    { label: 'Comm',  variant: 'gold' },
}

const sourceConfig: Record<Source, string> = {
  gsc: 'GSC', atp: 'ATP', manual: 'Manual',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600" style={{ fontFamily: 'var(--font-sans)' }}>
      <TrendingUp size={12} />+{change}
    </span>
  )
  if (change < 0) return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-red-500" style={{ fontFamily: 'var(--font-sans)' }}>
      <TrendingDown size={12} />{change}
    </span>
  )
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
      <Minus size={12} />0
    </span>
  )
}

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
const columns: Column<KeywordRow>[] = [
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
    key: 'intent',
    label: 'Intent',
    align: 'center',
    render: (row) => {
      const cfg = intentConfig[row.intent]
      return <Badge variant={cfg.variant as Parameters<typeof Badge>[0]['variant']}>{cfg.label}</Badge>
    },
  },
  {
    key: 'source',
    label: 'Src',
    align: 'center',
    render: (row) => (
      <span
        className="text-xs font-medium text-slate-400"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {sourceConfig[row.source]}
      </span>
    ),
  },
  {
    key: 'position',
    label: 'Pos.',
    align: 'center',
    render: (row) => (
      <div className="flex items-center justify-center gap-2">
        <span
          className={`min-w-[24px] text-right text-sm font-bold ${getPositionColor(row.position)}`}
          style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
        >
          #{row.position}
        </span>
        <Sparkline
          data={row.positionTrend}
          width={52}
          height={18}
          variant={row.position <= 3 ? 'success' : row.position <= 10 ? 'default' : 'danger'}
        />
      </div>
    ),
  },
  {
    key: 'positionChange',
    label: 'Chg',
    align: 'center',
    render: (row) => <ChangeIndicator change={row.positionChange} />,
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
  {
    key: 'priority',
    label: 'Priority',
    align: 'center',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${row.priority}%`,
              backgroundColor:
                row.priority >= 85 ? '#10B981'
                : row.priority >= 65 ? '#3B82F6'
                : '#F59E0B',
            }}
          />
        </div>
        <span
          className="w-6 text-right text-xs text-slate-400"
          style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
        >
          {row.priority}
        </span>
      </div>
    ),
  },
  {
    key: 'id',
    label: '',
    align: 'center',
    render: () => (
      <div className="flex items-center justify-center gap-1">
        <button
          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600 cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
          title="View SERP"
        >
          <ExternalLink size={10} />
          SERP
        </button>
        <button
          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-amber-300 hover:text-amber-600 cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
          title="Create content brief"
        >
          <FileText size={10} />
          Brief
        </button>
      </div>
    ),
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function KeywordsPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [search, setSearch] = useState('')
  const [intentFilter, setIntentFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('position')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let rows = [...ALL_KEYWORDS]
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.keyword.toLowerCase().includes(q))
    }
    if (intentFilter !== 'all') rows = rows.filter((r) => r.intent === intentFilter)
    if (sourceFilter !== 'all') rows = rows.filter((r) => r.source === sourceFilter)
    rows.sort((a, b) => {
      if (sortField === 'position')    return a.position - b.position
      if (sortField === 'clicks')      return b.clicks - a.clicks
      if (sortField === 'impressions') return b.impressions - a.impressions
      if (sortField === 'priority')    return b.priority - a.priority
      return 0
    })
    return rows
  }, [search, intentFilter, sourceFilter, sortField])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const startItem   = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endItem     = Math.min(currentPage * PAGE_SIZE, filtered.length)

  // Empty state for new users
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
            {currentClient?.name ?? 'All clients'} &mdash; {ALL_KEYWORDS.length} keywords tracked
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

      {/* Summary stat mini-row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'Tracked',  value: ALL_KEYWORDS.length,                               color: '#3B82F6' },
          { label: 'Top 3',    value: ALL_KEYWORDS.filter((k) => k.position <= 3).length, color: '#10B981' },
          { label: 'Top 10',   value: ALL_KEYWORDS.filter((k) => k.position <= 10).length,color: '#F59E0B' },
          { label: 'Improved', value: ALL_KEYWORDS.filter((k) => k.positionChange > 0).length, color: '#8B5CF6' },
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
                value={intentFilter}
                onChange={(v) => { setIntentFilter(v); setPage(1) }}
                options={[
                  { label: 'All Intent',      value: 'all' },
                  { label: 'Informational',   value: 'informational' },
                  { label: 'Transactional',   value: 'transactional' },
                  { label: 'Navigational',    value: 'navigational' },
                  { label: 'Commercial',      value: 'commercial' },
                ]}
              />
              <Select
                value={sourceFilter}
                onChange={(v) => { setSourceFilter(v); setPage(1) }}
                options={[
                  { label: 'All Sources', value: 'all' },
                  { label: 'GSC',         value: 'gsc' },
                  { label: 'ATP',         value: 'atp' },
                  { label: 'Manual',      value: 'manual' },
                ]}
              />
              <Select
                value={sortField}
                onChange={(v) => { setSortField(v as SortField); setPage(1) }}
                options={[
                  { label: 'Sort: Position',    value: 'position' },
                  { label: 'Sort: Clicks',      value: 'clicks' },
                  { label: 'Sort: Impressions', value: 'impressions' },
                  { label: 'Sort: Priority',    value: 'priority' },
                ]}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {clientLoading ? (
            <SkeletonTable rows={10} columns={8} />
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <DataTable<any>
              columns={columns}
              data={paginated}
              keyExtractor={(row: KeywordRow) => row.id}
              showRowNumbers
              emptyMessage="No keywords match your filters."
              className="border-none"
            />
          )}

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
    </div>
  )
}
