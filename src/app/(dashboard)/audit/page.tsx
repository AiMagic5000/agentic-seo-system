'use client'

import * as React from 'react'
import {
  Shield,
  Zap,
  Search,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wrench,
  Calendar,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressRing } from '@/components/ui/progress-ring'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useClient } from '@/contexts/client-context'
import { cn, truncateUrl } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type IssueSeverity = 'critical' | 'high' | 'medium' | 'low'
type IssueCategory = 'performance' | 'seo' | 'mobile' | 'schema' | 'links' | 'accessibility' | 'security'

interface AuditIssue {
  id: string
  severity: IssueSeverity
  category: IssueCategory
  title: string
  description: string
  affectedUrl: string
  fixSuggestion: string
  isFixed: boolean
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_ISSUES: AuditIssue[] = [
  { id: '1',  severity: 'critical', category: 'seo',           title: 'Missing meta descriptions on 23 pages',             description: 'Pages without meta descriptions receive auto-generated snippets from Google, which are often low quality and reduce CTR.',                                                                                   affectedUrl: 'https://startmybusiness.us/business-credit-guide',         fixSuggestion: 'Write unique, compelling meta descriptions (140-160 chars) for each page. Focus on primary keyword and include a clear value prop.',                                                                                       isFixed: false },
  { id: '2',  severity: 'critical', category: 'performance',   title: 'Largest Contentful Paint exceeds 4 seconds',         description: 'Core Web Vital LCP is at 4.3s on mobile. Google considers values above 2.5s "poor" and this directly impacts rankings.',                                                                             affectedUrl: 'https://startmybusiness.us/',                              fixSuggestion: 'Serve hero image in WebP format, add width/height attributes, preload LCP image. Consider faster hosting.',                                                                                                               isFixed: false },
  { id: '3',  severity: 'critical', category: 'links',         title: '7 broken internal links returning 404 errors',       description: 'Internal pages link to URLs that no longer exist, creating dead ends for users and wasting crawl budget.',                                                                                          affectedUrl: 'https://startmybusiness.us/net-30-accounts',              fixSuggestion: 'Set up 301 redirects from broken URLs to relevant live pages. Update or remove all internal links pointing to dead URLs.',                                                                                               isFixed: false },
  { id: '4',  severity: 'high',     category: 'seo',           title: 'Duplicate title tags across 11 pages',               description: 'Multiple pages share identical title tags, making it hard for search engines to determine the canonical version.',                                                                                 affectedUrl: 'https://startmybusiness.us/business-funding',             fixSuggestion: 'Audit all page titles and ensure each one is unique. Incorporate the primary keyword near the beginning, under 60 characters.',                                                                                          isFixed: false },
  { id: '5',  severity: 'high',     category: 'schema',        title: 'Missing FAQ schema on 8 informational pages',        description: 'Pages with FAQ sections lack FAQPage structured data. This can unlock rich result snippets and increase SERP real estate.',                                                                          affectedUrl: 'https://startmybusiness.us/paydex-score-guide',           fixSuggestion: "Add FAQPage JSON-LD schema to each page containing Q&A content. Validate with Google's Rich Results Test.",                                                                                                              isFixed: false },
  { id: '6',  severity: 'high',     category: 'mobile',        title: 'Tap targets too small on mobile (14 instances)',     description: 'Interactive elements are smaller than the 48x48 CSS pixel minimum. This causes accidental taps and degrades mobile UX.',                                                                            affectedUrl: 'https://startmybusiness.us/business-credit-cards-ein-only', fixSuggestion: 'Increase padding on anchor tags and buttons. Use min-height: 48px and min-width: 48px minimum target size.',                                                                                                                 isFixed: true  },
  { id: '7',  severity: 'high',     category: 'performance',   title: 'Render-blocking JavaScript in head (3 scripts)',     description: 'Three JS files loaded synchronously in the document head block HTML parsing and delay FCP by an estimated 620ms.',                                                                                   affectedUrl: 'https://startmybusiness.us/net-30-accounts',              fixSuggestion: 'Add "defer" or "async" attribute to non-critical scripts. Consider lazy-loading third-party scripts until user interaction.',                                                                                           isFixed: false },
  { id: '8',  severity: 'high',     category: 'seo',           title: 'Images missing alt text (34 images)',                description: 'Images without descriptive alt attributes are invisible to screen readers and search engine crawlers.',                                                                                              affectedUrl: 'https://startmybusiness.us/duns-number-guide',            fixSuggestion: 'Add descriptive alt text to every content image. Decorative images should use alt="" (empty string).',                                                                                                                   isFixed: false },
  { id: '9',  severity: 'medium',   category: 'links',         title: 'Redirect chain detected (4 hops on 3 URLs)',         description: 'Some URLs redirect through 4 intermediate URLs before the final destination, losing link equity at each hop.',                                                                                      affectedUrl: 'https://startmybusiness.us/llc-guide',                    fixSuggestion: 'Update all redirects to point directly from source to final destination. Never chain more than one redirect.',                                                                                                           isFixed: false },
  { id: '10', severity: 'medium',   category: 'schema',        title: 'Organization schema missing sameAs property',       description: 'Organization schema on the homepage lacks sameAs links to social profiles. This helps Google build a knowledge panel.',                                                                              affectedUrl: 'https://startmybusiness.us/',                              fixSuggestion: 'Add "sameAs" array to Organization JSON-LD with full URLs to LinkedIn, Facebook, Twitter/X, Instagram, and YouTube.',                                                                                                  isFixed: false },
  { id: '11', severity: 'medium',   category: 'seo',           title: 'Thin content pages below 300 words (6 pages)',      description: 'Six pages have fewer than 300 words. Thin pages rarely rank for competitive queries and may trigger quality filters.',                                                                                 affectedUrl: 'https://startmybusiness.us/contact',                      fixSuggestion: 'Expand thin pages with relevant content: FAQ sections, case studies, or supporting context. Consider consolidating with a related page.',                                                                                isFixed: false },
  { id: '12', severity: 'medium',   category: 'mobile',        title: 'Viewport meta tag missing on 2 pages',              description: 'Two pages lack the <meta name="viewport"> tag, causing mobile browsers to render at desktop width.',                                                                                                 affectedUrl: 'https://startmybusiness.us/thank-you',                    fixSuggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the head of all pages.',                                                                                                                    isFixed: true  },
  { id: '13', severity: 'medium',   category: 'performance',   title: 'Unoptimized images not in next-gen formats',        description: '18 images served as JPEG/PNG instead of WebP or AVIF. Next-gen formats offer 25-50% smaller file sizes.',                                                                                           affectedUrl: 'https://startmybusiness.us/business-tradelines',          fixSuggestion: 'Convert all images to WebP. Set up server-level accept-header negotiation to serve WebP to supporting browsers.',                                                                                                       isFixed: false },
  { id: '14', severity: 'low',      category: 'seo',           title: 'H1 tag used more than once on 4 pages',             description: 'Best practice is a single H1 per page as the primary topic signal. Multiple H1s dilute topical focus.',                                                                                             affectedUrl: 'https://startmybusiness.us/sba-loans-guide',              fixSuggestion: 'Audit heading structure. Keep one H1 with primary keyword, H2 for major sections, H3 for subsections.',                                                                                                                 isFixed: false },
  { id: '15', severity: 'low',      category: 'links',         title: 'Nofollow applied to internal resource links',       description: '9 internal links have rel="nofollow" applied, instructing Google not to pass PageRank through your own site.',                                                                                       affectedUrl: 'https://startmybusiness.us/resources',                    fixSuggestion: 'Remove rel="nofollow" from all internal links. Nofollow is for external untrusted links, not internal pages you control.',                                                                                              isFixed: false },
]

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
type SeverityFilter = 'all' | IssueSeverity
type CategoryFilter = 'all' | IssueCategory

const CATEGORY_SCORES = [
  { label: 'Performance',     score: 61, icon: <Zap className="h-4 w-4" />,           color: '#F59E0B' },
  { label: 'Accessibility',   score: 78, icon: <Shield className="h-4 w-4" />,        color: '#10B981' },
  { label: 'SEO',             score: 72, icon: <Search className="h-4 w-4" />,        color: '#3B82F6' },
  { label: 'Best Practices',  score: 85, icon: <CheckCircle2 className="h-4 w-4" />,  color: '#8B5CF6' },
]

const OVERALL_SCORE    = 74
const LAST_AUDIT_DATE  = 'Feb 22, 2025 at 11:34 AM'

function getSeverityVariant(s: IssueSeverity): 'danger' | 'warning' | 'info' | 'outline' {
  if (s === 'critical') return 'danger'
  if (s === 'high')     return 'warning'
  if (s === 'medium')   return 'info'
  return 'outline'
}

function getSeverityOrder(s: IssueSeverity): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[s]
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Work'
  return 'Poor'
}

// ---------------------------------------------------------------------------
// CategoryScoreCard
// ---------------------------------------------------------------------------
function CategoryScoreCard({ label, score, icon, color }: { label: string; score: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1a` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>{label}</p>
        <p className="text-lg font-bold" style={{ color, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
          {score}<span className="text-xs font-normal text-slate-400">/100</span>
        </p>
      </div>
      <ProgressRing value={score} size={34} strokeWidth={3} color={color} showLabel={false} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// IssueCard
// ---------------------------------------------------------------------------
function IssueCard({ issue, onMarkFixed }: { issue: AuditIssue; onMarkFixed: (id: string) => void }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <Card className={cn('transition-all duration-150', issue.isFixed && 'opacity-60')}>
      <CardContent className="p-4">
        {/* Top */}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge variant={getSeverityVariant(issue.severity)}>
              {issue.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}
            </Badge>
            {issue.isFixed && (
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3 mr-0.5" />Fixed
              </Badge>
            )}
          </div>
          <h3
            className="text-sm font-semibold text-slate-900 leading-snug"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {issue.title}
          </h3>
          <p
            className="mt-1 text-xs text-slate-500 leading-relaxed"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {issue.description}
          </p>
          <p
            className="mt-1.5 text-xs text-slate-400"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {truncateUrl(issue.affectedUrl, 60)}
          </p>
        </div>

        {/* Fix suggestion collapsible */}
        <div className="mt-3 border-t border-slate-100 pt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-left cursor-pointer"
          >
            <span
              className="flex items-center gap-1.5 text-xs font-medium text-amber-500"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <Wrench className="h-3 w-3" />Fix Suggestion
            </span>
            {expanded
              ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            }
          </button>

          {expanded && (
            <p
              className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {issue.fixSuggestion}
            </p>
          )}
        </div>

        {!issue.isFixed && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onMarkFixed(issue.id)}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Mark Fixed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AuditPage() {
  const { isLoading: clientLoading, hasNoBusiness } = useClient()
  const [issues, setIssues] = React.useState<AuditIssue[]>(
    [...MOCK_ISSUES].sort((a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity))
  )
  const [severityFilter, setSeverityFilter]   = React.useState<SeverityFilter>('all')
  const [categoryFilter, setCategoryFilter]   = React.useState<CategoryFilter>('all')

  const filtered = React.useMemo(
    () => issues.filter((i) => {
      return (severityFilter === 'all' || i.severity === severityFilter) &&
             (categoryFilter === 'all' || i.category === categoryFilter)
    }),
    [issues, severityFilter, categoryFilter]
  )

  const issueCounts = React.useMemo(
    () => ({
      critical: issues.filter((i) => i.severity === 'critical' && !i.isFixed).length,
      high:     issues.filter((i) => i.severity === 'high'     && !i.isFixed).length,
      medium:   issues.filter((i) => i.severity === 'medium'   && !i.isFixed).length,
      low:      issues.filter((i) => i.severity === 'low'      && !i.isFixed).length,
    }),
    [issues]
  )

  function handleMarkFixed(id: string) {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, isFixed: true } : i))
  }

  const SEVERITY_FILTERS: { label: string; value: SeverityFilter }[] = [
    { label: 'All',      value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'High',     value: 'high' },
    { label: 'Medium',   value: 'medium' },
    { label: 'Low',      value: 'low' },
  ]

  const CATEGORY_FILTERS: { label: string; value: CategoryFilter }[] = [
    { label: 'All',           value: 'all' },
    { label: 'Performance',   value: 'performance' },
    { label: 'SEO',           value: 'seo' },
    { label: 'Mobile',        value: 'mobile' },
    { label: 'Schema',        value: 'schema' },
    { label: 'Links',         value: 'links' },
    { label: 'Accessibility', value: 'accessibility' },
  ]

  if (hasNoBusiness) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] p-5">
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="No website connected"
          description="Add your first website to start running site audits."
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
            Site Audit
          </h1>
          <p
            className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <Calendar className="h-3 w-3" />
            Last audit: {LAST_AUDIT_DATE}
          </p>
        </div>
        <Button variant="amber" size="sm" className="shrink-0 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />Run Full Audit
        </Button>
      </div>

      {/* Score overview */}
      {clientLoading ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[0,1,2,3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p
              className="text-[11px] font-medium uppercase tracking-widest text-slate-400"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Overall Audit Score
            </p>
            <ProgressRing
              value={OVERALL_SCORE}
              size={100}
              strokeWidth={7}
              color={getScoreColor(OVERALL_SCORE)}
              label={
                <span className="text-center leading-tight">
                  <span
                    className="block text-2xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {OVERALL_SCORE}
                  </span>
                  <span className="block text-[10px] font-medium text-slate-400">/100</span>
                </span>
              }
            />
            <p
              className="text-sm font-semibold"
              style={{ color: getScoreColor(OVERALL_SCORE), fontFamily: 'var(--font-sans)' }}
            >
              {getScoreLabel(OVERALL_SCORE)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs" style={{ fontFamily: 'var(--font-sans)' }}>
              {issueCounts.critical > 0 && <span className="flex items-center gap-1 text-red-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{issueCounts.critical} critical</span>}
              {issueCounts.high > 0     && <span className="flex items-center gap-1 text-amber-500"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{issueCounts.high} high</span>}
              {issueCounts.medium > 0   && <span className="flex items-center gap-1 text-blue-600"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{issueCounts.medium} medium</span>}
              {issueCounts.low > 0      && <span className="flex items-center gap-1 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />{issueCounts.low} low</span>}
            </div>
          </div>

          {/* Category scores */}
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {CATEGORY_SCORES.map((cat) => <CategoryScoreCard key={cat.label} {...cat} />)}
          </div>
        </>
      )}

      {/* Issues section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2
            className="text-sm font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Issues
          </h2>
          <span
            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
          >
            {filtered.filter((i) => !i.isFixed).length} open
          </span>
        </div>

        {/* Severity filters */}
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1">
          {SEVERITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSeverityFilter(f.value)}
              className={cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-100 cursor-pointer',
                severityFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800'
              )}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategoryFilter(f.value)}
              className={cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-100 cursor-pointer',
                categoryFilter === f.value
                  ? 'bg-slate-200 text-slate-900 border border-slate-300'
                  : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-600'
              )}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Issues list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="No issues match your filters"
            description="Try adjusting the severity or category filters."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onMarkFixed={handleMarkFixed} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
