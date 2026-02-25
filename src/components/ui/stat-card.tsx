'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// StatCard — compact data-dense stat display (design system)
// ---------------------------------------------------------------------------

export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  iconColor?: string
  iconBg?: string
  subtitle?: string
  loading?: boolean
  className?: string
  onClick?: () => void
}

function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg p-3 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="h-2.5 w-20 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-6 w-6 rounded-full bg-slate-200 animate-pulse" />
      </div>
      <div className="h-7 w-24 rounded-lg bg-slate-200 animate-pulse mb-2" />
      <div className="h-4 w-16 rounded-full bg-slate-100 animate-pulse" />
    </div>
  )
}

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-400">
        <Minus size={10} />
        0%
      </span>
    )
  }
  const isPositive = change > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
        isPositive
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-700'
      )}
    >
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isPositive ? '+' : ''}
      {change.toFixed(1)}%
    </span>
  )
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      change,
      changeLabel,
      icon,
      iconColor = '#3B82F6',
      iconBg = '#EFF6FF',
      subtitle,
      loading = false,
      className,
      onClick,
    },
    ref
  ) => {
    if (loading) {
      return <StatCardSkeleton className={className} />
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-slate-200 rounded-lg p-3 shadow-sm',
          'hover:shadow-md transition-shadow duration-200',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {/* Top row: title + icon */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {title}
          </p>
          {icon && (
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
              style={{ backgroundColor: iconBg, color: iconColor }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <p
          className="text-2xl font-bold text-slate-900 tabular-nums leading-none mb-2"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {value}
        </p>

        {/* Bottom row: change + label */}
        <div className="flex items-center gap-2">
          {change !== undefined && <ChangeIndicator change={change} />}
          {(changeLabel || subtitle) && (
            <span
              className="text-[10px] text-slate-400"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {changeLabel ?? subtitle}
            </span>
          )}
        </div>
      </div>
    )
  }
)
StatCard.displayName = 'StatCard'

export { StatCard }
