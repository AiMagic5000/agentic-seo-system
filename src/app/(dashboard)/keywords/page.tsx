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
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkline } from '@/components/ui/sparkline'
import { SearchInput } from '@/components/ui/search-input'
import { DataTable, type Column } from '@/components/ui/data-table'
import { useClient } from '@/contexts/client-context'
import {
  formatNumber,
  formatPercent,
  getPositionColor,
} from '@/lib/utils'

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
// Mock keyword data (25+ keywords across niches)
// ---------------------------------------------------------------------------
const ALL_KEYWORDS: KeywordRow[] = [
  // Business credit & finance
  { id: 'k1', keyword: 'business credit cards no personal guarantee', intent: 'commercial', source: 'gsc', position: 3, positionChange: 2, positionTrend: [8, 7, 6, 5, 4, 4, 3], clicks: 1842, impressions: 24300, ctr: 0.076, priority: 94 },
  { id: 'k2', keyword: 'how to build business credit fast', intent: 'informational', source: 'gsc', position: 5, positionChange: 3, positionTrend: [9, 8, 7, 6, 6, 5, 5], clicks: 1204, impressions: 18900, ctr: 0.064, priority: 87 },
  { id: 'k3', keyword: 'net 30 accounts for small business', intent: 'commercial', source: 'gsc', position: 7, positionChange: 4, positionTrend: [12, 11, 10, 9, 8, 7, 7], clicks: 893, impressions: 14600, ctr: 0.061, priority: 82 },
  { id: 'k4', keyword: 'business bank account requirements', intent: 'informational', source: 'gsc', position: 4, positionChange: 1, positionTrend: [7, 6, 6, 5, 5, 4, 4], clicks: 1567, impressions: 21800, ctr: 0.072, priority: 88 },
  { id: 'k5', keyword: 'paydex score how to improve', intent: 'informational', source: 'atp', position: 6, positionChange: -1, positionTrend: [5, 5, 6, 7, 7, 6, 6], clicks: 944, impressions: 15700, ctr: 0.060, priority: 79 },
  { id: 'k6', keyword: 'business tradeline vendors list', intent: 'commercial', source: 'gsc', position: 8, positionChange: 2, positionTrend: [13, 12, 11, 10, 9, 8, 8], clicks: 781, impressions: 13200, ctr: 0.059, priority: 76 },
  { id: 'k7', keyword: 'invoice factoring companies small business', intent: 'commercial', source: 'gsc', position: 11, positionChange: -2, positionTrend: [9, 9, 10, 11, 12, 12, 11], clicks: 538, impressions: 9800, ctr: 0.055, priority: 70 },
  { id: 'k8', keyword: 'merchant cash advance requirements', intent: 'informational', source: 'atp', position: 14, positionChange: 3, positionTrend: [18, 17, 16, 16, 15, 14, 14], clicks: 312, impressions: 7400, ctr: 0.042, priority: 63 },
  { id: 'k9', keyword: 'best business line of credit 2024', intent: 'commercial', source: 'gsc', position: 9, positionChange: 0, positionTrend: [9, 9, 9, 9, 9, 9, 9], clicks: 712, impressions: 12400, ctr: 0.057, priority: 75 },
  { id: 'k10', keyword: 'equipment financing for startups', intent: 'transactional', source: 'manual', position: 17, positionChange: -3, positionTrend: [14, 14, 15, 16, 17, 18, 17], clicks: 248, impressions: 6100, ctr: 0.041, priority: 58 },

  // Legal / LLC
  { id: 'k11', keyword: 'llc formation guide step by step', intent: 'informational', source: 'gsc', position: 2, positionChange: 1, positionTrend: [4, 4, 3, 3, 2, 2, 2], clicks: 2310, impressions: 31200, ctr: 0.074, priority: 96 },
  { id: 'k12', keyword: 'ein number application online free', intent: 'transactional', source: 'gsc', position: 1, positionChange: 0, positionTrend: [1, 1, 1, 1, 1, 1, 1], clicks: 3420, impressions: 38500, ctr: 0.089, priority: 99 },
  { id: 'k13', keyword: 'how to file a dba', intent: 'informational', source: 'atp', position: 11, positionChange: 2, positionTrend: [14, 13, 13, 12, 12, 11, 11], clicks: 538, impressions: 9800, ctr: 0.055, priority: 68 },
  { id: 'k14', keyword: 'llc vs corporation differences', intent: 'informational', source: 'gsc', position: 6, positionChange: 1, positionTrend: [8, 8, 7, 7, 7, 6, 6], clicks: 1023, impressions: 16800, ctr: 0.061, priority: 81 },
  { id: 'k15', keyword: 'wyoming llc benefits', intent: 'informational', source: 'atp', position: 13, positionChange: 4, positionTrend: [18, 17, 16, 15, 14, 14, 13], clicks: 421, impressions: 8300, ctr: 0.051, priority: 66 },
  { id: 'k16', keyword: 'delaware llc registered agent', intent: 'navigational', source: 'gsc', position: 5, positionChange: -1, positionTrend: [4, 4, 5, 5, 5, 5, 5], clicks: 1187, impressions: 18200, ctr: 0.065, priority: 80 },
  { id: 'k17', keyword: 'sic naics code lookup tool', intent: 'navigational', source: 'manual', position: 8, positionChange: 0, positionTrend: [8, 8, 8, 8, 8, 8, 8], clicks: 634, impressions: 10900, ctr: 0.058, priority: 72 },

  // SBA / Grants
  { id: 'k18', keyword: 'sba loan requirements 2024', intent: 'informational', source: 'gsc', position: 9, positionChange: 2, positionTrend: [12, 11, 11, 10, 10, 9, 9], clicks: 712, impressions: 12400, ctr: 0.057, priority: 77 },
  { id: 'k19', keyword: 'small business grants women owned', intent: 'transactional', source: 'atp', position: 15, positionChange: -4, positionTrend: [11, 11, 12, 13, 14, 15, 15], clicks: 293, impressions: 6800, ctr: 0.043, priority: 61 },
  { id: 'k20', keyword: 'government grants small business apply', intent: 'transactional', source: 'atp', position: 19, positionChange: 1, positionTrend: [21, 21, 20, 20, 20, 19, 19], clicks: 164, impressions: 4900, ctr: 0.033, priority: 54 },

  // Credit / Monitoring
  { id: 'k21', keyword: 'duns number free registration', intent: 'transactional', source: 'gsc', position: 4, positionChange: 3, positionTrend: [8, 7, 7, 6, 5, 4, 4], clicks: 1621, impressions: 22400, ctr: 0.072, priority: 90 },
  { id: 'k22', keyword: 'equifax business credit report', intent: 'informational', source: 'gsc', position: 7, positionChange: 1, positionTrend: [9, 8, 8, 8, 7, 7, 7], clicks: 847, impressions: 13800, ctr: 0.061, priority: 74 },
  { id: 'k23', keyword: 'experian business credit score check', intent: 'navigational', source: 'gsc', position: 6, positionChange: -2, positionTrend: [4, 4, 5, 5, 6, 7, 6], clicks: 932, impressions: 15100, ctr: 0.062, priority: 73 },
  { id: 'k24', keyword: 'business credit monitoring services', intent: 'commercial', source: 'manual', position: 12, positionChange: 5, positionTrend: [18, 17, 16, 15, 14, 13, 12], clicks: 489, impressions: 9200, ctr: 0.053, priority: 69 },
  { id: 'k25', keyword: 'quill net 30 account approval', intent: 'commercial', source: 'atp', position: 10, positionChange: 3, positionTrend: [14, 13, 13, 12, 11, 10, 10], clicks: 621, impressions: 11300, ctr: 0.055, priority: 71 },
  { id: 'k26', keyword: 'uline net 30 credit account', intent: 'commercial', source: 'atp', position: 16, positionChange: 2, positionTrend: [19, 18, 18, 17, 17, 16, 16], clicks: 274, impressions: 6400, ctr: 0.043, priority: 60 },
  { id: 'k27', keyword: 'grainger business account apply', intent: 'transactional', source: 'manual', position: 18, positionChange: -1, positionTrend: [17, 18, 18, 19, 18, 18, 18], clicks: 201, impressions: 5300, ctr: 0.038, priority: 56 },
]

