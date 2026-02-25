import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { scanDomain } from '@/lib/seo-scanner'
import type { AuditIssue } from '@/lib/seo-scanner'

interface ScanRequestBody {
  clientId: string
}

/**
 * POST /api/audit/scan
 *
 * Triggers a real technical SEO scan against a client's domain.
 * Stores individual issues in site_audits and a summary in scan_jobs.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ScanRequestBody = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }

    // Fetch the client and verify ownership
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

    const targetUrl = client.site_url || `https://${client.domain}`
    const startedAt = new Date().toISOString()

    // Create a scan_jobs entry with status "running"
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
      .select()
      .single()

    if (scanJobError) {
      return NextResponse.json(
        { success: false, error: scanJobError.message },
        { status: 500 }
      )
    }

    // Run the actual scan
    const scanResult = await scanDomain(targetUrl)

    // Store each issue as a row in site_audits
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
      const { error: auditError } = await supabaseAdmin
        .from('site_audits')
        .insert(auditRows)

      if (auditError) {
        // Log but do not fail the whole request -- the scan itself succeeded
        // eslint-disable-next-line no-console
        console.error('Failed to insert audit rows:', auditError.message)
      }
    }

    // Update scan_jobs with completed results
    const completedAt = new Date().toISOString()
    const { error: updateError } = await supabaseAdmin
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

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error('Failed to update scan job:', updateError.message)
    }

    // Also record an agent_run for the audit-runner agent
    await supabaseAdmin.from('agent_runs').insert({
      agent_type: 'audit-runner',
      client_id: clientId,
      status: 'completed',
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: scanResult.meta.responseTimeMs,
      triggered_by: 'manual',
      results: {
        score: scanResult.score,
        stats: scanResult.stats,
        issuesFound: scanResult.issues.length,
        scanJobId: scanJob.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        scanJobId: scanJob.id,
        domain: scanResult.domain,
        score: scanResult.score,
        scannedAt: scanResult.scannedAt,
        stats: scanResult.stats,
        meta: scanResult.meta,
        issues: scanResult.issues,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to run SEO scan'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
