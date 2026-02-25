import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/audit/results?clientId=xxx
 *
 * Returns the latest audit findings from the site_audits table.
 * Includes summary statistics (severity counts, overall score, last scan date).
 *
 * Access control:
 * - Admin: sees all clients
 * - Regular user: only their own clients
 */
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
      .select('*')
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

    // Fetch all audit issues for this client, ordered by severity and date
    const { data: issues, error: issuesError } = await supabaseAdmin
      .from('site_audits')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (issuesError) {
      return NextResponse.json(
        { success: false, error: issuesError.message },
        { status: 500 }
      )
    }

    const allIssues = issues ?? []

    // Fetch the most recent completed scan job for the score and meta
    const { data: latestScan } = await supabaseAdmin
      .from('scan_jobs')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    // Compute severity counts from issues
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    }

    // Count only unfixed issues for the summary
    const unfixedIssues = allIssues.filter(
      (issue) => !issue.is_fixed
    )

    for (const issue of unfixedIssues) {
      const sev = issue.severity as keyof typeof severityCounts
      if (sev in severityCounts) {
        severityCounts[sev]++
      }
    }

    // Collect unique categories
    const categories = [
      ...new Set(unfixedIssues.map((i) => i.category)),
    ]

    // Extract score from latest scan results
    const scanResults =
      latestScan?.results as Record<string, unknown> | null
    const score =
      typeof scanResults?.score === 'number' ? scanResults.score : null

    const lastScanDate = latestScan?.completed_at ?? null

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        domain: client.domain,
        score,
        lastScanDate,
        summary: {
          totalIssues: unfixedIssues.length,
          fixedIssues: allIssues.length - unfixedIssues.length,
          ...severityCounts,
          categories,
        },
        issues: allIssues.map((issue) => ({
          id: issue.id,
          auditType: issue.audit_type,
          url: issue.url,
          severity: issue.severity,
          category: issue.category,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          evidence: issue.evidence,
          isFixed: issue.is_fixed,
          fixedAt: issue.fixed_at,
          createdAt: issue.created_at,
        })),
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch audit results'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
