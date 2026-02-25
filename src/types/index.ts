// ---------------------------------------------------------------------------
// Database entity types
// These mirror the Supabase table schemas for the Agentic SEO System.
// ---------------------------------------------------------------------------

export interface SEOClient {
  id: string
  created_at: string
  updated_at: string
  business_name: string
  url: string
  niche: string
  platform: "wordpress" | "webflow" | "shopify" | "custom" | "other"
  gsc_property_url: string | null
  ga_property_id: string | null
  data_sources: string[]
  is_active: boolean
  health_score: number | null
  notes: string | null
}

export interface Keyword {
  id: string
  created_at: string
  updated_at: string
  client_id: string
  keyword: string
  search_volume: number | null
  difficulty: number | null
  current_position: number | null
  previous_position: number | null
  position_change: number | null
  clicks: number | null
  impressions: number | null
  ctr: number | null
  url: string | null
  last_checked: string | null
  is_tracked: boolean
  tags: string[]
  intent: "informational" | "navigational" | "transactional" | "commercial" | null
}

export interface ContentBrief {
  id: string
  created_at: string
  updated_at: string
  client_id: string
  keyword_id: string | null
  title: string
  target_keyword: string
  secondary_keywords: string[]
  word_count_target: number | null
  status: "pending" | "in_progress" | "ready" | "published" | "archived"
  ai_brief: string | null
  competitor_urls: string[]
  notes: string | null
  assigned_to: string | null
  due_date: string | null
  published_url: string | null
}

export interface SEOPerformance {
  id: string
  created_at: string
  client_id: string
  date: string
  total_clicks: number
  total_impressions: number
  avg_ctr: number
  avg_position: number
  organic_sessions: number | null
  organic_revenue: number | null
  new_keywords: number
  keywords_top3: number
  keywords_top10: number
  keywords_top100: number
}

export interface SiteAudit {
  id: string
  created_at: string
  updated_at: string
  client_id: string
  status: "pending" | "running" | "completed" | "failed"
  started_at: string | null
  completed_at: string | null
  score: number | null
  issues_critical: number
  issues_warning: number
  issues_info: number
  page_count: number | null
  issues: AuditIssue[]
  raw_data: Record<string, unknown> | null
}

export interface AuditIssue {
  type: "critical" | "warning" | "info"
  category: "speed" | "mobile" | "schema" | "links" | "meta" | "content" | "security" | "other"
  title: string
  description: string
  affected_urls: string[]
  recommendation: string
}

export interface Competitor {
  id: string
  created_at: string
  updated_at: string
  client_id: string
  domain: string
  name: string | null
  is_active: boolean
  last_analyzed: string | null
  domain_authority: number | null
  backlink_count: number | null
  organic_keywords: number | null
  organic_traffic: number | null
  notes: string | null
}

export interface CompetitorRanking {
  id: string
  created_at: string
  competitor_id: string
  client_id: string
  keyword: string
  competitor_position: number | null
  client_position: number | null
  date: string
  competitor_url: string | null
  client_url: string | null
}

export interface AgentRun {
  id: string
  created_at: string
  updated_at: string
  agent_id: string
  client_id: string | null
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  started_at: string | null
  completed_at: string | null
  duration_seconds: number | null
  trigger: "manual" | "scheduled" | "webhook"
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  error: string | null
  tokens_used: number | null
  log_lines: string[]
}

export interface AgentConfig {
  id: string
  created_at: string
  updated_at: string
  agent_id: string
  client_id: string | null
  is_enabled: boolean
  schedule_cron: string | null
  settings: Record<string, unknown>
  last_run: string | null
  next_run: string | null
}

export interface DashboardMetrics {
  total_clients: number
  active_clients: number
  total_keywords_tracked: number
  keywords_gained_top10_30d: number
  avg_health_score: number
  total_clicks_30d: number
  total_impressions_30d: number
  avg_position_30d: number
  content_briefs_pending: number
  audits_issues_critical: number
  agents_running: number
  agents_completed_today: number
}

export interface GSCRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface WorkflowLog {
  id: string
  created_at: string
  workflow_id: string
  workflow_name: string
  client_id: string | null
  execution_id: string | null
  status: "success" | "error" | "running"
  duration_ms: number | null
  items_processed: number | null
  error_message: string | null
  metadata: Record<string, unknown> | null
}

export interface ATPBatch {
  id: string
  created_at: string
  updated_at: string
  client_id: string
  seed_keyword: string
  status: "pending" | "fetching" | "completed" | "failed"
  fetched_at: string | null
  questions: ATPQuestion[]
  total_questions: number
  keywords_created: number
}

export interface ATPQuestion {
  question: string
  category: "what" | "how" | "why" | "where" | "who" | "when" | "which" | "are" | "can" | "will" | "other"
  estimated_volume: number | null
  keyword_created: boolean
}

// ---------------------------------------------------------------------------
// Form & UI types
// ---------------------------------------------------------------------------

export interface OnboardingFormData {
  url: string
  business_name: string
  niche: string
  platform: SEOClient["platform"]
  gsc_property_url: string
  data_sources: string[]
}

// ---------------------------------------------------------------------------
// Utility / helper types
// ---------------------------------------------------------------------------

export type SortDirection = "asc" | "desc"

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface FilterState {
  search: string
  clientId: string | null
  dateRange: {
    start: string
    end: string
  }
}

export type AgentStatus = AgentRun["status"]
export type ContentStatus = ContentBrief["status"]
export type AuditStatus = SiteAudit["status"]
