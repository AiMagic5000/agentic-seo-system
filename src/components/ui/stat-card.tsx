import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title label (e.g. "Organic Traffic") */
  title: string
  /** Primary metric value displayed large (e.g. "24,391" or 24391) */
  value: string | number
  /** Percentage change from prior period. Positive = up, negative = down */
  change?: number
  /** Icon element rendered in the top-right icon box */
  icon: React.ReactNode
  /** Override automatic trend direction derived from `change` */
  trend?: 'up' | 'down' | 'neutral'
  /** Sub-label beneath the value (e.g. "vs last 30 days") */
  subtitle?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function resolveTrend(
  trend: StatCardProps['trend'],
  change?: number
): 'up' | 'down' | 'neutral' {
  if (trend) return trend
  if (change === undefined || change === 0) return 'neutral'
  return change > 0 ? 'up' : 'down'
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    textColor: 'text-[#10b981]',
    bgColor: 'bg-[#10b981]/10',
    label: (v: number) => `+${v.toFixed(1)}%`,
  },
  down: {
    icon: TrendingDown,
    textColor: 'text-[#ef4444]',
    bgColor: 'bg-[#ef4444]/10',
    label: (v: number) => `${v.toFixed(1)}%`,
  },
  neutral: {
    icon: Minus,
    textColor: 'text-[#94a3b8]',
    bgColor: 'bg-[#1e293b]',
    label: (_v: number) => '0.0%',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { title, value, change, icon, trend, subtitle, className, ...props },
    ref
  ) => {
    const direction = resolveTrend(trend, change)
    const config = trendConfig[direction]
    const TrendIcon = config.icon
    const showChange = change !== undefined

    return (
      <Card ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
        {/* Subtle top-edge gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2563eb]/40 to-transparent" />

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Left: metric data */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">
                {title}
              </p>

              <p className="mt-2 text-3xl font-bold tabular-nums text-[#f1f5f9] leading-none">
                {value}
              </p>

              {subtitle && (
                <p className="mt-1 text-xs text-[#64748b]">{subtitle}</p>
              )}

              {showChange && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                      config.bgColor,
                      config.textColor
                    )}
                  >
                    <TrendIcon size={11} strokeWidth={2.5} />
                    {config.label(Math.abs(change))}
                  </span>
                  <span className="text-xs text-[#64748b]">vs prior period</span>
                </div>
              )}
            </div>

            {/* Right: icon box */}
            <div className="flex-shrink-0 rounded-lg bg-[#1e293b] p-2.5 text-[#2563eb]">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatCard.displayName = 'StatCard'

export { StatCard }
