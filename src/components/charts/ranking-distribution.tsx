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
    <div className="rounded-lg border border-[#dadce0] bg-white px-3 py-2 shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
      <p className="mb-1 text-xs font-medium text-[#80868b]">Position {label}</p>
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0]?.payload?.color }}
        />
        <span className="text-xs font-semibold text-[#202124]">
          {payload[0]?.value} keywords
        </span>
      </div>
    </div>
  )
}

export function RankingDistribution({ data, height = 180 }: RankingDistributionProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" vertical={false} />

        <XAxis
          dataKey="range"
          tick={{ fill: '#80868b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fill: '#80868b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: '#f1f3f4', opacity: 0.8 }}
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
