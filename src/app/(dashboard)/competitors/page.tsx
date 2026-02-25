'use client'

import * as React from 'react'
import {
  Eye,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus,
  Globe,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useClient } from '@/contexts/client-context'
import { formatNumber, cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MockCompetitor {
  id: string
  domain: string
  name: string
  avgPosition: number
  overlap: number
  threatLevel: 'high' | 'medium' | 'low'
  organicKeywords: number
  estimatedTraffic: number
  domainAuthority: number
}

interface KeywordOverlapRow {
  keyword: string
  yourPosition: number
  competitorPosition: number
  gap: number
  opportunity: 'winning' | 'close' | 'losing'
  searchVolume: number
  competitorDomain: string
}

interface ContentGapItem {
  id: string
  keyword: string
  competitorDomain: string
  competitorPosition: number
  monthlySearches: number
  difficulty: number
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_COMPETITORS: MockCompetitor[] = [
  { id: '1', domain: 'ahrefs.com',           name: 'Ahrefs',              avgPosition: 4.2, overlap: 68, threatLevel: 'high',   organicKeywords: 142800, estimatedTraffic: 2100000, domainAuthority: 91 },
  { id: '2', domain: 'semrush.com',          name: 'SEMrush',             avgPosition: 3.8, overlap: 74, threatLevel: 'high',   organicKeywords: 189400, estimatedTraffic: 3400000, domainAuthority: 93 },
  { id: '3', domain: 'moz.com',              name: 'Moz',                 avgPosition: 6.1, overlap: 52, threatLevel: 'medium', organicKeywords: 87200,  estimatedTraffic: 940000,  domainAuthority: 88 },
  { id: '4', domain: 'searchengineland.com', name: 'Search Engine Land',  avgPosition: 8.3, overlap: 31, threatLevel: 'low',    organicKeywords: 54100,  estimatedTraffic: 480000,  domainAuthority: 79 },
]

const MOCK_KEYWORD_OVERLAP: KeywordOverlapRow[] = [
  { keyword: 'seo audit tool',               yourPosition: 7,  competitorPosition: 2,  gap: -5,  opportunity: 'losing',  searchVolume: 8100,  competitorDomain: 'ahrefs.com' },
  { keyword: 'keyword rank tracker',         yourPosition: 3,  competitorPosition: 5,  gap:  2,  opportunity: 'winning', searchVolume: 6600,  competitorDomain: 'semrush.com' },
  { keyword: 'backlink checker free',        yourPosition: 12, competitorPosition: 4,  gap: -8,  opportunity: 'losing',  searchVolume: 22000, competitorDomain: 'ahrefs.com' },
  { keyword: 'technical seo checklist',      yourPosition: 4,  competitorPosition: 6,  gap:  2,  opportunity: 'winning', searchVolume: 4400,  competitorDomain: 'moz.com' },
  { keyword: 'competitor analysis seo',      yourPosition: 9,  competitorPosition: 8,  gap: -1,  opportunity: 'close',   searchVolume: 3600,  competitorDomain: 'semrush.com' },
  { keyword: 'google search console guide',  yourPosition: 2,  competitorPosition: 7,  gap:  5,  opportunity: 'winning', searchVolume: 5400,  competitorDomain: 'moz.com' },
  { keyword: 'seo content brief template',   yourPosition: 6,  competitorPosition: 3,  gap: -3,  opportunity: 'losing',  searchVolume: 2900,  competitorDomain: 'ahrefs.com' },
  { keyword: 'local seo optimization',       yourPosition: 11, competitorPosition: 4,  gap: -7,  opportunity: 'losing',  searchVolume: 18100, competitorDomain: 'semrush.com' },
  { keyword: 'on page seo factors',          yourPosition: 5,  competitorPosition: 9,  gap:  4,  opportunity: 'winning', searchVolume: 7200,  competitorDomain: 'searchengineland.com' },
  { keyword: 'crawl budget optimization',    yourPosition: 8,  competitorPosition: 7,  gap: -1,  opportunity: 'close',   searchVolume: 1600,  competitorDomain: 'ahrefs.com' },
  { keyword: 'schema markup generator',      yourPosition: 14, competitorPosition: 2,  gap: -12, opportunity: 'losing',  searchVolume: 12100, competitorDomain: 'moz.com' },
  { keyword: 'core web vitals checker',      yourPosition: 3,  competitorPosition: 6,  gap:  3,  opportunity: 'winning', searchVolume: 9900,  competitorDomain: 'searchengineland.com' },
  { keyword: 'internal linking strategy',    yourPosition: 10, competitorPosition: 11, gap:  1,  opportunity: 'close',   searchVolume: 3200,  competitorDomain: 'semrush.com' },
  { keyword: 'keyword clustering tool',      yourPosition: 18, competitorPosition: 3,  gap: -15, opportunity: 'losing',  searchVolume: 4800,  competitorDomain: 'ahrefs.com' },
  { keyword: 'seo reporting dashboard',      yourPosition: 2,  competitorPosition: 8,  gap:  6,  opportunity: 'winning', searchVolume: 2400,  competitorDomain: 'semrush.com' },
  { keyword: 'page speed optimization seo',  yourPosition: 7,  competitorPosition: 6,  gap: -1,  opportunity: 'close',   searchVolume: 5500,  competitorDomain: 'moz.com' },
]

const MOCK_CONTENT_GAPS: ContentGapItem[] = [
  { id: '1', keyword: 'link building strategies 2025',   competitorDomain: 'ahrefs.com',           competitorPosition: 1, monthlySearches: 27000, difficulty: 68 },
  { id: '2', keyword: 'e-e-a-t seo guide',               competitorDomain: 'semrush.com',           competitorPosition: 3, monthlySearches: 14800, difficulty: 55 },
  { id: '3', keyword: 'google helpful content update',   competitorDomain: 'searchengineland.com',  competitorPosition: 2, monthlySearches: 9900,  difficulty: 44 },
  { id: '4', keyword: 'topical authority seo',           competitorDomain: 'semrush.com',           competitorPosition: 4, monthlySearches: 8100,  difficulty: 52 },
  { id: '5', keyword: 'ai seo tools comparison',         competitorDomain: 'ahrefs.com',            competitorPosition: 5, monthlySearches: 6600,  difficulty: 41 },
  { id: '6', keyword: 'programmatic seo guide',          competitorDomain: 'ahrefs.com',            competitorPosition: 2, monthlySearches: 5400,  difficulty: 49 },
  { id: '7', keyword: 'seo automation workflow',         competitorDomain: 'semrush.com',           competitorPosition: 6, monthlySearches: 3900,  difficulty: 38 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function threatVariant(level: MockCompetitor['threatLevel']): 'danger' | 'warning' | 'outline' {
  if (level === 'high')   return 'danger'
  if (level === 'medium') return 'warning'
  return 'outline'
}

function positionColorClass(pos: number): string {
  if (pos <= 3)  return 'text-emerald-600'
  if (pos <= 10) return 'text-blue-600'
  if (pos <= 20) return 'text-amber-500'
  return 'text-red-500'
}

function difficultyColor(d: number): string {
  if (d <= 30) return 'text-emerald-600'
  if (d <= 55) return 'text-amber-500'
  return 'text-red-500'
}

// ---------------------------------------------------------------------------
// CompetitorCard
// ---------------------------------------------------------------------------
function CompetitorCard({
  competitor, isSelected, onSelect,
}: {
  competitor: MockCompetitor; isSelected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex min-w-[200px] flex-col gap-3 rounded-lg border p-3 text-left transition-all duration-150 cursor-pointer',
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50">
            <Globe size={12} className="text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>{competitor.name}</p>
            <p className="text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>{competitor.domain}</p>
          </div>
        </div>
        <Badge variant={threatVariant(competitor.threatLevel)} className="shrink-0 text-[10px] capitalize">
          {competitor.threatLevel}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        {[
          { label: 'Avg Pos', value: `#${competitor.avgPosition}`, colorClass: positionColorClass(competitor.avgPosition) },
          { label: 'Overlap', value: `${competitor.overlap}%`,     colorClass: 'text-slate-800' },
          { label: 'DA',      value: competitor.domainAuthority,   colorClass: 'text-slate-600' },
          { label: 'Traffic', value: formatNumber(competitor.estimatedTraffic), colorClass: 'text-slate-600' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>{s.label}</p>
            <p className={cn('text-xs font-bold', s.colorClass)} style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-1 text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>Keyword overlap</p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${competitor.overlap}%` }} />
        </div>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Opportunity badge
// ---------------------------------------------------------------------------
function OpportunityBadge({ opp }: { opp: KeywordOverlapRow['opportunity'] }) {
  if (opp === 'winning') return (
    <Badge variant="success" className="gap-1 text-[10px]">
      <TrendingUp size={9} />Winning
    </Badge>
  )
  if (opp === 'close') return (
    <Badge variant="warning" className="gap-1 text-[10px]">
      <Minus size={9} />Close
    </Badge>
  )
  return (
    <Badge variant="danger" className="gap-1 text-[10px]">
      <TrendingDown size={9} />Losing
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// DataTable columns
// ---------------------------------------------------------------------------
const overlapColumns: Column<Record<string, unknown>>[] = [
  {
    key: 'keyword', label: 'Keyword',
    render: (row) => (
      <div className="flex items-center gap-1.5">
        <Search size={11} className="shrink-0 text-slate-400" />
        <span className="font-medium text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>{String(row.keyword)}</span>
      </div>
    ),
  },
  {
    key: 'yourPosition', label: 'You', align: 'center',
    render: (row) => {
      const pos = row.yourPosition as number
      return <span className={cn('font-bold', positionColorClass(pos))} style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>#{pos}</span>
    },
  },
  {
    key: 'competitorPosition', label: 'Comp.', align: 'center',
    render: (row) => {
      const pos = row.competitorPosition as number
      return <span className={cn('font-bold', positionColorClass(pos))} style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>#{pos}</span>
    },
  },
  {
    key: 'gap', label: 'Gap', align: 'center',
    render: (row) => {
      const gap = row.gap as number
      const cls = gap > 0 ? 'text-emerald-600' : gap >= -1 ? 'text-amber-500' : 'text-red-500'
      return (
        <span className={cn('font-semibold', cls)} style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
          {gap > 0 ? `+${gap}` : gap}
        </span>
      )
    },
  },
  {
    key: 'searchVolume', label: 'Vol.', align: 'right',
    render: (row) => (
      <span className="text-slate-500" style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
        {formatNumber(row.searchVolume as number)}
      </span>
    ),
  },
  {
    key: 'opportunity', label: 'Status', align: 'center',
    render: (row) => <OpportunityBadge opp={row.opportunity as KeywordOverlapRow['opportunity']} />,
  },
]

// ---------------------------------------------------------------------------
// Trend bar placeholder
// ---------------------------------------------------------------------------
function TrendBars() {
  const data = [42, 38, 45, 35, 28, 32, 25, 22, 18, 24, 20, 15]
  const max  = Math.max(...data)
  return (
    <div className="relative flex h-20 w-full items-end gap-0.5 overflow-hidden">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: i < 6
              ? 'linear-gradient(to top, #1e3a5f, #3B82F6)'
              : 'linear-gradient(to top, #78350f, #F59E0B)',
          }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CompetitorsPage() {
  const { isLoading: clientLoading, hasNoBusiness } = useClient()
  const [selectedId, setSelectedId]           = React.useState<string>('1')
  const [briefQueue, setBriefQueue]           = React.useState<Set<string>>(new Set())

  const selectedComp = MOCK_COMPETITORS.find((c) => c.id === selectedId)
  const filteredOverlap = selectedComp
    ? MOCK_KEYWORD_OVERLAP.filter((r) => r.competitorDomain === selectedComp.domain)
    : MOCK_KEYWORD_OVERLAP

  const winCount     = filteredOverlap.filter((r) => r.opportunity === 'winning').length
  const closeCount   = filteredOverlap.filter((r) => r.opportunity === 'close').length
  const losingCount  = filteredOverlap.filter((r) => r.opportunity === 'losing').length

  if (hasNoBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-5">
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No website connected"
          description="Add your first website to start monitoring competitor rankings."
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
            Track competitors, identify keyword gaps, and find opportunities to outrank them.
          </p>
        </div>
        <Button variant="amber" size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus size={13} />
          Add Competitor
        </Button>
      </div>

      {/* Competitor cards */}
      {clientLoading ? (
        <div className="mb-4 flex gap-3">
          {[0,1,2,3].map((i) => <SkeletonCard key={i} className="min-w-[200px]" />)}
        </div>
      ) : (
        <div className="mb-4 flex gap-3 overflow-x-auto pb-1">
          {MOCK_COMPETITORS.map((comp) => (
            <CompetitorCard
              key={comp.id}
              competitor={comp}
              isSelected={selectedId === comp.id}
              onSelect={() => setSelectedId(comp.id)}
            />
          ))}
        </div>
      )}

      {/* Summary strip */}
      {selectedComp && (
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { color: '#10B981', label: 'Winning', count: winCount },
            { color: '#F59E0B', label: 'Close',   count: closeCount },
            { color: '#EF4444', label: 'Losing',  count: losingCount },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>{s.label}</span>
              <span className="text-sm font-bold" style={{ color: s.color, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{s.count}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Globe size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>vs</span>
            <span className="text-xs font-semibold text-slate-800" style={{ fontFamily: 'var(--font-mono)' }}>{selectedComp.domain}</span>
          </div>
        </div>
      )}

      {/* Main: overlap + gaps */}
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        {/* Keyword overlap table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>Keyword Overlap</h2>
            <span className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>{filteredOverlap.length} shared</span>
          </div>
          <DataTable
            columns={overlapColumns}
            data={filteredOverlap as unknown as Record<string, unknown>[]}
            keyExtractor={(row) => String(row.keyword)}
            emptyMessage="No keyword overlap for this competitor."
          />
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />You rank higher</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Within 1-2 positions</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500" />Competitor ranks higher</span>
          </div>
        </div>

        {/* Content gaps */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>Content Gaps</h2>
            <span className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>{MOCK_CONTENT_GAPS.length} opportunities</span>
          </div>
          <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
            {MOCK_CONTENT_GAPS.map((item) => (
              <div key={item.id} className="flex flex-col gap-1.5 p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-slate-800 leading-snug" style={{ fontFamily: 'var(--font-sans)' }}>
                    {item.keyword}
                  </p>
                  {briefQueue.has(item.id) ? (
                    <Badge variant="success" className="shrink-0 text-[10px]">In queue</Badge>
                  ) : (
                    <button
                      onClick={() => setBriefQueue((prev) => new Set(prev).add(item.id))}
                      className="flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-transparent px-2 py-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                    >
                      <FileText size={9} />Brief
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                  <span className="flex items-center gap-1"><Globe size={10} />{item.competitorDomain}</span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight size={10} />
                    <span className={positionColorClass(item.competitorPosition)} style={{ fontFamily: 'var(--font-mono)' }}>#{item.competitorPosition}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Search size={10} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(item.monthlySearches)}/mo</span>
                  </span>
                  <span className={cn('flex items-center gap-1', difficultyColor(item.difficulty))}>
                    <AlertTriangle size={10} />
                    <span style={{ fontFamily: 'var(--font-mono)' }}>KD {item.difficulty}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="gap-1 self-start text-xs text-slate-500">
            View all gaps<ChevronRight size={12} />
          </Button>
        </div>
      </div>

      {/* Trend section */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>
              Competitor Trend
            </h2>
            <span className="text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>last 12 weeks</span>
          </div>
          <div className="flex gap-3 text-[11px]" style={{ fontFamily: 'var(--font-sans)' }}>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-blue-500" />You</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />{selectedComp?.name ?? 'Competitor'}</span>
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-[11px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>Avg. position (lower = better)</p>
            <TrendBars />
            <div className="mt-2 flex justify-between text-[10px] text-slate-300" style={{ fontFamily: 'var(--font-sans)' }}>
              {['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'].map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
