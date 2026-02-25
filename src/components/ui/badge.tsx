import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Badge — design system variants
// ---------------------------------------------------------------------------

const BADGE_VARIANTS = {
  default:     'bg-blue-50 text-blue-700 border border-blue-100',
  success:     'bg-emerald-50 text-emerald-700 border border-emerald-100',
  warning:     'bg-amber-50 text-amber-700 border border-amber-200',
  danger:      'bg-red-50 text-red-700 border border-red-100',
  purple:      'bg-violet-50 text-violet-700 border border-violet-100',
  outline:     'bg-transparent text-slate-500 border border-slate-200',
  info:        'bg-sky-50 text-sky-700 border border-sky-100',
  gold:        'bg-amber-50 text-amber-700 border border-amber-200',
  muted:       'bg-slate-50 text-slate-500 border border-slate-200',
} as const

export type BadgeVariant = keyof typeof BADGE_VARIANTS

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        'transition-colors duration-150',
        BADGE_VARIANTS[variant],
        className
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

function badgeVariants(options: { variant?: BadgeVariant } = {}): string {
  const { variant = 'default' } = options
  return cn(
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-150',
    BADGE_VARIANTS[variant]
  )
}

export { Badge, badgeVariants }
