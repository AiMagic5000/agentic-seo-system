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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { formatNumber } from '@/lib/utils'

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
  {
    id: '1',
    domain: 'ahrefs.com',
    name: 'Ahrefs',
    avgPosition: 4.2,
    overlap: 68,
    threatLevel: 'high',
    organicKeywords: 142800,
    estimatedTraffic: 2100000,
    domainAuthority: 91,
  },
  {
    id: '2',
    domain: 'semrush.com',
    name: 'SEMrush',
    avgPosition: 3.8,
    overlap: 74,
    threatLevel: 'high',
    organicKeywords: 189400,
    estimatedTraffic: 3400000,
    domainAuthority: 93,
  },
  {
    id: '3',
    domain: 'moz.com',
    name: 'Moz',
    avgPosition: 6.1,
    overlap: 52,
    threatLevel: 'medium',
    organicKeywords: 87200,
    estimatedTraffic: 940000,
    domainAuthority: 88,
  },
  {
    id: '4',
    domain: 'searchengineland.com',
    name: 'Search Engine Land',
    avgPosition: 8.3,
    overlap: 31,
    threatLevel: 'low',
    organicKeywords: 54100,
    estimatedTraffic: 480000,
    domainAuthority: 79,
  },
]

const MOCK_KEYWORD_OVERLAP: KeywordOverlapRow[] = [
  {
    keyword: 'seo audit tool',
    yourPosition: 7,
    competitorPosition: 2,
    gap: -5,
    opportunity: 'losing',
    searchVolume: 8100,
    competitorDomain: 'ahrefs.com',
  },
  {
    keyword: 'keyword rank tracker',
    yourPosition: 3,
    competitorPosition: 5,
    gap: 2,
    opportunity: 'winning',
    searchVolume: 6600,
    competitorDomain: 'semrush.com',
  },
  {
    keyword: 'backlink checker free',
    yourPosition: 12,
    competitorPosition: 4,
    gap: -8,
    opportunity: 'losing',
    searchVolume: 22000,
    competitorDomain: 'ahrefs.com',
  },
  {
    keyword: 'technical seo checklist',
    yourPosition: 4,
    competitorPosition: 6,
    gap: 2,
    opportunity: 'winning',
    searchVolume: 4400,
    competitorDomain: 'moz.com',
  },
  {
    keyword: 'competitor analysis seo',
    yourPosition: 9,
    competitorPosition: 8,
    gap: -1,
    opportunity: 'close',
    searchVolume: 3600,
    competitorDomain: 'semrush.com',
  },
  {
    keyword: 'google search console guide',
    yourPosition: 2,
    competitorPosition: 7,
    gap: 5,
    opportunity: 'winning',
    searchVolume: 5400,
    competitorDomain: 'moz.com',
  },
  {
    keyword: 'seo content brief template',
    yourPosition: 6,
    competitorPosition: 3,
    gap: -3,
    opportunity: 'losing',
    searchVolume: 2900,
    competitorDomain: 'ahrefs.com',
  },
  {
    keyword: 'local seo optimization',
    yourPosition: 11,
    competitorPosition: 4,
    gap: -7,
    opportunity: 'losing',
    searchVolume: 18100,
    competitorDomain: 'semrush.com',
  },
  {
    keyword: 'on page seo factors',
    yourPosition: 5,
    competitorPosition: 9,
    gap: 4,
    opportunity: 'winning',
    searchVolume: 7200,
    competitorDomain: 'searchengineland.com',
  },
  {
    keyword: 'crawl budget optimization',
    yourPosition: 8,
    competitorPosition: 7,
    gap: -1,
    opportunity: 'close',
    searchVolume: 1600,
    competitorDomain: 'ahrefs.com',
  },
  {
    keyword: 'schema markup generator',
    yourPosition: 14,
    competitorPosition: 2,
    gap: -12,
    opportunity: 'losing',
    searchVolume: 12100,
    competitorDomain: 'moz.com',
  },
  {
    keyword: 'core web vitals checker',
    yourPosition: 3,
    competitorPosition: 6,
    gap: 3,
    opportunity: 'winning',
    searchVolume: 9900,
    competitorDomain: 'searchengineland.com',
  },
  {
    keyword: 'internal linking strategy',
    yourPosition: 10,
    competitorPosition: 11,
    gap: 1,
    opportunity: 'close',
    searchVolume: 3200,
    competitorDomain: 'semrush.com',
  },
  {
    keyword: 'keyword clustering tool',
    yourPosition: 18,
    competitorPosition: 3,
    gap: -15,
    opportunity: 'losing',
    searchVolume: 4800,
    competitorDomain: 'ahrefs.com',
  },
  {
    keyword: 'seo reporting dashboard',
    yourPosition: 2,
    competitorPosition: 8,
    gap: 6,
    opportunity: 'winning',
    searchVolume: 2400,
    competitorDomain: 'semrush.com',
  },
  {
    keyword: 'page speed optimization seo',
    yourPosition: 7,
    competitorPosition: 6,
    gap: -1,
    opportunity: 'close',
    searchVolume: 5500,
    competitorDomain: 'moz.com',
  },
]

