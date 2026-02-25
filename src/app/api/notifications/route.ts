import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/notifications
 *
 * Returns unread notifications for the current user.
 * Optional query params: ?limit=20&includeRead=true
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

    const limit = parseInt(
      request.nextUrl.searchParams.get('limit') || '20',
      10
    )
    const includeRead =
      request.nextUrl.searchParams.get('includeRead') === 'true'

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_clerk_id', user.clerkUserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!includeRead) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Also get unread count
    const { count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_clerk_id', user.clerkUserId)
      .eq('read', false)

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: { unreadCount: count || 0 },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch notifications'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 *
 * Admin only: Create a notification for a specific user.
 * Body: { userClerkId, type, title, message?, actionUrl? }
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

    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userClerkId, type, title, message, actionUrl } = body

    if (!userClerkId || !type || !title) {
      return NextResponse.json(
        {
          success: false,
          error: 'userClerkId, type, and title are required',
        },
        { status: 400 }
      )
    }

    const validTypes = ['info', 'success', 'warning', 'error', 'system']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `type must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_clerk_id: userClerkId,
        type,
        title,
        message: message || null,
        action_url: actionUrl || null,
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
      { success: true, data: notification },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create notification'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 *
 * Mark notifications as read.
 * Body: { ids: string[] } or { markAllRead: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ids, markAllRead } = body

    if (markAllRead) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_clerk_id', user.clerkUserId)
        .eq('read', false)

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      })
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'ids array is required, or set markAllRead: true',
        },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .in('id', ids)
      .eq('user_clerk_id', user.clerkUserId)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} notification(s) marked as read`,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update notifications'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
