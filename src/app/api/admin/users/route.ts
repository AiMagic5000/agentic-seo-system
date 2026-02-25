import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/admin/users
 *
 * Admin only: Returns all user profiles with their business count.
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

    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: admin access required' },
        { status: 403 }
      )
    }

    // Fetch all user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      return NextResponse.json(
        { success: false, error: profilesError.message },
        { status: 500 }
      )
    }

    // Fetch business counts per owner
    const { data: businessCounts, error: countsError } = await supabaseAdmin
      .from('seo_clients')
      .select('owner_clerk_id')
      .eq('active', true)
      .not('owner_clerk_id', 'is', null)

    if (countsError) {
      return NextResponse.json(
        { success: false, error: countsError.message },
        { status: 500 }
      )
    }

    // Build a map of clerk_id -> business count
    const countMap: Record<string, number> = {}
    for (const row of businessCounts || []) {
      const ownerId = row.owner_clerk_id as string
      countMap[ownerId] = (countMap[ownerId] || 0) + 1
    }

    // Merge business counts into profiles
    const usersWithCounts = (profiles || []).map((profile) => ({
      ...profile,
      business_count: countMap[profile.clerk_user_id] || 0,
    }))

    return NextResponse.json({
      success: true,
      data: usersWithCounts,
      meta: { total: usersWithCounts.length },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch users'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
