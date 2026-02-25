// ---------------------------------------------------------------------------
// App-wide constants for the Agentic SEO System.
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string
  href: string
  /** lucide-react icon component name */
  icon: string
}

/**
 * Primary navigation items used by the sidebar.
 * Icons map to lucide-react component names.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
  },
  {
    label: "Keywords",
    href: "/keywords",
    icon: "Search",
  },
  {
    label: "Content",
    href: "/content",
    icon: "FileText",
  },
  {
    label: "Audit",
    href: "/audit",
    icon: "Shield",
  },
  {
    label: "Competitors",
    href: "/competitors",
    icon: "Eye",
  },
  {
    label: "Agents",
    href: "/agents",
    icon: "Bot",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart3",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
  },
]

// ---------------------------------------------------------------------------
// Date range presets
// ---------------------------------------------------------------------------

export const DATE_RANGE_PRESETS = [
  { label: "Last 7 days", value: "7d", days: 7 },
  { label: "Last 28 days", value: "28d", days: 28 },
  { label: "Last 3 months", value: "3m", days: 90 },
  { label: "Last 6 months", value: "6m", days: 180 },
  { label: "Last 12 months", value: "12m", days: 365 },
] as const

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]["value"]

// ---------------------------------------------------------------------------
// Platform options (matches SEOClient.platform)
// ---------------------------------------------------------------------------

export const PLATFORM_OPTIONS = [
  { label: "WordPress", value: "wordpress" },
  { label: "Webflow", value: "webflow" },
  { label: "Shopify", value: "shopify" },
  { label: "Custom", value: "custom" },
  { label: "Other", value: "other" },
] as const

// ---------------------------------------------------------------------------
// Data source options for client onboarding
// ---------------------------------------------------------------------------

export const DATA_SOURCE_OPTIONS = [
  { label: "Google Search Console", value: "gsc" },
  { label: "Google Analytics 4", value: "ga4" },
  { label: "Answer The Public", value: "atp" },
  { label: "Manual Keywords", value: "manual" },
] as const

// ---------------------------------------------------------------------------
// Keyword intent labels
// ---------------------------------------------------------------------------

export const INTENT_LABELS = {
  informational: { label: "Informational", color: "text-blue-500" },
  navigational: { label: "Navigational", color: "text-gray-500" },
  transactional: { label: "Transactional", color: "text-green-500" },
  commercial: { label: "Commercial", color: "text-purple-500" },
} as const

// ---------------------------------------------------------------------------
// Health score thresholds
// ---------------------------------------------------------------------------

export const HEALTH_SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 0,
} as const

export function getHealthScoreLabel(score: number): string {
  if (score >= HEALTH_SCORE_THRESHOLDS.excellent) return "Excellent"
  if (score >= HEALTH_SCORE_THRESHOLDS.good) return "Good"
  if (score >= HEALTH_SCORE_THRESHOLDS.fair) return "Fair"
  return "Poor"
}

export function getHealthScoreColor(score: number): string {
  if (score >= HEALTH_SCORE_THRESHOLDS.excellent) return "text-green-500"
  if (score >= HEALTH_SCORE_THRESHOLDS.good) return "text-blue-500"
  if (score >= HEALTH_SCORE_THRESHOLDS.fair) return "text-yellow-500"
  return "text-red-500"
}

// ---------------------------------------------------------------------------
// App metadata
// ---------------------------------------------------------------------------

export const APP_NAME = "Agentic SEO System"
export const APP_DESCRIPTION =
  "AI-powered SEO automation platform for tracking, optimizing, and scaling organic growth."
export const APP_VERSION = "1.0.0"
