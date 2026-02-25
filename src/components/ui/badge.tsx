import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[#e8f0fe] text-[#1a73e8]',
        success:
          'bg-[#e6f4ea] text-[#1e8e3e]',
        warning:
          'bg-[#fef7e0] text-[#e37400]',
        danger:
          'bg-[#fce8e6] text-[#d93025]',
        info:
          'bg-[#e8f0fe] text-[#1967d2]',
        outline:
          'bg-transparent text-[#5f6368] border border-[#dadce0]',
        gold:
          'bg-[#fef7e0] text-[#b06000]',
        purple:
          'bg-[#f3e8fd] text-[#9334e6]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

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
