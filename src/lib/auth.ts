import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from './supabase'

const ADMIN_EMAIL = 'coreypearsonemail@gmail.com'

export type UserRole = 'admin' | 'user'

export interface CurrentUser {
  clerkUserId: string
  email: string
  fullName: string
  role: UserRole
  isAdmin: boolean
}

/**
 * Get the current authenticated user with role information.
 * Bootstraps a user_profiles row on first login if the Clerk webhook
 * hasn't fired yet, ensuring zero-downtime auth for new signups.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId } = await auth()
  if (!userId) return null

  // Try to get from our DB first
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  if (profile) {
    return {
      clerkUserId: profile.clerk_user_id,
      email: profile.email,
      fullName: profile.full_name || '',
      role: profile.role as UserRole,
      isAdmin: profile.role === 'admin',
    }
  }

  // Profile doesn't exist yet (webhook hasn't fired) - bootstrap it
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress || ''
  const role: UserRole = email === ADMIN_EMAIL ? 'admin' : 'user'
  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ')

  await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        clerk_user_id: userId,
        email,
        full_name: fullName,
        avatar_url: clerkUser.imageUrl,
        role,
        max_businesses: role === 'admin' ? 999 : 1,
      },
      { onConflict: 'clerk_user_id' }
    )
    .select()
    .single()

  return {
    clerkUserId: userId,
    email,
    fullName,
    role,
    isAdmin: role === 'admin',
  }
}

/**
 * Guard that throws if the user is not an admin.
 * Use in admin-only API routes.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  if (!user.isAdmin) {
    throw new Error('Forbidden: admin access required')
  }
  return user
}
