-- ============================================================================
-- SEO/AEO AUTOMATION SYSTEM - EXTENDED SCHEMA MIGRATION
-- ============================================================================
-- Extends existing schema with new tables for advanced agent capabilities:
-- - Site audits and issue tracking
-- - Competitor intelligence and ranking tracking
-- - Agent run history and orchestration
-- - Scan jobs and deep site analysis
-- - SEO reporting with AI summaries
--
-- Project: Start My Business Inc. - Agentic SEO System
-- ============================================================================

-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. EXTEND SEO_CLIENTS TABLE WITH NEW COLUMNS
-- ============================================================================
-- Add columns for agent configuration, data sources, and competitor tracking

ALTER TABLE seo_clients
ADD COLUMN IF NOT EXISTS data_sources JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scan_depth TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS agent_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS competitor_domains JSONB DEFAULT '[]'::jsonb;

-- Add comments for new columns
COMMENT ON COLUMN seo_clients.data_sources IS 'Array of data source integrations: ["gsc", "apify", "semrush", "ahrefs"]';
COMMENT ON COLUMN seo_clients.scan_depth IS 'Default scan depth: quick, standard, deep';
COMMENT ON COLUMN seo_clients.agent_config IS 'JSON configuration for autonomous agents: {keyword_scout: {enabled: true}, rank_tracker: {...}}';
COMMENT ON COLUMN seo_clients.competitor_domains IS 'Array of competitor domains to track';

-- ============================================================================
-- 2. SITE AUDITS TABLE
-- ============================================================================
-- Stores technical SEO issues, performance problems, and recommendations

CREATE TABLE IF NOT EXISTS site_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,

    -- Audit Metadata
    audit_type TEXT NOT NULL, -- 'full', 'quick', 'deep', 'page_speed', 'mobile', 'schema', 'links', 'security'
    url TEXT,

    -- Issue Classification
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    category TEXT NOT NULL, -- 'performance', 'seo', 'mobile', 'schema', 'links', 'accessibility', 'security'

    -- Issue Details
    title TEXT NOT NULL,
    description TEXT,
    recommendation TEXT,
    evidence JSONB, -- Technical details: {metric: value, expected: value}

    -- Resolution Tracking
    is_fixed BOOLEAN DEFAULT false,
    fixed_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for site_audits
CREATE INDEX IF NOT EXISTS idx_site_audits_client ON site_audits(client_id);
CREATE INDEX IF NOT EXISTS idx_site_audits_severity ON site_audits(client_id, severity, is_fixed);
CREATE INDEX IF NOT EXISTS idx_site_audits_category ON site_audits(category);
CREATE INDEX IF NOT EXISTS idx_site_audits_created ON site_audits(client_id, created_at DESC);

-- Row level security for site_audits
ALTER TABLE site_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON site_audits FOR ALL USING (true);

-- ============================================================================
-- 3. COMPETITORS TABLE
-- ============================================================================
-- Track competitor sites and their key metrics

CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,

    -- Competitor Info
    domain TEXT NOT NULL,
    name TEXT,

    -- Authority & Traffic
    domain_authority INTEGER, -- 0-100 scale
    page_authority INTEGER,
    estimated_traffic INTEGER, -- Monthly organic traffic estimate
    backlink_count INTEGER,

    -- Competitive Analysis
    overlap_percentage DECIMAL(5,2), -- % of keywords we both rank for
    threat_level TEXT DEFAULT 'medium' CHECK (threat_level IN ('high', 'medium', 'low')),
    competitive_gaps JSONB, -- {keywords_they_rank_not_us: [...], we_rank_not_they: [...]}

    -- Status & Tracking
    active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_analyzed_at TIMESTAMP WITH TIME ZONE,

    -- Unique constraint
    UNIQUE(client_id, domain)
);

