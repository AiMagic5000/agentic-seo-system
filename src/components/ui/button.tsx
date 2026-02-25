'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Button — design system variants
// ---------------------------------------------------------------------------

const VARIANTS = {
  default:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
  secondary:
    'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  outline:
    'border border-blue-200 text-blue-600 bg-transparent hover:bg-blue-50 active:bg-blue-100',
  ghost:
    'text-slate-500 bg-transparent hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  amber:
    'bg-amber-500 text-white font-semibold hover:bg-amber-600 active:bg-amber-700 shadow-sm',
  gold:
    'bg-amber-500 text-white font-semibold hover:bg-amber-600 active:bg-amber-700 shadow-sm',
  link:
    'text-blue-600 underline-offset-4 hover:underline bg-transparent p-0 h-auto',
} as const

const SIZES = {
  default: 'h-9 px-4 text-sm',
  sm:      'h-8 px-3 text-xs',
  lg:      'h-11 px-6 text-base',
  icon:    'h-9 w-9 p-0',
} as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild: _asChild, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium',
        'transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
        'disabled:opacity-40 disabled:pointer-events-none',
        'select-none whitespace-nowrap',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
      {...props}
    />
  )
)
Button.displayName = 'Button'

function buttonVariants(options: { variant?: ButtonVariant; size?: ButtonSize } = {}): string {
  const { variant = 'default', size = 'default' } = options
  return cn(
    'inline-flex items-center justify-center gap-1.5 rounded-md font-medium',
    'transition-all duration-150 cursor-pointer select-none',
    VARIANTS[variant],
    SIZES[size]
  )
}

export { Button, buttonVariants }
