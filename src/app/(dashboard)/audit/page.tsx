'use client'

import { useEffect, useState } from 'react'
import { Shield, Globe } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useClient } from '@/contexts/client-context'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AuditPage() {
  const { currentClient, isLoading: clientLoading, hasNoBusiness } = useClient()
  const [clientName, setClientName] = useState<string>('')

  useEffect(() => {
    if (currentClient?.name) {
      setClientName(currentClient.name)
    }
  }, [currentClient?.id, currentClient?.name])

  // --- Client loading state ---
  if (clientLoading) {
    return (
      <div className="space-y-4 p-5">
        <div className="h-5 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  // --- No business (new user) ---
  if (hasNoBusiness) {
    return <EmptyDashboard />
  }

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-4">
        <h1
          className="text-base font-semibold text-slate-900"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Site Audit
        </h1>
        <p
          className="mt-0.5 text-xs text-slate-500"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Technical SEO audit for{' '}
          <span className="font-medium text-blue-700">{clientName}</span>
        </p>
      </div>

      {/* Empty state */}
      <EmptyState
        icon={<Shield className="h-6 w-6" />}
        title={`Site audit coming soon${clientName ? ` for ${clientName}` : ''}`}
        description="Automated site audits will scan for technical SEO issues, performance problems, and accessibility concerns."
        size="lg"
      />
    </div>
  )
}
