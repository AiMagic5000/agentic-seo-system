'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Globe } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useClient } from '@/contexts/client-context'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReportsPage() {
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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="h-36" />
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
    <div className="space-y-4 p-5">
      {/* Header */}
      <div>
        <h1
          className="text-base font-semibold text-slate-900"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Reports
        </h1>
        <p
          className="mt-0.5 text-xs text-slate-500"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          AI-generated performance reports for{' '}
          <span className="font-medium text-blue-700">{clientName}</span>
        </p>
      </div>

      {/* Empty state */}
      <EmptyState
        icon={<BarChart3 className="h-6 w-6" />}
        title={`No reports available${clientName ? ` for ${clientName}` : ''}`}
        description="AI-generated performance reports will appear here once your SEO agents have collected enough data."
        size="lg"
      />
    </div>
  )
}