const MOCK_CONTENT_GAPS: ContentGapItem[] = [
  {
    id: '1',
    keyword: 'link building strategies 2025',
    competitorDomain: 'ahrefs.com',
    competitorPosition: 1,
    monthlySearches: 27000,
    difficulty: 68,
  },
  {
    id: '2',
    keyword: 'e-e-a-t seo guide',
    competitorDomain: 'semrush.com',
    competitorPosition: 3,
    monthlySearches: 14800,
    difficulty: 55,
  },
  {
    id: '3',
    keyword: 'google helpful content update',
    competitorDomain: 'searchengineland.com',
    competitorPosition: 2,
    monthlySearches: 9900,
    difficulty: 44,
  },
  {
    id: '4',
    keyword: 'topical authority seo',
    competitorDomain: 'semrush.com',
    competitorPosition: 4,
    monthlySearches: 8100,
    difficulty: 52,
  },
  {
    id: '5',
    keyword: 'ai seo tools comparison',
    competitorDomain: 'ahrefs.com',
    competitorPosition: 5,
    monthlySearches: 6600,
    difficulty: 41,
  },
  {
    id: '6',
    keyword: 'programmatic seo guide',
    competitorDomain: 'ahrefs.com',
    competitorPosition: 2,
    monthlySearches: 5400,
    difficulty: 49,
  },
  {
    id: '7',
    keyword: 'seo automation workflow',
    competitorDomain: 'semrush.com',
    competitorPosition: 6,
    monthlySearches: 3900,
    difficulty: 38,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function threatVariant(level: MockCompetitor['threatLevel']) {
  if (level === 'high') return 'danger' as const
  if (level === 'medium') return 'warning' as const
  return 'outline' as const
}

function positionColor(pos: number): string {
  if (pos <= 3) return 'text-green-400'
  if (pos <= 10) return 'text-blue-400'
  if (pos <= 20) return 'text-yellow-400'
  return 'text-red-400'
}

function difficultyColor(d: number): string {
  if (d <= 30) return 'text-green-400'
  if (d <= 55) return 'text-yellow-400'
  return 'text-red-400'
}

// ---------------------------------------------------------------------------
// Competitor summary card
// ---------------------------------------------------------------------------
function CompetitorCard({
  competitor,
  isSelected,
  onSelect,
}: {
  competitor: MockCompetitor
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        'flex min-w-[220px] flex-col gap-3 rounded-xl border p-4 text-left transition-all',
        isSelected
          ? 'border-[#2563eb] bg-[#0c1a3a] shadow-[0_0_0_1px_#2563eb40]'
          : 'border-[#1e293b] bg-[#111827] hover:border-[#334155]',
      ].join(' ')}
    >
      {/* Top: domain + threat */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e293b] bg-[#0d1520]">
            <Globe size={14} className="text-[#64748b]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f1f5f9]">{competitor.name}</p>
            <p className="text-[11px] text-[#475569]">{competitor.domain}</p>
          </div>
        </div>
        <Badge variant={threatVariant(competitor.threatLevel)} className="shrink-0 capitalize text-[10px]">
          {competitor.threatLevel}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-[#475569]">Avg Position</p>
          <p className={`text-sm font-bold tabular-nums ${positionColor(competitor.avgPosition)}`}>
            #{competitor.avgPosition}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[#475569]">Keyword Overlap</p>
          <p className="text-sm font-bold tabular-nums text-[#f1f5f9]">
            {competitor.overlap}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[#475569]">DA</p>
          <p className="text-sm font-bold tabular-nums text-[#94a3b8]">
            {competitor.domainAuthority}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-[#475569]">Est. Traffic</p>
          <p className="text-sm font-bold tabular-nums text-[#94a3b8]">
            {formatNumber(competitor.estimatedTraffic)}
          </p>
        </div>
      </div>

      {/* Overlap bar */}
      <div>
        <p className="mb-1.5 text-[10px] text-[#475569]">Keyword overlap with you</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e293b]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all"
            style={{ width: `${competitor.overlap}%` }}
          />
        </div>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Opportunity badge
// ---------------------------------------------------------------------------
function OpportunityBadge({ opp }: { opp: KeywordOverlapRow['opportunity'] }) {
  if (opp === 'winning')
    return (
      <Badge variant="success" className="gap-1 text-[10px]">
        <TrendingUp size={10} />
        Winning
      </Badge>
    )
  if (opp === 'close')
    return (
      <Badge variant="warning" className="gap-1 text-[10px]">
        <Minus size={10} />
        Close
      </Badge>
    )
  return (
    <Badge variant="danger" className="gap-1 text-[10px]">
      <TrendingDown size={10} />
      Losing
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// DataTable column definitions
// ---------------------------------------------------------------------------
const overlapColumns: Column<Record<string, unknown>>[] = [
  {
    key: 'keyword',
    label: 'Keyword',
    render: (row) => (
      <div className="flex items-center gap-2">
        <Search size={12} className="shrink-0 text-[#475569]" />
        <span className="font-medium text-[#e2e8f0]">
          {String(row.keyword)}
        </span>
      </div>
    ),
  },
  {
    key: 'yourPosition',
    label: 'Your Pos.',
    align: 'center',
    render: (row) => {
      const pos = row.yourPosition as number
      return (
        <span className={`font-bold tabular-nums ${positionColor(pos)}`}>
          #{pos}
        </span>
      )
    },
  },
  {
    key: 'competitorPosition',
    label: 'Competitor',
    align: 'center',
    render: (row) => {
      const pos = row.competitorPosition as number
      return (
        <span className={`font-bold tabular-nums ${positionColor(pos)}`}>
          #{pos}
        </span>
      )
    },
  },
  {
    key: 'gap',
    label: 'Gap',
    align: 'center',
    render: (row) => {
      const gap = row.gap as number
      const isPositive = gap > 0
      const isNeutral = gap === 0 || gap === -1
      return (
        <span
          className={`tabular-nums font-semibold ${
            isPositive
              ? 'text-green-400'
              : isNeutral
              ? 'text-yellow-400'
              : 'text-red-400'
          }`}
        >
          {gap > 0 ? `+${gap}` : gap}
        </span>
      )
    },
  },
  {
    key: 'searchVolume',
    label: 'Volume',
    align: 'right',
    render: (row) => (
      <span className="tabular-nums text-[#94a3b8]">
        {formatNumber(row.searchVolume as number)}
      </span>
    ),
  },
  {
    key: 'opportunity',
    label: 'Status',
    align: 'center',
    render: (row) => (
      <OpportunityBadge opp={row.opportunity as KeywordOverlapRow['opportunity']} />
    ),
  },
]

// ---------------------------------------------------------------------------
// Trend chart placeholder
// ---------------------------------------------------------------------------
function TrendPlaceholder() {
  // Simple SVG sparkline-style placeholder with rough bars
  const data = [42, 38, 45, 35, 28, 32, 25, 22, 18, 24, 20, 15]
  const max = Math.max(...data)
  const width = 400
  const height = 80
  const barW = width / data.length - 2

  return (
    <div className="relative flex h-24 w-full items-end gap-0.5 overflow-hidden px-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm opacity-80 transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: i < 6
              ? 'linear-gradient(to top, #1e3a5f, #2563eb)'
              : 'linear-gradient(to top, #3d2a00, #D4A84B)',
          }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function CompetitorsPage() {
  const [selectedCompetitorId, setSelectedCompetitorId] = React.useState<string>('1')
  const [briefQueue, setBriefQueue] = React.useState<Set<string>>(new Set())

  const selectedCompetitor = MOCK_COMPETITORS.find(
    (c) => c.id === selectedCompetitorId
  )

  const filteredOverlap = selectedCompetitor
    ? MOCK_KEYWORD_OVERLAP.filter(
        (row) => row.competitorDomain === selectedCompetitor.domain
      )
    : MOCK_KEYWORD_OVERLAP

  function handleCreateBrief(itemId: string) {
    setBriefQueue((prev) => new Set(prev).add(itemId))
  }

  const winCount = filteredOverlap.filter((r) => r.opportunity === 'winning').length
  const closeCount = filteredOverlap.filter((r) => r.opportunity === 'close').length
  const losingCount = filteredOverlap.filter((r) => r.opportunity === 'losing').length

  return (
    <div className="p-6 lg:p-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Eye size={22} className="text-[#D4A84B]" />
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Competitor Analysis</h1>
          </div>
          <p className="mt-1 text-sm text-[#64748b]">
            Track competitors, identify keyword gaps, and find opportunities to outrank them.
          </p>
        </div>
        <Button variant="gold" className="gap-2 self-start sm:self-auto">
          <Plus size={15} />
          Add Competitor
        </Button>
      </div>

      {/* ── Competitor cards (horizontal scroll) ────────────────────── */}
      <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
        {MOCK_COMPETITORS.map((comp) => (
          <CompetitorCard
            key={comp.id}
            competitor={comp}
            isSelected={selectedCompetitorId === comp.id}
            onSelect={() => setSelectedCompetitorId(comp.id)}
          />
        ))}
      </div>

      {/* ── Active competitor summary strip ─────────────────────────── */}
      {selectedCompetitor && (
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#111827] px-4 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-[#64748b]">Winning</span>
            <span className="text-sm font-bold text-green-400">{winCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#111827] px-4 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            <span className="text-xs text-[#64748b]">Close</span>
            <span className="text-sm font-bold text-yellow-400">{closeCount}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#111827] px-4 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span className="text-xs text-[#64748b]">Losing</span>
            <span className="text-sm font-bold text-red-400">{losingCount}</span>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#111827] px-4 py-2.5">
            <Globe size={13} className="text-[#475569]" />
            <span className="text-xs text-[#64748b]">Comparing with</span>
            <span className="text-sm font-semibold text-[#f1f5f9]">
              {selectedCompetitor.domain}
            </span>
          </div>
        </div>
      )}

      {/* ── Main content: keyword overlap + content gaps ─────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left: keyword overlap table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#f1f5f9]">
              Keyword Overlap
            </h2>
            <p className="text-xs text-[#475569]">
              {filteredOverlap.length} shared keywords
            </p>
          </div>

          <DataTable
            columns={overlapColumns}
            data={
              filteredOverlap as unknown as Record<string, unknown>[]
            }
            keyExtractor={(row) => String(row.keyword)}
            emptyMessage="No keyword overlap data for this competitor."
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[11px] text-[#475569]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
              You rank higher (winning)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
              Within 1-2 positions (close)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
              Competitor ranks higher (losing)
            </span>
          </div>
        </div>

        {/* Right: content gaps panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#f1f5f9]">Content Gaps</h2>
            <span className="text-xs text-[#475569]">
              {MOCK_CONTENT_GAPS.length} opportunities
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[#1e293b] rounded-xl border border-[#1e293b] bg-[#111827]">
            {MOCK_CONTENT_GAPS.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-4 hover:bg-[#0d1520] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug text-[#e2e8f0]">
                    {item.keyword}
                  </p>
                  {briefQueue.has(item.id) ? (
                    <Badge variant="success" className="shrink-0 text-[10px]">
                      In queue
                    </Badge>
                  ) : (
                    <button
                      onClick={() => handleCreateBrief(item.id)}
                      className="flex shrink-0 items-center gap-1 rounded-md border border-[#334155] bg-transparent px-2 py-1 text-[10px] font-medium text-[#94a3b8] transition-colors hover:border-[#2563eb] hover:bg-[#0c1a3a] hover:text-[#60a5fa]"
                    >
                      <FileText size={10} />
                      Brief
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <Globe size={11} />
                    {item.competitorDomain}
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowUpRight size={11} />
                    <span className={positionColor(item.competitorPosition)}>
                      #{item.competitorPosition}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Search size={11} />
                    {formatNumber(item.monthlySearches)}/mo
                  </span>
                  <span
                    className={`flex items-center gap-1 ${difficultyColor(item.difficulty)}`}
                  >
                    <AlertTriangle size={11} />
                    KD {item.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" size="sm" className="gap-1 self-start text-xs text-[#64748b]">
            View all gaps
            <ChevronRight size={13} />
          </Button>
        </div>
      </div>

      {/* ── Competitor trend section ─────────────────────────────────── */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#475569]" />
            <h2 className="text-base font-semibold text-[#f1f5f9]">
              Competitor Trend
            </h2>
            <span className="text-xs text-[#475569]">— last 12 weeks</span>
          </div>
          <div className="flex gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2563eb]" />
              You
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#D4A84B]" />
              {selectedCompetitor?.name ?? 'Competitor'}
            </span>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex justify-between text-[11px] text-[#475569]">
              <span>Avg. position (lower = better)</span>
              <span>
                {selectedCompetitor?.domain}
              </span>
            </div>
            <TrendPlaceholder />
            <div className="mt-2 flex justify-between text-[10px] text-[#334155]">
              {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'].map(
                (w) => (
                  <span key={w}>{w}</span>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
