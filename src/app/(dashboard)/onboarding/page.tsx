'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList,
  Server,
  Globe,
  Key,
  Terminal,
  Save,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SkeletonCard } from '@/components/ui/skeleton'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'
import { useClient } from '@/contexts/client-context'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CredentialFields {
  hosting_provider: string
  hosting_login: string
  hosting_password: string
  cms_type: string
  cms_admin_url: string
  cms_user: string
  cms_password: string
  ssh_host: string
  ssh_user: string
  ssh_key: string
  ftp_host: string
  ftp_user: string
  ftp_password: string
  dns_provider: string
  cloudflare_zone_id: string
  additional_notes: string
}

const EMPTY_CREDS: CredentialFields = {
  hosting_provider: '',
  hosting_login: '',
  hosting_password: '',
  cms_type: '',
  cms_admin_url: '',
  cms_user: '',
  cms_password: '',
  ssh_host: '',
  ssh_user: '',
  ssh_key: '',
  ftp_host: '',
  ftp_user: '',
  ftp_password: '',
  dns_provider: '',
  cloudflare_zone_id: '',
  additional_notes: '',
}

// ---------------------------------------------------------------------------
// Field groups
// ---------------------------------------------------------------------------
interface FieldDef {
  key: keyof CredentialFields
  label: string
  type: 'text' | 'password' | 'textarea' | 'select'
  placeholder: string
  options?: string[]
}

interface FieldGroup {
  title: string
  icon: React.ReactNode
  description: string
  fields: FieldDef[]
}

