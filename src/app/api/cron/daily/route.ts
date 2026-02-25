import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { scanDomain } from '@/lib/seo-scanner'
import type { AuditIssue } from '@/lib/seo-scanner'

// ---------------------------------------------------------------------------
// POST /api/cron/daily
//
// Daily automation endpoint intended to be triggered by n8n, Vercel Cron,
// or any external scheduler. Runs a full SEO scan for every active client,
// stores results in site_audits and scan_jobs, and records agent_runs.
//
// Authentication: x-cron-secret header must match CRON_SECRET env var.
// ---------------------------------------------------------------------------

const DEFAULT_CRON_SECRET = 'agentic-seo-cron-2026'

interface ClientScanResult {
  clientId: string
  domain: string
  score: number
  issuesFound: number
  scanJobId: string | null
  status: 'success' | 'error'
  error?: string
  durationMs: number
}

/**
 * Run a scan for a single client and persist the results.
 * Mirrors the logic in /api/audit/scan but without auth context.
 */
async function scanClient(
  client: Record<string, unknown>
): Promise<ClientScanResult> {
  const clientId = String(client.id)
  const domain = String(client.domain ?? '')
  const targetUrl = String(
    client.site_url || `https://${domain}`
  )
  const startedAt = new Date().toISOString()
  const startMs = Date.now()

  try {
    // Create scan_jobs entry
    const { data: scanJob, error: scanJobError } = await supabaseAdmin
      .from('scan_jobs')
      .insert({
        client_id: clientId,
        url: targetUrl,
        status: 'running',
        started_at: startedAt,
        depth: 'standard',
        pages_scanned: 0,
      })
      .select('id')
      .single()

    if (scanJobError) {
      return {
        clientId,
        domain,
        score: 0,
        issuesFound: 0,
        scanJobId: null,
        status: 'error',
        error: scanJobError.message,
        durationMs: Date.now() - startMs,
      }
    }

    // Execute the scan
    const scanResult = await scanDomain(targetUrl)

    // Store audit issues
    const auditRows = scanResult.issues.map((issue: AuditIssue) => ({
      client_id: clientId,
      audit_type: 'technical-seo',
      url: issue.url ?? targetUrl,
      severity: issue.severity,
      category: issue.category,
      title: issue.title,
      description: issue.description,
      recommendation: issue.recommendation,
      evidence: issue.evidence ?? {},
      is_fixed: false,
    }))

    if (auditRows.length > 0) {
      await supabaseAdmin.from('site_audits').insert(auditRows)
    }

    // Update scan_jobs with completed results
    const completedAt = new Date().toISOString()
    await supabaseAdmin
      .from('scan_jobs')
      .update({
        status: 'completed',
        completed_at: completedAt,
        pages_scanned: 1,
        results: {
          score: scanResult.score,
          domain: scanResult.domain,
          scannedAt: scanResult.scannedAt,
          stats: scanResult.stats,
          meta: scanResult.meta,
          issueCount: scanResult.issues.length,
        },
      })
      .eq('id', scanJob.id)

    // Record agent_run for the audit-runner agent
    await supabaseAdmin.from('agent_runs').insert({
      agent_type: 'audit-runner',
      client_id: clientId,
      status: 'completed',
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: Date.now() - startMs,
      triggered_by: 'cron',
      results: {
        score: scanResult.score,
        stats: scanResult.stats,
        issuesFound: scanResult.issues.length,
        scanJobId: scanJob.id,
      },
    })

    return {
      clientId,
      domain,
      score: scanResult.score,
      issuesFound: scanResult.issues.length,
      scanJobId: scanJob.id,
      status: 'success',
      durationMs: Date.now() - startMs,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown scan error'

    // Record failed agent_run
    await supabaseAdmin.from('agent_runs').insert({
      agent_type: 'audit-runner',
      client_id: clientId,
      status: 'failed',
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startMs,
      triggered_by: 'cron',
      results: { error: errorMessage },
    })

    return {
      clientId,
      domain,
      score: 0,
      issuesFound: 0,
      scanJobId: null,
      status: 'error',
      error: errorMessage,
      durationMs: Date.now() - startMs,
    }
  }
}

/**
 * POST /api/cron/daily
 *
 * Scans all active clients sequentially and returns a summary.
 * Authenticated via x-cron-secret header.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret =
      process.env.CRON_SECRET ?? DEFAULT_CRON_SECRET
    const providedSecret = request.headers.get('x-cron-secret')

    if (providedSecret !== cronSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid cron secret' },
        { status: 401 }
      )
    }

    // Fetch all active clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, domain, site_url, business_name')
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (clientsError) {
      return NextResponse.json(
        { success: false, error: clientsError.message },
        { status: 500 }
      )
    }

    const activeClients = clients ?? []

    if (activeClients.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No active clients to scan',
          scannedAt: new Date().toISOString(),
          totalClients: 0,
          results: [],
        },
      })
    }

    // Scan each client sequentially to avoid overwhelming target servers
    const results: ClientScanResult[] = []
    for (const client of activeClients) {
      const result = await scanClient(client)
      results.push(result)
    }

    const successful = results.filter((r) => r.status === 'success')
    const failed = results.filter((r) => r.status === 'error')

    const avgScore =
      successful.length > 0
        ? Math.round(
            successful.reduce((sum, r) => sum + r.score, 0) /
              successful.length
          )
        : 0

    const totalDurationMs = results.reduce(
      (sum, r) => sum + r.durationMs,
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        scannedAt: new Date().toISOString(),
        totalClients: activeClients.length,
        successful: successful.length,
        failed: failed.length,
        averageScore: avgScore,
        totalDurationMs,
        results,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Daily cron job failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
