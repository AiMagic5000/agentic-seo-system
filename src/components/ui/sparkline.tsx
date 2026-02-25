import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Sparkline — compact line chart (design system colors)
// ---------------------------------------------------------------------------

export interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'fill'> {
  data: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  fill?: boolean
  showEndDot?: boolean
  variant?: 'default' | 'success' | 'danger'
}

const VARIANT_COLORS = {
  default: '#3B82F6',
  success: '#10B981',
  danger:  '#EF4444',
}

function normalize(
  data: number[],
  width: number,
  height: number,
  padding = 2
): string {
  if (data.length < 2) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const usableW = width - padding * 2
  const usableH = height - padding * 2

  return data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * usableW
      const y = padding + usableH - ((v - min) / range) * usableH
      return `${x},${y}`
    })
    .join(' ')
}

function buildPath(pointsStr: string): string {
  if (!pointsStr) return ''
  const pairs = pointsStr.split(' ').map((p) => p.split(',').map(Number))
  if (pairs.length < 2) return ''
  let d = `M ${pairs[0][0]} ${pairs[0][1]}`
  for (let i = 1; i < pairs.length; i++) {
    const [x, y] = pairs[i]
    const [px, py] = pairs[i - 1]
    const cpX = (px + x) / 2
    d += ` C ${cpX} ${py}, ${cpX} ${y}, ${x} ${y}`
  }
  return d
}

function buildAreaPath(
  linePath: string,
  width: number,
  height: number,
  padding = 2
): string {
  if (!linePath) return ''
  const pairs = linePath
    .replace('M ', '')
    .split(' C ')
    .map((seg) => seg.trim())
  const firstPt = pairs[0].split(' ')[0]
  const [fx] = firstPt.split(',').map(Number)
  const bottom = height - padding / 2
  return `${linePath} L ${width - padding} ${bottom} L ${fx} ${bottom} Z`
}

const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      data,
      width = 80,
      height = 24,
      color,
      strokeWidth = 1.5,
      fill = true,
      showEndDot = true,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    if (!data || data.length < 2) return null

    const resolvedColor = color ?? VARIANT_COLORS[variant]
    const padding = 2
    const pointsStr = normalize(data, width, height, padding)
    const linePath = buildPath(pointsStr)
    const areaPath = buildAreaPath(linePath, width, height, padding)
    const pairs = pointsStr.split(' ').map((p) => p.split(',').map(Number))
    const lastPt = pairs[pairs.length - 1]
    const gradientId = React.useId()

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('overflow-visible', className)}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={resolvedColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {fill && areaPath && (
          <path d={areaPath} fill={`url(#${gradientId})`} />
        )}

        {linePath && (
          <path
            d={linePath}
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {showEndDot && lastPt && (
          <circle
            cx={lastPt[0]}
            cy={lastPt[1]}
            r={2.5}
            fill={resolvedColor}
            stroke="white"
            strokeWidth={1.5}
          />
        )}
      </svg>
    )
  }
)
Sparkline.displayName = 'Sparkline'

export { Sparkline }