const PAGE_SIZE = 20

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const intentConfig: Record<Intent, { label: string; variant: 'default' | 'success' | 'warning' | 'gold' | 'info' }> = {
  informational: { label: 'Info', variant: 'info' },
  transactional: { label: 'Trans', variant: 'success' },
  navigational: { label: 'Nav', variant: 'outline' as 'default' },
  commercial: { label: 'Comm', variant: 'gold' },
}

const sourceConfig: Record<Source, string> = {
  gsc: 'GSC',
  atp: 'ATP',
  manual: 'Manual',
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-[#10b981]">
        <TrendingUp size={12} />
        +{change}
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-[#ef4444]">
        <TrendingDown size={12} />
        {change}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-[#64748b]">
      <Minus size={12} />
      0
    </span>
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
      <span className="max-w-[260px] truncate text-sm font-semibold text-[#f1f5f9]">
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
      return (
        <Badge variant={cfg.variant as Parameters<typeof Badge>[0]['variant']}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    key: 'source',
    label: 'Source',
    align: 'center',
    render: (row) => (
      <span className="text-xs font-medium text-[#64748b]">
        {sourceConfig[row.source]}
      </span>
    ),
  },
  {
    key: 'position',
    label: 'Position',
    align: 'center',
    render: (row) => (
      <div className="flex items-center justify-center gap-2">
        <span
          className={`min-w-[24px] text-right text-sm font-bold tabular-nums ${getPositionColor(row.position)}`}
        >
          #{row.position}
        </span>
        <Sparkline
          data={row.positionTrend}
          width={52}
          height={18}
          color={row.position <= 3 ? '#10b981' : row.position <= 10 ? '#2563eb' : '#f59e0b'}
        />
      </div>
    ),
  },
  {
    key: 'positionChange',
    label: 'Change',
    align: 'center',
    render: (row) => <ChangeIndicator change={row.positionChange} />,
  },
  {
    key: 'clicks',
    label: 'Clicks',
    align: 'right',
    render: (row) => (
      <span className="text-sm tabular-nums text-[#f1f5f9]">
        {formatNumber(row.clicks)}
      </span>
    ),
  },
  {
    key: 'impressions',
    label: 'Impressions',
    align: 'right',
    render: (row) => (
      <span className="text-sm tabular-nums text-[#94a3b8]">
        {formatNumber(row.impressions)}
      </span>
    ),
  },
  {
    key: 'ctr',
    label: 'CTR',
    align: 'right',
    render: (row) => (
      <span className="text-sm tabular-nums text-[#94a3b8]">
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
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#1e293b]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${row.priority}%`,
              backgroundColor:
                row.priority >= 85
                  ? '#10b981'
                  : row.priority >= 65
                  ? '#2563eb'
                  : '#D4A84B',
            }}
          />
        </div>
        <span className="w-6 text-right text-xs tabular-nums text-[#64748b]">
          {row.priority}
        </span>
      </div>
    ),
  },
  {
    key: 'id',
    label: 'Actions',
    align: 'center',
    render: () => (
      <div className="flex items-center justify-center gap-1">
        <button
          className="inline-flex items-center gap-1 rounded-md border border-[#1e293b] bg-[#0d1520] px-2 py-1 text-xs font-medium text-[#94a3b8] transition-colors hover:border-[#2563eb]/50 hover:text-[#2563eb]"
          title="View SERP"
        >
          <ExternalLink size={11} />
          View
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-md border border-[#1e293b] bg-[#0d1520] px-2 py-1 text-xs font-medium text-[#94a3b8] transition-colors hover:border-[#D4A84B]/50 hover:text-[#D4A84B]"
          title="Create content brief"
        >
          <FileText size={11} />
          Brief
        </button>
      </div>
    ),
  },
]

// ---------------------------------------------------------------------------
// Filter/Sort select component
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
      className={[
        'rounded-lg border border-[#1e293b] bg-[#0d1520] px-3 py-2 text-sm text-[#f1f5f9]',
        'focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50',
        'transition-colors duration-150 hover:border-[#334155]',
        className,
      ].join(' ')}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#111827]">
          {o.label}
        </option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function KeywordsPage() {
  const { currentClient } = useClient()

  const [search, setSearch] = useState('')
  const [intentFilter, setIntentFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('position')
  const [page, setPage] = useState(1)

  // Filter + sort
  const filtered = useMemo(() => {
    let rows = [...ALL_KEYWORDS]

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.keyword.toLowerCase().includes(q))
    }

    if (intentFilter !== 'all') {
      rows = rows.filter((r) => r.intent === intentFilter)
    }

    if (sourceFilter !== 'all') {
      rows = rows.filter((r) => r.source === sourceFilter)
    }

    rows.sort((a, b) => {
      if (sortField === 'position') return a.position - b.position
      if (sortField === 'clicks') return b.clicks - a.clicks
      if (sortField === 'impressions') return b.impressions - a.impressions
      if (sortField === 'priority') return b.priority - a.priority
      return 0
    })

    return rows
  }, [search, intentFilter, sourceFilter, sortField])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const endItem = Math.min(currentPage * PAGE_SIZE, filtered.length)

  function handleSearchChange(val: string) {
    setSearch(val)
    setPage(1)
  }

  function handleIntentChange(val: string) {
    setIntentFilter(val)
    setPage(1)
  }

  function handleSourceChange(val: string) {
    setSourceFilter(val)
    setPage(1)
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Keyword Intelligence</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Track, analyze, and prioritize keywords for{' '}
            <span className="font-medium text-[#94a3b8]">
              {currentClient?.name ?? 'your account'}
            </span>
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm font-medium text-[#94a3b8] transition-colors hover:border-[#334155] hover:text-[#f1f5f9]">
            <Upload size={15} />
            Import Keywords
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]">
            <Sparkles size={15} />
            Run Discovery
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Tracked', value: ALL_KEYWORDS.length.toString(), color: '#2563eb' },
          { label: 'Top 3', value: ALL_KEYWORDS.filter((k) => k.position <= 3).length.toString(), color: '#10b981' },
          { label: 'Top 10', value: ALL_KEYWORDS.filter((k) => k.position <= 10).length.toString(), color: '#D4A84B' },
          { label: 'Improved', value: ALL_KEYWORDS.filter((k) => k.positionChange > 0).length.toString(), color: '#8b5cf6' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#111827] px-4 py-3"
          >
            <div
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: stat.color }}
            />
            <div>
              <p className="text-xl font-bold tabular-nums text-[#f1f5f9]">{stat.value}</p>
              <p className="text-xs text-[#64748b]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main table card ── */}
      <Card>
        {/* Filter bar */}
        <CardHeader className="border-b border-[#1e293b] pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              placeholder="Filter keywords..."
              value={search}
              onChange={handleSearchChange}
              wrapperClassName="flex-1 max-w-sm"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={intentFilter}
                onChange={handleIntentChange}
                options={[
                  { label: 'All Intent', value: 'all' },
                  { label: 'Informational', value: 'informational' },
                  { label: 'Transactional', value: 'transactional' },
                  { label: 'Navigational', value: 'navigational' },
                  { label: 'Commercial', value: 'commercial' },
                ]}
              />
              <Select
                value={sourceFilter}
                onChange={handleSourceChange}
                options={[
                  { label: 'All Sources', value: 'all' },
                  { label: 'Google Search Console', value: 'gsc' },
                  { label: 'Answer the Public', value: 'atp' },
                  { label: 'Manual', value: 'manual' },
                ]}
              />
              <Select
                value={sortField}
                onChange={(v) => { setSortField(v as SortField); setPage(1) }}
                options={[
                  { label: 'Sort: Position', value: 'position' },
                  { label: 'Sort: Clicks', value: 'clicks' },
                  { label: 'Sort: Impressions', value: 'impressions' },
                  { label: 'Sort: Priority', value: 'priority' },
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
            keyExtractor={(row: KeywordRow) => row.id}
            showRowNumbers
            emptyMessage="No keywords match your filters."
            className="border-none"
          />

          {/* Pagination bar */}
          <div className="flex items-center justify-between border-t border-[#1e293b] px-5 py-3">
            <p className="text-sm text-[#64748b]">
              {filtered.length === 0 ? (
                'No results'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-medium text-[#94a3b8]">
                    {startItem}-{endItem}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-[#94a3b8]">{filtered.length}</span>{' '}
                  keywords
                </>
              )}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#1e293b] text-[#64748b] transition-colors hover:border-[#334155] hover:text-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
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
                    <span key={`ellipsis-${i}`} className="px-1 text-xs text-[#64748b]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={[
                        'inline-flex h-8 min-w-[32px] items-center justify-center rounded-md border px-2 text-sm transition-colors',
                        currentPage === p
                          ? 'border-[#2563eb] bg-[#2563eb] font-semibold text-white'
                          : 'border-[#1e293b] text-[#64748b] hover:border-[#334155] hover:text-[#f1f5f9]',
                      ].join(' ')}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#1e293b] text-[#64748b] transition-colors hover:border-[#334155] hover:text-[#f1f5f9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
