import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompetitorIssues {
  critical: number
  high: number
  medium: number
  low: number
}

interface CompetitorEntry {
  clientId: string
  domain: string
  businessName: string
  score: number | null
  keywordCount: number
  issues: CompetitorIssues
  lastScanned: string | null
  color: string
}

/**
 * GET /api/competitors?clientId=xxx
 *
 * Returns all active clients as "competitors" for cross-comparison.
 * Each entry includes SEO score, keyword count, issue severity breakdown,
 * and last scan date.
 *
 * Access control:
 * - Admin: sees all clients
 * - Regular user: only their own clients (which limits the comparison)
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

    // Verify the requesting client exists and user has access
    const { data: requestingClient, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !requestingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!user.isAdmin && requestingClient.owner_clerk_id !== user.clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Fetch all active clients as competitors
    const { data: allClients, error: allClientsError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, domain, business_name, color')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (allClientsError) {
      return NextResponse.json(
        { success: false, error: allClientsError.message },
        { status: 500 }
      )
    }

    if (!allClients || allClients.length === 0) {
      return NextResponse.json({
        success: true,
        data: { currentClientId: clientId, competitors: [] },
      })
    }

    const clientIds = allClients.map((c) => c.id)

    // Fetch site_audits severity counts per client (unfixed only)
    const { data: auditRows, error: auditError } = await supabaseAdmin
      .from('site_audits')
      .select('client_id, severity')
      .in('client_id', clientIds)
      .eq('is_fixed', false)

    if (auditError) {
      return NextResponse.json(
        { success: false, error: auditError.message },
        { status: 500 }
      )
    }

    // Build severity counts per client
    const issueMap = new Map<string, CompetitorIssues>()
    for (const row of auditRows ?? []) {
      const cid = row.client_id as string
      if (!issueMap.has(cid)) {
        issueMap.set(cid, { critical: 0, high: 0, medium: 0, low: 0 })
      }
      const entry = issueMap.get(cid)!
      const sev = row.severity as keyof CompetitorIssues
      if (sev in entry) {
        entry[sev]++
      }
    }

    // Fetch latest completed scan job per client for scores
    // We get all completed scans ordered by date, then pick the latest per client
    const { data: scanRows, error: scanError } = await supabaseAdmin
      .from('scan_jobs')
      .select('client_id, results, completed_at')
      .in('client_id', clientIds)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    if (scanError) {
      return NextResponse.json(
        { success: false, error: scanError.message },
        { status: 500 }
      )
    }

    // Build score + lastScanned per client (take first occurrence = latest)
    const scoreMap = new Map<string, { score: number | null; lastScanned: string | null }>()
    for (const scan of scanRows ?? []) {
      const cid = scan.client_id as string
      if (!scoreMap.has(cid)) {
        const results = scan.results as Record<string, unknown> | null
        const score = typeof results?.score === 'number' ? results.score : null
        scoreMap.set(cid, {
          score,
          lastScanned: (scan.completed_at as string) ?? null,
        })
      }
    }

    // Fetch keyword counts per client
    const { data: keywordRows, error: kwError } = await supabaseAdmin
      .from('keywords')
      .select('client_id')
      .in('client_id', clientIds)

    if (kwError) {
      return NextResponse.json(
        { success: false, error: kwError.message },
        { status: 500 }
      )
    }

    // Count keywords per client
    const kwCountMap = new Map<string, number>()
    for (const row of keywordRows ?? []) {
      const cid = row.client_id as string
      kwCountMap.set(cid, (kwCountMap.get(cid) ?? 0) + 1)
    }

    // Assemble competitor entries
    const competitors: CompetitorEntry[] = allClients.map((client) => {
      const cid = client.id as string
      const scanInfo = scoreMap.get(cid)
      return {
        clientId: cid,
        domain: (client.domain as string) ?? '',
        businessName: (client.business_name as string) ?? (client.domain as string) ?? 'Unknown',
        score: scanInfo?.score ?? null,
        keywordCount: kwCountMap.get(cid) ?? 0,
        issues: issueMap.get(cid) ?? { critical: 0, high: 0, medium: 0, low: 0 },
        lastScanned: scanInfo?.lastScanned ?? null,
        color: (client.color as string) ?? '#3B82F6',
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        currentClientId: clientId,
        competitors,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch competitors'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
