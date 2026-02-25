'use client'

import * as React from 'react'
import { X, Globe, Building2, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { INDUSTRY_OPTIONS, PLATFORM_OPTIONS } from '@/lib/constants'
import { useClient } from '@/contexts/client-context'

// ---------------------------------------------------------------------------
// AddBusinessWizard — 3-step modal to add a new client
// ---------------------------------------------------------------------------

interface WizardProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  business_name: string
  domain: string
  industry: string
  platform: string
  gsc_property_url: string
}

const INITIAL_FORM: FormData = {
  business_name: '',
  domain: '',
  industry: '',
  platform: 'wordpress',
  gsc_property_url: '',
}

function StepIndicator({
  step,
  current,
  label,
}: {
  step: number
  current: number
  label: string
}) {
  const done = current > step
  const active = current === step
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
          'transition-all duration-200',
          done
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-400'
        )}
      >
        {done ? <CheckCircle2 size={14} /> : step}
      </div>
      <span
        className={cn(
          'text-[10px] font-medium',
          active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-slate-400'
        )}
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {label}
      </span>
    </div>
  )
}

function FieldLabel({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-slate-700 mb-1"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function Input({
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
}) {
  return (
    <div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border px-3 py-2 text-sm',
          'bg-slate-50 text-slate-900 placeholder:text-slate-400',
          'transition-all duration-150',
          'focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 focus:bg-white',
          error ? 'border-red-300' : 'border-slate-200'
        )}
        style={{ fontFamily: 'var(--font-sans)' }}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500" style={{ fontFamily: 'var(--font-sans)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function Select({
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
      className={cn(
        'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
        'bg-slate-50 text-slate-900',
        'transition-all duration-150',
        'focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 focus:bg-white',
        'cursor-pointer'
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function AddBusinessWizard({ open, onClose, onSuccess }: WizardProps) {
  const { refetchClients } = useClient()
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState<FormData>(INITIAL_FORM)
  const [errors, setErrors] = React.useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validateStep1(): boolean {
    const errs: Partial<FormData> = {}
    if (!form.business_name.trim()) errs.business_name = 'Business name is required'
    if (!form.domain.trim()) {
      errs.domain = 'Website URL is required'
    } else {
      try {
        new URL(
          form.domain.startsWith('http') ? form.domain : `https://${form.domain}`
        )
      } catch {
        errs.domain = 'Enter a valid URL (e.g. yoursite.com)'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const errs: Partial<FormData> = {}
    if (!form.industry) errs.industry = 'Please select an industry'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => s + 1)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        business_name: form.business_name.trim(),
        domain: form.domain.startsWith('http')
          ? form.domain.trim()
          : `https://${form.domain.trim()}`,
        niche: form.industry,
        platform: form.platform,
        gsc_property_url: form.gsc_property_url.trim() || undefined,
      }
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Failed to add business')
      }
      await refetchClients()
      onSuccess?.()
      handleClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setStep(1)
    setForm(INITIAL_FORM)
    setErrors({})
    setSubmitError(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2
              className="text-sm font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Add Your Website
            </h2>
            <p
              className="text-xs text-slate-500 mt-0.5"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-6 border-b border-slate-100 px-5 py-3">
          <StepIndicator step={1} current={step} label="Basics" />
          <div className="h-px flex-1 bg-slate-200 max-w-[40px]" />
          <StepIndicator step={2} current={step} label="Details" />
          <div className="h-px flex-1 bg-slate-200 max-w-[40px]" />
          <StepIndicator step={3} current={step} label="GSC" />
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <FieldLabel htmlFor="business_name" required>
                  Business Name
                </FieldLabel>
                <Input
                  id="business_name"
                  value={form.business_name}
                  onChange={(v) => update('business_name', v)}
                  placeholder="Start My Business Inc."
                  error={errors.business_name}
                />
              </div>
              <div>
                <FieldLabel htmlFor="domain" required>
                  Website URL
                </FieldLabel>
                <Input
                  id="domain"
                  value={form.domain}
                  onChange={(v) => update('domain', v)}
                  placeholder="startmybusiness.us"
                  error={errors.domain}
                />
                <p
                  className="mt-1 text-[11px] text-slate-400"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Enter your domain without https:// or trailing slash
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <FieldLabel htmlFor="industry" required>
                  Industry / Niche
                </FieldLabel>
                <Select
                  id="industry"
                  value={form.industry}
                  onChange={(v) => update('industry', v)}
                  options={INDUSTRY_OPTIONS as unknown as { label: string; value: string }[]}
                />
                {errors.industry && (
                  <p className="mt-1 text-xs text-red-500">{errors.industry}</p>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="platform">
                  Website Platform
                </FieldLabel>
                <Select
                  id="platform"
                  value={form.platform}
                  onChange={(v) => update('platform', v)}
                  options={PLATFORM_OPTIONS as unknown as { label: string; value: string }[]}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-100 p-3 mb-4">
                <Globe size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-xs font-semibold text-blue-800 mb-1"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Connect Google Search Console (Optional)
                  </p>
                  <p
                    className="text-xs text-blue-600 leading-relaxed"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    Adding your GSC property URL lets the AI agents access real
                    keyword and click data. You can skip this and connect it later
                    from Settings.
                  </p>
                </div>
              </div>
              <FieldLabel htmlFor="gsc_property_url">
                GSC Property URL
              </FieldLabel>
              <Input
                id="gsc_property_url"
                value={form.gsc_property_url}
                onChange={(v) => update('gsc_property_url', v)}
                placeholder="sc-domain:startmybusiness.us"
              />
              <p
                className="mt-1 text-[11px] text-slate-400"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Found in Google Search Console under "Property" settings
              </p>
            </div>
          )}

          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <p
                className="text-xs text-red-700"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {submitError}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1.5"
            >
              Continue
              <ChevronRight size={14} />
            </Button>
          ) : (
            <Button
              variant="amber"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1.5 min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Building2 size={13} />
                  Add Website
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
