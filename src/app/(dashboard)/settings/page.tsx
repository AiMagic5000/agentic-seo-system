'use client'

import * as React from 'react'
import {
  Users,
  Plug,
  Bell,
  UserPlus,
  Globe,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Pencil,
  Search,
  TrendingUp,
  FileText,
  Shield,
  Bot,
  BarChart3,
  Loader2,
  Rocket,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClient } from '@/contexts/client-context'
import { cn } from '@/lib/utils'
import { PLATFORM_OPTIONS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
type SettingsTab = 'clients' | 'onboarding' | 'api-keys' | 'notifications'

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'clients',       label: 'Clients',       icon: Users },
  { id: 'onboarding',    label: 'Onboarding',    icon: UserPlus },
  { id: 'api-keys',      label: 'API Keys',      icon: Plug },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const PLATFORM_LABELS: Record<string, string> = {
  wordpress: 'WordPress',
  webflow:   'Webflow',
  shopify:   'Shopify',
  custom:    'Custom',
  other:     'Other',
}

// ---------------------------------------------------------------------------
// Shared input primitives
// ---------------------------------------------------------------------------
function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-medium uppercase tracking-wider text-slate-400"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {children}
    </label>
  )
}

function TextInput({
  id, value, onChange, placeholder, type = 'text', className,
}: {
  id?: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; className?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800',
        'placeholder:text-slate-300 outline-none transition-all duration-150',
        'focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30',
        className
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
    />
  )
}

