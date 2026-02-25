'use client'

import * as React from 'react'
import {
  BarChart3,
  FileText,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Sparkles,
  Calendar,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Activity,
  Eye,
  Loader2,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useClient } from '@/contexts/client-context'
import { cn, formatNumber } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DateRange   = '7d' | '28d' | '3m' | '6m'
type ReportType  = 'Weekly' | 'Monthly' | 'Custom'
type ReportStatus = 'Ready' | 'Generating' | 'Scheduled'

interface AgentActivity {
  agentName: string
  agentId: string
  color: string
  action: string
  findings: string
}

interface MockReport {
  id: string
  title: string
  generatedAt: string
  aiModel: string
  type: ReportType
  status: ReportStatus
  summaryPreview: string
  metrics: {
    clicks: number
    clicksChange: number
    impressions: number
    impressionsChange: number
    positionChange: number
    avgPosition: number
  }
  detail: {
    executiveSummary: string
    wins: string[]
    concerns: string[]
    recommendations: string[]
    agentActivity: AgentActivity[]
  }
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_REPORTS: MockReport[] = [
  {
    id: 'rpt-001',
    title: 'Weekly Performance Report - Feb 17-24, 2026',
    generatedAt: '2026-02-24T10:12:00Z',
    aiModel: 'Claude 3.5 Sonnet',
    type: 'Weekly',
    status: 'Ready',
    summaryPreview: 'Organic clicks climbed 18.4% week-over-week driven by a surge in long-tail informational queries around business formation and credit topics. Three target keywords broke into the top 10 for the first time. One technical issue flagged on the mobile checkout flow may be suppressing conversion-stage traffic.',
    metrics: { clicks: 4821, clicksChange: 18.4, impressions: 142300, impressionsChange: 11.2, positionChange: -1.3, avgPosition: 8.7 },
    detail: {
      executiveSummary: 'The week of February 17-24 produced the strongest organic performance of Q1 2026. Clicks reached 4,821 — a gain of 18.4% compared to the prior week — while average position improved from 10.0 to 8.7. The keyword-scout agent identified 34 new long-tail opportunities, 8 of which have already been promoted to tracked status.',
      wins: [
        '"how to build business credit fast" moved from position 14 to position 7, generating 312 new clicks.',
        'Impressions for the business formation cluster grew 28% after a content refresh last Monday.',
        'Three pages crossed the 100-click/week threshold for the first time.',
        'CTR on the featured snippet for "what is a DUNS number" improved to 8.3%.',
        'Competitor Watcher flagged that FinancedByUs.com lost top-3 positions on 6 shared keywords.',
      ],
      concerns: [
        'Mobile LCP on /checkout degraded from 2.1s to 4.4s following the Shopify theme update on Feb 19.',
        '"business credit cards for startups" slipped from position 5 to position 9 after a competitor published a 4,200-word comparison guide.',
        'Click-through rate on /sba-loans dropped 1.8 percentage points.',
        'Crawl depth issue: 14 pages beyond 3 clicks from the homepage are receiving zero impressions.',
      ],
      recommendations: [
        'Immediately roll back the Shopify theme change or isolate the LCP regression.',
        'Publish a 3,500+ word comparison guide for "business credit cards for startups".',
        'Update meta descriptions on /sba-loans and /invoice-factoring using CTR-optimized templates.',
        'Add internal links from the homepage to the 14 deep pages to resolve crawl depth issues.',
      ],
      agentActivity: [
        { agentName: 'Keyword Scout',    agentId: 'keyword-scout',      color: '#3B82F6', action: 'Ran GSC query mining + ATP batch',           findings: '34 new opportunities discovered, 8 promoted to tracked' },
        { agentName: 'Rank Tracker',     agentId: 'rank-tracker',       color: '#10B981', action: 'Daily position snapshots for 287 keywords',  findings: '3 keywords entered top 10, 2 keywords dropped 5+ positions' },
        { agentName: 'Technical Auditor',agentId: 'technical-auditor',  color: '#F59E0B', action: 'Full site crawl completed',                  findings: '1 critical issue (mobile LCP), 4 warnings, 11 informational' },
        { agentName: 'Competitor Watcher',agentId:'competitor-watcher', color: '#EF4444', action: 'Monitored 5 competitors across 287 keywords', findings: 'Competitor FinancedByUs.com lost 6 top-3 positions' },
      ],
    },
  },
  {
    id: 'rpt-002',
    title: 'Weekly Performance Report - Feb 10-17, 2026',
    generatedAt: '2026-02-17T10:08:00Z',
    aiModel: 'Claude 3.5 Sonnet',
    type: 'Weekly',
    status: 'Ready',
    summaryPreview: 'A content refresh campaign on 8 core landing pages delivered measurable position gains across commercial-intent keywords. Schema markup additions on 3 pages triggered featured snippet appearances for the first time.',
    metrics: { clicks: 4073, clicksChange: 7.1, impressions: 127900, impressionsChange: 5.8, positionChange: -0.8, avgPosition: 9.5 },
    detail: {
      executiveSummary: 'Week of February 10-17 showed steady incremental gains. Eight core pages were updated with expanded FAQ sections and improved internal linking, resulting in an average position improvement of 0.8.',
      wins: [
        'FAQ schema additions on 3 pages triggered featured snippet appearances, generating 241 incremental clicks.',
        '"How to get business credit" improved from position 11 to position 8 after content expansion.',
        'The /equipment-financing page crossed 200 weekly clicks for the first time.',
        'Zero critical technical issues flagged for the second consecutive week.',
      ],
      concerns: [
        'Average position for the business banking cluster remains above 15 despite two content refreshes.',
        'Six pages have duplicate H1 tags introduced during the theme migration.',
        'Impressions for branded queries dropped 4.2%.',
      ],
      recommendations: [
        'Audit and resolve the 6 duplicate H1 tags before they compound into indexing issues.',
        'Build topical authority in the business banking cluster with 2-3 supporting articles.',
        'Investigate the branded impressions drop with a GSC query segmentation.',
      ],
      agentActivity: [
        { agentName: 'Content Optimizer', agentId: 'content-optimizer', color: '#8B5CF6', action: 'Analyzed 8 refreshed pages + generated 12 new briefs', findings: 'Average content score improved from 61 to 74' },
        { agentName: 'Rank Tracker',      agentId: 'rank-tracker',      color: '#10B981', action: 'Daily snapshots for 287 keywords',                    findings: '1 keyword entered top 10, featured snippets on 2 pages' },
      ],
    },
  },
  {
    id: 'rpt-003',
    title: 'Monthly Performance Report - January 2026',
    generatedAt: '2026-02-01T09:00:00Z',
    aiModel: 'Claude 3.5 Sonnet',
    type: 'Monthly',
    status: 'Ready',
    summaryPreview: 'January 2026 marked the strongest organic month on record with clicks up 31% year-over-year. The agentic system discovered 187 new keyword opportunities, published 6 AI-assisted briefs, and resolved 23 technical issues.',
    metrics: { clicks: 16840, clicksChange: 31.0, impressions: 498200, impressionsChange: 24.7, positionChange: -2.6, avgPosition: 9.8 },
    detail: {
      executiveSummary: 'January 2026 was a record-breaking month. Total clicks reached 16,840 — a 31% year-over-year improvement — while average tracked keyword position improved 2.6 places from 12.4 to 9.8.',
      wins: [
        'Record monthly clicks (16,840) — a 31% YoY improvement and 12% MoM improvement.',
        'Average position for top 50 keywords improved from 12.4 to 9.8 over the month.',
        '187 new keyword opportunities identified via the automated ATP and GSC pipeline.',
        '23 technical issues resolved including 4 canonical mismatches and 11 broken internal links.',
        '"business credit score" entered the top 5 for the first time.',
      ],
      concerns: [
        'Page speed scores declined slightly on mobile following plugin updates in mid-January.',
        'Three high-priority content briefs remain unpublished.',
        'Backlink acquisition rate slowed — only 3 new referring domains in January.',
      ],
      recommendations: [
        'Prioritize the 3 unpublished high-priority briefs to capture position before competitors.',
        'Launch a link-building campaign targeting business finance resource pages.',
        'Run a mobile performance audit focused on plugin-introduced render-blocking resources.',
      ],
      agentActivity: [
        { agentName: 'Keyword Scout',    agentId: 'keyword-scout',     color: '#3B82F6', action: 'Ran 31 daily GSC queries + 8 ATP batches', findings: '187 new opportunities found, 42 promoted to tracked' },
        { agentName: 'Rank Tracker',     agentId: 'rank-tracker',      color: '#10B981', action: '31 daily snapshots for 287 keywords',      findings: '11 keywords entered top 10 in January' },
        { agentName: 'Technical Auditor',agentId: 'technical-auditor', color: '#F59E0B', action: 'Completed 4 full crawls',                  findings: '23 issues resolved' },
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function MetricChange({ value, change, label, invertColor = false }: { value: string | number; change: number; label: string; invertColor?: boolean }) {
  const isPositive = invertColor ? change < 0 : change > 0
  const isNeutral  = change === 0
  const colorClass = isNeutral ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-500'
  const arrow      = isNeutral ? '--' : isPositive ? '↑' : '↓'

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>{label}</p>
      <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
      <p className={cn('text-xs font-medium', colorClass)} style={{ fontFamily: 'var(--font-sans)' }}>
        {arrow} {Math.abs(change).toFixed(1)}%
      </p>
    </div>
  )
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  if (status === 'Ready')      return <Badge variant="success">Ready</Badge>
  if (status === 'Generating') return <Badge variant="warning"><Loader2 size={9} className="animate-spin" />Generating</Badge>
  return <Badge variant="default">Scheduled</Badge>
}

function ReportTypeBadge({ type }: { type: ReportType }) {
  if (type === 'Monthly') return <Badge variant="gold">Monthly</Badge>
  if (type === 'Custom')  return <Badge variant="info">Custom</Badge>
  return <Badge variant="outline">Weekly</Badge>
}

function AgentActivityRow({ agent }: { agent: AgentActivity }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${agent.color}1a`, border: `1px solid ${agent.color}33` }}
      >
        <Bot size={11} style={{ color: agent.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>{agent.agentName}</p>
        <p className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>{agent.action}</p>
        <p className="mt-0.5 text-xs text-slate-600" style={{ fontFamily: 'var(--font-sans)' }}>{agent.findings}</p>
      </div>
      <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-500" />
    </div>
  )
}

function ReportDetail({ report }: { report: MockReport }) {
  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      {/* Executive Summary */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <FileText size={13} className="text-blue-600" />
          <h4 className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>Executive Summary</h4>
        </div>
        <p className="text-xs leading-relaxed text-slate-600" style={{ fontFamily: 'var(--font-sans)' }}>
          {report.detail.executiveSummary}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Key Wins */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={13} className="text-emerald-500" />
            <h4 className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>Key Wins</h4>
          </div>
          <ul className="space-y-1">
            {report.detail.wins.map((win, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600" style={{ fontFamily: 'var(--font-sans)' }}>
                <span className="mt-0.5 shrink-0 font-bold text-emerald-500">+</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas of Concern */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={13} className="text-amber-500" />
            <h4 className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>Areas of Concern</h4>
          </div>
          <ul className="space-y-1">
            {report.detail.concerns.map((concern, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600" style={{ fontFamily: 'var(--font-sans)' }}>
                <span className="mt-0.5 shrink-0 font-bold text-amber-500">!</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Lightbulb size={13} className="text-amber-500" />
          <h4 className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>AI Recommendations</h4>
        </div>
        <ol className="space-y-1">
          {report.detail.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600" style={{ fontFamily: 'var(--font-sans)' }}>
              <span className="shrink-0 font-semibold text-amber-500">{i + 1}.</span>
              <span>{rec}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Agent Activity */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Activity size={13} className="text-violet-500" />
          <h4 className="text-xs font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>Agent Activity</h4>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {report.detail.agentActivity.map((agent) => (
            <AgentActivityRow key={agent.agentId} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ReportCard({ report }: { report: MockReport }) {
  const [expanded, setExpanded] = React.useState(false)

  const generatedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <Card className="overflow-hidden transition-all duration-200">
      <CardContent className="p-0">
        <div className="p-4">
          {/* Top row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>
                {report.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                <span className="flex items-center gap-1"><Calendar size={10} />Generated {generatedDate}</span>
                <span className="text-slate-200">·</span>
                <span className="flex items-center gap-1"><Sparkles size={10} className="text-amber-400" />{report.aiModel}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <ReportTypeBadge type={report.type} />
              <ReportStatusBadge status={report.status} />
            </div>
          </div>

          {/* Preview */}
          <p className="mt-3 text-xs leading-relaxed text-slate-600" style={{ fontFamily: 'var(--font-sans)' }}>
            {report.summaryPreview}
          </p>

          {/* Metrics row */}
          <div className="mt-3 flex flex-wrap gap-5 border-t border-slate-100 pt-3">
            <MetricChange
              label="Clicks"
              value={formatNumber(report.metrics.clicks)}
              change={report.metrics.clicksChange}
            />
            <MetricChange
              label="Impressions"
              value={formatNumber(report.metrics.impressions)}
              change={report.metrics.impressionsChange}
            />
            <MetricChange
              label="Avg Position"
              value={`#${report.metrics.avgPosition}`}
              change={report.metrics.positionChange}
              invertColor
            />
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-1.5"
            >
              {expanded ? (
                <><ChevronUp size={12} />Collapse</>
              ) : (
                <><Eye size={12} />View Full Report</>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Download size={12} />PDF
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Share2 size={12} />Share
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="px-4 pb-4">
            <ReportDetail report={report} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Date range selector
// ---------------------------------------------------------------------------
const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: '7d', value: '7d' },
  { label: '28d', value: '28d' },
  { label: '3m', value: '3m' },
  { label: '6m', value: '6m' },
]

function DateRangeSelector({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {DATE_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={cn(
            'rounded px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer',
            value === range.value
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          )}
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReportsPage() {
  const { isLoading: clientLoading, hasNoBusiness } = useClient()
  const [dateRange, setDateRange] = React.useState<DateRange>('28d')

  if (hasNoBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-5">
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No website connected"
          description="Add your first website to start receiving AI-generated performance reports."
          size="lg"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Reports
          </h1>
          <p
            className="mt-0.5 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            AI-generated performance reports across all tracked clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <Button variant="amber" size="sm" className="gap-1.5">
            <BarChart3 size={13} />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report cards */}
      {clientLoading ? (
        <div className="space-y-3">
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
          <SkeletonCard className="h-36" />
        </div>
      ) : (
        <div className="space-y-3">
          {MOCK_REPORTS.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
