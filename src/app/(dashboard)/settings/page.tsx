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
  ChevronRight,
  ChevronLeft,
  Pencil,
  Search,
  TrendingUp,
  FileText,
  Shield,
  Bot,
  BarChart3,
  Loader2,
  Rocket,
  ExternalLink,
  AlertCircle,
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
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
  { id: 'api-keys', label: 'API Keys', icon: Plug },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

// ---------------------------------------------------------------------------
// Re-use the PLATFORM_OPTIONS from constants (already imported)
// ---------------------------------------------------------------------------
const PLATFORM_LABELS: Record<string, string> = {
  wordpress: 'WordPress',
  webflow: 'Webflow',
  shopify: 'Shopify',
  custom: 'Custom',
  other: 'Other',
}

// ---------------------------------------------------------------------------
// Shared input primitives
// ---------------------------------------------------------------------------
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-wider text-[#80868b]">
      {children}
    </label>
  )
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full rounded-lg border border-[#dadce0] bg-[#ffffff] px-3 py-2 text-sm text-[#202124]',
        'placeholder:text-[#bdc1c6] outline-none transition-all duration-150',
        'focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20',
        className
      )}
    />
  )
}

function SelectInput({
  id,
  value,
  onChange,
  options,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[#dadce0] bg-[#ffffff] px-3 py-2 text-sm text-[#202124] outline-none transition-all duration-150 focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#202124]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[#80868b]">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'flex-shrink-0 transition-colors duration-200',
          checked ? 'text-[#1a73e8]' : 'text-[#bdc1c6]'
        )}
        aria-pressed={checked}
      >
        {checked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  )
}

