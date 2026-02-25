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
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressRing } from '@/components/ui/progress-ring'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useClient } from '@/contexts/client-context'
import { cn, timeAgo, truncateUrl } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BriefStatus  = 'draft' | 'approved' | 'implemented' | 'rejected'
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
    id: '1', title: 'How to Build Business Credit Without a Personal Guarantee in 2025',
    targetUrl: 'https://startmybusiness.us/business-credit-no-personal-guarantee',
    targetKeyword: 'business credit no personal guarantee', intent: 'commercial',
    contentScore: 72, status: 'draft', wordCountTarget: 2400,
    createdAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  },
  {
    id: '2', title: 'Best Net-30 Vendor Accounts for New LLCs (No PG Required)',
    targetUrl: 'https://startmybusiness.us/net-30-accounts-new-llc',
    targetKeyword: 'net 30 accounts for new business', intent: 'commercial',
    contentScore: 88, status: 'approved', wordCountTarget: 1800,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: '3', title: 'What Is a PAYDEX Score? Complete Guide for Business Owners',
    targetUrl: 'https://startmybusiness.us/paydex-score-guide',
    targetKeyword: 'what is a paydex score', intent: 'informational',
    contentScore: 65, status: 'draft', wordCountTarget: 2100,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    id: '4', title: 'EIN-Only Business Credit Cards: Apply Without SSN in 2025',
    targetUrl: 'https://startmybusiness.us/business-credit-cards-ein-only',
    targetKeyword: 'business credit cards ein only no ssn', intent: 'transactional',
    contentScore: 91, status: 'implemented', wordCountTarget: 2800,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: '5', title: 'How Long Does It Take to Build Business Credit? Timeline Guide',
    targetUrl: 'https://startmybusiness.us/how-long-build-business-credit',
    targetKeyword: 'how long to build business credit', intent: 'informational',
    contentScore: 58, status: 'rejected', wordCountTarget: 1600,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
  },
  {
    id: '6', title: 'Uline Net 30 Account Review: Is It Worth It for Your Business?',
    targetUrl: 'https://startmybusiness.us/uline-net-30-review',
    targetKeyword: 'uline net 30 account review', intent: 'commercial',
    contentScore: 79, status: 'draft', wordCountTarget: 1400,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: '7', title: 'D-U-N-S Number: How to Get One Free and Why Every Business Needs It',
    targetUrl: 'https://startmybusiness.us/duns-number-guide',
    targetKeyword: 'how to get duns number free', intent: 'informational',
    contentScore: 83, status: 'approved', wordCountTarget: 1900,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: '8', title: 'SBA Loan Requirements 2025: What You Need to Qualify',
    targetUrl: 'https://startmybusiness.us/sba-loan-requirements-2025',
    targetKeyword: 'sba loan requirements 2025', intent: 'transactional',
    contentScore: 94, status: 'implemented', wordCountTarget: 3200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type FilterTab = 'all' | BriefStatus

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Draft',       value: 'draft' },
  { label: 'Approved',    value: 'approved' },
  { label: 'Implemented', value: 'implemented' },
  { label: 'Rejected',    value: 'rejected' },
]

function getStatusVariant(status: BriefStatus): 'default' | 'success' | 'gold' | 'danger' {
  switch (status) {
    case 'draft':       return 'default'
    case 'approved':    return 'success'
    case 'implemented': return 'gold'
    case 'rejected':    return 'danger'
  }
}

function getIntentVariant(intent: KeywordIntent): 'info' | 'success' | 'gold' | 'outline' {
  switch (intent) {
    case 'informational': return 'info'
    case 'transactional': return 'success'
    case 'commercial':    return 'gold'
    case 'navigational':  return 'outline'
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

// ---------------------------------------------------------------------------
// BriefCard
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
    <Card className="flex flex-col transition-all duration-150 hover:border-blue-300">
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Top: title + score ring */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-semibold leading-snug line-clamp-2 text-slate-900"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {brief.title}
            </h3>
            <a
              href={brief.targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[240px]">{truncateUrl(brief.targetUrl, 48)}</span>
            </a>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-0.5">
            <ProgressRing
              value={brief.contentScore}
              size={48}
              strokeWidth={4}
              color={scoreColor}
              labelClassName="text-[10px] font-bold"
              label={`${brief.contentScore}`}
            />
            <span
              className="text-[10px] text-slate-400"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              score
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-xs text-slate-500 truncate max-w-[180px]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {brief.targetKeyword}
          </span>
          <Badge variant={getIntentVariant(brief.intent)}>
            {brief.intent}
          </Badge>
          <Badge variant={getStatusVariant(brief.status)}>
            {brief.status.charAt(0).toUpperCase() + brief.status.slice(1)}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-3 text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {brief.wordCountTarget.toLocaleString()}
              </span> words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(brief.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-500">
              <Eye className="h-3 w-3 mr-1" />View
            </Button>
            {isDraft && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50"
                  onClick={() => onApprove(brief.id)}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-500 hover:bg-red-50"
                  onClick={() => onReject(brief.id)}
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />Reject
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
// Page
// ---------------------------------------------------------------------------
export default function ContentPage() {
  const { isLoading: clientLoading, hasNoBusiness } = useClient()
  const [briefs, setBriefs] = React.useState<ContentBriefItem[]>(MOCK_BRIEFS)
  const [activeFilter, setActiveFilter] = React.useState<FilterTab>('all')

  const counts = React.useMemo(
    () => ({
      draft:       briefs.filter((b) => b.status === 'draft').length,
      approved:    briefs.filter((b) => b.status === 'approved').length,
      implemented: briefs.filter((b) => b.status === 'implemented').length,
      rejected:    briefs.filter((b) => b.status === 'rejected').length,
    }),
    [briefs]
  )

  const filtered = React.useMemo(
    () => activeFilter === 'all' ? briefs : briefs.filter((b) => b.status === activeFilter),
    [briefs, activeFilter]
  )

  function handleApprove(id: string) {
    setBriefs((prev) => prev.map((b) => b.id === id ? { ...b, status: 'approved' } : b))
  }

  function handleReject(id: string) {
    setBriefs((prev) => prev.map((b) => b.id === id ? { ...b, status: 'rejected' } : b))
  }

  if (hasNoBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-5">
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No website connected"
          description="Add your first website to start generating content briefs."
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
          <h1
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Content Optimization
          </h1>
          <p
            className="mt-0.5 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            AI-generated briefs and content implementation tracking
          </p>
        </div>
        <Button variant="amber" size="sm" className="shrink-0 gap-1.5">
          <PlusCircle className="h-3.5 w-3.5" />
          Generate Brief
        </Button>
      </div>

      {/* Stat row */}
      {clientLoading ? (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { icon: <FileText className="h-4 w-4" />, label: 'Pending Briefs', value: counts.draft,       color: '#3B82F6' },
            { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Approved',   value: counts.approved,    color: '#10B981' },
            { icon: <Rocket className="h-4 w-4" />,    label: 'Implemented',   value: counts.implemented, color: '#F59E0B' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${s.color}1a` }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <p
                  className="text-xl font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {s.value}
                </p>
                <p
                  className="text-xs text-slate-500"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-100 cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800'
              )}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  )}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {counts[tab.value as BriefStatus]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Brief grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No content briefs found"
          description="No briefs match the selected filter. Try a different tab or generate a new brief."
          action={
            <Button variant="amber" size="sm" className="gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Generate Brief
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
