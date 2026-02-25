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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressRing } from '@/components/ui/progress-ring'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { truncateUrl } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IssueSeverity = 'critical' | 'high' | 'medium' | 'low'
type IssueCategory =
  | 'performance'
  | 'seo'
  | 'mobile'
  | 'schema'
  | 'links'
  | 'accessibility'
  | 'security'

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
// Mock audit issues (15 realistic issues)
// ---------------------------------------------------------------------------

const MOCK_ISSUES: AuditIssue[] = [
  {
    id: '1',
    severity: 'critical',
    category: 'seo',
    title: 'Missing meta descriptions on 23 pages',
    description:
      'Pages without meta descriptions receive auto-generated snippets from Google, which are often low quality and reduce click-through rates from search results.',
    affectedUrl: 'https://startmybusiness.us/business-credit-guide',
    fixSuggestion:
      'Write unique, compelling meta descriptions (140-160 characters) for each page. Focus on the primary keyword and include a clear value proposition or call to action.',
    isFixed: false,
  },
  {
    id: '2',
    severity: 'critical',
    category: 'performance',
    title: 'Largest Contentful Paint (LCP) exceeds 4 seconds',
    description:
      'Core Web Vital LCP is measured at 4.3 seconds on mobile. Google considers values above 2.5 seconds as "poor" and this directly impacts page rankings.',
    affectedUrl: 'https://startmybusiness.us/',
    fixSuggestion:
      'Optimize hero image by serving it in WebP format and adding width/height attributes to reduce layout shift. Preload the LCP image using <link rel="preload">. Consider upgrading to a faster hosting provider.',
    isFixed: false,
  },
  {
    id: '3',
    severity: 'critical',
    category: 'links',
    title: '7 broken internal links returning 404 errors',
    description:
      'Internal pages link to URLs that no longer exist. This creates dead ends for users and wastes crawl budget. Google may interpret frequent 404s as a sign of poor site maintenance.',
    affectedUrl: 'https://startmybusiness.us/net-30-accounts',
    fixSuggestion:
      'Set up 301 redirects from the broken URLs to the most relevant live pages. Update or remove all internal links pointing to these dead URLs. Implement automated link checking in your deployment pipeline.',
    isFixed: false,
  },
  {
    id: '4',
    severity: 'high',
    category: 'seo',
    title: 'Duplicate title tags detected across 11 pages',
    description:
      'Multiple pages share identical title tags, making it difficult for search engines to determine which page is the canonical version for a given query. This can lead to keyword cannibalization.',
    affectedUrl: 'https://startmybusiness.us/business-funding',
    fixSuggestion:
      'Audit all page titles and ensure each one is unique. Incorporate the primary keyword near the beginning and keep titles under 60 characters. Use the site structure to differentiate: "Business Funding | Start My Business" vs. "SBA Loans | Start My Business".',
    isFixed: false,
  },
  {
    id: '5',
    severity: 'high',
    category: 'schema',
    title: 'Missing FAQ schema on 8 informational pages',
    description:
      'Pages with FAQ sections are not marked up with FAQPage structured data. Adding this schema can unlock rich result snippets in Google search, significantly increasing SERP real estate.',
    affectedUrl: 'https://startmybusiness.us/paydex-score-guide',
    fixSuggestion:
      'Add FAQPage JSON-LD schema to each page containing questions and answers. Ensure the schema questions exactly match the visible on-page content. Validate with Google\'s Rich Results Test before deploying.',
    isFixed: false,
  },
  {
    id: '6',
    severity: 'high',
    category: 'mobile',
    title: 'Tap targets too small on mobile (14 instances)',
    description:
      'Interactive elements such as links and buttons are smaller than the recommended 48x48 CSS pixel minimum size. This causes accidental taps and degrades the mobile experience.',
    affectedUrl: 'https://startmybusiness.us/business-credit-cards-ein-only',
    fixSuggestion:
      'Increase the padding on all anchor tags and buttons in the footer navigation and sidebar. Use min-height: 48px and min-width: 48px or add padding to reach the minimum target size. Test on real devices after changes.',
    isFixed: true,
  },
  {
    id: '7',
    severity: 'high',
    category: 'performance',
    title: 'Render-blocking JavaScript in <head> (3 scripts)',
    description:
      'Three JavaScript files are loaded synchronously in the document head, blocking HTML parsing and delaying the First Contentful Paint by an estimated 620ms.',
    affectedUrl: 'https://startmybusiness.us/net-30-accounts',
    fixSuggestion:
      'Add the "defer" or "async" attribute to non-critical scripts. Move scripts that must execute before render to the bottom of <body>. Consider lazy-loading third-party scripts (chat widgets, analytics) until user interaction.',
    isFixed: false,
  },
  {
    id: '8',
    severity: 'high',
    category: 'seo',
    title: 'Images missing alt text (34 images)',
    description:
      'Images without descriptive alt attributes are invisible to screen readers and search engine crawlers. This hurts both accessibility compliance and image search visibility.',
    affectedUrl: 'https://startmybusiness.us/duns-number-guide',
    fixSuggestion:
      'Add descriptive alt text to every content image. Alt text should describe what the image shows and, where relevant, include the target keyword naturally. Decorative images should use alt="" (empty string).',
    isFixed: false,
  },
  {
    id: '9',
    severity: 'medium',
    category: 'links',
    title: 'Redirect chain detected (4 hops on 3 URLs)',
    description:
      'Some URLs redirect through 4 intermediate URLs before reaching the final destination. Redirect chains lose link equity at each hop and slow page load time for users.',
    affectedUrl: 'https://startmybusiness.us/llc-guide',
    fixSuggestion:
      'Audit all redirects and update them to point directly from source to final destination. Update any internal links or external references that point to intermediate redirect URLs. Never chain more than one redirect.',
    isFixed: false,
  },
  {
    id: '10',
    severity: 'medium',
    category: 'schema',
    title: 'Organization schema missing sameAs property',
    description:
      'The Organization schema on the homepage does not include sameAs links to your social media profiles. This property helps Google build a knowledge panel and understand your brand entity.',
    affectedUrl: 'https://startmybusiness.us/',
    fixSuggestion:
      'Add "sameAs" array to your Organization JSON-LD with full URLs to your LinkedIn, Facebook, Twitter/X, Instagram, and YouTube profiles. Also include your Wikidata and Crunchbase pages if available.',
    isFixed: false,
  },
  {
    id: '11',
    severity: 'medium',
    category: 'seo',
    title: 'Thin content pages below 300 words (6 pages)',
    description:
      'Six pages have fewer than 300 words of body content. While word count is not a direct ranking factor, thin pages rarely provide enough depth to rank for competitive queries and may trigger quality filters.',
    affectedUrl: 'https://startmybusiness.us/contact',
    fixSuggestion:
      'Expand thin pages with relevant, useful content: add an FAQ section, case studies, or supporting context. If a page truly has no content to add, consider consolidating it with a related page using a 301 redirect.',
    isFixed: false,
  },
  {
    id: '12',
    severity: 'medium',
    category: 'mobile',
    title: 'Viewport meta tag missing on 2 pages',
    description:
      'Two pages do not include the <meta name="viewport"> tag. Without this tag, mobile browsers render the page at desktop width and then scale it down, creating a poor mobile experience.',
    affectedUrl: 'https://startmybusiness.us/thank-you',
    fixSuggestion:
      'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> of all pages. If using a CMS template system, update the base template rather than each page individually.',
    isFixed: true,
  },
  {
    id: '13',
    severity: 'medium',
    category: 'performance',
    title: 'Unoptimized images not served in next-gen formats',
    description:
      '18 images are served in JPEG or PNG format instead of WebP or AVIF. Next-gen formats offer 25-50% smaller file sizes at comparable visual quality, reducing page weight and improving load times.',
    affectedUrl: 'https://startmybusiness.us/business-tradelines',
    fixSuggestion:
      'Convert all images to WebP using tools like Squoosh or Sharp. For WordPress, use an image optimization plugin. Set up server-level accept-header negotiation to serve WebP to supporting browsers and fallback JPEG/PNG to older ones.',
    isFixed: false,
  },
  {
    id: '14',
    severity: 'low',
    category: 'seo',
    title: 'H1 tag used more than once on 4 pages',
    description:
      'Best practice is to use a single H1 tag per page as the primary topic signal. Multiple H1 tags dilute the topical focus and can confuse search engine parsers about the page\'s main subject.',
    affectedUrl: 'https://startmybusiness.us/sba-loans-guide',
    fixSuggestion:
      'Audit the heading structure on each affected page. Keep one H1 with the primary keyword, then use H2 for major sections and H3 for subsections. Use a browser extension like "Web Developer" to inspect heading hierarchy.',
    isFixed: false,
  },
  {
    id: '15',
    severity: 'low',
    category: 'links',
    title: 'Nofollow applied to internal resource links',
    description:
      '9 internal links have rel="nofollow" applied, which instructs Google not to pass PageRank. Internal nofollow links waste link equity that should flow freely through your own site.',
    affectedUrl: 'https://startmybusiness.us/resources',
    fixSuggestion:
      'Remove rel="nofollow" from all internal links. The nofollow attribute is intended for external untrusted links, sponsored content, and user-generated content. Internal pages you control should always use standard followed links.',
    isFixed: false,
  },
]

