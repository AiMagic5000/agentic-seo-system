'use client'

import {
  MousePointerClick,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Bot,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Minus,
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
import { Sparkline } from '@/components/ui/sparkline'
import { ProgressRing } from '@/components/ui/progress-ring'
import { DataTable, type Column } from '@/components/ui/data-table'
import { TrafficChart, type TrafficDataPoint } from '@/components/charts/traffic-chart'
import { RankingDistribution, type RankingBucket } from '@/components/charts/ranking-distribution'
import { useClient } from '@/contexts/client-context'
import { formatNumber, formatPercent, formatPosition, getPositionColor } from '@/lib/utils'
import { getHealthScoreLabel, getHealthScoreColor } from '@/lib/constants'
import type { AgentRun } from '@/types'

function buildTrafficData(): TrafficDataPoint[] {
  const data: TrafficDataPoint[] = []
  const now = new Date()
  let clicks = 3200
  let impressions = 82000

  for (let i = 27; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    clicks = Math.max(800, clicks + Math.round((Math.random() - 0.42) * 480))
    impressions = Math.max(20000, impressions + Math.round((Math.random() - 0.42) * 9000))

    data.push({ date: label, clicks, impressions })
  }
  return data
}

const TRAFFIC_DATA = buildTrafficData()

const RANKING_DATA: RankingBucket[] = [
  { range: '1-3', count: 47, color: '#1e8e3e' },
  { range: '4-10', count: 183, color: '#1a73e8' },
  { range: '11-20', count: 219, color: '#f9ab00' },
  { range: '21-50', count: 312, color: '#e8710a' },
  { range: '51+', count: 523, color: '#d93025' },
]

const HEALTH_SCORE = 78

interface TopKeyword {
  keyword: string
  position: number
  trend: number[]
  clicks: number
  impressions: number
  ctr: number
}

const TOP_KEYWORDS: TopKeyword[] = [
  { keyword: 'business credit cards no personal guarantee', position: 3, trend: [8, 7, 6, 5, 4, 4, 3], clicks: 1842, impressions: 24300, ctr: 0.076 },
  { keyword: 'how to build business credit fast', position: 5, trend: [9, 8, 7, 6, 6, 5, 5], clicks: 1204, impressions: 18900, ctr: 0.064 },
  { keyword: 'llc formation guide', position: 2, trend: [4, 4, 3, 3, 2, 2, 2], clicks: 2310, impressions: 31200, ctr: 0.074 },
  { keyword: 'net 30 accounts for small business', position: 7, trend: [12, 11, 10, 9, 8, 7, 7], clicks: 893, impressions: 14600, ctr: 0.061 },
  { keyword: 'business bank account requirements', position: 4, trend: [7, 6, 6, 5, 5, 4, 4], clicks: 1567, impressions: 21800, ctr: 0.072 },
  { keyword: 'ein number application online', position: 1, trend: [2, 2, 1, 1, 1, 1, 1], clicks: 3420, impressions: 38500, ctr: 0.089 },
  { keyword: 'sba loan requirements 2024', position: 9, trend: [14, 13, 12, 11, 10, 9, 9], clicks: 712, impressions: 12400, ctr: 0.057 },
  { keyword: 'paydex score how to improve', position: 6, trend: [10, 9, 8, 7, 7, 6, 6], clicks: 944, impressions: 15700, ctr: 0.060 },
  { keyword: 'dba filing process', position: 11, trend: [16, 15, 14, 13, 12, 11, 11], clicks: 538, impressions: 9800, ctr: 0.055 },
  { keyword: 'business tradeline vendors', position: 8, trend: [13, 12, 11, 10, 9, 8, 8], clicks: 781, impressions: 13200, ctr: 0.059 },
]

interface RecentRun {
  id: string
  agentName: string
  status: AgentRun['status']
  timeAgo: string
  detail: string
}

const RECENT_RUNS: RecentRun[] = [
  { id: '1', agentName: 'Keyword Scout', status: 'completed', timeAgo: '12 min ago', detail: '48 new opportunities found' },
  { id: '2', agentName: 'Rank Tracker', status: 'completed', timeAgo: '1 hr ago', detail: 'Daily snapshot saved' },
  { id: '3', agentName: 'Content Optimizer', status: 'running', timeAgo: 'Just now', detail: 'Analyzing 14 pages...' },
  { id: '4', agentName: 'Technical Auditor', status: 'completed', timeAgo: '3 hr ago', detail: '7 issues flagged' },
  { id: '5', agentName: 'Competitor Watcher', status: 'failed', timeAgo: '5 hr ago', detail: 'API rate limit hit' },
  { id: '6', agentName: 'Report Generator', status: 'completed', timeAgo: '1 day ago', detail: 'Weekly PDF delivered' },
]

function AgentStatusBadge({ status }: { status: AgentRun['status'] }) {
  if (status === 'completed') {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 size={10} />
        Done
      </Badge>
    )
  }
  if (status === 'running') {
    return (
      <Badge variant="info" className="gap-1">
        <Loader2 size={10} className="animate-spin" />
        Running
      </Badge>
    )
  }
  if (status === 'failed') {
    return (
      <Badge variant="danger" className="gap-1">
        <AlertCircle size={10} />
        Failed
      </Badge>
    )
  }
  return <Badge variant="outline">{status}</Badge>
}

