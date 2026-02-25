// ---------------------------------------------------------------------------
// App-wide constants — SMB Agentic SEO Design System
// ---------------------------------------------------------------------------

export const APP_NAME = 'SMB Agentic SEO'
export const APP_DESCRIPTION =
  'AI-powered SEO automation platform by Start My Business for tracking, optimizing, and scaling organic growth.'
export const APP_VERSION = '1.0.0'

// ---------------------------------------------------------------------------
// Design System Colors
// ---------------------------------------------------------------------------

export const COLORS = {
  primary:    '#1E40AF',
  secondary:  '#3B82F6',
  accent:     '#F59E0B',
  bg:         '#F8FAFC',
  surface:    '#FFFFFF',
  text:       '#1E3A8A',
  textMuted:  '#64748B',
  success:    '#10B981',
  warning:    '#F59E0B',
  error:      '#EF4444',
  border:     '#E2E8F0',
  muted:      '#F1F5F9',
} as const

// Client avatar color palette (cycles through for new clients)
export const CLIENT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#EF4444',
  '#F59E0B',
  '#F97316',
] as const

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string
  href: string
  /** lucide-react icon component name */
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',   icon: 'LayoutDashboard' },
  { label: 'Keywords',    href: '/keywords',    icon: 'Search' },
  { label: 'Content',     href: '/content',     icon: 'FileText' },
  { label: 'Audit',       href: '/audit',       icon: 'Shield' },
  { label: 'Competitors', href: '/competitors', icon: 'Eye' },
  { label: 'Agents',      href: '/agents',      icon: 'Bot' },
  { label: 'Reports',     href: '/reports',     icon: 'BarChart3' },
  { label: 'Settings',    href: '/settings',    icon: 'Settings' },
]

// ---------------------------------------------------------------------------
// Date range presets
// ---------------------------------------------------------------------------

export const DATE_RANGE_PRESETS = [
  { label: 'Last 7 days',    value: '7d',  days: 7 },
  { label: 'Last 28 days',   value: '28d', days: 28 },
  { label: 'Last 3 months',  value: '3m',  days: 90 },
  { label: 'Last 6 months',  value: '6m',  days: 180 },
  { label: 'Last 12 months', value: '12m', days: 365 },
] as const

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]['value']

// ---------------------------------------------------------------------------
// Platform options (matches SEOClient.platform)
// ---------------------------------------------------------------------------

export const PLATFORM_OPTIONS = [
  { label: 'WordPress', value: 'wordpress' },
  { label: 'Webflow',   value: 'webflow' },
  { label: 'Shopify',   value: 'shopify' },
  { label: 'Custom',    value: 'custom' },
  { label: 'Other',     value: 'other' },
] as const

// ---------------------------------------------------------------------------
// Data source options for client onboarding
// ---------------------------------------------------------------------------

export const DATA_SOURCE_OPTIONS = [
  { label: 'Google Search Console', value: 'gsc' },
  { label: 'Google Analytics 4',    value: 'ga4' },
  { label: 'Answer The Public',     value: 'atp' },
  { label: 'Manual Keywords',       value: 'manual' },
] as const

// ---------------------------------------------------------------------------
// Industry options
// ---------------------------------------------------------------------------

export const INDUSTRY_OPTIONS = [
  { label: 'Business Services',  value: 'business-services' },
  { label: 'E-Commerce',         value: 'ecommerce' },
  { label: 'Finance / Credit',   value: 'finance' },
  { label: 'Real Estate',        value: 'real-estate' },
  { label: 'Legal',              value: 'legal' },
  { label: 'Health / Wellness',  value: 'health' },
  { label: 'Technology / SaaS',  value: 'tech' },
  { label: 'Education',          value: 'education' },
  { label: 'Other',              value: 'other' },
] as const

// ---------------------------------------------------------------------------
// Keyword intent labels
// ---------------------------------------------------------------------------

export const INTENT_LABELS = {
  informational: { label: 'Informational', color: '#3B82F6',  bg: '#EFF6FF' },
  navigational:  { label: 'Navigational',  color: '#64748B',  bg: '#F1F5F9' },
  transactional: { label: 'Transactional', color: '#10B981',  bg: '#ECFDF5' },
  commercial:    { label: 'Commercial',    color: '#8B5CF6',  bg: '#F5F3FF' },
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
  if (score >= HEALTH_SCORE_THRESHOLDS.excellent) return 'Excellent'
  if (score >= HEALTH_SCORE_THRESHOLDS.good) return 'Good'
  if (score >= HEALTH_SCORE_THRESHOLDS.fair) return 'Fair'
  return 'Poor'
}

export function getHealthScoreColor(score: number): string {
  if (score >= HEALTH_SCORE_THRESHOLDS.excellent) return '#10B981'
  if (score >= HEALTH_SCORE_THRESHOLDS.good) return '#3B82F6'
  if (score >= HEALTH_SCORE_THRESHOLDS.fair) return '#F59E0B'
  return '#EF4444'
}
