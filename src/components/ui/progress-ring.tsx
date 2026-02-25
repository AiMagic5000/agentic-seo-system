import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ProgressRingProps extends React.SVGAttributes<SVGSVGElement> {
  /** Current value (0-100) */
  value: number
  /** Outer diameter of the SVG in pixels (default 64) */
  size?: number
  /** Stroke width of the ring track and progress arc (default 5) */
  strokeWidth?: number
  /** Color of the progress arc (default #2563eb) */
  color?: string
  /** Color of the background track (default #1e293b) */
  trackColor?: string
  /** Label shown inside the ring. Defaults to "{value}%" */
  label?: React.ReactNode
  /** Font size of the centered percentage text (default 'text-sm') */
  labelClassName?: string
  /** Show the percentage label inside the ring (default true) */
  showLabel?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      size = 64,
      strokeWidth = 5,
      color = '#2563eb',
      trackColor = '#1e293b',
      label,
      labelClassName,
      showLabel = true,
      className,
      ...props
    },
    ref
  ) => {
    // Clamp value 0-100
    const clamped = Math.max(0, Math.min(100, value))

    const center = size / 2
    const radius = center - strokeWidth / 2 - 1 // 1px inner padding
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (clamped / 100) * circumference

    // Unique id for gradient (avoids collision when multiple rings on page)
    const gradientId = React.useId()

    return (
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={cn('-rotate-90', className)}
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          {...props}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity={0.7} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>

        {/* Center label - rendered on top of the SVG */}
        {showLabel && (
          <span
            className={cn(
              'absolute text-xs font-semibold tabular-nums text-[#f1f5f9]',
              labelClassName
            )}
          >
            {label ?? `${clamped}%`}
          </span>
        )}
      </div>
    )
  }
)
ProgressRing.displayName = 'ProgressRing'

export { ProgressRing }