function MaskedApiField({
  label,
  value,
  connected,
}: {
  label: string
  value: string
  connected: boolean
}) {
  const [visible, setVisible] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)

  const masked = '•'.repeat(Math.min(value.length, 40))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {connected ? (
            <Badge variant="success">
              <CheckCircle2 size={10} /> Connected
            </Badge>
          ) : (
            <Badge variant="danger">
              <XCircle size={10} /> Disconnected
            </Badge>
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
              'w-full rounded-lg border border-[#dadce0] bg-[#ffffff] px-3 py-2 pr-10 text-sm font-mono text-[#202124]',
              'outline-none transition-all duration-150',
              editing && 'focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20'
            )}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#80868b] hover:text-[#5f6368]"
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {editing ? (
          <Button
            size="sm"
            onClick={() => setEditing(false)}
            className="flex-shrink-0"
          >
            Save
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditing(true)}
            className="flex-shrink-0"
          >
            <Pencil size={13} />
            Edit
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

  // Extend with mock platform/GSC data for display
  const mockExtended: Record<string, { platform: string; gscProperty: string; isActive: boolean }> =
    {
      'client-1': { platform: 'shopify', gscProperty: 'sc-domain:acmecorp.com', isActive: true },
      'client-2': { platform: 'webflow', gscProperty: 'sc-domain:brightmedia.io', isActive: true },
      'client-3': { platform: 'wordpress', gscProperty: 'sc-domain:novahealth.co', isActive: true },
      'client-4': { platform: 'custom', gscProperty: 'sc-domain:frontiertech.dev', isActive: false },
    }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#80868b]">
          {clients.length} client{clients.length !== 1 ? 's' : ''} configured
        </p>
        <Button variant="gold" size="sm" className="gap-2">
          <UserPlus size={14} />
          Add New Client
        </Button>
      </div>

      <div className="space-y-3">
        {clients.map((client) => {
          const ext = mockExtended[client.id] ?? {
            platform: 'other',
            gscProperty: '—',
            isActive: true,
          }
          const isSelected = currentClient?.id === client.id

          return (
            <Card
              key={client.id}
              className={cn(
                'transition-all duration-150',
                isSelected && 'border-[#1a73e8]/40'
              )}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: client.color ?? '#1a73e8' }}
                  >
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#202124]">{client.name}</p>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#80868b]">{client.domain}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#80868b]">
                      <span>
                        Platform:{' '}
                        <span className="text-[#5f6368]">
                          {PLATFORM_LABELS[ext.platform] ?? ext.platform}
                        </span>
                      </span>
                      <span>
                        GSC:{' '}
                        <span className="text-[#5f6368]">{ext.gscProperty}</span>
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {}}
                      className={cn(
                        'transition-colors duration-200',
                        ext.isActive ? 'text-[#1a73e8]' : 'text-[#bdc1c6]'
                      )}
                    >
                      {ext.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                    <Button variant="secondary" size="sm">
                      <Pencil size={13} />
                      Edit
                    </Button>
                    {!isSelected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentClient(client)}
                      >
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
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 2: Onboarding wizard
// ---------------------------------------------------------------------------

type Platform = 'wordpress' | 'webflow' | 'shopify' | 'custom' | 'other'
type ScanDepth = 'quick' | 'standard' | 'deep'
type AgentSchedule = 'realtime' | 'daily' | 'weekly'

interface OnboardingState {
  // Step 1
  businessName: string
  websiteUrl: string
  niche: string
  platform: Platform
  // Step 2
  gscEnabled: boolean
  gscProperty: string
  gaEnabled: boolean
  gaPropertyId: string
  atpEnabled: boolean
  competitorTracking: boolean
  dataRepoUrl: string
  // Step 3
  scanDepth: ScanDepth
  enabledAgents: string[]
  agentSchedule: AgentSchedule
  competitors: string[]
  // Meta
  step: number
}

const AGENT_OPTIONS = [
  { id: 'keyword-scout', label: 'Keyword Scout', icon: Search, color: '#1a73e8' },
  { id: 'rank-tracker', label: 'Rank Tracker', icon: TrendingUp, color: '#1e8e3e' },
  { id: 'content-optimizer', label: 'Content Optimizer', icon: FileText, color: '#9334e6' },
  { id: 'technical-auditor', label: 'Technical Auditor', icon: Shield, color: '#f9ab00' },
  { id: 'competitor-watcher', label: 'Competitor Watcher', icon: Bot, color: '#d93025' },
  { id: 'report-generator', label: 'Report Generator', icon: BarChart3, color: '#f9ab00' },
]

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200',
              i + 1 === step
                ? 'bg-[#1a73e8] text-white'
                : i + 1 < step
                  ? 'bg-[#1e8e3e] text-white'
                  : 'bg-[#dadce0] text-[#80868b]'
            )}
          >
            {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                'h-px flex-1 transition-all duration-200',
                i + 1 < step ? 'bg-[#1e8e3e]' : 'bg-[#dadce0]'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

const STEP_LABELS = ['Website Details', 'Data Sources', 'AI Configuration', 'Review & Launch']

function OnboardingTab() {
  const [state, setState] = React.useState<OnboardingState>({
    businessName: '',
    websiteUrl: '',
    niche: '',
    platform: 'wordpress',
    gscEnabled: false,
    gscProperty: '',
    gaEnabled: false,
    gaPropertyId: '',
    atpEnabled: true,
    competitorTracking: true,
    dataRepoUrl: '',
    scanDepth: 'standard',
    enabledAgents: ['keyword-scout', 'rank-tracker', 'content-optimizer', 'technical-auditor'],
    agentSchedule: 'daily',
    competitors: ['', '', '', '', ''],
    step: 1,
  })

  const [launched, setLaunched] = React.useState(false)
  const [launching, setLaunching] = React.useState(false)

  const set = <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }))

  const canProceed = () => {
    if (state.step === 1) return state.businessName.trim() && state.websiteUrl.trim()
    return true
  }

  const handleLaunch = async () => {
    setLaunching(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLaunching(false)
    setLaunched(true)
  }

  const toggleAgent = (id: string) => {
    set(
      'enabledAgents',
      state.enabledAgents.includes(id)
        ? state.enabledAgents.filter((a) => a !== id)
        : [...state.enabledAgents, id]
    )
  }

  const setCompetitor = (index: number, value: string) => {
    const next = [...state.competitors]
    next[index] = value
    set('competitors', next)
  }

  if (launched) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e8e3e]/20">
          <CheckCircle2 size={32} className="text-[#1e8e3e]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#202124]">Agentic SEO Launched!</h3>
          <p className="mt-1 text-sm text-[#80868b]">
            {state.businessName} is now being monitored. Agents will begin their first scan shortly.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLaunched(false)
            setState((prev) => ({ ...prev, step: 1 }))
          }}
        >
          Add Another Client
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div>
        <StepIndicator step={state.step} total={4} />
        <p className="mt-2 text-xs text-[#80868b]">
          Step {state.step} of 4 — {STEP_LABELS[state.step - 1]}
        </p>
      </div>

      {/* ── Step 1: Website Details ── */}
      {state.step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-[#202124]">Website Details</h3>
            <p className="mt-0.5 text-sm text-[#80868b]">
              Tell us about the client you want to start tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="biz-name">Business Name</Label>
              <TextInput
                id="biz-name"
                value={state.businessName}
                onChange={(v) => set('businessName', v)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website-url">Website URL</Label>
              <TextInput
                id="website-url"
                value={state.websiteUrl}
                onChange={(v) => set('websiteUrl', v)}
                placeholder="https://acmecorp.com"
                type="url"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="niche">Niche / Industry</Label>
              <TextInput
                id="niche"
                value={state.niche}
                onChange={(v) => set('niche', v)}
                placeholder="Business Finance, SaaS, E-commerce..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="platform">Platform</Label>
              <SelectInput
                id="platform"
                value={state.platform}
                onChange={(v) => set('platform', v as Platform)}
                options={PLATFORM_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Data Sources ── */}
      {state.step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-[#202124]">Data Sources</h3>
            <p className="mt-0.5 text-sm text-[#80868b]">
              Connect your data sources so agents have live signals to work from.
            </p>
          </div>

          <div className="space-y-4">
            {/* GSC */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <Toggle
                  checked={state.gscEnabled}
                  onChange={(v) => set('gscEnabled', v)}
                  label="Google Search Console"
                  description="Required for ranking data, click-through rates, and keyword discovery."
                />
                {state.gscEnabled && (
                  <div className="space-y-1.5 pl-1">
                    <Label htmlFor="gsc-property">GSC Property URL</Label>
                    <TextInput
                      id="gsc-property"
                      value={state.gscProperty}
                      onChange={(v) => set('gscProperty', v)}
                      placeholder="sc-domain:acmecorp.com or https://acmecorp.com/"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GA4 */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <Toggle
                  checked={state.gaEnabled}
                  onChange={(v) => set('gaEnabled', v)}
                  label="Google Analytics 4"
                  description="Adds session data, conversion tracking, and revenue attribution."
                />
                {state.gaEnabled && (
                  <div className="space-y-1.5 pl-1">
                    <Label htmlFor="ga-property">GA4 Property ID</Label>
                    <TextInput
                      id="ga-property"
                      value={state.gaPropertyId}
                      onChange={(v) => set('gaPropertyId', v)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ATP */}
            <Card>
              <CardContent className="p-4">
                <Toggle
                  checked={state.atpEnabled}
                  onChange={(v) => set('atpEnabled', v)}
                  label="Answer The Public Discovery"
                  description="Automatically fetches question-based keyword ideas from seed terms."
                />
              </CardContent>
            </Card>

            {/* Competitor tracking */}
            <Card>
              <CardContent className="p-4">
                <Toggle
                  checked={state.competitorTracking}
                  onChange={(v) => set('competitorTracking', v)}
                  label="Competitor Tracking"
                  description="Monitor up to 5 competitor domains for ranking changes and new content."
                />
              </CardContent>
            </Card>

            {/* Data repo */}
            <div className="space-y-1.5">
              <Label htmlFor="data-repo">Data Repository URL (optional)</Label>
              <TextInput
                id="data-repo"
                value={state.dataRepoUrl}
                onChange={(v) => set('dataRepoUrl', v)}
                placeholder="Google Drive folder URL, CSV endpoint, or Notion URL"
              />
              <p className="text-xs text-[#80868b]">
                Link business documents, existing keyword lists, or CSVs for agents to reference.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: AI Scan Configuration ── */}
      {state.step === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-[#202124]">AI Scan Configuration</h3>
            <p className="mt-0.5 text-sm text-[#80868b]">
              Configure which agents to run and how deep the initial scan goes.
            </p>
          </div>

          {/* Scan depth */}
          <div className="space-y-2">
            <Label>Scan Depth</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { value: 'quick', label: 'Quick', desc: 'Homepage only (~2 min)' },
                  { value: 'standard', label: 'Standard', desc: 'Top 20 pages (~8 min)' },
                  { value: 'deep', label: 'Deep', desc: 'Full site crawl (~25 min)' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('scanDepth', opt.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all duration-150',
                    state.scanDepth === opt.value
                      ? 'border-[#1a73e8] bg-[#dadce0]'
                      : 'border-[#dadce0] bg-[#ffffff] hover:border-[#bdc1c6]'
                  )}
                >
                  <p className="text-sm font-semibold text-[#202124]">{opt.label}</p>
                  <p className="text-xs text-[#80868b]">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Agent selection */}
          <div className="space-y-2">
            <Label>Active Agents</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AGENT_OPTIONS.map((agent) => {
                const Icon = agent.icon
                const active = state.enabledAgents.includes(agent.id)
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-3 text-left transition-all duration-150',
                      active
                        ? 'border-[#1a73e8]/40 bg-[#dadce0]'
                        : 'border-[#dadce0] bg-[#ffffff] opacity-60 hover:opacity-80'
                    )}
                  >
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${agent.color}22`,
                        border: `1px solid ${agent.color}44`,
                      }}
                    >
                      <Icon size={13} style={{ color: agent.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#202124]">{agent.label}</p>
                    </div>
                    <div
                      className={cn(
                        'h-4 w-4 flex-shrink-0 rounded-full border transition-all duration-150',
                        active
                          ? 'border-[#1a73e8] bg-[#1a73e8]'
                          : 'border-[#bdc1c6] bg-transparent'
                      )}
                    >
                      {active && (
                        <CheckCircle2 size={16} className="-m-px text-white" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label>Agent Run Schedule</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { value: 'realtime', label: 'Real-time', desc: 'Runs on every data update' },
                  { value: 'daily', label: 'Daily', desc: 'Runs once per day at 6 AM' },
                  { value: 'weekly', label: 'Weekly', desc: 'Runs every Monday at 6 AM' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('agentSchedule', opt.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all duration-150',
                    state.agentSchedule === opt.value
                      ? 'border-[#1a73e8] bg-[#dadce0]'
                      : 'border-[#dadce0] bg-[#ffffff] hover:border-[#bdc1c6]'
                  )}
                >
                  <p className="text-sm font-semibold text-[#202124]">{opt.label}</p>
                  <p className="text-xs text-[#80868b]">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Competitor domains */}
          {state.competitorTracking && (
            <div className="space-y-2">
              <Label>Competitor Domains (up to 5)</Label>
              <div className="space-y-2">
                {state.competitors.map((comp, i) => (
                  <TextInput
                    key={i}
                    value={comp}
                    onChange={(v) => setCompetitor(i, v)}
                    placeholder={`Competitor ${i + 1} domain (e.g. competitor.com)`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Review & Launch ── */}
      {state.step === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-[#202124]">Review & Launch</h3>
            <p className="mt-0.5 text-sm text-[#80868b]">
              Confirm your setup before launching the Agentic SEO system.
            </p>
          </div>

          {/* Summary card */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#80868b]">Business</p>
                  <p className="text-sm font-semibold text-[#202124]">
                    {state.businessName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#80868b]">URL</p>
                  <p className="text-sm font-semibold text-[#202124]">
                    {state.websiteUrl || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#80868b]">Niche</p>
                  <p className="text-sm font-semibold text-[#202124]">{state.niche || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#80868b]">Platform</p>
                  <p className="text-sm font-semibold text-[#202124]">
                    {PLATFORM_LABELS[state.platform]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#80868b]">Scan Depth</p>
                  <p className="text-sm font-semibold text-[#202124] capitalize">
                    {state.scanDepth}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#80868b]">Schedule</p>
                  <p className="text-sm font-semibold text-[#202124] capitalize">
                    {state.agentSchedule}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#dadce0] pt-3">
                <p className="mb-2 text-xs text-[#80868b]">Active Agents</p>
                <div className="flex flex-wrap gap-2">
                  {AGENT_OPTIONS.filter((a) => state.enabledAgents.includes(a.id)).map((a) => (
                    <Badge key={a.id} variant="info">
                      {a.label}
                    </Badge>
                  ))}
                  {state.enabledAgents.length === 0 && (
                    <p className="text-xs text-[#80868b]">No agents selected</p>
                  )}
                </div>
              </div>

              {state.competitorTracking && (
                <div className="border-t border-[#dadce0] pt-3">
                  <p className="mb-2 text-xs text-[#80868b]">Competitor Domains</p>
                  <div className="flex flex-wrap gap-2">
                    {state.competitors
                      .filter(Boolean)
                      .map((c, i) => (
                        <Badge key={i} variant="outline">
                          {c}
                        </Badge>
                      ))}
                    {!state.competitors.some(Boolean) && (
                      <p className="text-xs text-[#80868b]">None added</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What will happen */}
          <div className="rounded-lg border border-[#f9ab00]/20 bg-[#fef7e0]/30 p-4">
            <div className="flex items-start gap-3">
              <Rocket size={16} className="mt-0.5 flex-shrink-0 text-[#f9ab00]" />
              <div>
                <p className="text-sm font-semibold text-[#f9ab00]">What happens when you launch</p>
                <ul className="mt-2 space-y-1 text-xs text-[#5f6368]">
                  <li>
                    AI will scan{' '}
                    <span className="font-medium text-[#202124]">
                      {state.websiteUrl || '[your URL]'}
                    </span>{' '}
                    using a{' '}
                    <span className="font-medium text-[#202124]">{state.scanDepth}</span> crawl
                  </li>
                  <li>Keyword Scout will discover initial keyword opportunities from GSC data</li>
                  <li>Rank Tracker will begin daily position monitoring for all found keywords</li>
                  <li>Technical Auditor will run a full site audit and log all issues</li>
                  {state.competitorTracking && (
                    <li>
                      Competitor Watcher will begin monitoring{' '}
                      {state.competitors.filter(Boolean).length || 0} competitor domains
                    </li>
                  )}
                  <li>
                    Your first AI performance report will be generated after the initial data
                    collection period
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Launch button */}
          <Button
            variant="gold"
            size="lg"
            className="w-full gap-2"
            onClick={handleLaunch}
            disabled={launching}
          >
            {launching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Launching Agentic SEO...
              </>
            ) : (
              <>
                <Rocket size={16} />
                Launch Agentic SEO
              </>
            )}
          </Button>
        </div>
      )}

      {/* Navigation buttons */}
      {state.step < 4 && (
        <div className="flex items-center justify-between border-t border-[#dadce0] pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => set('step', Math.max(1, state.step - 1))}
            disabled={state.step === 1}
            className="gap-1.5"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => set('step', Math.min(4, state.step + 1))}
            disabled={!canProceed()}
            className="gap-1.5"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {state.step === 4 && (
        <div className="flex items-center justify-start border-t border-[#dadce0] pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => set('step', 3)}
            className="gap-1.5"
          >
            <ChevronLeft size={14} />
            Back
          </Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 3: API Keys
// ---------------------------------------------------------------------------
function ApiKeysTab() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-[#202124]">API Connections</h3>
        <p className="mt-0.5 text-sm text-[#80868b]">
          Manage keys and connection status for all external services.
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-5">
            <MaskedApiField
              label="Maton API Gateway"
              value="RzfjgLYTOSk2Q40WOBjciy8Rcw7ME7zlBRGtXdzxBEFyF6Vj"
              connected={true}
            />
            <p className="text-xs text-[#80868b]">
              Provides access to Google Ads, Search Console, Analytics, YouTube, and Sheets via
              unified OAuth proxy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <MaskedApiField
              label="n8n Workflow Engine"
              value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YjM5"
              connected={true}
            />
            <div className="flex items-center gap-2 text-xs text-[#80868b]">
              <span>Endpoint:</span>
              <span className="font-mono text-[#5f6368]">http://10.28.28.97:5678</span>
              <a
                href="#"
                className="flex items-center gap-1 text-[#1a73e8] hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                <ExternalLink size={10} />
                Open n8n
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <MaskedApiField
              label="Cognabase (Supabase)"
              value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh"
              connected={true}
            />
            <div className="flex items-center gap-2 text-xs text-[#80868b]">
              <span>Database:</span>
              <span className="font-mono text-[#5f6368]">10.28.28.97:5433</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <MaskedApiField
              label="Anthropic Claude API"
              value="sk-ant-api03-PLACEHOLDER-KEY-VALUE-HERE"
              connected={false}
            />
            <div className="flex items-center gap-2 rounded-md border border-[#d93025]/20 bg-[#fce8e6]/30 p-2">
              <AlertCircle size={12} className="flex-shrink-0 text-[#d93025]" />
              <p className="text-xs text-[#d93025]">
                No API key configured. Add your Anthropic key to enable AI report generation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <MaskedApiField
              label="Google Search Console (Maton)"
              value="connected-via-maton-gateway-oauth"
              connected={true}
            />
            <p className="text-xs text-[#80868b]">
              Connected via Maton API Gateway. No separate key needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab 4: Notifications
// ---------------------------------------------------------------------------
function NotificationsTab() {
  const [emailEnabled, setEmailEnabled] = React.useState(true)
  const [slackUrl, setSlackUrl] = React.useState('')
  const [positionDropThreshold, setPositionDropThreshold] = React.useState('5')
  const [trafficDropThreshold, setTrafficDropThreshold] = React.useState('20')
  const [weeklyReport, setWeeklyReport] = React.useState(true)
  const [criticalAlerts, setCriticalAlerts] = React.useState(true)
  const [competitorAlerts, setCompetitorAlerts] = React.useState(true)

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-[#202124]">Notification Settings</h3>
        <p className="mt-0.5 text-sm text-[#80868b]">
          Configure when and how you receive SEO alerts and reports.
        </p>
      </div>

      {/* Channels */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">
            Channels
          </p>

          <Toggle
            checked={emailEnabled}
            onChange={setEmailEnabled}
            label="Email Notifications"
            description="Receive alerts and weekly reports via email."
          />

          <div className="space-y-1.5">
            <Label htmlFor="slack-url">Slack Webhook URL</Label>
            <TextInput
              id="slack-url"
              value={slackUrl}
              onChange={setSlackUrl}
              placeholder="https://hooks.slack.com/services/T00000000/B00000000/xxxx"
            />
            {slackUrl && (
              <p className="text-xs text-[#1e8e3e]">Slack notifications active</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert thresholds */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">
            Alert Thresholds
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="position-drop">Position Drop Alert</Label>
              <div className="flex items-center gap-2">
                <TextInput
                  id="position-drop"
                  value={positionDropThreshold}
                  onChange={setPositionDropThreshold}
                  placeholder="5"
                  type="number"
                  className="w-20"
                />
                <span className="text-sm text-[#80868b]">positions or more</span>
              </div>
              <p className="text-xs text-[#80868b]">
                Alert when any tracked keyword drops by this many positions.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="traffic-drop">Traffic Drop Alert</Label>
              <div className="flex items-center gap-2">
                <TextInput
                  id="traffic-drop"
                  value={trafficDropThreshold}
                  onChange={setTrafficDropThreshold}
                  placeholder="20"
                  type="number"
                  className="w-20"
                />
                <span className="text-sm text-[#80868b]">% week-over-week</span>
              </div>
              <p className="text-xs text-[#80868b]">
                Alert when organic clicks drop by this percentage in a 7-day window.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report & alert toggles */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">
            Automated Reports & Alerts
          </p>

          <Toggle
            checked={weeklyReport}
            onChange={setWeeklyReport}
            label="Weekly Report Auto-Send"
            description="Automatically email the weekly AI report every Monday at 9 AM."
          />

          <Toggle
            checked={criticalAlerts}
            onChange={setCriticalAlerts}
            label="Critical Technical Issue Alerts"
            description="Immediate notification when the technical auditor finds a critical issue."
          />

          <Toggle
            checked={competitorAlerts}
            onChange={setCompetitorAlerts}
            label="Competitor Movement Alerts"
            description="Alert when a competitor enters the top 3 for any of your tracked keywords."
          />
        </CardContent>
      </Card>

      <Button variant="default" size="sm">
        Save Notification Settings
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('clients')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#202124]">Settings</h1>
        <p className="mt-0.5 text-sm text-[#80868b]">
          Manage clients, onboard new sites, configure API connections, and set notifications.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-[#dadce0]">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all duration-150',
                active
                  ? 'border-[#1a73e8] text-[#202124]'
                  : 'border-transparent text-[#80868b] hover:text-[#5f6368]'
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'clients' && <ClientsTab />}
        {activeTab === 'onboarding' && <OnboardingTab />}
        {activeTab === 'api-keys' && <ApiKeysTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  )
}
