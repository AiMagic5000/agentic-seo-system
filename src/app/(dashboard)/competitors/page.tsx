'use client'

import { useEffect, useState } from 'react'
import { Eye, Globe } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useClient } from '@/contexts/client-context'
import { EmptyDashboard } from '@/components/onboarding/EmptyDashboard'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CompetitorsPage() {
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
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="min-w-[200px]" />
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
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-amber-500" />
          <h1
            className="text-base font-semibold text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Competitor Analysis
          </h1>
        </div>
        <p
          className="mt-0.5 text-xs text-slate-500"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Track competitors and identify keyword gaps for{' '}
          <span className="font-medium text-blue-700">{clientName}</span>
        </p>
      </div>

      {/* Empty state */}
      <EmptyState
        icon={<Eye className="h-6 w-6" />}
        title={`Competitor analysis coming soon${clientName ? ` for ${clientName}` : ''}`}
        description="Monitor competitor rankings, discover content gaps, and find opportunities to outrank them."
        size="lg"
      />
    </div>
  )
}