function getGscPositionColor(pos: number): string {
  if (pos <= 3) return 'text-[#1e8e3e]'
  if (pos <= 10) return 'text-[#1a73e8]'
  if (pos <= 20) return 'text-[#e37400]'
  return 'text-[#d93025]'
}

const keywordColumns: Column<TopKeyword>[] = [
  {
    key: 'keyword',
    label: 'Keyword',
    render: (row) => (
      <span className="max-w-[200px] truncate text-sm font-medium text-[#202124]">
        {row.keyword}
      </span>
    ),
  },
  {
    key: 'position',
    label: 'Position',
    align: 'center',
    render: (row) => (
      <div className="flex items-center justify-center gap-2">
        <span className={`text-sm font-bold tabular-nums ${getGscPositionColor(row.position)}`}>
          #{row.position}
        </span>
        <Sparkline
          data={row.trend}
          width={56}
          height={20}
          color={row.position <= 3 ? '#1e8e3e' : row.position <= 10 ? '#1a73e8' : '#e37400'}
        />
      </div>
    ),
  },
  {
    key: 'clicks',
    label: 'Clicks',
    align: 'right',
    render: (row) => (
      <span className="text-sm tabular-nums text-[#202124]">
        {formatNumber(row.clicks)}
      </span>
    ),
  },
  {
    key: 'impressions',
    label: 'Impr.',
    align: 'right',
    render: (row) => (
      <span className="text-sm tabular-nums text-[#5f6368]">
        {formatNumber(row.impressions)}
      </span>
    ),
  },
  {
    key: 'ctr',
    label: 'CTR',
    align: 'right',
    render: (row) => (
      <span className="text-sm tabular-nums text-[#5f6368]">
        {formatPercent(row.ctr)}
      </span>
    ),
  },
]