// ---------------------------------------------------------------------------
// Filter config
// ---------------------------------------------------------------------------

type SeverityFilter = 'all' | IssueSeverity
type CategoryFilter = 'all' | IssueCategory

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

function getSeverityBadgeVariant(
  severity: IssueSeverity
): 'danger' | 'warning' | 'info' | 'outline' {
  switch (severity) {
    case 'critical':
      return 'danger'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'outline'
  }
}

function getSeverityOrder(severity: IssueSeverity): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[severity]
}

function getCategoryLabel(category: IssueCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

// ---------------------------------------------------------------------------
// Category score data
// ---------------------------------------------------------------------------

const CATEGORY_SCORES = [
  {
    label: 'Performance',
    score: 61,
    icon: <Zap className="h-4 w-4" />,
    color: '#D4A84B',
  },
  {
    label: 'Accessibility',
    score: 78,
    icon: <Shield className="h-4 w-4" />,
    color: '#10b981',
  },
  {
    label: 'SEO',
    score: 72,
    icon: <Search className="h-4 w-4" />,
    color: '#2563eb',
  },
  {
    label: 'Best Practices',
    score: 85,
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: '#8b5cf6',
  },
]

const OVERALL_SCORE = 74
const LAST_AUDIT_DATE = 'Feb 22, 2025 at 11:34 AM'

// ---------------------------------------------------------------------------
// Score color
// ---------------------------------------------------------------------------

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#D4A84B'
  return '#ef4444'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Work'
  return 'Poor'
}