-- Indexes for competitors
CREATE INDEX IF NOT EXISTS idx_competitors_client ON competitors(client_id);
CREATE INDEX IF NOT EXISTS idx_competitors_threat ON competitors(client_id, threat_level);
CREATE INDEX IF NOT EXISTS idx_competitors_overlap ON competitors(client_id, overlap_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_competitors_active ON competitors(client_id, active);

-- Row level security for competitors
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON competitors FOR ALL USING (true);

-- ============================================================================
-- 4. COMPETITOR RANKINGS TABLE
-- ============================================================================
-- Track competitor rankings for shared keywords

CREATE TABLE IF NOT EXISTS competitor_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,

    -- Keyword Data
    keyword TEXT NOT NULL,

    -- Ranking Metrics
    competitor_position DECIMAL(5,2), -- Their ranking position
    our_position DECIMAL(5,2), -- Our ranking position
    position_gap DECIMAL(5,2) GENERATED ALWAYS AS (COALESCE(competitor_position, 100) - COALESCE(our_position, 100)) STORED,

    -- Search Metrics
    search_volume INTEGER,
    monthly_traffic INTEGER, -- Estimated traffic for this keyword

    -- Opportunity Assessment
    opportunity TEXT DEFAULT 'monitor' CHECK (opportunity IN ('win', 'close', 'losing', 'monitor')),
    opportunity_score DECIMAL(5,2), -- 0-100 score for winning this keyword

    -- Timestamps
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for competitor_rankings
CREATE INDEX IF NOT EXISTS idx_competitor_rankings_competitor ON competitor_rankings(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_rankings_keyword ON competitor_rankings(client_id, keyword);
CREATE INDEX IF NOT EXISTS idx_competitor_rankings_opportunity ON competitor_rankings(client_id, opportunity);
CREATE INDEX IF NOT EXISTS idx_competitor_rankings_score ON competitor_rankings(client_id, opportunity_score DESC);

-- Row level security for competitor_rankings
ALTER TABLE competitor_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON competitor_rankings FOR ALL USING (true);

-- ============================================================================
-- 5. AGENT RUNS TABLE
-- ============================================================================
-- Track autonomous agent executions and their results

CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,

    -- Agent Info
    agent_type TEXT NOT NULL, -- 'keyword-scout', 'rank-tracker', 'audit-runner', 'report-generator', 'competitor-analyzer'
    agent_name TEXT, -- Human-readable agent name

    -- Execution Details
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

    -- Performance
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER, -- Execution time in milliseconds

    -- Results
    results JSONB, -- Agent-specific results: {keywords_found: N, audits_created: N, etc}
    error_message TEXT,
    error_details JSONB, -- Stack trace or detailed error info

    -- Trigger & Context
    triggered_by TEXT DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'schedule', 'webhook', 'user')),
    triggered_by_user TEXT, -- User email/ID if manually triggered

    -- Configuration Used
    config_snapshot JSONB, -- Snapshot of agent config at time of execution

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for agent_runs
CREATE INDEX IF NOT EXISTS idx_agent_runs_client ON agent_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_type ON agent_runs(agent_type, status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(client_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created ON agent_runs(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_completed ON agent_runs(client_id, completed_at DESC) WHERE status = 'completed';

-- Row level security for agent_runs
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON agent_runs FOR ALL USING (true);

-- ============================================================================
-- 6. SCAN JOBS TABLE
-- ============================================================================
-- Track site crawl/scan jobs for technical analysis

CREATE TABLE IF NOT EXISTS scan_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,

    -- Scan Configuration
    url TEXT NOT NULL,
    depth TEXT DEFAULT 'standard' CHECK (depth IN ('quick', 'standard', 'deep')),

    -- Scan Execution
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'processing', 'completed', 'failed')),

    -- Progress Tracking
    pages_scanned INTEGER DEFAULT 0,
    pages_total INTEGER,

    -- Results
    results JSONB, -- {issues: [], performance: {score: N}, seo: {...}, accessibility: {...}}
    stats JSONB, -- {broken_links: N, redirect_chains: N, duplicate_content: N, etc}
    issues_count JSONB, -- {critical: N, high: N, medium: N, low: N, info: N}

    -- Performance Metrics
    crawl_duration_seconds INTEGER,
    average_page_load_ms DECIMAL(8,2),

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scan_jobs
CREATE INDEX IF NOT EXISTS idx_scan_jobs_client ON scan_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON scan_jobs(client_id, status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created ON scan_jobs(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_completed ON scan_jobs(completed_at DESC) WHERE status = 'completed';

-- Row level security for scan_jobs
ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON scan_jobs FOR ALL USING (true);

-- ============================================================================
-- 7. SEO REPORTS TABLE
-- ============================================================================
-- AI-generated comprehensive SEO reports with insights and recommendations

CREATE TABLE IF NOT EXISTS seo_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,

    -- Report Type & Period
    report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'custom', 'executive')),
    title TEXT NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,

    -- Executive Summary
    executive_summary TEXT, -- 2-3 paragraph high-level summary

    -- Key Findings
    key_wins JSONB, -- [{title, description, metric_change}]
    key_concerns JSONB, -- [{title, severity, impact, recommendation}]

    -- Recommendations
    recommendations JSONB, -- [{priority, category, action, expected_impact, resources_needed}]

    -- Competitive Analysis
    competitor_summary JSONB, -- {threats: [], opportunities: [], ranking_changes: []}

    -- Agent-Generated Content
    agent_summary JSONB, -- Summary of agent work done this period
    agent_insights JSONB, -- {patterns_found: [], anomalies: [], opportunities: []}

    -- Metrics & KPIs
    metrics JSONB, -- {impressions, clicks, ctr, position, traffic, revenue, etc}
    metric_changes JSONB, -- {field: {current, previous, change_pct, trend}}

    -- Report Metadata
    status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'scheduled', 'sent', 'archived')),
    scheduled_send_date TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    generated_by TEXT DEFAULT 'claude-3.5-sonnet', -- AI model used
    generation_time_ms INTEGER,

    -- Report Content
    full_html TEXT, -- Full HTML report for email/web delivery
    pdf_url TEXT, -- URL to PDF version if generated

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for seo_reports
CREATE INDEX IF NOT EXISTS idx_seo_reports_client ON seo_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_seo_reports_period ON seo_reports(client_id, date_range_end DESC);
CREATE INDEX IF NOT EXISTS idx_seo_reports_status ON seo_reports(client_id, status);
CREATE INDEX IF NOT EXISTS idx_seo_reports_type ON seo_reports(report_type, created_at DESC);

