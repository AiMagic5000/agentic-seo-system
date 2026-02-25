import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Skeleton — design system loading placeholders
// ---------------------------------------------------------------------------

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-slate-200',
        className
      )}
      {...props}
    />
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg p-3 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <Skeleton className="h-7 w-24 mb-2" />
      <Skeleton className="h-4 w-16 rounded-full" />
    </div>
  )
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-slate-200',
        className
      )}
    >
      <div className="flex gap-4 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-2.5"
            style={{ width: `${10 + (i % 3) * 8}%` }}
          />
        ))}
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="flex gap-4 px-3 items-center h-9"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className="h-3"
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
}

function SkeletonStat({ className }: { className?: string }) {
  return <SkeletonCard className={className} />
}

function SkeletonChart({
  height = 200,
  className,
}: {
  height?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg p-3 shadow-sm',
        className
      )}
      style={{ height }}
    >
      <Skeleton className="h-3 w-32 mb-4" />
      <div className="flex items-end gap-1 h-[calc(100%-3rem)]">
        {Array.from({ length: 14 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${30 + ((i * 7) % 60)}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonStat, SkeletonChart }
