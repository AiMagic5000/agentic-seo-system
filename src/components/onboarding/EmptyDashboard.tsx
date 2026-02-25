'use client'

import * as React from 'react'
import { Globe, Search, Bot, BarChart3, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddBusinessWizard } from './AddBusinessWizard'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// EmptyDashboard — full-page empty state for new users with no websites
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: Search,
    color: '#3B82F6',
    bg: '#EFF6FF',
    title: 'Keyword Tracking',
    description:
      'Track unlimited keywords across your entire site. See position changes daily.',
  },
  {
    icon: Bot,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'AI Agents',
    description:
      '6 autonomous agents run 24/7. They find gaps, fix issues, and surface opportunities.',
  },
  {
    icon: BarChart3,
    color: '#059669',
    bg: '#ECFDF5',
    title: 'Automated Reports',
    description:
      'Weekly and monthly reports generated automatically and delivered to your inbox.',
  },
]

export function EmptyDashboard() {
  const [wizardOpen, setWizardOpen] = React.useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-16">
      {/* Icon */}
      <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100">
        <Globe className="w-8 h-8 text-slate-300" />
      </div>

      {/* Title */}
      <h1
        className="text-xl font-bold text-slate-900 mb-2 text-center"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        Welcome to SMB Agentic SEO
      </h1>

      {/* Description */}
      <p
        className="text-sm text-slate-500 max-w-sm text-center mb-8 leading-relaxed"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        Add your first website to start tracking SEO performance. Our AI agents
        will begin working immediately after you connect.
      </p>

      {/* CTA */}
      <Button
        variant="amber"
        size="lg"
        onClick={() => setWizardOpen(true)}
        className="gap-2 mb-12"
      >
        <Plus size={16} />
        Add Your Website
      </Button>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className={cn(
                'rounded-lg border border-slate-200 bg-white p-4 text-center',
                'shadow-sm'
              )}
            >
              <div
                className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: feature.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: feature.color }} />
              </div>
              <h3
                className="text-xs font-semibold text-slate-900 mb-1"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {feature.title}
              </h3>
              <p
                className="text-[11px] text-slate-500 leading-relaxed"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Wizard */}
      <AddBusinessWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  )
}
