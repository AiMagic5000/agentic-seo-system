import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://10.28.28.97:8100'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJpc3MiOiAic3VwYWJhc2UiLCAiaWF0IjogMTc3MTU0MzQ4OSwgImV4cCI6IDIwODY5MDM0ODksICJyb2xlIjogImFub24ifQ.yu8ba82B5jokUFbh__Sv80-LIANehnv2Co1IAd5kKhE'

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJpc3MiOiAic3VwYWJhc2UiLCAiaWF0IjogMTc3MTU0MzQ4OSwgImV4cCI6IDIwODY5MDM0ODksICJyb2xlIjogInNlcnZpY2Vfcm9sZSJ9.2WwzRXuU1ZKzUYFo4AJrYEs8pI7hg6zTqDIu2Xa0pNY'

/**
 * Public Supabase client using the anon key.
 * Safe for client-side usage -- respects RLS policies.
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
  }
)

/**
 * Admin Supabase client using the service_role key.
 * Server-side ONLY -- bypasses all RLS policies.
 * Never expose this client to the browser.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
)

/**
 * Create a one-off Supabase client with a specific access token.
 * Useful for impersonation or per-request auth in API routes.
 */
export function createSupabaseClient(accessToken?: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {},
    },
    db: {
      schema: 'public',
    },
  })
}