// ---------------------------------------------------------------------------
// Category score mini-card
// ---------------------------------------------------------------------------

function CategoryScoreCard({
  label,
  score,
  icon,
  color,
}: {
  label: string
  score: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#111827] p-4">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#64748b]">{label}</p>
        <p className="text-lg font-bold" style={{ color }}>
          {score}
          <span className="text-xs font-normal text-[#64748b]">/100</span>
        </p>
      </div>
      <ProgressRing
        value={score}
        size={36}
        strokeWidth={3}
        color={color}
        showLabel={false}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Issue card
// ---------------------------------------------------------------------------

function IssueCard({
  issue,
  onMarkFixed,
}: {
  issue: AuditIssue
  onMarkFixed: (id: string) => void
}) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <Card
      className={cn(
        'transition-all duration-150',
        issue.isFixed && 'opacity-60'
      )}
    >
      <CardContent className="p-5">
        {/* Top row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                {issue.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {getCategoryLabel(issue.category)}
              </Badge>
              {issue.isFixed && (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" />
                  Fixed
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-[#f1f5f9] leading-snug">
              {issue.title}
            </h3>

            {/* Description */}
            <p className="mt-1.5 text-xs text-[#94a3b8] leading-relaxed">
              {issue.description}
            </p>

            {/* Affected URL */}
            <p className="mt-2 text-xs font-mono text-[#64748b]">
              {truncateUrl(issue.affectedUrl, 60)}
            </p>
          </div>
        </div>

        {/* Fix suggestion collapsible */}
        <div className="mt-3 border-t border-[#1e293b] pt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#D4A84B]">
              <Wrench className="h-3.5 w-3.5" />
              Fix Suggestion
            </span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#64748b]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#64748b]" />
            )}
          </button>

          {expanded && (
            <p className="mt-2 text-xs text-[#94a3b8] leading-relaxed rounded-lg bg-[#0d1520] border border-[#1e293b] p-3">
              {issue.fixSuggestion}
            </p>
          )}
        </div>

        {/* Footer actions */}
        {!issue.isFixed && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onMarkFixed(issue.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-[#4ade80]" />
              Mark Fixed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AuditPage() {
  const [issues, setIssues] = React.useState<AuditIssue[]>(
    [...MOCK_ISSUES].sort(
      (a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity)
    )
  )
  const [severityFilter, setSeverityFilter] =
    React.useState<SeverityFilter>('all')
  const [categoryFilter, setCategoryFilter] =
    React.useState<CategoryFilter>('all')

  const filtered = React.useMemo(() => {
    return issues.filter((issue) => {
      const matchSeverity =
        severityFilter === 'all' || issue.severity === severityFilter
      const matchCategory =
        categoryFilter === 'all' || issue.category === categoryFilter
      return matchSeverity && matchCategory
    })
  }, [issues, severityFilter, categoryFilter])

  const issueCounts = React.useMemo(
    () => ({
      critical: issues.filter(
        (i) => i.severity === 'critical' && !i.isFixed
      ).length,
      high: issues.filter((i) => i.severity === 'high' && !i.isFixed).length,
      medium: issues.filter((i) => i.severity === 'medium' && !i.isFixed)
        .length,
      low: issues.filter((i) => i.severity === 'low' && !i.isFixed).length,
    }),
    [issues]
  )

  function handleMarkFixed(id: string) {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFixed: true } : i))
    )
  }

  const SEVERITY_FILTERS: { label: string; value: SeverityFilter }[] = [
    { label: 'All Severity', value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ]

  const CATEGORY_FILTERS: { label: string; value: CategoryFilter }[] = [
    { label: 'All Categories', value: 'all' },
    { label: 'Performance', value: 'performance' },
    { label: 'SEO', value: 'seo' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Schema', value: 'schema' },
    { label: 'Links', value: 'links' },
    { label: 'Accessibility', value: 'accessibility' },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Site Audit</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#64748b]">
            <Calendar className="h-3.5 w-3.5" />
            Last audit: {LAST_AUDIT_DATE}
          </p>
        </div>
        <Button variant="gold" className="shrink-0">
          <RefreshCw className="h-4 w-4" />
          Run Full Audit
        </Button>
      </div>

      {/* ── Score overview ── */}
      <div className="mb-6 flex flex-col items-center gap-2 rounded-xl border border-[#1e293b] bg-[#111827] p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-[#64748b]">
          Overall Audit Score
        </p>
        <ProgressRing
          value={OVERALL_SCORE}
          size={120}
          strokeWidth={8}
          color={getScoreColor(OVERALL_SCORE)}
          label={
            <span className="text-center leading-tight">
              <span className="block text-2xl font-bold text-[#f1f5f9]">
                {OVERALL_SCORE}
              </span>
              <span className="block text-[10px] font-medium text-[#64748b]">
                /100
              </span>
            </span>
          }
          labelClassName="text-center"
        />
        <p
          className="text-sm font-semibold"
          style={{ color: getScoreColor(OVERALL_SCORE) }}
        >
          {getScoreLabel(OVERALL_SCORE)}
        </p>
        {/* Open issue summary */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
          {issueCounts.critical > 0 && (
            <span className="flex items-center gap-1 text-[#f87171]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
              {issueCounts.critical} critical
            </span>
          )}
          {issueCounts.high > 0 && (
            <span className="flex items-center gap-1 text-[#fbbf24]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              {issueCounts.high} high
            </span>
          )}
          {issueCounts.medium > 0 && (
            <span className="flex items-center gap-1 text-[#60a5fa]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
              {issueCounts.medium} medium
            </span>
          )}
          {issueCounts.low > 0 && (
            <span className="flex items-center gap-1 text-[#94a3b8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#64748b]" />
              {issueCounts.low} low
            </span>
          )}
        </div>
      </div>

      {/* ── Category scores ── */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_SCORES.map((cat) => (
          <CategoryScoreCard key={cat.label} {...cat} />
        ))}
      </div>

      {/* ── Issues section ── */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-[#f1f5f9]">
            Issues
            <span className="ml-2 rounded-full bg-[#1e293b] px-2 py-0.5 text-xs text-[#94a3b8]">
              {filtered.filter((i) => !i.isFixed).length} open
            </span>
          </h2>
        </div>

        {/* Filter bars */}
        <div className="mb-4 flex flex-col gap-2">
          {/* Severity filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {SEVERITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSeverityFilter(f.value)}
                className={cn(
                  'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-100',
                  severityFilter === f.value
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-[#111827] text-[#94a3b8] border border-[#1e293b] hover:border-[#334155] hover:text-[#f1f5f9]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategoryFilter(f.value)}
                className={cn(
                  'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-100',
                  categoryFilter === f.value
                    ? 'bg-[#1e293b] text-[#f1f5f9] border border-[#334155]'
                    : 'bg-transparent text-[#64748b] border border-transparent hover:text-[#94a3b8]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Issues list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="No issues match your filters"
            description="Try adjusting the severity or category filters to see more issues."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onMarkFixed={handleMarkFixed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
