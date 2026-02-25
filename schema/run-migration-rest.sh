#!/bin/bash
# Run migration via Supabase pg/query API endpoint
BASE="http://10.28.28.97:8100"
KEY="eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJpc3MiOiAic3VwYWJhc2UiLCAiaWF0IjogMTc3MTU0MzQ4OSwgImV4cCI6IDIwODY5MDM0ODksICJyb2xlIjogInNlcnZpY2Vfcm9sZSJ9.2WwzRXuU1ZKzUYFo4AJrYEs8pI7hg6zTqDIu2Xa0pNY"

run_sql() {
  local sql="$1"
  local desc="$2"
  result=$(curl -s -X POST "$BASE/pg/query" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$sql" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')}" \
    --max-time 10 2>&1)

  if echo "$result" | grep -qi "error"; then
    echo "WARN [$desc]: $result"
  else
    echo "OK [$desc]"
  fi
}

echo "=== Running Agentic SEO Migration on Cognabase R740xd ==="

# First create the seo_clients table (base schema)
run_sql "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"" "uuid extension"

run_sql "CREATE TABLE IF NOT EXISTS seo_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    niche TEXT NOT NULL,
    business_type TEXT,
    site_url TEXT NOT NULL,
    sitemap_url TEXT,
    platform TEXT DEFAULT 'custom',
    gsc_property_url TEXT,
    gsc_site_encoded TEXT,
    gsc_credentials JSONB,
    apify_last_run TIMESTAMP,
    apify_keywords_count INTEGER DEFAULT 0,
    webhook_approve_path TEXT,
    webhook_revise_path TEXT,
    skip_patterns JSONB DEFAULT '[]'::jsonb,
    header_color TEXT DEFAULT '#2563eb',
    accent_color TEXT DEFAULT '#22c55e',
    active BOOLEAN DEFAULT true,
    onboarding_complete BOOLEAN DEFAULT false,
    data_sources JSONB DEFAULT '[]'::jsonb,
    scan_depth TEXT DEFAULT 'standard',
    agent_config JSONB DEFAULT '{}'::jsonb,
    competitor_domains JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)" "seo_clients"

run_sql "CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    keyword_type TEXT,
    source TEXT NOT NULL DEFAULT 'manual',
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    position DECIMAL(5,2) DEFAULT 100,
    search_volume INTEGER,
    competition_level TEXT,
    priority_score INTEGER DEFAULT 0,
    content_created BOOLEAN DEFAULT false,
    content_brief_id UUID,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, keyword)
)" "keywords"

run_sql "CREATE TABLE IF NOT EXISTS content_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
    keyword_id UUID,
    target_url TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    h1 TEXT,
    intro_paragraph TEXT,
    outline JSONB,
    word_count_target INTEGER,
    schema_markup JSONB,
    llm_optimization_tags JSONB,
    faq_section JSONB,
    content_suggestions JSONB,
    status TEXT DEFAULT 'draft',
    approval_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    implemented_at TIMESTAMP WITH TIME ZONE
)" "content_briefs"

run_sql "CREATE TABLE IF NOT EXISTS seo_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period_type TEXT DEFAULT 'daily',
    total_impressions INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    avg_ctr DECIMAL(5,4),
    avg_position DECIMAL(5,2),
    top_queries JSONB,
    top_pages JSONB,
    impressions_change DECIMAL(6,2),
    clicks_change DECIMAL(6,2),
    position_change DECIMAL(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, date, period_type)
)" "seo_performance"

run_sql "CREATE TABLE IF NOT EXISTS workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
    workflow_type TEXT NOT NULL,
    workflow_id TEXT,
    status TEXT DEFAULT 'started',
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
)" "workflow_logs"

# New tables for agentic system
run_sql "CREATE TABLE IF NOT EXISTS site_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,
    audit_type TEXT NOT NULL,
    url TEXT,
    severity TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    recommendation TEXT,
    evidence JSONB,
    is_fixed BOOLEAN DEFAULT false,
    fixed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)" "site_audits"

run_sql "CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES seo_clients(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    name TEXT,
    domain_authority INTEGER,
    estimated_traffic INTEGER,
    overlap_percentage DECIMAL(5,2),
    threat_level TEXT DEFAULT 'medium',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, domain)
)" "competitors"

run_sql "CREATE TABLE IF NOT EXISTS competitor_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    position DECIMAL(5,2),
    our_position DECIMAL(5,2),
    gap DECIMAL(5,2),
    search_volume INTEGER,
    opportunity TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)" "competitor_rankings"

run_sql "CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    results JSONB,
    error_message TEXT,
    triggered_by TEXT DEFAULT 'manual'
)" "agent_runs"

run_sql "CREATE TABLE IF NOT EXISTS scan_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    depth TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'pending',
    pages_scanned INTEGER DEFAULT 0,
    results JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
)" "scan_jobs"

run_sql "CREATE TABLE IF NOT EXISTS seo_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES seo_clients(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    date_range_start DATE,
    date_range_end DATE,
    executive_summary TEXT,
    key_wins JSONB,
    concerns JSONB,
    recommendations JSONB,
    agent_summary JSONB,
    metrics JSONB,
    status TEXT DEFAULT 'generating',
    generated_by TEXT DEFAULT 'claude-3.5-sonnet',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)" "seo_reports"

# Indexes
run_sql "CREATE INDEX IF NOT EXISTS idx_keywords_client ON keywords(client_id)" "idx keywords"
run_sql "CREATE INDEX IF NOT EXISTS idx_site_audits_client ON site_audits(client_id)" "idx audits"
run_sql "CREATE INDEX IF NOT EXISTS idx_competitors_client ON competitors(client_id)" "idx competitors"
run_sql "CREATE INDEX IF NOT EXISTS idx_agent_runs_client ON agent_runs(client_id)" "idx agent_runs"
run_sql "CREATE INDEX IF NOT EXISTS idx_scan_jobs_client ON scan_jobs(client_id)" "idx scan_jobs"
run_sql "CREATE INDEX IF NOT EXISTS idx_seo_reports_client ON seo_reports(client_id)" "idx reports"

# RLS
for table in seo_clients keywords content_briefs seo_performance workflow_logs site_audits competitors competitor_rankings agent_runs scan_jobs seo_reports; do
  run_sql "ALTER TABLE $table ENABLE ROW LEVEL SECURITY" "RLS $table"
  run_sql "DO \$\$ BEGIN CREATE POLICY \"service_role_all_${table}\" ON $table FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END \$\$" "policy $table"
done

echo ""
echo "=== Migration complete! ==="