export default function DashboardPage() {
  const { currentClient, isLoading } = useClient()

  const clientName = isLoading
    ? 'Loading...'
    : currentClient?.name ?? 'your account'

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-[#202124]">Overview</h1>
        <p className="mt-1 text-sm text-[#5f6368]">
          SEO performance summary for{' '}
          <span className="font-medium text-[#202124]">{clientName}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Clicks"
          value={formatNumber(94_312)}
          change={12.4}
          subtitle="Last 28 days"
          icon={<MousePointerClick size={18} />}
        />
        <StatCard
          title="Total Impressions"
          value={formatNumber(1_824_500)}
          change={8.7}
          subtitle="Last 28 days"
          icon={<Eye size={18} />}
        />
        <StatCard
          title="Avg. Position"
          value={formatPosition(14.2)}
          change={-1.8}
          trend="up"
          subtitle="Improved from 16.0"
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          title="Avg. CTR"
          value={formatPercent(0.052)}
          change={3.1}
          subtitle="vs prior 28 days"
          icon={<BarChart2 size={18} />}
        />
      </div>

      {/* Traffic chart + Health score */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription className="mt-0.5">
                  Clicks and impressions -- last 28 days
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#80868b]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded-full bg-[#1a73e8]" />
                  Clicks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded-full bg-[#9334e6]" />
                  Impressions
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TrafficChart data={TRAFFIC_DATA} height={220} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>SEO Health Score</CardTitle>
            <CardDescription className="mt-0.5">Overall site health</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-4">
            <ProgressRing
              value={HEALTH_SCORE}
              size={128}
              strokeWidth={8}
              color="#1a73e8"
              trackColor="#e8eaed"
              label={
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-[#202124]">{HEALTH_SCORE}</span>
                  <span className="text-[10px] text-[#80868b]">/ 100</span>
                </div>
              }
            />

            <div className="w-full space-y-2.5">
              {[
                { label: 'Technical', score: 85, color: '#1e8e3e' },
                { label: 'Content', score: 72, color: '#1a73e8' },
                { label: 'Backlinks', score: 68, color: '#f9ab00' },
                { label: 'Speed', score: 91, color: '#9334e6' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-16 text-right text-xs text-[#5f6368]">{item.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8eaed]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.score}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="w-8 text-xs tabular-nums text-[#5f6368]">{item.score}</span>
                </div>
              ))}
            </div>

            <p className={`text-sm font-semibold ${getHealthScoreColor(HEALTH_SCORE)}`}>
              {getHealthScoreLabel(HEALTH_SCORE)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top keywords + Agent activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Top Keywords</CardTitle>
              <a
                href="/keywords"
                className="text-xs font-medium text-[#1a73e8] transition-colors hover:text-[#1557b0] cursor-pointer"
              >
                View all
              </a>
            </div>
            <CardDescription className="mt-0.5">
              Top 10 by clicks -- last 28 days
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <DataTable<any>
              columns={keywordColumns}
              data={TOP_KEYWORDS}
              keyExtractor={(row: TopKeyword) => row.keyword}
              showRowNumbers
              className="border-none"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Agent Activity</CardTitle>
              <a
                href="/agents"
                className="text-xs font-medium text-[#1a73e8] transition-colors hover:text-[#1557b0] cursor-pointer"
              >
                View all
              </a>
            </div>
            <CardDescription className="mt-0.5">Recent automated runs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 p-0 pb-3">
            {RECENT_RUNS.map((run) => (
              <div
                key={run.id}
                className="flex items-start gap-3 px-5 py-2.5 transition-colors hover:bg-[#f8f9fa] cursor-pointer"
              >
                <div className="mt-0.5 flex-shrink-0 rounded-md bg-[#e8f0fe] p-1.5 text-[#1a73e8]">
                  <Bot size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#202124]">
                    {run.agentName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#5f6368]">{run.detail}</p>
                </div>
                <div className="flex-shrink-0 space-y-1 text-right">
                  <AgentStatusBadge status={run.status} />
                  <p className="text-[10px] text-[#80868b]">{run.timeAgo}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ranking distribution */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ranking Distribution</CardTitle>
              <CardDescription className="mt-0.5">
                Keywords by position range -- {RANKING_DATA.reduce((s, d) => s + d.count, 0).toLocaleString()} total tracked
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              {RANKING_DATA.map((b) => (
                <div key={b.range} className="flex items-center gap-1.5 text-xs text-[#5f6368]">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: b.color }}
                  />
                  <span>
                    Pos {b.range}: <span className="font-semibold text-[#202124]">{b.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RankingDistribution data={RANKING_DATA} height={180} />
        </CardContent>
      </Card>
    </div>
  )
}
