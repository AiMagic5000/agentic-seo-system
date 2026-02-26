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
  Users,
  FileText,
  Timer,
  ArrowUpRight,
  ExternalLink,
  MapPin,
  Megaphone,
  DollarSign,
  Target,
  Pause,
  Play,
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
import { DataTable, type Column } from '@/components/ui/data-table'
import {
  TrafficChart,
  type TrafficDataPoint,
} from '@/components/charts/traffic-chart'
import {
  VisitorsChart,
  type VisitorDataPoint,
} from '@/components/charts/visitors-chart'
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

interface UmamiSummary {
  pageviews: number
  visitors: number
  visits: number
  bounceRate: number
  avgDuration: number
}

interface UmamiDailyEntry {
  date: string
  value: number
}

interface UmamiMetric {
  x: string
  y: number
}

interface UmamiData {
  summary: UmamiSummary
  daily: {
    pageviews: UmamiDailyEntry[]
    sessions: UmamiDailyEntry[]
  }
  topReferrers: UmamiMetric[]
  topPages: UmamiMetric[]
  topCountries: UmamiMetric[]
  devices: UmamiMetric[]
  domain: string
}

// ---------------------------------------------------------------------------
// Google Ads types
// ---------------------------------------------------------------------------

interface AdsCampaign {
  id: string
  name: string
  status: string
  channelType: string
  budgetMicros: string
  impressions: number
  clicks: number
  costMicros: number
  conversions: number
  ctr: number
  avgCpc: number
}

interface AdsSummary {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  avgCtr: number
  activeCampaigns: number
  pausedCampaigns: number
}

interface AdsData {
  campaigns: AdsCampaign[]
  summary: AdsSummary
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

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
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

  // GSC state
  const [gscData, setGscData] = useState<GscData | null>(null)
  const [gscLoading, setGscLoading] = useState(false)
  const [gscError, setGscError] = useState<string | null>(null)
  const [gscEmpty, setGscEmpty] = useState(false)

  // Audit state
  const [auditScore, setAuditScore] = useState<number | null>(null)
  const [auditStats, setAuditStats] = useState<Record<string, number> | null>(null)

  // Umami state
  const [umamiData, setUmamiData] = useState<UmamiData | null>(null)
  const [umamiLoading, setUmamiLoading] = useState(false)

  // Google Ads state
  const [adsData, setAdsData] = useState<AdsData | null>(null)
  const [adsLoading, setAdsLoading] = useState(false)

  const [wizardOpen, setWizardOpen] = useState(false)

