import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressRingProps extends React.SVGAttributes<SVGSVGElement> {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: React.ReactNode
  labelClassName?: string
  showLabel?: boolean
}

const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  (
    {
      value,
      size = 64,
      strokeWidth = 5,
      color = '#1a73e8',
      trackColor = '#e8eaed',
      label,
      labelClassName,
      showLabel = true,
      className,
      ...props
    },
    ref
  ) => {
    const clamped = Math.max(0, Math.min(100, value))
    const center = size / 2
    const radius = center - strokeWidth / 2 - 1
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (clamped / 100) * circumference
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
              <stop offset="0%" stopColor={color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
          </defs>

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

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

        {showLabel && (
          <span
            className={cn(
              'absolute text-xs font-semibold tabular-nums text-[#202124]',
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
