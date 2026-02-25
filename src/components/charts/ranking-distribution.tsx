'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export interface RankingBucket {
  range: string
  count: number
  color?: string
}

export interface RankingDistributionProps {
  data: RankingBucket[]
  height?: number
}

// Design system position colors
const POSITION_COLORS = {
  '1-3':   '#10B981', // emerald (top 3)
  '4-10':  '#3B82F6', // blue (page 1)
  '11-20': '#F59E0B', // amber (page 2)
  '21-50': '#F97316', // orange (page 2-3)
  '51+':   '#EF4444', // red (page 3+)
} as const

function resolveColor(bucket: RankingBucket, index: number): string {
  if (bucket.color) return bucket.color
  const keys = Object.keys(POSITION_COLORS)
  const key = keys[index % keys.length] as keyof typeof POSITION_COLORS
  return POSITION_COLORS[key]
}

interface TooltipPayloadItem {
  value: number
  payload: RankingBucket
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <p className="mb-1 text-xs font-medium text-slate-400">
        Position {label}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0]?.payload?.color ?? '#3B82F6' }}
        />
        <span
          className="text-xs font-semibold text-slate-900 tabular-nums"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {payload[0]?.value} keywords
        </span>
      </div>
    </div>
  )
}

export function RankingDistribution({
  data,
  height = 180,
}: RankingDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#F1F5F9"
          vertical={false}
        />

        <XAxis
          dataKey="range"
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: '#F8FAFC', opacity: 0.8 }}
        />

        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={resolveColor(entry, index)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
