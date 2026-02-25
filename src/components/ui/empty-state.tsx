import * as React from 'react'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// EmptyState — centered empty content placeholder (design system)
// ---------------------------------------------------------------------------

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  size?: 'sm' | 'default' | 'lg'
}

const sizeConfig = {
  sm: {
    wrapper: 'py-8 gap-3 min-h-[200px]',
    iconBox: 'h-10 w-10',
    title: 'text-sm',
    description: 'text-xs max-w-xs',
  },
  default: {
    wrapper: 'py-16 gap-4 min-h-[300px]',
    iconBox: 'h-14 w-14',
    title: 'text-base',
    description: 'text-sm max-w-sm',
  },
  lg: {
    wrapper: 'py-24 gap-5 min-h-[400px]',
    iconBox: 'h-20 w-20',
    title: 'text-lg',
    description: 'text-sm max-w-md',
  },
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon, title, description, action, size = 'default', className, ...props },
    ref
  ) => {
    const cfg = sizeConfig[size]
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full flex-col items-center justify-center text-center',
          cfg.wrapper,
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center rounded-2xl bg-slate-100 text-slate-300',
            cfg.iconBox
          )}
        >
          {icon ?? <Globe className="w-6 h-6" />}
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-1.5">
          <h3
            className={cn('font-semibold text-slate-900', cfg.title)}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn('text-slate-500 leading-relaxed', cfg.description)}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Action */}
        {action && <div className="mt-2">{action}</div>}
      </div>
    )
  }
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
