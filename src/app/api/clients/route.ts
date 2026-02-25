import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import type { OnboardingFormData } from '@/types'

/**
 * GET /api/clients
 *
 * Role-aware client listing:
 * - Admin: sees admin-owned (owner_clerk_id IS NULL) + all active clients
 * - Regular user: sees only their own clients (owner_clerk_id = their ID)
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

    let query = supabaseAdmin
      .from('seo_clients')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (user.isAdmin) {
      // Admin sees admin-owned records (NULL owner) and all other active clients
      // No additional filter needed - admin sees everything
    } else {
      // Regular users only see their own businesses
      query = query.eq('owner_clerk_id', user.clerkUserId)
    }

    const { data: clients, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Map results to include color field explicitly
    const mapped = (clients || []).map((client) => ({
      ...client,
      color: client.color || '#1a73e8',
    }))

    return NextResponse.json({ success: true, data: mapped })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch clients'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/clients
 *
 * Create a new business/client. Enforces one-business limit for non-admin users.
 * Sets owner_clerk_id to the current user's Clerk ID.
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

    // Enforce one-business limit for non-admins
    if (!user.isAdmin) {
      const { count, error: countError } = await supabaseAdmin
        .from('seo_clients')
        .select('*', { count: 'exact', head: true })
        .eq('owner_clerk_id', user.clerkUserId)
        .eq('active', true)

      if (countError) {
        return NextResponse.json(
          { success: false, error: countError.message },
          { status: 500 }
        )
      }

      // Fetch user's max_businesses limit
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('max_businesses')
        .eq('clerk_user_id', user.clerkUserId)
        .single()

      const maxBusinesses = profile?.max_businesses ?? 1

      if ((count || 0) >= maxBusinesses) {
        return NextResponse.json(
          {
            success: false,
            error: `You have reached your limit of ${maxBusinesses} business(es). Upgrade your plan to add more.`,
          },
          { status: 403 }
        )
      }
    }

    const body: OnboardingFormData = await request.json()
    const {
      url,
      business_name,
      niche,
      platform,
      gsc_property_url,
      data_sources,
    } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'url is required' },
        { status: 400 }
      )
    }
    if (!business_name) {
      return NextResponse.json(
        { success: false, error: 'business_name is required' },
        { status: 400 }
      )
    }
    if (!niche) {
      return NextResponse.json(
        { success: false, error: 'niche is required' },
        { status: 400 }
      )
    }
    if (!platform) {
      return NextResponse.json(
        { success: false, error: 'platform is required' },
        { status: 400 }
      )
    }

    const domain = new URL(url).hostname.replace('www.', '')

    const { data: client, error } = await supabaseAdmin
      .from('seo_clients')
      .insert({
        site_url: url,
        domain,
        business_name,
        niche,
        platform,
        gsc_property_url: gsc_property_url || null,
        data_sources: data_sources ?? [],
        active: true,
        owner_clerk_id: user.clerkUserId,
        color: '#1a73e8',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: client },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create client'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
