import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { supabaseAdmin } from '@/lib/supabase'

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || ''
const ADMIN_EMAIL = 'coreypearsonemail@gmail.com'
const N8N_WEBHOOK_URL = 'http://10.28.28.97:5678/webhook/new-seo-user'

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkWebhookUserData {
  id: string
  email_addresses: ClerkEmailAddress[]
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

interface ClerkWebhookEvent {
  data: ClerkWebhookUserData
  type: string
  object: string
}

/**
 * POST /api/webhooks/clerk
 *
 * Handles Clerk webhook events:
 * - user.created: Creates user_profiles row, notifies admin, fires n8n webhook
 * - user.updated: Syncs profile changes
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body and headers for Svix verification
    const body = await request.text()
    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { success: false, error: 'Missing Svix headers' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    if (!CLERK_WEBHOOK_SECRET) {
      // In development, skip verification but log a warning
      // eslint-disable-next-line no-console
      console.warn(
        'CLERK_WEBHOOK_SECRET not set - skipping signature verification'
      )
    } else {
      const wh = new Webhook(CLERK_WEBHOOK_SECRET)
      try {
        wh.verify(body, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        })
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    }

    const event: ClerkWebhookEvent = JSON.parse(body)

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const userData = event.data
      const email =
        userData.email_addresses[0]?.email_address || ''
      const fullName = [userData.first_name, userData.last_name]
        .filter(Boolean)
        .join(' ')
      const role = email === ADMIN_EMAIL ? 'admin' : 'user'

      // Upsert user profile
      const { error: upsertError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(
          {
            clerk_user_id: userData.id,
            email,
            full_name: fullName,
            avatar_url: userData.image_url,
            role,
            max_businesses: role === 'admin' ? 999 : 1,
          },
          { onConflict: 'clerk_user_id' }
        )

      if (upsertError) {
        return NextResponse.json(
          { success: false, error: upsertError.message },
          { status: 500 }
        )
      }

      // Only run these for new user signups
      if (event.type === 'user.created') {
        // Notify admin about new user signup
        const { data: adminProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('clerk_user_id')
          .eq('email', ADMIN_EMAIL)
          .single()

        if (adminProfile) {
          await supabaseAdmin.from('notifications').insert({
            user_clerk_id: adminProfile.clerk_user_id,
            type: 'info',
            title: 'New user signed up',
            message: `${fullName || 'Unknown'} (${email}) just created an account.`,
            action_url: '/admin/users',
          })
        }

        // Fire n8n webhook (non-blocking)
        fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkUserId: userData.id,
            email,
            fullName,
            signedUpAt: new Date().toISOString(),
          }),
        }).catch(() => {
          // Silently ignore n8n webhook failures
        })
      }

      return NextResponse.json({
        success: true,
        message: `User ${event.type === 'user.created' ? 'created' : 'updated'}: ${email}`,
      })
    }

    // Unhandled event type - acknowledge receipt
    return NextResponse.json({
      success: true,
      message: `Unhandled event type: ${event.type}`,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Webhook processing failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