function SelectInput({
  id, value, onChange, options,
}: {
  id?: string; value: string; onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-all duration-150 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 cursor-pointer"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

function Toggle({
  checked, onChange, label, description,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn('shrink-0 transition-colors duration-200 cursor-pointer', checked ? 'text-blue-600' : 'text-slate-300')}
        aria-pressed={checked}
      >
        {checked ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
      </button>
    </div>
  )
}

function MaskedApiField({ label, value, connected }: { label: string; value: string; connected: boolean }) {
  const [visible, setVisible] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex items-center gap-2">
          {connected ? (
            <Badge variant="success"><CheckCircle2 size={9} />Connected</Badge>
          ) : (
            <Badge variant="danger"><XCircle size={9} />Disconnected</Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={editing ? editValue : value}
            onChange={(e) => setEditValue(e.target.value)}
            readOnly={!editing}
            className={cn(
              'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-800',
              'outline-none transition-all duration-150',
              editing && 'focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30'
            )}
            style={{ fontFamily: 'var(--font-mono)' }}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        {editing ? (
          <Button size="sm" onClick={() => setEditing(false)}>Save</Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)} className="gap-1">
            <Pencil size={12} />Edit
          </Button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 1: Clients
// ---------------------------------------------------------------------------
function ClientsTab() {
  const { clients, currentClient, setCurrentClient } = useClient()

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Globe size={32} className="mb-4 text-slate-200" />
        <p className="text-sm font-medium text-slate-700" style={{ fontFamily: 'var(--font-sans)' }}>No clients yet</p>
        <p className="mt-1 text-xs text-slate-400 max-w-xs" style={{ fontFamily: 'var(--font-sans)' }}>
          Add your first website to start tracking SEO performance.
        </p>
        <Button variant="amber" size="sm" className="mt-4 gap-1.5">
          <UserPlus size={13} />Add Website
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
          {clients.length} client{clients.length !== 1 ? 's' : ''} configured
        </p>
        <Button variant="amber" size="sm" className="gap-1.5">
          <UserPlus size={13} />Add Client
        </Button>
      </div>

      {clients.map((client) => {
        const isSelected = currentClient?.id === client.id
        const platformLabel = PLATFORM_LABELS[client.platform ?? ''] ?? client.platform ?? 'Other'
        const gscProperty = client.gsc_property_url || '--'
        const isActive = client.active !== false

        return (
          <Card
            key={client.id}
            className={cn('transition-all duration-150', isSelected && 'border-blue-300')}
          >
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: client.color ?? '#3B82F6' }}
                >
                  {client.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>
                      {client.name}
                    </p>
                    {isSelected && <Badge variant="default" className="text-[10px]">Active</Badge>}
                  </div>
                  <p className="text-xs text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>{client.domain}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400" style={{ fontFamily: 'var(--font-sans)' }}>
                    <span>Platform: <span className="text-slate-600">{platformLabel}</span></span>
                    <span>GSC: <span className="text-slate-600" style={{ fontFamily: 'var(--font-mono)' }}>{gscProperty}</span></span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className={cn('cursor-pointer transition-colors duration-200', isActive ? 'text-blue-600' : 'text-slate-300')}
                  >
                    {isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <Button variant="secondary" size="sm" className="gap-1 h-7 text-xs">
                    <Pencil size={11} />Edit
                  </Button>
                  {!isSelected && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setCurrentClient(client)}>
                      Select
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 2: Onboarding wizard
// ---------------------------------------------------------------------------
type Platform      = 'wordpress' | 'webflow' | 'shopify' | 'custom' | 'other'
type ScanDepth     = 'quick' | 'standard' | 'deep'
type AgentSchedule = 'realtime' | 'daily' | 'weekly'

interface OnboardingState {
  businessName: string; websiteUrl: string; niche: string; platform: Platform
  gscEnabled: boolean; gscProperty: string; gaEnabled: boolean; gaPropertyId: string
  atpEnabled: boolean; competitorTracking: boolean; dataRepoUrl: string
  scanDepth: ScanDepth; enabledAgents: string[]; agentSchedule: AgentSchedule
  competitors: string[]; step: number
}

const AGENT_OPTIONS = [
  { id: 'keyword-scout',      label: 'Keyword Scout',      icon: Search,    color: '#3B82F6' },
  { id: 'rank-tracker',       label: 'Rank Tracker',       icon: TrendingUp,color: '#10B981' },
  { id: 'content-optimizer',  label: 'Content Optimizer',  icon: FileText,  color: '#8B5CF6' },
  { id: 'technical-auditor',  label: 'Technical Auditor',  icon: Shield,    color: '#F59E0B' },
  { id: 'competitor-watcher', label: 'Competitor Watcher', icon: Bot,       color: '#EF4444' },
  { id: 'report-generator',   label: 'Report Generator',   icon: BarChart3, color: '#F59E0B' },
]

function WizardStepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-200',
            i + 1 === step ? 'w-5 bg-blue-600' : i + 1 < step ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200'
          )}
        />
      ))}
    </div>
  )
}

function OnboardingTab() {
  const [state, setState] = React.useState<OnboardingState>({
    businessName: '', websiteUrl: '', niche: '', platform: 'wordpress',
    gscEnabled: false, gscProperty: '', gaEnabled: false, gaPropertyId: '',
    atpEnabled: false, competitorTracking: true, dataRepoUrl: '',
    scanDepth: 'standard', enabledAgents: AGENT_OPTIONS.map((a) => a.id),
    agentSchedule: 'daily', competitors: ['', ''], step: 1,
  })
  const [saving, setSaving] = React.useState(false)

  function update<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
  }

  const TOTAL_STEPS = 3

  return (
    <div className="space-y-4">
      {/* Step header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
            Step {state.step} of {TOTAL_STEPS}
          </p>
          <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: 'var(--font-sans)' }}>
            {state.step === 1 ? 'Site Details' : state.step === 2 ? 'Integrations' : 'Agent Configuration'}
          </p>
        </div>
        <WizardStepDots step={state.step} total={TOTAL_STEPS} />
      </div>

      {/* Step 1 */}
      {state.step === 1 && (
        <Card>
          <CardContent className="space-y-4 p-4">
            {[
              { label: 'Business Name', key: 'businessName' as const, placeholder: 'Start My Business Inc.' },
              { label: 'Website URL',   key: 'websiteUrl'  as const, placeholder: 'https://startmybusiness.us' },
              { label: 'Niche / Industry', key: 'niche'    as const, placeholder: 'Business Credit & Formation' },
            ].map((f) => (
              <div key={f.key} className="space-y-1">
                <FieldLabel htmlFor={f.key}>{f.label}</FieldLabel>
                <TextInput
                  id={f.key}
                  value={state[f.key] as string}
                  onChange={(v) => update(f.key, v)}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <div className="space-y-1">
              <FieldLabel htmlFor="platform">Platform</FieldLabel>
              <SelectInput
                id="platform"
                value={state.platform}
                onChange={(v) => update('platform', v as Platform)}
                options={[...PLATFORM_OPTIONS]}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {state.step === 2 && (
        <Card>
          <CardContent className="space-y-5 p-4">
            <Toggle
              checked={state.gscEnabled}
              onChange={(v) => update('gscEnabled', v)}
              label="Google Search Console"
              description="Connect GSC for real keyword and click data"
            />
            {state.gscEnabled && (
              <div className="space-y-1 pl-4">
                <FieldLabel htmlFor="gscProperty">GSC Property URL</FieldLabel>
                <TextInput
                  id="gscProperty"
                  value={state.gscProperty}
                  onChange={(v) => update('gscProperty', v)}
                  placeholder="sc-domain:startmybusiness.us"
                />
              </div>
            )}
            <Toggle
              checked={state.gaEnabled}
              onChange={(v) => update('gaEnabled', v)}
              label="Google Analytics 4"
              description="Connect GA4 for traffic and engagement metrics"
            />
            {state.gaEnabled && (
              <div className="space-y-1 pl-4">
                <FieldLabel htmlFor="gaId">GA4 Property ID</FieldLabel>
                <TextInput
                  id="gaId"
                  value={state.gaPropertyId}
                  onChange={(v) => update('gaPropertyId', v)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            )}
            <Toggle
              checked={state.atpEnabled}
              onChange={(v) => update('atpEnabled', v)}
              label="Answer The Public"
              description="Enable ATP keyword discovery agent"
            />
            <Toggle
              checked={state.competitorTracking}
              onChange={(v) => update('competitorTracking', v)}
              label="Competitor Tracking"
              description="Monitor up to 5 competitor domains in real time"
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {state.step === 3 && (
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-700" style={{ fontFamily: 'var(--font-sans)' }}>
                Agent Scan Depth
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                {(['quick', 'standard', 'deep'] as ScanDepth[]).map((depth) => (
                  <button
                    key={depth}
                    type="button"
                    onClick={() => update('scanDepth', depth)}
                    className={cn(
                      'rounded-lg border p-2.5 text-left transition-all duration-150 cursor-pointer',
                      state.scanDepth === depth
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <p className="text-xs font-semibold capitalize text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>{depth}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>
                      {depth === 'quick' ? '~2 min' : depth === 'standard' ? '~8 min' : '~25 min'}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-700" style={{ fontFamily: 'var(--font-sans)' }}>
                Enabled Agents
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {AGENT_OPTIONS.map((agent) => {
                const Icon    = agent.icon
                const enabled = state.enabledAgents.includes(agent.id)
                return (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded"
                        style={{ backgroundColor: `${agent.color}1a` }}
                      >
                        <Icon size={12} style={{ color: agent.color }} />
                      </div>
                      <span className="text-xs font-medium text-slate-800" style={{ fontFamily: 'var(--font-sans)' }}>{agent.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          'enabledAgents',
                          enabled
                            ? state.enabledAgents.filter((id) => id !== agent.id)
                            : [...state.enabledAgents, agent.id]
                        )
                      }
                      className={cn('cursor-pointer transition-colors', enabled ? 'text-blue-600' : 'text-slate-300')}
                    >
                      {enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={state.step <= 1}
          onClick={() => update('step', state.step - 1)}
        >
          <ChevronLeft size={13} />Back
        </Button>

        {state.step < TOTAL_STEPS ? (
          <Button size="sm" className="gap-1.5" onClick={() => update('step', state.step + 1)}>
            Next<ChevronRight size={13} />
          </Button>
        ) : (
          <Button variant="amber" size="sm" disabled={saving} className="gap-1.5 min-w-[100px]" onClick={handleSave}>
            {saving ? <><Loader2 size={12} className="animate-spin" />Saving...</> : <><Rocket size={12} />Launch</>}
          </Button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 3: API Keys
// ---------------------------------------------------------------------------
function ApiKeysTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700" style={{ fontFamily: 'var(--font-sans)' }}>
          API keys are encrypted at rest and never exposed in plain text. Only the last 4 characters are shown for verification.
        </p>
      </div>

      {[
        { label: 'Google Search Console OAuth', value: 'AIzaSyB-8mF9k...j4kP', connected: true },
        { label: 'Google Analytics 4',           value: 'ya29.a0AWY7Ck...mN9x',  connected: true },
        { label: 'OpenAI API Key',               value: 'sk-proj-xF3...k8Qz',     connected: true },
        { label: 'Anthropic API Key',            value: 'sk-ant-...v2Wx',          connected: false },
        { label: 'Answer The Public API',        value: '',                         connected: false },
        { label: 'SerpAPI Key',                  value: '',                         connected: false },
      ].map((field) => (
        <Card key={field.label}>
          <CardContent className="p-4">
            <MaskedApiField
              label={field.label}
              value={field.value || 'Not configured'}
              connected={field.connected}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 4: Notifications
// ---------------------------------------------------------------------------
interface NotifSetting {
  id: string
  label: string
  description: string
  enabled: boolean
  category: 'rankings' | 'audits' | 'reports' | 'agents'
}

function NotificationsTab() {
  const [settings, setSettings] = React.useState<NotifSetting[]>([
    { id: 'rank-drop',       label: 'Rank Drop Alerts',          description: 'Notify when any tracked keyword drops 5+ positions',  enabled: true,  category: 'rankings' },
    { id: 'top3-entry',      label: 'Top 3 Entry',                description: 'Notify when a keyword enters positions 1-3',          enabled: true,  category: 'rankings' },
    { id: 'critical-issue',  label: 'Critical Audit Issues',     description: 'Notify immediately when a critical issue is detected',  enabled: true,  category: 'audits' },
    { id: 'weekly-report',   label: 'Weekly Report Ready',       description: 'Notify when a new weekly report is generated',          enabled: true,  category: 'reports' },
    { id: 'monthly-report',  label: 'Monthly Report Ready',      description: 'Notify when a new monthly report is generated',         enabled: true,  category: 'reports' },
    { id: 'agent-failure',   label: 'Agent Failure',              description: 'Notify when an agent run fails or errors',             enabled: true,  category: 'agents' },
    { id: 'agent-complete',  label: 'Agent Run Complete',        description: 'Notify after each successful agent run',                enabled: false, category: 'agents' },
    { id: 'competitor-alert',label: 'Competitor Alerts',         description: 'Notify when a competitor enters top 3 for a tracked keyword', enabled: true, category: 'rankings' },
  ])

  function toggle(id: string) {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const categories: { id: NotifSetting['category']; label: string }[] = [
    { id: 'rankings', label: 'Rankings' },
    { id: 'audits',   label: 'Audits' },
    { id: 'reports',  label: 'Reports' },
    { id: 'agents',   label: 'Agents' },
  ]

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const catSettings = settings.filter((s) => s.category === cat.id)
        return (
          <Card key={cat.id}>
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-sans)' }}>
                {cat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-50 px-4 pb-2">
              {catSettings.map((setting) => (
                <div key={setting.id} className="py-3">
                  <Toggle
                    checked={setting.enabled}
                    onChange={() => toggle(setting.id)}
                    label={setting.label}
                    description={setting.description}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('clients')
  const ActiveComponent = {
    clients:       ClientsTab,
    onboarding:    OnboardingTab,
    'api-keys':    ApiKeysTab,
    notifications: NotificationsTab,
  }[activeTab]

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-4">
        <h1
          className="text-base font-semibold text-slate-900"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Settings
        </h1>
        <p
          className="mt-0.5 text-xs text-slate-500"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Manage clients, integrations, and agent configuration
        </p>
      </div>

      {/* Tab nav */}
      <div className="mb-5 flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {TABS.map((tab) => {
          const Icon     = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-all duration-150 cursor-pointer',
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <ActiveComponent />
    </div>
  )
}
