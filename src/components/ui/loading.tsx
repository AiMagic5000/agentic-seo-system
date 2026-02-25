import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Loading primitives — design system skeleton components
// ---------------------------------------------------------------------------

// Spinner
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 24, color = '#3B82F6', className, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeOpacity={0.2}
          strokeWidth="2.5"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
)
Spinner.displayName = 'Spinner'

// SkeletonText
export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  lastLineWidth?: string
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 1, lastLineWidth = '60%', className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded-full bg-slate-200"
          style={{
            width: i === lines - 1 && lines > 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  )
)
SkeletonText.displayName = 'SkeletonText'

// SkeletonCard
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-3 shadow-sm',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  )
)
SkeletonCard.displayName = 'SkeletonCard'

// SkeletonTable
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  columns?: number
}

const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ rows = 5, columns = 4, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-lg border border-slate-200',
        className
      )}
      {...props}
    >
      {/* Header row */}
      <div className="flex gap-4 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-slate-200"
            style={{ width: `${10 + (i % 3) * 8}%` }}
          />
        ))}
      </div>
      {/* Data rows */}
      <div className="divide-y divide-slate-100 bg-white">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 px-3 py-2.5 h-9 items-center">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-3 animate-pulse rounded-full bg-slate-200"
                style={{
                  width: `${15 + ((rowIdx + colIdx) % 4) * 10}%`,
                  animationDelay: `${(rowIdx * columns + colIdx) * 40}ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
)
SkeletonTable.displayName = 'SkeletonTable'

// LoadingOverlay
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ label, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className
      )}
      {...props}
    >
      <Spinner size={28} color="#3B82F6" />
      {label && (
        <p className="text-sm text-slate-500" style={{ fontFamily: 'var(--font-sans)' }}>
          {label}
        </p>
      )}
    </div>
  )
)
LoadingOverlay.displayName = 'LoadingOverlay'

export { Spinner, SkeletonText, SkeletonCard, SkeletonTable, LoadingOverlay }
