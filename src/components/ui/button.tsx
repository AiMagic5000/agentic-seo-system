'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
    'text-sm font-medium transition-all duration-150 ease-in-out cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-[#1a73e8] text-white shadow-sm hover:bg-[#1557b0] active:bg-[#174ea6]',
        secondary:
          'bg-white text-[#202124] border border-[#dadce0] hover:bg-[#f8f9fa] active:bg-[#f1f3f4]',
        destructive:
          'bg-[#d93025] text-white shadow-sm hover:bg-[#c5221f] active:bg-[#a50e0e]',
        outline:
          'border border-[#dadce0] bg-transparent text-[#1a73e8] hover:bg-[#e8f0fe] active:bg-[#d2e3fc]',
        ghost:
          'bg-transparent text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124] active:bg-[#e8eaed]',
        gold:
          'bg-[#f9ab00] text-white font-semibold shadow-sm hover:bg-[#e69500] active:bg-[#cc8400]',
        link:
          'bg-transparent text-[#1a73e8] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-9 px-4 py-2',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
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
