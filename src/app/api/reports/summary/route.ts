import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// ---------------------------------------------------------------------------
// Agent type display names
// ---------------------------------------------------------------------------
const AGENT_NAMES: Record<string, string> = {
  'keyword-scout': 'Keyword Scout',
  'rank-tracker': 'Rank Tracker',
  'audit-runner': 'Audit Runner',
  'content-optimizer': 'Content Optimizer',
  'competitor-monitor': 'Competitor Monitor',
}

// ---------------------------------------------------------------------------
// GET /api/reports/summary?clientId=xxx
//
// Aggregates data from multiple tables into a comprehensive SEO report:
//   - seo_clients: domain, business_name, gsc_property_url
//   - site_audits: issue counts by severity, categories affected
//   - scan_jobs: latest score, scan history
//   - keywords: tracked count, top 10 by clicks, position distribution
//   - agent_runs: total runs, last run per agent type, success/fail counts
//
// Access control:
//   - Admin: sees all clients
//   - Regular user: only their own clients
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId query parameter is required' },
        { status: 400 }
      )
    }

    // Verify client exists and user has access
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, domain, business_name, gsc_property_url, owner_clerk_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!user.isAdmin && client.owner_clerk_id !== user.clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // -----------------------------------------------------------------------
    // 1. Site Audits -- issue counts by severity and category
    // -----------------------------------------------------------------------
    const { data: auditIssues } = await supabaseAdmin
      .from('site_audits')
      .select('id, severity, category, title, description, recommendation, is_fixed, url')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    const allIssues = auditIssues ?? []
    const unfixedIssues = allIssues.filter((i) => !i.is_fixed)

    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    const categoryMap: Record<string, number> = {}

    for (const issue of unfixedIssues) {
      const sev = issue.severity as keyof typeof severityCounts
      if (sev in severityCounts) {
        severityCounts[sev]++
      }
      const cat = (issue.category as string) || 'other'
      categoryMap[cat] = (categoryMap[cat] ?? 0) + 1
    }

    const issuesByCategory = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // Top 5 critical/high priority recommendations
    const recommendations = unfixedIssues
      .filter((i) => i.severity === 'critical' || i.severity === 'high')
      .slice(0, 5)
      .map((i) => ({
        severity: i.severity,
        title: i.title,
        recommendation: i.recommendation ?? '',
        url: i.url ?? '',
      }))

    // -----------------------------------------------------------------------
    // 2. Scan Jobs -- latest score and scan history
    // -----------------------------------------------------------------------
    const { data: latestScan } = await supabaseAdmin
      .from('scan_jobs')
      .select('id, status, completed_at, results')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const scanResults = latestScan?.results as Record<string, unknown> | null
    const overallScore =
      typeof scanResults?.score === 'number' ? scanResults.score : null
    const lastScanDate = latestScan?.completed_at ?? null

    // -----------------------------------------------------------------------
    // 3. Keywords -- tracked count, top 10 by clicks, position distribution
    // -----------------------------------------------------------------------
    const { data: allKeywords, count: keywordCount } = await supabaseAdmin
      .from('keywords')
      .select('keyword, clicks, impressions, current_position, ctr', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('is_tracked', true)

    const keywords = allKeywords ?? []
    const totalTracked = keywordCount ?? keywords.length

    // Position distribution
    let top3 = 0
    let top10 = 0
    let top20 = 0
    let beyond20 = 0

    for (const kw of keywords) {
      const pos = kw.current_position
      if (pos === null || pos === undefined) continue
      if (pos <= 3) top3++
      else if (pos <= 10) top10++
      else if (pos <= 20) top20++
      else beyond20++
    }

    // Top 10 keywords by clicks
    const topKeywords = [...keywords]
      .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0))
      .slice(0, 10)
      .map((kw) => ({
        keyword: kw.keyword,
        clicks: kw.clicks ?? 0,
        impressions: kw.impressions ?? 0,
        position: kw.current_position ?? null,
        ctr: kw.ctr ?? null,
      }))

    // -----------------------------------------------------------------------
    // 4. Agent Runs -- total runs, last run per agent type, success/fail
    // -----------------------------------------------------------------------
    const { data: agentRuns, count: agentRunCount } = await supabaseAdmin
      .from('agent_runs')
      .select('id, agent_type, status, started_at, completed_at, duration_ms', { count: 'exact' })
      .eq('client_id', clientId)
      .order('started_at', { ascending: false })

    const runs = agentRuns ?? []
    const totalRuns = agentRunCount ?? runs.length

    let successCount = 0
    let failCount = 0
    const lastRunByAgent: Record<string, {
      agentType: string
      agentName: string
      status: string
      completedAt: string | null
      startedAt: string | null
    }> = {}

    for (const run of runs) {
      if (run.status === 'completed') successCount++
      if (run.status === 'failed') failCount++

      const agentType = run.agent_type as string
      if (!lastRunByAgent[agentType]) {
        lastRunByAgent[agentType] = {
          agentType,
          agentName: AGENT_NAMES[agentType] ?? agentType,
          status: run.status,
          completedAt: run.completed_at,
          startedAt: run.started_at,
        }
      }
    }

    // -----------------------------------------------------------------------
    // 5. Assemble report
    // -----------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        clientId,
        domain: client.domain,
        businessName: client.business_name,
        gscPropertyUrl: client.gsc_property_url,
        generatedAt: new Date().toISOString(),

        // Overall score
        score: overallScore,
        lastScanDate,

        // Issue summary
        issues: {
          total: unfixedIssues.length,
          fixed: allIssues.length - unfixedIssues.length,
          bySeverity: severityCounts,
          byCategory: issuesByCategory,
        },

        // Keyword performance
        keywords: {
          totalTracked,
          positionDistribution: {
            top3,
            top10,
            top20,
            beyond20,
          },
          topKeywords,
        },

        // Agent activity
        agents: {
          totalRuns,
          successCount,
          failCount,
          lastRunByAgent: Object.values(lastRunByAgent),
        },

        // Recommendations
        recommendations,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate report summary'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
