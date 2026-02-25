// ---------------------------------------------------------------------------
// Agent registry for the Agentic SEO System.
// Each entry maps to an autonomous agent that runs on a schedule or on-demand.
// The `icon` field corresponds to a lucide-react component name.
// ---------------------------------------------------------------------------

export interface AgentDefinition {
  id: string
  name: string
  description: string
  /** lucide-react icon component name */
  icon: string
  /** Brand/accent color for the agent card and badge */
  color: string
  /** Human-readable schedule description */
  schedule: string
  capabilities: string[]
}

export const AGENTS: AgentDefinition[] = [
  {
    id: "keyword-scout",
    name: "Keyword Scout",
    description:
      "Discovers new keyword opportunities via GSC data analysis and Answer The Public",
    icon: "Search",
    color: "#3b82f6",
    schedule: "Daily at 6:00 AM",
    capabilities: [
      "GSC query mining for hidden long-tail keywords",
      "Answer The Public batch queries for seed terms",
      "Search volume and difficulty enrichment",
      "Intent classification (informational / transactional / commercial)",
      "Opportunity scoring and prioritization",
      "Auto-creates keyword records in the database",
    ],
  },
  {
    id: "rank-tracker",
    name: "Rank Tracker",
    description:
      "Monitors daily ranking changes and alerts on significant position shifts",
    icon: "TrendingUp",
    color: "#10b981",
    schedule: "Daily at 7:00 AM",
    capabilities: [
      "Daily position snapshots from GSC for all tracked keywords",
      "Calculates day-over-day and week-over-week position deltas",
      "Alerts on drops of 5+ positions or gains of 3+ positions",
      "Tracks SERP feature appearances (featured snippets, PAA)",
      "Stores historical position series for trend analysis",
      "Exports ranking reports to Google Sheets",
    ],
  },
  {
    id: "content-optimizer",
    name: "Content Optimizer",
    description:
      "Analyzes page content quality and generates optimization briefs",
    icon: "FileText",
    color: "#8b5cf6",
    schedule: "Weekly on Monday at 8:00 AM",
    capabilities: [
      "Crawls client URLs for on-page content signals",
      "Scores pages on word count, heading structure, and keyword coverage",
      "Compares against top 10 SERP competitors",
      "Generates AI-powered content briefs with title suggestions",
      "Identifies content gaps and semantic coverage mismatches",
      "Tracks content freshness and flags stale pages",
    ],
  },
  {
    id: "technical-auditor",
    name: "Technical Auditor",
    description:
      "Crawls sites for technical SEO issues: speed, mobile, schema, links",
    icon: "Shield",
    color: "#f59e0b",
    schedule: "Weekly on Sunday at 2:00 AM",
    capabilities: [
      "Full site crawl for broken internal and external links",
      "Core Web Vitals checks (LCP, CLS, FID) via Lighthouse API",
      "Mobile-friendliness and viewport configuration analysis",
      "Schema.org structured data validation",
      "Canonical tag and hreflang consistency checks",
      "XML sitemap and robots.txt verification",
    ],
  },
  {
    id: "competitor-watcher",
    name: "Competitor Watcher",
    description:
      "Tracks competitor rankings, content changes, and backlink profiles",
    icon: "Eye",
    color: "#ef4444",
    schedule: "Daily at 9:00 AM",
    capabilities: [
      "Monitors competitor keyword rankings across tracked terms",
      "Detects new competitor content and landing pages",
      "Alerts on competitors entering the top 3 for client keywords",
      "Tracks estimated organic traffic changes via GSC comparison",
      "Identifies competitor backlink acquisition patterns",
      "Generates competitive gap and overlap reports",
    ],
  },
  {
    id: "report-generator",
    name: "Report Generator",
    description:
      "Generates weekly AI-powered SEO performance reports",
    icon: "BarChart3",
    color: "#D4A84B",
    schedule: "Every Monday at 10:00 AM",
    capabilities: [
      "Pulls 30-day GSC performance summary per client",
      "Highlights wins, losses, and actionable opportunities",
      "Generates natural-language executive summaries via AI",
      "Creates visual charts for rankings, clicks, and impressions",
      "Exports PDF-ready reports with client branding",
      "Sends reports via email or uploads to Google Drive",
    ],
  },
]

/**
 * Look up an agent definition by its ID.
 * Returns undefined if no agent with that ID exists.
 */
export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENTS.find((agent) => agent.id === id)
}

/**
 * Return all agent IDs as a typed union-safe array.
 */
export function getAgentIds(): string[] {
  return AGENTS.map((agent) => agent.id)
}
