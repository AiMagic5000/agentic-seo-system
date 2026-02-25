import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Variant definitions
// ---------------------------------------------------------------------------
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Neutral blue – default state / info
        default:
          'bg-[#1e3a5f] text-[#93c5fd] border border-[#2563eb]/30',
        // Green – healthy, active, passing
        success:
          'bg-[#052e16] text-[#4ade80] border border-[#10b981]/30',
        // Amber – caution, in-progress
        warning:
          'bg-[#451a03] text-[#fbbf24] border border-[#f59e0b]/30',
        // Red – error, failed, critical
        danger:
          'bg-[#450a0a] text-[#f87171] border border-[#ef4444]/30',
        // Blue info (slightly brighter than default)
        info:
          'bg-[#0c1a3a] text-[#60a5fa] border border-[#3b82f6]/30',
        // Outlined – no fill, just a border
        outline:
          'bg-transparent text-[#94a3b8] border border-[#334155]',
        // Gold – premium / highlight
        gold:
          'bg-[#3d2a00] text-[#D4A84B] border border-[#D4A84B]/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
