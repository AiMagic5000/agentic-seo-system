import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

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
    textColor: 'text-[#1e8e3e]',
    bgColor: 'bg-[#e6f4ea]',
    label: (v: number) => `+${v.toFixed(1)}%`,
  },
  down: {
    icon: TrendingDown,
    textColor: 'text-[#d93025]',
    bgColor: 'bg-[#fce8e6]',
    label: (v: number) => `${v.toFixed(1)}%`,
  },
  neutral: {
    icon: Minus,
    textColor: 'text-[#80868b]',
    bgColor: 'bg-[#f1f3f4]',
    label: (_v: number) => '0.0%',
  },
}

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
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-[#dadce0] bg-white p-5 shadow-[0_1px_2px_rgba(60,64,67,0.1)] transition-shadow hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wider">
              {title}
            </p>

            <p className="mt-2 text-2xl font-semibold tabular-nums text-[#202124] leading-none">
              {value}
            </p>

            {subtitle && (
              <p className="mt-1 text-xs text-[#80868b]">{subtitle}</p>
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
                <span className="text-xs text-[#80868b]">vs prior period</span>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 rounded-full bg-[#e8f0fe] p-2.5 text-[#1a73e8]">
            {icon}
          </div>
        </div>
      </div>
    )
  }
)
StatCard.displayName = 'StatCard'

export { StatCard }
