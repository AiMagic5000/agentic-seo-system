import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon element rendered above the title.
   * Recommended size: 40-48px. Will be wrapped in a styled container.
   */
  icon?: React.ReactNode
  /** Primary heading text */
  title: string
  /** Supporting description text */
  description?: string
  /** Optional action button or element rendered below the description */
  action?: React.ReactNode
  /** Size preset controlling overall padding / spacing */
  size?: 'sm' | 'default' | 'lg'
}

// ---------------------------------------------------------------------------
// Size config
// ---------------------------------------------------------------------------
const sizeConfig = {
  sm: {
    wrapper: 'py-8 gap-3',
    iconBox: 'h-10 w-10',
    title: 'text-sm',
    description: 'text-xs max-w-xs',
  },
  default: {
    wrapper: 'py-16 gap-4',
    iconBox: 'h-14 w-14',
    title: 'text-base',
    description: 'text-sm max-w-sm',
  },
  lg: {
    wrapper: 'py-24 gap-5',
    iconBox: 'h-20 w-20',
    title: 'text-lg',
    description: 'text-base max-w-md',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
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
        {/* Icon box */}
        {icon && (
          <div
            className={cn(
              'flex items-center justify-center rounded-xl border border-[#1e293b] bg-[#0d1520] text-[#64748b]',
              cfg.iconBox
            )}
          >
            {icon}
          </div>
        )}

        {/* Text block */}
        <div className="flex flex-col items-center gap-1.5">
          <h3
            className={cn(
              'font-semibold text-[#f1f5f9]',
              cfg.title
            )}
          >
            {title}
          </h3>

          {description && (
            <p
              className={cn(
                'text-[#64748b] leading-relaxed',
                cfg.description
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Action */}
        {action && <div className="mt-1">{action}</div>}
      </div>
    )
  }
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
