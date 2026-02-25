'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Variant definitions
// ---------------------------------------------------------------------------
const buttonVariants = cva(
  // Base styles applied to every variant
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg',
    'text-sm font-medium transition-all duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1a]',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ],
  {
    variants: {
      variant: {
        // Primary blue CTA
        default:
          'bg-[#2563eb] text-white shadow-sm hover:bg-[#1d4ed8] active:bg-[#1e40af]',
        // Muted secondary action
        secondary:
          'bg-[#1e293b] text-[#f1f5f9] border border-[#334155] hover:bg-[#273344] active:bg-[#1e293b]',
        // Destructive / danger
        destructive:
          'bg-[#ef4444] text-white shadow-sm hover:bg-[#dc2626] active:bg-[#b91c1c]',
        // Outlined – transparent background
        outline:
          'border border-[#334155] bg-transparent text-[#f1f5f9] hover:bg-[#1e293b] active:bg-[#273344]',
        // Ghost – no border, no bg
        ghost:
          'bg-transparent text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f1f5f9] active:bg-[#273344]',
        // Gold accent for premium / highlighted actions
        gold:
          'bg-[#D4A84B] text-[#0a0f1a] font-semibold shadow-sm hover:bg-[#c49a40] active:bg-[#b38b38]',
        // Link-style – no background, underlined
        link:
          'bg-transparent text-[#2563eb] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-9 px-4 py-2',
        lg: 'h-11 px-6 text-base',
        // Square icon button
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different element (e.g. span for Radix Slot usage) */
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
