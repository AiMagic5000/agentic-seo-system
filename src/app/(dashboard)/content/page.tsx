'use client'

import * as React from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  Rocket,
  PlusCircle,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressRing } from '@/components/ui/progress-ring'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { timeAgo, truncateUrl } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BriefStatus = 'draft' | 'approved' | 'implemented' | 'rejected'
type KeywordIntent = 'informational' | 'transactional' | 'commercial' | 'navigational'

interface ContentBriefItem {
  id: string
  title: string
  targetUrl: string
  targetKeyword: string
  intent: KeywordIntent
  contentScore: number
  status: BriefStatus
  wordCountTarget: number
  createdAt: string
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_BRIEFS: ContentBriefItem[] = [
  {
    id: '1',
    title: 'How to Build Business Credit Without a Personal Guarantee in 2025',
    targetUrl: 'https://startmybusiness.us/business-credit-no-personal-guarantee',
    targetKeyword: 'business credit no personal guarantee',
    intent: 'commercial',
    contentScore: 72,
    status: 'draft',
    wordCountTarget: 2400,
    createdAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  },
  {
    id: '2',
    title: 'Best Net-30 Vendor Accounts for New LLCs (No PG Required)',
    targetUrl: 'https://startmybusiness.us/net-30-accounts-new-llc',
    targetKeyword: 'net 30 accounts for new business',
    intent: 'commercial',
    contentScore: 88,
    status: 'approved',
    wordCountTarget: 1800,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: '3',
    title: 'What Is a PAYDEX Score? Complete Guide for Business Owners',
    targetUrl: 'https://startmybusiness.us/paydex-score-guide',
    targetKeyword: 'what is a paydex score',
    intent: 'informational',
    contentScore: 65,
    status: 'draft',
    wordCountTarget: 2100,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: '4',
    title: 'EIN-Only Business Credit Cards: Apply Without SSN in 2025',
    targetUrl: 'https://startmybusiness.us/business-credit-cards-ein-only',
    targetKeyword: 'business credit cards ein only no ssn',
    intent: 'transactional',
    contentScore: 91,
    status: 'implemented',
    wordCountTarget: 2800,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: '5',
    title: 'How Long Does It Take to Build Business Credit? Timeline Guide',
    targetUrl: 'https://startmybusiness.us/how-long-build-business-credit',
    targetKeyword: 'how long to build business credit',
    intent: 'informational',
    contentScore: 58,
    status: 'rejected',
    wordCountTarget: 1600,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
  },
  {
    id: '6',
    title: 'Uline Net 30 Account Review: Is It Worth It for Your Business?',
    targetUrl: 'https://startmybusiness.us/uline-net-30-review',
    targetKeyword: 'uline net 30 account review',
    intent: 'commercial',
    contentScore: 79,
    status: 'draft',
    wordCountTarget: 1400,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: '7',
    title: 'D-U-N-S Number: How to Get One Free and Why Every Business Needs It',
    targetUrl: 'https://startmybusiness.us/duns-number-guide',
    targetKeyword: 'how to get duns number free',
    intent: 'informational',
    contentScore: 83,
    status: 'approved',
    wordCountTarget: 1900,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: '8',
    title: 'SBA Loan Requirements 2025: What You Need to Qualify',
    targetUrl: 'https://startmybusiness.us/sba-loan-requirements-2025',
    targetKeyword: 'sba loan requirements 2025',
    intent: 'transactional',
    contentScore: 94,
    status: 'implemented',
    wordCountTarget: 3200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
]

// ---------------------------------------------------------------------------
// Filter tabs config
// ---------------------------------------------------------------------------

type FilterTab = 'all' | BriefStatus

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Approved', value: 'approved' },
  { label: 'Implemented', value: 'implemented' },
  { label: 'Rejected', value: 'rejected' },
]

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

function getStatusBadgeVariant(
  status: BriefStatus
): 'default' | 'success' | 'gold' | 'danger' | 'outline' {
  switch (status) {
    case 'draft':
      return 'default'
    case 'approved':
      return 'success'
    case 'implemented':
      return 'gold'
    case 'rejected':
      return 'danger'
  }
}

function getStatusLabel(status: BriefStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getIntentBadgeVariant(
  intent: KeywordIntent
): 'info' | 'success' | 'gold' | 'outline' {
  switch (intent) {
    case 'informational':
      return 'info'
    case 'transactional':
      return 'success'
    case 'commercial':
      return 'gold'
    case 'navigational':
      return 'outline'
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#1e8e3e'
  if (score >= 60) return '#f9ab00'
  return '#d93025'
}

// ---------------------------------------------------------------------------
// Stat summary card
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="rounded-xl border border-[#dadce0] bg-[#ffffff] p-4 flex items-center gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}20` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-[#202124]">{value}</p>
        <p className="text-xs text-[#80868b]">{label}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Content brief card
// ---------------------------------------------------------------------------

function BriefCard({
  brief,
  onApprove,
  onReject,
}: {
  brief: ContentBriefItem
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  const scoreColor = getScoreColor(brief.contentScore)
  const isDraft = brief.status === 'draft'

  return (
    <Card className="flex flex-col gap-0 overflow-hidden transition-all duration-150 hover:border-[#1a73e8]/40">
      <CardContent className="flex flex-col gap-4 p-5">
        {/* Top row: title + score ring */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#202124] leading-snug line-clamp-2">
              {brief.title}
            </h3>
            <a
              href={brief.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-[#1a73e8] hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[260px]">
                {truncateUrl(brief.targetUrl, 48)}
              </span>
            </a>
          </div>
          {/* Score ring */}
          <div className="shrink-0 flex flex-col items-center gap-0.5">
            <ProgressRing
              value={brief.contentScore}
              size={52}
              strokeWidth={4}
              color={scoreColor}
              labelClassName="text-[10px] font-bold"
              label={`${brief.contentScore}`}
            />
            <span className="text-[10px] text-[#80868b]">score</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Keyword + intent */}
          <span className="text-xs text-[#5f6368] font-mono truncate max-w-[180px]">
            {brief.targetKeyword}
          </span>
          <Badge variant={getIntentBadgeVariant(brief.intent)}>
            {brief.intent}
          </Badge>
          <Badge variant={getStatusBadgeVariant(brief.status)}>
            {getStatusLabel(brief.status)}
          </Badge>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1 border-t border-[#dadce0]">
          <div className="flex items-center gap-3 text-xs text-[#80868b]">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {brief.wordCountTarget.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(brief.createdAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[#5f6368] text-xs"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
            {isDraft && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-[#1e8e3e] hover:text-[#1e8e3e] hover:bg-[#e6f4ea]"
                  onClick={() => onApprove(brief.id)}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-[#d93025] hover:text-[#d93025] hover:bg-[#fce8e6]"
                  onClick={() => onReject(brief.id)}
                >
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContentPage() {
  const [briefs, setBriefs] = React.useState<ContentBriefItem[]>(MOCK_BRIEFS)
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>('all')

  const counts = React.useMemo(
    () => ({
      draft: briefs.filter((b) => b.status === 'draft').length,
      approved: briefs.filter((b) => b.status === 'approved').length,
      implemented: briefs.filter((b) => b.status === 'implemented').length,
      rejected: briefs.filter((b) => b.status === 'rejected').length,
    }),
    [briefs]
  )

  const filtered = React.useMemo(
    () =>
      activeFilter === 'all'
        ? briefs
        : briefs.filter((b) => b.status === activeFilter),
    [briefs, activeFilter]
  )

  function handleApprove(id: string) {
    setBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'approved' } : b))
    )
  }

  function handleReject(id: string) {
    setBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'rejected' } : b))
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#202124]">
            Content Optimization
          </h1>
          <p className="mt-1 text-sm text-[#80868b]">
            Manage AI-generated content briefs and track implementation progress.
          </p>
        </div>
        <Button variant="gold" className="shrink-0">
          <PlusCircle className="h-4 w-4" />
          Generate New Brief
        </Button>
      </div>

      {/* ── Stat row ── */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Pending Briefs"
          value={counts.draft}
          accent="#1a73e8"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Approved"
          value={counts.approved}
          accent="#1e8e3e"
        />
        <StatCard
          icon={<Rocket className="h-4 w-4" />}
          label="Implemented"
          value={counts.implemented}
          accent="#f9ab00"
        />
      </div>

      {/* ── Filter tabs ── */}
      <div className="mb-5 flex items-center gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-100',
                isActive
                  ? 'bg-[#1a73e8] text-white'
                  : 'bg-[#ffffff] text-[#5f6368] border border-[#dadce0] hover:border-[#bdc1c6] hover:text-[#202124]'
              )}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#dadce0] text-[#80868b]'
                  )}
                >
                  {counts[tab.value as BriefStatus]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Brief grid ── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No content briefs found"
          description="There are no briefs matching the selected filter. Try switching to a different tab or generate a new brief."
          action={
            <Button variant="gold" size="sm">
              <PlusCircle className="h-3.5 w-3.5" />
              Generate Brief
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((brief) => (
            <BriefCard
              key={brief.id}
              brief={brief}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
