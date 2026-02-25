'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MousePointerClick,
  Eye,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Plus,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import {
  TrafficChart,
  type TrafficDataPoint,
} from '@/components/charts/traffic-chart'
import {
  RankingDistribution,
  type RankingBucket,
} from '@/components/charts/ranking-distribution'
import { ProgressRing } from '@/components/ui/progress-ring'
import { SkeletonCard, SkeletonChart } from '@/components/ui/skeleton'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'
import { AddBusinessWizard } from '@/components/onboarding/AddBusinessWizard'
import { useClient } from '@/contexts/client-context'
import { formatNumber, formatPercent, formatPosition } from '@/lib/utils'
import { getHealthScoreLabel, getHealthScoreColor } from '@/lib/constants'
import type { AgentRun } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GscSummary {
  clicks: number
  impressions: number
  avgPosition: number
  avgCtr: number
}

interface GscKeyword {
  keyword: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface GscTrafficDay {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface GscData {
  summary: GscSummary
  topKeywords: GscKeyword[]
  trafficByDate: GscTrafficDay[]
  domain: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function positionColor(pos: number): string {
  if (pos <= 3) return 'text-emerald-600'
  if (pos <= 10) return 'text-blue-700'
  if (pos <= 20) return 'text-amber-600'
  return 'text-red-600'
}

function AgentStatusBadge({ status }: { status: AgentRun['status'] }) {
  if (status === 'completed')
    return <Badge variant="success" className="gap-1"><CheckCircle2 size={10} />Done</Badge>
  if (status === 'running')
    return <Badge variant="info" className="gap-1"><Loader2 size={10} className="animate-spin" />Running</Badge>
  if (status === 'failed')
    return <Badge variant="danger" className="gap-1"><AlertCircle size={10} />Failed</Badge>
  return <Badge variant="outline">{status}</Badge>
}

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()
  const [gscData, setGscData] = useState<GscData | null>(null)
  const [gscLoading, setGscLoading] = useState(false)
  const [gscError, setGscError] = useState<string | null>(null)
  const [gscEmpty, setGscEmpty] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  const fetchGscData = useCallback(async (clientId: string) => {
    setGscLoading(true)
    setGscError(null)
    setGscEmpty(false)
    try {
      const res = await fetch(`/api/gsc/summary?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setGscData(json.data)
      } else if (json.empty) {
        setGscEmpty(true)
        setGscData(null)
      } else {
        setGscError(json.error || 'Failed to fetch data')
      }
    } catch {
      setGscError('Failed to connect to the server.')
    } finally {
      setGscLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      fetchGscData(currentClient.id)
    }
  }, [currentClient?.id, fetchGscData])

  // --- Client loading state ---
  if (clientLoading) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-5 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart height={240} />
      </div>
    )
  }

  // --- No business (new user) ---
  if (hasNoBusiness) {
    return <EmptyDashboard />
  }

  const clientName = currentClient?.name ?? 'your account'
  const summary = gscData?.summary
  const trafficData: TrafficDataPoint[] = (gscData?.trafficByDate ?? []).map(
    (d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      clicks: d.clicks,
      impressions: d.impressions,
    })
  )

  const keywords = gscData?.topKeywords ?? []

  const rankingData: RankingBucket[] = [
    { range: '1-3',   count: 0, color: '#10B981' },
    { range: '4-10',  count: 0, color: '#3B82F6' },
    { range: '11-20', count: 0, color: '#F59E0B' },
    { range: '21-50', count: 0, color: '#F97316' },
    { range: '51+',   count: 0, color: '#EF4444' },
  ]
  for (const kw of keywords) {
    if (kw.position <= 3) rankingData[0].count++
    else if (kw.position <= 10) rankingData[1].count++
    else if (kw.position <= 20) rankingData[2].count++
    else if (kw.position <= 50) rankingData[3].count++
    else rankingData[4].count++
  }

  const keywordColumns: Column<GscKeyword>[] = [
    {
      key: 'keyword',
      label: 'Keyword',
      render: (row) => (
        <span className="max-w-[200px] truncate text-sm font-medium text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>
          {row.keyword}
        </span>
      ),
    },
    {
      key: 'position',
      label: 'Position',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className={`text-sm font-bold tabular-nums ${positionColor(row.position)}`}>
          #{Math.round(row.position * 10) / 10}
        </span>
      ),
    },
    {
      key: 'clicks',
      label: 'Clicks',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="text-sm tabular-nums text-slate-700">{formatNumber(row.clicks)}</span>
      ),
    },
    {
      key: 'impressions',
      label: 'Impr.',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="text-sm tabular-nums text-slate-500">{formatNumber(row.impressions)}</span>
      ),
    },
    {
      key: 'ctr',
      label: 'CTR',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="text-sm tabular-nums text-slate-500">{formatPercent(row.ctr)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-4 p-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-sm font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>
            Performance for{' '}
            <span className="font-medium text-blue-700">{clientName}</span>
            {gscData?.domain && (
              <span className="ml-1 text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
                ({gscData.domain})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* GSC loading */}
      {gscLoading && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* GSC error */}
      {gscError && !gscLoading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800" style={{ fontFamily: 'var(--font-sans)' }}>
          {gscError}
        </div>
      )}

      {/* GSC not configured */}
      {gscEmpty && !gscLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Globe className="h-6 w-6 text-slate-300" />
          </div>
          <h2 className="text-sm font-semibold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
            Connect Google Search Console
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
            Add your GSC property URL in Settings to start seeing real keyword and traffic data.
          </p>
          <a href="/settings" className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
            Go to Settings
          </a>
        </div>
      )}

      {/* Stat cards */}
      {summary && !gscLoading && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Clicks"
            value={formatNumber(summary.clicks)}
            subtitle="Last 28 days"
            icon={<MousePointerClick size={14} />}
            iconColor="#3B82F6"
            iconBg="#EFF6FF"
          />
          <StatCard
            title="Impressions"
            value={formatNumber(summary.impressions)}
            subtitle="Last 28 days"
            icon={<Eye size={14} />}
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
          />
          <StatCard
            title="Avg. Position"
            value={formatPosition(summary.avgPosition)}
            subtitle="Lower is better"
            icon={<TrendingUp size={14} />}
            iconColor="#059669"
            iconBg="#ECFDF5"
          />
          <StatCard
            title="Avg. CTR"
            value={formatPercent(summary.avgCtr)}
            subtitle="Click-through rate"
            icon={<BarChart2 size={14} />}
            iconColor="#D97706"
            iconBg="#FFFBEB"
          />
        </div>
      )}

      {/* Traffic chart + Health score */}
      {!gscLoading && trafficData.length > 0 && (
        <div className="grid gap-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription className="mt-0.5">
                    Clicks and impressions - last 28 days
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-3 rounded-sm bg-blue-500" />
                    Clicks
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-3 rounded-sm bg-violet-500" />
                    Impressions
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TrafficChart data={trafficData} height={200} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>SEO Health Score</CardTitle>
              <CardDescription className="mt-0.5">Overall site health</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-2">
              <ProgressRing
                value={78}
                size={112}
                strokeWidth={7}
                color="#3B82F6"
                trackColor="#E2E8F0"
                label={
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-mono)' }}>78</span>
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                }
              />

              <div className="w-full space-y-2">
                {[
                  { label: 'Technical', score: 85, color: '#10B981' },
                  { label: 'Content',   score: 72, color: '#3B82F6' },
                  { label: 'Backlinks', score: 68, color: '#F59E0B' },
                  { label: 'Speed',     score: 91, color: '#8B5CF6' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-14 text-right text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                      {item.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.score}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="w-7 text-[11px] tabular-nums text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="text-xs font-semibold"
                style={{ color: getHealthScoreColor(78) }}
              >
                {getHealthScoreLabel(78)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top keywords + Agent activity */}
      {!gscLoading && keywords.length > 0 && (
        <div className="grid gap-2 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Keywords</CardTitle>
                <a
                  href="/keywords"
                  className="text-xs font-medium text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  View all
                </a>
              </div>
              <CardDescription>Top 10 by clicks - last 28 days</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pb-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <DataTable<any>
                columns={keywordColumns}
                data={keywords}
                keyExtractor={(row: GscKeyword) => row.keyword}
                showRowNumbers
                className="border-none"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agent Activity</CardTitle>
                <a
                  href="/agents"
                  className="text-xs font-medium text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  View all
                </a>
              </div>
              <CardDescription>Recent automated runs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                  No agent runs yet. Configure agents in the Agents tab.
                </p>
                <a
                  href="/agents"
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Set up agents
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ranking distribution */}
      {!gscLoading && keywords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>Ranking Distribution</CardTitle>
                <CardDescription>
                  Keywords by position range - {keywords.length} total tracked
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                {rankingData.map((b) => (
                  <div
                    key={b.range}
                    className="flex items-center gap-1.5 text-[11px] text-slate-500"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    <span className="h-2 w-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
                    <span>
                      Pos {b.range}:{' '}
                      <span className="font-semibold text-slate-900" style={{ fontFamily: 'var(--font-mono)' }}>
                        {b.count}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RankingDistribution data={rankingData} height={170} />
          </CardContent>
        </Card>
      )}

      {/* Add business wizard */}
      <AddBusinessWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  )
}
