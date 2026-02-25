import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// ---------------------------------------------------------------------------
// POST /api/onboarding/credentials
// GET  /api/onboarding/credentials?clientId=xxx
//
// Stores and retrieves hosting/access credentials for SEO automation.
// NOTE: In production, encrypt the access_credentials JSONB column at rest
// using Supabase Vault or application-level encryption (e.g. aes-256-gcm)
// before writing to the database.
// ---------------------------------------------------------------------------

interface CredentialFields {
  ssh_host?: string
  ssh_user?: string
  ssh_key?: string
  hosting_provider?: string
  hosting_login?: string
  hosting_password?: string
  cms_type?: string
  cms_admin_url?: string
  cms_user?: string
  cms_password?: string
  ftp_host?: string
  ftp_user?: string
  ftp_password?: string
  dns_provider?: string
  cloudflare_zone_id?: string
  additional_notes?: string
}

interface CredentialsRequestBody {
  clientId: string
  credentials: CredentialFields
}

const PASSWORD_FIELDS: (keyof CredentialFields)[] = [
  'ssh_key',
  'hosting_password',
  'cms_password',
  'ftp_password',
]

/**
 * Mask a sensitive value, showing only the last 4 characters.
 * Returns "****" if the value is too short.
 */
function maskValue(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (value.length <= 4) return '****'
  return '****' + value.slice(-4)
}

/**
 * Return a shallow copy of credentials with password fields masked.
 */
function maskCredentials(
  creds: CredentialFields
): Record<string, string | undefined> {
  const masked: Record<string, string | undefined> = { ...creds }
  for (const field of PASSWORD_FIELDS) {
    if (masked[field]) {
      masked[field] = maskValue(masked[field])
    }
  }
  return masked
}

/**
 * POST /api/onboarding/credentials
 *
 * Saves hosting/access credentials into the seo_clients.access_credentials
 * JSONB column. Requires authentication and ownership of the client.
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

    const body: CredentialsRequestBody = await request.json()
    const { clientId, credentials } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }

    if (!credentials || typeof credentials !== 'object') {
      return NextResponse.json(
        { success: false, error: 'credentials object is required' },
        { status: 400 }
      )
    }

    // Verify client exists and user has access
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, owner_clerk_id')
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

    // Strip unexpected keys -- only allow known credential fields
    const allowedKeys: (keyof CredentialFields)[] = [
      'ssh_host',
      'ssh_user',
      'ssh_key',
      'hosting_provider',
      'hosting_login',
      'hosting_password',
      'cms_type',
      'cms_admin_url',
      'cms_user',
      'cms_password',
      'ftp_host',
      'ftp_user',
      'ftp_password',
      'dns_provider',
      'cloudflare_zone_id',
      'additional_notes',
    ]

    const sanitized: CredentialFields = {}
    for (const key of allowedKeys) {
      if (credentials[key] !== undefined) {
        sanitized[key] = String(credentials[key])
      }
    }

    // Update the client row with the credentials JSONB
    const { error: updateError } = await supabaseAdmin
      .from('seo_clients')
      .update({
        access_credentials: sanitized,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        savedFields: Object.keys(sanitized),
        credentials: maskCredentials(sanitized),
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save credentials'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/onboarding/credentials?clientId=xxx
 *
 * Returns stored credentials with passwords masked (last 4 chars visible).
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

    // Verify client exists and user has access
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, owner_clerk_id, access_credentials')
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

    const rawCredentials =
      (client.access_credentials as CredentialFields) ?? {}

    return NextResponse.json({
      success: true,
      data: {
        clientId,
        hasCredentials: Object.keys(rawCredentials).length > 0,
        credentials: maskCredentials(rawCredentials),
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch credentials'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
