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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RankingBucket {
  range: string
  count: number
  color: string
}

export interface RankingDistributionProps {
  data: RankingBucket[]
  height?: number
}

interface TooltipPayloadItem {
  value: number
  payload: RankingBucket
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
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
    <div className="rounded-lg border border-[#1e293b] bg-[#0d1520] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-[#64748b]">Position {label}</p>
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0]?.payload?.color }}
        />
        <span className="text-xs font-semibold text-[#f1f5f9]">
          {payload[0]?.value} keywords
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RankingDistribution({ data, height = 180 }: RankingDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

        <XAxis
          dataKey="range"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: '#1e293b', opacity: 0.5 }}
        />

        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