-- Row level security for seo_reports
ALTER TABLE seo_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON seo_reports FOR ALL USING (true);

-- ============================================================================
-- 8. ADVANCED INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================

-- Multi-column indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_site_audits_client_severity_fixed
    ON site_audits(client_id, severity, is_fixed);

CREATE INDEX IF NOT EXISTS idx_competitor_rankings_client_opportunity_score
    ON competitor_rankings(client_id, opportunity, opportunity_score DESC);

CREATE INDEX IF NOT EXISTS idx_agent_runs_client_type_status
    ON agent_runs(client_id, agent_type, status);

CREATE INDEX IF NOT EXISTS idx_scan_jobs_client_status_date
    ON scan_jobs(client_id, status, created_at DESC);

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate competitive position gap
CREATE OR REPLACE FUNCTION calculate_competitive_gap(
    p_our_position DECIMAL,
    p_competitor_position DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN COALESCE(p_competitor_position, 100) - COALESCE(p_our_position, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to assess opportunity level based on rankings
CREATE OR REPLACE FUNCTION assess_opportunity(
    p_our_position DECIMAL,
    p_competitor_position DECIMAL,
    p_search_volume INTEGER
) RETURNS TEXT AS $$
BEGIN
    IF p_our_position IS NULL OR p_our_position > 50 THEN
        RETURN 'monitor'; -- We're not ranking well
    ELSIF p_competitor_position < p_our_position - 3 THEN
        RETURN 'losing'; -- We're falling behind
    ELSIF ABS(p_competitor_position - p_our_position) <= 3 THEN
        RETURN 'close'; -- Close race, opportunity to win
    ELSIF p_competitor_position > p_our_position THEN
        RETURN 'win'; -- We have advantage
    ELSE
        RETURN 'monitor';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to clean up old scan job results (retain last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_scan_jobs()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM scan_jobs
    WHERE status = 'completed'
      AND created_at < NOW() - INTERVAL '90 days'
      AND results IS NOT NULL;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN QUERY SELECT v_deleted;
END;
$$ LANGUAGE plpgsql;

-- Function to get agent run statistics for client
CREATE OR REPLACE FUNCTION get_agent_stats(p_client_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    agent_type TEXT,
    total_runs INTEGER,
    successful_runs INTEGER,
    failed_runs INTEGER,
    avg_duration_ms INTEGER,
    last_run_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ar.agent_type,
        COUNT(*)::INTEGER as total_runs,
        COUNT(*) FILTER (WHERE ar.status = 'completed')::INTEGER as successful_runs,
        COUNT(*) FILTER (WHERE ar.status = 'failed')::INTEGER as failed_runs,
        AVG(ar.duration_ms)::INTEGER as avg_duration_ms,
        MAX(ar.completed_at) as last_run_at
    FROM agent_runs ar
    WHERE ar.client_id = p_client_id
      AND ar.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY ar.agent_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 10. VIEWS FOR ANALYSIS
-- ============================================================================

-- View: Active security issues and audits
CREATE OR REPLACE VIEW v_active_audits AS
SELECT
    c.id as client_id,
    c.business_name,
    c.domain,
    sa.id as audit_id,
    sa.severity,
    sa.category,
    sa.title,
    sa.url,
    sa.created_at,
    COUNT(*) OVER (PARTITION BY sa.client_id, sa.severity) as issue_count
FROM site_audits sa
JOIN seo_clients c ON sa.client_id = c.id
WHERE sa.is_fixed = false
ORDER BY sa.created_at DESC;

-- View: Competitor threat analysis
CREATE OR REPLACE VIEW v_competitor_threats AS
SELECT
    c.id as client_id,
    c.business_name,
    c.domain as our_domain,
    co.id as competitor_id,
    co.domain as competitor_domain,
    co.threat_level,
    co.overlap_percentage,
    COUNT(DISTINCT cr.id) as shared_keywords,
    COUNT(DISTINCT cr.id) FILTER (WHERE cr.opportunity = 'win')::INTEGER as win_opportunities,
    COUNT(DISTINCT cr.id) FILTER (WHERE cr.opportunity = 'close')::INTEGER as close_races,
    AVG(cr.opportunity_score) as avg_opportunity_score
FROM competitors co
LEFT JOIN competitor_rankings cr ON co.id = cr.competitor_id
JOIN seo_clients c ON co.client_id = c.id
WHERE co.active = true
GROUP BY c.id, c.business_name, c.domain, co.id, co.domain, co.threat_level, co.overlap_percentage
ORDER BY co.threat_level DESC, co.overlap_percentage DESC;

-- View: Recent agent activity
CREATE OR REPLACE VIEW v_recent_agent_activity AS
SELECT
    ar.id as run_id,
    ar.client_id,
    c.business_name,
    c.domain,
    ar.agent_type,
    ar.status,
    ar.triggered_by,
    ar.created_at,
    ar.completed_at,
    ar.duration_ms,
    ar.results,
    CASE
        WHEN ar.status = 'completed' THEN 'success'
        WHEN ar.status = 'failed' THEN 'error'
        WHEN ar.status = 'running' THEN 'in-progress'
        ELSE ar.status
    END as run_status
FROM agent_runs ar
JOIN seo_clients c ON ar.client_id = c.id
WHERE ar.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ar.created_at DESC;

-- View: Scan job summary
CREATE OR REPLACE VIEW v_scan_job_summary AS
SELECT
    c.id as client_id,
    c.business_name,
    c.domain,
    sj.id as scan_id,
    sj.status,
    sj.depth,
    sj.pages_scanned,
    sj.pages_total,
    sj.created_at,
    sj.completed_at,
    (sj.issues_count->>'critical')::INTEGER as critical_issues,
    (sj.issues_count->>'high')::INTEGER as high_issues,
    (sj.issues_count->>'medium')::INTEGER as medium_issues,
    CASE
        WHEN (sj.issues_count->>'critical')::INTEGER > 0 THEN 'critical'
        WHEN (sj.issues_count->>'high')::INTEGER > 0 THEN 'high'
        WHEN (sj.issues_count->>'medium')::INTEGER > 0 THEN 'medium'
        ELSE 'low'
    END as overall_health
FROM scan_jobs sj
JOIN seo_clients c ON sj.client_id = c.id
WHERE sj.status = 'completed'
ORDER BY sj.created_at DESC;

-- View: Top winning opportunities from competitive analysis
CREATE OR REPLACE VIEW v_top_opportunities AS
SELECT
    c.id as client_id,
    c.business_name,
    c.domain,
    cr.keyword,
    cr.search_volume,
    cr.our_position,
    cr.competitor_position,
    cr.position_gap,
    cr.opportunity_score,
    co.domain as competitor_domain,
    co.threat_level
FROM competitor_rankings cr
JOIN competitors co ON cr.competitor_id = co.id
JOIN seo_clients c ON cr.client_id = c.id
WHERE cr.opportunity IN ('win', 'close')
  AND cr.opportunity_score >= 70
ORDER BY cr.opportunity_score DESC
LIMIT 100;

-- ============================================================================
-- 11. DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE site_audits IS 'Technical SEO audits, performance issues, and recommendations';
COMMENT ON TABLE competitors IS 'Competitor site intelligence and metrics';
COMMENT ON TABLE competitor_rankings IS 'Keyword rankings for competitors vs our site';
COMMENT ON TABLE agent_runs IS 'Autonomous agent execution history and results';
COMMENT ON TABLE scan_jobs IS 'Site crawl/scan jobs for technical analysis';
COMMENT ON TABLE seo_reports IS 'AI-generated comprehensive SEO reports';

COMMENT ON COLUMN site_audits.severity IS 'Critical, High, Medium, Low, or Info severity level';
COMMENT ON COLUMN competitors.threat_level IS 'Assessment of competitive threat: high, medium, low';
COMMENT ON COLUMN agent_runs.agent_type IS 'Type of agent: keyword-scout, rank-tracker, audit-runner, report-generator, competitor-analyzer';
COMMENT ON COLUMN scan_jobs.depth IS 'Crawl depth: quick (1 level), standard (3 levels), deep (5+ levels)';
COMMENT ON COLUMN seo_reports.report_type IS 'Report frequency/type: weekly, monthly, quarterly, custom, executive';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration adds:
--   1. Extended seo_clients with agent/competitor configuration
--   2. site_audits - Technical SEO issue tracking
--   3. competitors - Competitor intelligence database
--   4. competitor_rankings - Keyword-level competitive analysis
--   5. agent_runs - Autonomous agent execution history
--   6. scan_jobs - Site scanning and crawling results
--   7. seo_reports - AI-generated reporting
--   8. Helper functions and views for analysis
--
-- All tables include:
--   - Row-level security with service role full access
--   - Comprehensive indexes for performance
--   - Proper foreign key constraints
--   - Timestamps and audit trails
--
-- Next steps:
--   1. Run this migration in Supabase SQL editor
--   2. Verify all tables created: SELECT * FROM information_schema.tables WHERE table_schema = 'public'
--   3. Test agent automation workflows
--   4. Configure agent schedules in n8n
-- ============================================================================
