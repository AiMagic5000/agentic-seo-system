import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  getGoogleAdsCampaigns,
  getGoogleAdsAccountSummary,
} from '@/lib/maton'

/**
 * GET /api/campaigns
 *
 * Returns Google Ads campaigns with performance metrics (last 30 days).
 * Admin-only endpoint.
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [campaigns, summary] = await Promise.all([
      getGoogleAdsCampaigns(),
      getGoogleAdsAccountSummary(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        campaigns,
        summary: {
          ...summary,
          totalCost: summary.totalCostMicros / 1_000_000,
          avgCtr: Math.round(summary.avgCtr * 10000) / 100,
        },
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch campaigns'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
