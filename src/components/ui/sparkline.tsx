import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SparklineProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'fill'> {
  /** Array of numeric data points */
  data: number[]
  /** SVG width in pixels (default 80) */
  width?: number
  /** SVG height in pixels (default 24) */
  height?: number
  /** Stroke color (default #2563eb) */
  color?: string
  /** Stroke width in pixels (default 1.5) */
  strokeWidth?: number
  /**
   * Fill the area under the line with a semi-transparent gradient.
   * Default: true
   */
  fill?: boolean
  /**
   * If true, renders a dot at the last data point.
   * Default: true
   */
  showEndDot?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * usableW
    const y = padding + usableH - ((v - min) / range) * usableH
    return `${x},${y}`
  })

  return points.join(' ')
}

function buildPath(points: string): string {
  if (!points) return ''
  const pairs = points.split(' ').map((p) => p.split(',').map(Number))
  if (pairs.length < 2) return ''

  let d = `M ${pairs[0][0]} ${pairs[0][1]}`
  for (let i = 1; i < pairs.length; i++) {
    const [x, y] = pairs[i]
    const [px, py] = pairs[i - 1]
    // Cubic bezier for smooth curves
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
  // Close the path along the bottom edge
  const pairs = linePath
    .replace('M ', '')
    .split(' C ')
    .map((seg) => seg.trim())
  const firstPt = pairs[0].split(' ')[0]
  const [fx] = firstPt.split(',').map(Number)
  const bottom = height - padding / 2

  return `${linePath} L ${width - padding} ${bottom} L ${fx} ${bottom} Z`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      data,
      width = 80,
      height = 24,
      color = '#2563eb',
      strokeWidth = 1.5,
      fill = true,
      showEndDot = true,
      className,
      ...props
    },
    ref
  ) => {
    if (!data || data.length < 2) return null

    const padding = 2
    const pointsStr = normalize(data, width, height, padding)
    const linePath = buildPath(pointsStr)
    const areaPath = buildAreaPath(linePath, width, height, padding)

    // Last data point coords for the dot
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
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Filled area */}
        {fill && areaPath && (
          <path d={areaPath} fill={`url(#${gradientId})`} />
        )}

        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* End dot */}
        {showEndDot && lastPt && (
          <circle
            cx={lastPt[0]}
            cy={lastPt[1]}
            r={2.5}
            fill={color}
            stroke="#111827"
            strokeWidth={1.5}
          />
        )}
      </svg>
    )
  }
)
Sparkline.displayName = 'Sparkline'

export { Sparkline }
