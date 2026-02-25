import * as React from 'react'
import { cn } from '@/lib/utils'

// ===========================================================================
// Spinner
// ===========================================================================
export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter of the spinner in pixels (default 24) */
  size?: number
  /** Stroke color (default #2563eb) */
  color?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 24, color = '#2563eb', className, ...props }, ref) => (
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
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        {/* Track */}
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={color}
          strokeOpacity={0.2}
          strokeWidth="2.5"
        />
        {/* Arc */}
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

// ===========================================================================
// SkeletonText - single line or multi-line text placeholder
// ===========================================================================
export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of lines to render (default 1) */
  lines?: number
  /** Width of the last line relative to the others (default '60%') */
  lastLineWidth?: string
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 1, lastLineWidth = '60%', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded-full bg-[#1e293b]"
          style={{
            width: i === lines - 1 && lines > 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  )
)
SkeletonText.displayName = 'SkeletonText'

// ===========================================================================
// SkeletonCard - placeholder for a stat/info card
// ===========================================================================
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-[#1e293b] bg-[#111827] p-5',
        className
      )}
      {...props}
    >
      {/* Top row: label + icon placeholder */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* Label */}
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-[#1e293b]" />
          {/* Value */}
          <div className="h-8 w-28 animate-pulse rounded-lg bg-[#1e293b]" />
          {/* Change pill */}
          <div className="h-5 w-20 animate-pulse rounded-full bg-[#1e293b]" />
        </div>
        {/* Icon box */}
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[#1e293b]" />
      </div>
    </div>
  )
)
SkeletonCard.displayName = 'SkeletonCard'

// ===========================================================================
// SkeletonTable - placeholder for a data table
// ===========================================================================
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of rows to render (default 5) */
  rows?: number
  /** Number of columns to render (default 4) */
  columns?: number
}

const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ rows = 5, columns = 4, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-xl border border-[#1e293b]',
        className
      )}
      {...props}
    >
      {/* Header row */}
      <div className="flex gap-4 border-b border-[#1e293b] bg-[#0d1520] px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-[#1e293b]"
            style={{ width: `${12 + (i % 3) * 6}%` }}
          />
        ))}
      </div>

      {/* Data rows */}
      <div className="divide-y divide-[#1e293b] bg-[#111827]">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="h-3 animate-pulse rounded-full bg-[#1e293b]"
                style={{
                  width: `${16 + ((rowIdx + colIdx) % 4) * 8}%`,
                  animationDelay: `${(rowIdx * columns + colIdx) * 50}ms`,
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

// ===========================================================================
// LoadingOverlay - full-area centered spinner with optional label
// ===========================================================================
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
      <Spinner size={32} />
      {label && (
        <p className="text-sm text-[#64748b]">{label}</p>
      )}
    </div>
  )
)
LoadingOverlay.displayName = 'LoadingOverlay'

export { Spinner, SkeletonText, SkeletonCard, SkeletonTable, LoadingOverlay }