  const fetchData = useCallback(async (clientId: string) => {
    // Fetch GSC and Umami in parallel
    setGscLoading(true)
    setUmamiLoading(true)
    setGscError(null)
    setGscEmpty(false)

    const gscPromise = fetch(`/api/gsc/summary?clientId=${clientId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setGscData(json.data)
        } else if (json.empty) {
          setGscEmpty(true)
          setGscData(null)
        } else {
          setGscError(json.error || 'Failed to fetch GSC data')
        }
      })
      .catch(() => {
        setGscError('Failed to connect to the server.')
      })
      .finally(() => setGscLoading(false))

    const umamiPromise = fetch(`/api/analytics/summary?clientId=${clientId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setUmamiData(json.data)
        } else {
          setUmamiData(null)
        }
      })
      .catch(() => {
        setUmamiData(null)
      })
      .finally(() => setUmamiLoading(false))

    // Fetch latest audit score for this client
    fetch(`/api/reports/summary?clientId=${clientId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.latestScan?.results) {
          const results = json.data.latestScan.results
          setAuditScore(results.score ?? null)
          setAuditStats(results.stats ?? null)
        }
      })
      .catch(() => {
        // silent fail
      })

    // Fetch Google Ads data (account-wide, not per-client)
    setAdsLoading(true)
    const adsPromise = fetch('/api/campaigns')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setAdsData(json.data)
        } else {
          setAdsData(null)
        }
      })
      .catch(() => {
        setAdsData(null)
      })
      .finally(() => setAdsLoading(false))

    await Promise.all([gscPromise, umamiPromise, adsPromise])
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      setGscData(null)
      setUmamiData(null)
      fetchData(currentClient.id)
    }
  }, [currentClient?.id, fetchData])

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
  const hasGscData = summary && (summary.clicks > 0 || summary.impressions > 0)
  const umamiSummary = umamiData?.summary

  // GSC traffic chart data
  const gscTrafficData: TrafficDataPoint[] = (gscData?.trafficByDate ?? []).map(
    (d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      clicks: d.clicks,
      impressions: d.impressions,
    })
  )

  // Umami visitors chart data
  const umamiChartData: VisitorDataPoint[] = (() => {
    if (!umamiData?.daily?.pageviews) return []
    const pvMap = new Map<string, number>()
    const sessMap = new Map<string, number>()
    for (const entry of umamiData.daily.pageviews) {
      const key = new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      pvMap.set(key, entry.value)
    }
    for (const entry of umamiData.daily.sessions ?? []) {
      const key = new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      sessMap.set(key, entry.value)
    }
    return Array.from(pvMap.entries()).map(([date, pv]) => ({
      date,
      pageviews: pv,
      visitors: sessMap.get(date) ?? 0,
    }))
  })()

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

  const isLoading = gscLoading || umamiLoading || adsLoading

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
            {(gscData?.domain || currentClient?.domain) && (
              <span className="ml-1 text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
                ({gscData?.domain || currentClient?.domain})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <SkeletonChart height={240} />
        </div>
      )}

      {/* GSC error */}
      {gscError && !gscLoading && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800" style={{ fontFamily: 'var(--font-sans)' }}>
          {gscError}
        </div>
      )}

      {/* GSC not configured */}
      {gscEmpty && !gscLoading && !umamiData && (
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

      {/* ----------------------------------------------------------------- */}
      {/* Website Traffic (Umami) — always shown when data exists           */}
      {/* ----------------------------------------------------------------- */}
      {!isLoading && umamiSummary && (
        <>
          {/* Section label */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
              Website Traffic
            </p>
            <span className="text-[10px] text-slate-300" style={{ fontFamily: 'var(--font-sans)' }}>
              Last 28 days
            </span>
          </div>

          {/* Umami stat cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Visitors"
              value={formatNumber(umamiSummary.visitors)}
              subtitle="Unique visitors"
              icon={<Users size={14} />}
              iconColor="#10B981"
              iconBg="#ECFDF5"
            />
            <StatCard
              title="Pageviews"
              value={formatNumber(umamiSummary.pageviews)}
              subtitle="Total page views"
              icon={<FileText size={14} />}
              iconColor="#3B82F6"
              iconBg="#EFF6FF"
            />
            <StatCard
              title="Bounce Rate"
              value={formatPercent(umamiSummary.bounceRate)}
              subtitle="Single page visits"
              icon={<ArrowUpRight size={14} />}
              iconColor="#F59E0B"
              iconBg="#FFFBEB"
            />
            <StatCard
              title="Avg Duration"
              value={formatDuration(umamiSummary.avgDuration)}
              subtitle="Per session"
              icon={<Timer size={14} />}
              iconColor="#8B5CF6"
              iconBg="#F5F3FF"
            />
          </div>

          {/* Visitors chart + Top referrers */}
          {umamiChartData.length > 0 && (
            <div className="grid gap-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Visitors & Pageviews</CardTitle>
                      <CardDescription className="mt-0.5">
                        Daily traffic - last 28 days
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500" />
                        Visitors
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-3 rounded-sm bg-blue-500" />
                        Pageviews
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <VisitorsChart data={umamiChartData} height={200} />
                </CardContent>
              </Card>

              {/* Top Referrers */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Top Referrers</CardTitle>
                  <CardDescription className="mt-0.5">Where visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                  {umamiData?.topReferrers && umamiData.topReferrers.length > 0 ? (
                    <div className="space-y-2">
                      {umamiData.topReferrers.slice(0, 8).map((ref) => (
                        <div key={ref.x} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <ExternalLink size={10} className="flex-shrink-0 text-slate-300" />
                            <span
                              className="truncate text-xs text-slate-700"
                              style={{ fontFamily: 'var(--font-sans)' }}
                              title={ref.x || '(direct)'}
                            >
                              {ref.x || '(direct)'}
                            </span>
                          </div>
                          <span
                            className="flex-shrink-0 text-xs font-semibold tabular-nums text-slate-900"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {formatNumber(ref.y)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                      No referrer data yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Pages + Countries/Devices */}
          <div className="grid gap-2 lg:grid-cols-2">
            {/* Top Pages */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Top Pages</CardTitle>
                <CardDescription className="mt-0.5">Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                {umamiData?.topPages && umamiData.topPages.length > 0 ? (
                  <div className="space-y-2">
                    {umamiData.topPages.slice(0, 8).map((page, i) => (
                      <div key={page.x} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className="flex-shrink-0 w-4 text-right text-[10px] font-medium text-slate-400 tabular-nums"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {i + 1}
                          </span>
                          <span
                            className="truncate text-xs text-slate-700"
                            style={{ fontFamily: 'var(--font-mono)' }}
                            title={page.x}
                          >
                            {page.x}
                          </span>
                        </div>
                        <span
                          className="flex-shrink-0 text-xs font-semibold tabular-nums text-slate-900"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {formatNumber(page.y)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                    No page data yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Countries + Devices */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Audience</CardTitle>
                <CardDescription className="mt-0.5">Countries and devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Countries */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                      Countries
                    </p>
                    {umamiData?.topCountries && umamiData.topCountries.length > 0 ? (
                      <div className="space-y-1.5">
                        {umamiData.topCountries.slice(0, 5).map((c) => (
                          <div key={c.x} className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin size={10} className="flex-shrink-0 text-slate-300" />
                              <span className="truncate text-xs text-slate-600" style={{ fontFamily: 'var(--font-sans)' }}>
                                {c.x || 'Unknown'}
                              </span>
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-slate-800" style={{ fontFamily: 'var(--font-mono)' }}>
                              {formatNumber(c.y)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No data</p>
                    )}
                  </div>

                  {/* Devices */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                      Devices
                    </p>
                    {umamiData?.devices && umamiData.devices.length > 0 ? (
                      <div className="space-y-1.5">
                        {umamiData.devices.slice(0, 5).map((d) => {
                          const total = umamiData.devices.reduce((s, x) => s + x.y, 0)
                          const pct = total > 0 ? Math.round((d.y / total) * 100) : 0
                          return (
                            <div key={d.x} className="flex items-center justify-between gap-1">
                              <span className="text-xs text-slate-600 capitalize" style={{ fontFamily: 'var(--font-sans)' }}>
                                {d.x || 'Unknown'}
                              </span>
                              <span className="text-xs font-semibold tabular-nums text-slate-800" style={{ fontFamily: 'var(--font-mono)' }}>
                                {pct}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Search Performance (GSC) — shown when GSC has data               */}
      {/* ----------------------------------------------------------------- */}
      {!isLoading && summary && (
        <>
          {/* Section label */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
              Search Performance
            </p>
            <span className="text-[10px] text-slate-300" style={{ fontFamily: 'var(--font-sans)' }}>
              Google Search Console - Last 28 days
            </span>
          </div>

          {/* GSC connected but no search data */}
          {!hasGscData && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 text-center">
              <p className="text-sm font-medium text-blue-800 mb-0.5" style={{ fontFamily: 'var(--font-sans)' }}>
                GSC is connected for {clientName}
              </p>
              <p className="text-xs text-blue-600" style={{ fontFamily: 'var(--font-sans)' }}>
                No search data in the last 28 days. Data will appear as Google indexes this site.
              </p>
            </div>
          )}

          {/* GSC stat cards — only when data exists */}
          {hasGscData && (
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

          {/* GSC traffic chart + Health score */}
          {hasGscData && gscTrafficData.length > 0 && (
            <div className="grid gap-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Search Traffic</CardTitle>
                      <CardDescription className="mt-0.5">
                        Clicks and impressions from Google
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
                  <TrafficChart data={gscTrafficData} height={200} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>SEO Health Score</CardTitle>
                  <CardDescription className="mt-0.5">Overall site health</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 pt-2">
                  {(() => {
                    const score = auditScore ?? 78
                    const stats = auditStats ?? {}
                    // Derive category scores from audit stats
                    const criticalPenalty = (stats.critical ?? 0) * 15
                    const highPenalty = (stats.high ?? 0) * 10
                    const mediumPenalty = (stats.medium ?? 0) * 5
                    const technicalScore = Math.max(0, 100 - criticalPenalty - Math.floor(highPenalty / 2))
                    const contentScore = Math.max(0, 100 - mediumPenalty - Math.floor(highPenalty / 2))
                    const backlinksScore = Math.min(100, 60 + (summary?.clicks ?? 0 > 100 ? 20 : 0) + (summary?.impressions ?? 0 > 1000 ? 20 : 0))
                    const speedScore = score >= 90 ? 95 : score >= 70 ? 85 : score >= 50 ? 70 : 50

                    return (
                      <>
                        <ProgressRing
                          value={score}
                          size={112}
                          strokeWidth={7}
                          color={score >= 80 ? '#10B981' : score >= 60 ? '#3B82F6' : '#F59E0B'}
                          trackColor="#E2E8F0"
                          label={
                            <div className="flex flex-col items-center">
                              <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-mono)' }}>{score}</span>
                              <span className="text-[10px] text-slate-400">/ 100</span>
                            </div>
                          }
                        />

                        <div className="w-full space-y-2">
                          {[
                            { label: 'Technical', score: technicalScore, color: '#10B981' },
                            { label: 'Content', score: contentScore, color: '#3B82F6' },
                            { label: 'Backlinks', score: backlinksScore, color: '#F59E0B' },
                            { label: 'Speed', score: speedScore, color: '#8B5CF6' },
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
                          style={{ color: getHealthScoreColor(score) }}
                        >
                          {getHealthScoreLabel(score)}
                        </p>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top keywords + Agent activity */}
          {hasGscData && keywords.length > 0 && (
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
          {hasGscData && keywords.length > 0 && (
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
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Google Ads Campaigns                                              */}
      {/* ----------------------------------------------------------------- */}
      {!isLoading && adsData && adsData.campaigns.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
              Google Ads
            </p>
            <span className="text-[10px] text-slate-300" style={{ fontFamily: 'var(--font-sans)' }}>
              Last 30 days
            </span>
          </div>

          {/* Ads stat cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Ad Clicks"
              value={formatNumber(adsData.summary.totalClicks)}
              subtitle={`${adsData.summary.activeCampaigns} active campaigns`}
              icon={<MousePointerClick size={14} />}
              iconColor="#F59E0B"
              iconBg="#FFFBEB"
            />
            <StatCard
              title="Impressions"
              value={formatNumber(adsData.summary.totalImpressions)}
              subtitle="Total ad views"
              icon={<Eye size={14} />}
              iconColor="#8B5CF6"
              iconBg="#F5F3FF"
            />
            <StatCard
              title="Ad Spend"
              value={`$${adsData.summary.totalCost.toFixed(2)}`}
              subtitle="Last 30 days"
              icon={<DollarSign size={14} />}
              iconColor="#EF4444"
              iconBg="#FEF2F2"
            />
            <StatCard
              title="Conversions"
              value={formatNumber(adsData.summary.totalConversions)}
              subtitle={`CTR: ${adsData.summary.avgCtr.toFixed(2)}%`}
              icon={<Target size={14} />}
              iconColor="#10B981"
              iconBg="#ECFDF5"
            />
          </div>

          {/* Campaign list */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone size={14} className="text-amber-500" />
                  <CardTitle>Campaigns</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="gap-1">
                    <Play size={9} />
                    {adsData.summary.activeCampaigns} Active
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Pause size={9} />
                    {adsData.summary.pausedCampaigns} Paused
                  </Badge>
                </div>
              </div>
              <CardDescription>
                All campaigns in Google Ads account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adsData.campaigns
                  .filter((c) => c.impressions > 0 || c.status === 'ENABLED')
                  .slice(0, 10)
                  .map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            campaign.status === 'ENABLED'
                              ? 'bg-emerald-50 text-emerald-600'
                              : campaign.status === 'PAUSED'
                                ? 'bg-slate-100 text-slate-400'
                                : 'bg-red-50 text-red-400'
                          }`}
                        >
                          {campaign.status === 'ENABLED' ? (
                            <Play size={12} />
                          ) : (
                            <Pause size={12} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium text-slate-800 truncate"
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {campaign.name}
                          </p>
                          <p
                            className="text-[11px] text-slate-400"
                            style={{ fontFamily: 'var(--font-sans)' }}
                          >
                            {campaign.channelType.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p
                            className="text-xs font-semibold text-slate-800 tabular-nums"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {formatNumber(campaign.clicks)}
                          </p>
                          <p className="text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                            clicks
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-xs font-semibold text-slate-800 tabular-nums"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {formatNumber(campaign.impressions)}
                          </p>
                          <p className="text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                            impr
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-xs font-semibold text-slate-800 tabular-nums"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            ${(campaign.costMicros / 1_000_000).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                            spend
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add business wizard */}
      <AddBusinessWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  )
}
