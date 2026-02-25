'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { FileText, AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'
import { useClient } from '@/contexts/client-context'
import { cn, timeAgo } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types (mirrors audit API response)
// ---------------------------------------------------------------------------
type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

interface AuditIssue {
  id: string
  severity: Severity
  category: string
  title: string
  description: string
  recommendation: string
  url: string
  is_fixed: boolean
  created_at: string
}

interface AuditStats {
  critical: number
  high: number
  medium: number
  low: number
  info: number
  totalChecks: number
  passedChecks: number
}

interface AuditData {
  score: number
  lastScanAt: string
  stats: AuditStats
  issues: AuditIssue[]
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CONTENT_CATEGORIES = ['seo', 'links', 'accessibility', 'schema']

const CATEGORY_LABELS: Record<string, string> = {
  seo:           'SEO',
  links:         'Links',
  accessibility: 'Accessibility',
  schema:        'Structured Data',
}

const SEVERITY_BADGE: Record<Severity, BadgeVariant> = {
  critical: 'danger',
  high:     'warning',
  medium:   'gold',
  low:      'info',
  info:     'muted',
}

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info']

const SEVERITY_ICON: Record<Severity, React.ReactNode> = {
  critical: <AlertCircle size={12} className="text-red-500" />,
  high:     <AlertTriangle size={12} className="text-amber-500" />,
  medium:   <AlertTriangle size={12} className="text-yellow-500" />,
  low:      <Info size={12} className="text-blue-400" />,
  info:     <Info size={12} className="text-slate-400" />,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getContentScore(issues: AuditIssue[]): number {
  const contentIssues = issues.filter((i) => CONTENT_CATEGORIES.includes(i.category))
  const critical = contentIssues.filter((i) => i.severity === 'critical').length
  const high     = contentIssues.filter((i) => i.severity === 'high').length
  const medium   = contentIssues.filter((i) => i.severity === 'medium').length
  const penalty  = critical * 15 + high * 8 + medium * 3
  return Math.max(0, Math.min(100, 100 - penalty))
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 70) return 'text-blue-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-600'
}

// ---------------------------------------------------------------------------
// Issue row
// ---------------------------------------------------------------------------
function IssueRow({ issue }: { issue: AuditIssue }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50/60 transition-colors duration-100 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="mt-0.5 flex-shrink-0">{SEVERITY_ICON[issue.severity]}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-sm font-medium text-slate-800"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {issue.title}
            </span>
            <Badge variant={SEVERITY_BADGE[issue.severity]} className="text-[10px]">
              {issue.severity}
            </Badge>
            {issue.is_fixed && (
              <Badge variant="success" className="text-[10px]">Fixed</Badge>
            )}
          </div>
          {!expanded && (
            <p
              className="mt-0.5 text-xs text-slate-500 truncate max-w-xl"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {issue.description}
            </p>
          )}
        </div>
        <ArrowRight
          size={13}
          className={cn(
            'mt-1 flex-shrink-0 text-slate-300 transition-transform duration-150',
            expanded && 'rotate-90'
          )}
        />
      </button>

      {expanded && (
        <div className="mx-4 mb-3 rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
          <p
            className="text-xs text-slate-600 leading-relaxed"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {issue.description}
          </p>
          {issue.recommendation && (
            <div className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50/60 p-2">
              <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0 text-blue-500" />
              <p
                className="text-xs text-blue-700 leading-relaxed"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <span className="font-semibold">Recommendation: </span>
                {issue.recommendation}
              </p>
            </div>
          )}
          {issue.url && (
            <p
              className="text-[10px] text-slate-400 font-mono truncate"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {issue.url}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Category section
// ---------------------------------------------------------------------------
function CategorySection({
  category,
  issues,
}: {
  category: string
  issues: AuditIssue[]
}) {
  const label     = CATEGORY_LABELS[category] ?? category
  const openCount = issues.filter((i) => !i.is_fixed).length

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <h3
          className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {label}
        </h3>
        <div className="flex items-center gap-1.5">
          {openCount > 0 && (
            <Badge variant="danger" className="text-[10px]">
              {openCount} open
            </Badge>
          )}
          {openCount === 0 && (
            <Badge variant="success" className="text-[10px]">
              All fixed
            </Badge>
          )}
        </div>
      </div>
      <div>
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ContentPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [data, setData]             = useState<AuditData | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [sopLoading, setSopLoading] = useState(false)

  const handleDownloadSOP = async () => {
    if (!currentClient?.id || sopLoading) return
    setSopLoading(true)
    try {
      const res = await fetch('/api/sop/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: currentClient.id }),
      })
      const json = await res.json()
      if (!json.success || !json.data) {
        setError(json.error || 'Failed to generate SOP.')
        return
      }
      const sop = json.data
      // Build markdown SOP document
      let md = `# SEO Fix SOP - ${sop.domain}\n`
      md += `Generated: ${sop.generatedAt}\n`
      md += `Total Issues: ${sop.totalIssues}\n\n`
      for (const section of sop.sections ?? []) {
        md += `## ${section.category.toUpperCase()} (${section.items?.length ?? 0} issues)\n\n`
        for (const item of section.items ?? []) {
          md += `### [${item.severity.toUpperCase()}] ${item.title}\n`
          md += `${item.description}\n\n`
          md += `**Steps to fix:**\n`
          for (const step of item.steps ?? []) {
            md += `${step.stepNumber}. ${step.instruction}\n`
            if (step.codeSnippet) md += `\`\`\`\n${step.codeSnippet}\n\`\`\`\n`
          }
          if (item.verification) md += `\n**Verify:** ${item.verification}\n`
          md += '\n---\n\n'
        }
      }
      // Download as .md file
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sop-${sop.domain}-${new Date().toISOString().slice(0, 10)}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to generate SOP.')
    } finally {
      setSopLoading(false)
    }
  }

  const fetchData = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res  = await fetch(`/api/audit/results?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        const summary = d.summary ?? {}
        const totalIssues = summary.totalIssues ?? 0
        const auditData: AuditData = {
          score: d.score ?? 0,
          lastScanAt: d.lastScanDate ?? '',
          stats: {
            critical: summary.critical ?? 0,
            high: summary.high ?? 0,
            medium: summary.medium ?? 0,
            low: summary.low ?? 0,
            info: summary.info ?? 0,
            totalChecks: totalIssues + (summary.fixedIssues ?? 0) + 18,
            passedChecks: 18 - totalIssues + (summary.fixedIssues ?? 0),
          },
          issues: (d.issues ?? []).map((i: Record<string, unknown>) => ({
            id: i.id,
            severity: i.severity,
            category: i.category,
            title: i.title,
            description: i.description,
            recommendation: i.recommendation,
            url: i.url,
            is_fixed: i.isFixed ?? i.is_fixed ?? false,
            created_at: i.createdAt ?? i.created_at ?? '',
          })),
        }
        setData(auditData)
      } else {
        setError(json.error || 'Failed to fetch audit data.')
      }
    } catch {
      setError('Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      fetchData(currentClient.id)
    }
  }, [currentClient?.id, fetchData])

  // Derive content-specific data
  const contentIssues = useMemo(() => {
    if (!data?.issues) return []
    return data.issues
      .filter((i) => CONTENT_CATEGORIES.includes(i.category))
      .sort(
        (a, b) =>
          SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
      )
  }, [data])

  const byCategory = useMemo(() => {
    const map: Record<string, AuditIssue[]> = {}
    for (const issue of contentIssues) {
      if (!map[issue.category]) map[issue.category] = []
      map[issue.category].push(issue)
    }
    // Return only categories that have issues, in preferred order
    return CONTENT_CATEGORIES.filter((c) => (map[c]?.length ?? 0) > 0).map(
      (c) => ({ category: c, issues: map[c] })
    )
  }, [contentIssues])

  const contentScore        = data ? getContentScore(data.issues) : 0
  const totalRecommendations = contentIssues.filter((i) => !i.is_fixed).length

  // --- Client loading ---
  if (clientLoading) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-5 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable rows={6} columns={3} />
      </div>
    )
  }

  // --- No business ---
  if (hasNoBusiness) {
    return <EmptyDashboard />
  }

  const clientName = currentClient?.name ?? 'your account'

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
            Content analysis for{' '}
            <span className="font-medium text-blue-700">{clientName}</span>
            {data?.lastScanAt && (
              <span className="text-slate-400">
                {' '}&mdash; scanned {timeAgo(data.lastScanAt)}
              </span>
            )}
          </p>
        </div>

        {data && contentIssues.length > 0 && (
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={handleDownloadSOP}
            disabled={sopLoading}
          >
            <Download size={13} className={sopLoading ? 'animate-bounce' : ''} />
            {sopLoading ? 'Generating...' : 'Download Fix SOP'}
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={6} columns={3} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {error}
        </div>
      )}

      {/* No audit data */}
      {!loading && !error && !data && (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No content data yet"
          description="Run a site audit first to see content optimization recommendations."
          size="lg"
          action={
            <a
              href="/audit"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Go to Site Audit
              <ArrowRight size={12} />
            </a>
          }
        />
      )}

      {/* Data loaded */}
      {!loading && !error && data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {/* Content score */}
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
              <div>
                <p
                  className={cn('text-lg font-bold', getScoreColor(contentScore))}
                  style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {contentScore}
                </p>
                <p className="text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                  Content Score
                </p>
              </div>
            </div>

            {/* Total issues */}
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: '#EF4444' }} />
              <div>
                <p
                  className="text-lg font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {contentIssues.length}
                </p>
                <p className="text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                  Total Issues
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
              <div>
                <p
                  className="text-lg font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {totalRecommendations}
                </p>
                <p className="text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                  Recommendations
                </p>
              </div>
            </div>

            {/* Categories analyzed */}
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <div>
                <p
                  className="text-lg font-bold text-slate-900"
                  style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {byCategory.length}
                </p>
                <p className="text-[11px] text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
                  Areas Analyzed
                </p>
              </div>
            </div>
          </div>

          {/* Content analysis */}
          {byCategory.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="No content issues found"
              description="Your site passed all content-related checks. Great work!"
              size="default"
            />
          ) : (
            <Card>
              <CardHeader className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Content Analysis</CardTitle>
                  <span
                    className="text-xs text-slate-400"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {contentIssues.length} issue{contentIssues.length !== 1 ? 's' : ''} across{' '}
                    {byCategory.length} area{byCategory.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {byCategory.map(({ category, issues }) => (
                  <CategorySection
                    key={category}
                    category={category}
                    issues={issues}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