const FIELD_GROUPS: FieldGroup[] = [
  {
    title: 'Hosting Access',
    icon: <Server size={14} />,
    description: 'Required for automated deployments, file changes, and server-side optimizations.',
    fields: [
      { key: 'hosting_provider', label: 'Provider', type: 'select', placeholder: 'Select provider', options: ['Hostinger', 'GoDaddy', 'Bluehost', 'SiteGround', 'Cloudflare Pages', 'Vercel', 'Netlify', 'AWS', 'DigitalOcean', 'Coolify', 'Other'] },
      { key: 'hosting_login', label: 'Login Email/Username', type: 'text', placeholder: 'admin@example.com' },
      { key: 'hosting_password', label: 'Password / API Key', type: 'password', placeholder: 'Hosting password or API token' },
    ],
  },
  {
    title: 'CMS Access',
    icon: <Globe size={14} />,
    description: 'Required for content updates, meta tag fixes, structured data, and page creation.',
    fields: [
      { key: 'cms_type', label: 'CMS Platform', type: 'select', placeholder: 'Select CMS', options: ['WordPress', 'Webflow', 'Shopify', 'Squarespace', 'Wix', 'Ghost', 'Next.js', 'Custom', 'None'] },
      { key: 'cms_admin_url', label: 'Admin URL', type: 'text', placeholder: 'https://example.com/wp-admin' },
      { key: 'cms_user', label: 'Admin Username', type: 'text', placeholder: 'admin' },
      { key: 'cms_password', label: 'Admin Password / App Password', type: 'password', placeholder: 'WordPress app password or login' },
    ],
  },
  {
    title: 'SSH / Server Access',
    icon: <Terminal size={14} />,
    description: 'For direct server configuration: robots.txt, .htaccess, server-side redirects, SSL.',
    fields: [
      { key: 'ssh_host', label: 'SSH Host', type: 'text', placeholder: '10.0.0.1 or server.example.com' },
      { key: 'ssh_user', label: 'SSH Username', type: 'text', placeholder: 'root or admin' },
      { key: 'ssh_key', label: 'SSH Key / Password', type: 'password', placeholder: 'SSH private key or password' },
    ],
  },
  {
    title: 'FTP Access',
    icon: <Key size={14} />,
    description: 'Fallback file access for uploading sitemaps, robots.txt, and static assets.',
    fields: [
      { key: 'ftp_host', label: 'FTP Host', type: 'text', placeholder: 'ftp.example.com' },
      { key: 'ftp_user', label: 'FTP Username', type: 'text', placeholder: 'ftp-user' },
      { key: 'ftp_password', label: 'FTP Password', type: 'password', placeholder: 'FTP password' },
    ],
  },
  {
    title: 'DNS / CDN',
    icon: <Globe size={14} />,
    description: 'For DNS record management, CDN configuration, and SSL certificate setup.',
    fields: [
      { key: 'dns_provider', label: 'DNS Provider', type: 'select', placeholder: 'Select provider', options: ['Cloudflare', 'Namecheap', 'GoDaddy', 'Route 53', 'Google Domains', 'Other'] },
      { key: 'cloudflare_zone_id', label: 'Cloudflare Zone ID (if applicable)', type: 'text', placeholder: 'Zone ID from Cloudflare dashboard' },
    ],
  },
  {
    title: 'Additional Notes',
    icon: <ClipboardList size={14} />,
    description: 'Any special instructions, additional API keys, or access details.',
    fields: [
      { key: 'additional_notes', label: 'Notes', type: 'textarea', placeholder: 'Any special access instructions, 2FA details, VPN requirements, etc.' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
}) {
  const baseClass = cn(
    'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800',
    'focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 focus:bg-white',
    'transition-colors duration-150 placeholder:text-slate-400'
  )

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={baseClass}
        style={{ fontFamily: 'var(--font-sans)' }}
      />
    )
  }

  if (field.type === 'select' && field.options) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(baseClass, 'cursor-pointer')}
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <option value="">{field.placeholder}</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  return (
    <input
      type={field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={baseClass}
      style={{ fontFamily: field.type === 'password' ? 'var(--font-mono)' : 'var(--font-sans)' }}
    />
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OnboardingPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()

  const [creds, setCreds]     = useState<CredentialFields>(EMPTY_CREDS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [hasExisting, setHasExisting] = useState(false)

  const fetchCreds = useCallback(async (clientId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/onboarding/credentials?clientId=${clientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        setHasExisting(json.data.hasCredentials)
        if (json.data.credentials) {
          setCreds((prev) => ({ ...prev, ...json.data.credentials }))
        }
      }
    } catch {
      // OK if no creds yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentClient?.id) {
      fetchCreds(currentClient.id)
    }
  }, [currentClient?.id, fetchCreds])

  const handleSave = async () => {
    if (!currentClient?.id || saving) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: currentClient.id, credentials: creds }),
      })
      const json = await res.json()
      if (json.success) {
        setSaved(true)
        setHasExisting(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(json.error || 'Failed to save credentials.')
      }
    } catch {
      setError('Failed to save credentials.')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: keyof CredentialFields, value: string) => {
    setCreds((prev) => ({ ...prev, [key]: value }))
  }

  const filledCount = Object.values(creds).filter(Boolean).length
  const totalFields = Object.keys(creds).length

  if (clientLoading) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-5 w-40 rounded-full bg-slate-200 animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-40" />
        ))}
      </div>
    )
  }

  if (hasNoBusiness) {
    return <EmptyDashboard />
  }

  const clientName = currentClient?.name ?? 'your site'

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-amber-500" />
            <h1
              className="text-base font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Site Onboarding
            </h1>
          </div>
          <p
            className="mt-0.5 text-xs text-slate-500"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Access credentials for{' '}
            <span className="font-medium text-blue-700">{clientName}</span>
            {' '}&mdash; required for automated SEO fixes, content deployment, and agent operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasExisting && (
            <Badge variant="success" className="text-[10px]">
              Configured
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            {filledCount}/{totalFields} fields
          </Badge>
        </div>
      </div>

      {/* Info banner */}
      <div
        className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-800"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        These credentials enable autonomous agents to fix SEO issues, deploy content, manage DNS records, and optimize your site 24/7. All credentials are stored encrypted at rest. Only provide what applies to your setup.
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {error}
        </div>
      )}

      {/* Credential groups */}
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-40" />
        ))
      ) : (
        FIELD_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader className="border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500">
                  {group.icon}
                </div>
                <CardTitle>{group.title}</CardTitle>
              </div>
              <p
                className="mt-1 text-xs text-slate-500"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {group.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              {group.fields.map((field) => (
                <div key={field.key}>
                  <label
                    className="mb-1 block text-xs font-medium text-slate-600"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {field.label}
                  </label>
                  <FieldInput
                    field={field}
                    value={creds[field.key]}
                    onChange={(v) => updateField(field.key, v)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      {/* Save button */}
      {!loading && (
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={13} />
            ) : (
              <Save size={13} />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Credentials'}
          </Button>
          {saved && (
            <span
              className="text-xs text-emerald-600 font-medium"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Credentials saved successfully
            </span>
          )}
        </div>
      )}
    </div>
  )
}
