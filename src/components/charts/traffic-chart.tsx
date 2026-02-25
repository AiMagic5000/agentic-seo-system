'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCompact } from '@/lib/utils'

export interface TrafficDataPoint {
  date: string
  clicks: number
  impressions: number
}

export interface TrafficChartProps {
  data: TrafficDataPoint[]
  height?: number
}

interface TooltipEntry {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-[#dadce0] bg-white px-3 py-2 shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
      <p className="mb-1.5 text-xs font-medium text-[#80868b]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs capitalize text-[#5f6368]">{entry.name}:</span>
          <span className="text-xs font-semibold text-[#202124]">
            {formatCompact(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrafficChart({ data, height = 220 }: TrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          {/* Clicks gradient - GSC blue */}
          <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
          </linearGradient>
          {/* Impressions gradient - GSC purple */}
          <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9334e6" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#9334e6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e8eaed"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tick={{ fill: '#80868b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          tick={{ fill: '#80868b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCompact(v)}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#dadce0', strokeWidth: 1, strokeDasharray: '4 2' }}
        />

        {/* Impressions behind */}
        <Area
          type="monotone"
          dataKey="impressions"
          stroke="#9334e6"
          strokeWidth={1.5}
          fill="url(#gradImpressions)"
          dot={false}
          activeDot={{ r: 4, fill: '#9334e6', strokeWidth: 0 }}
        />

        {/* Clicks on top */}
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="#1a73e8"
          strokeWidth={2}
          fill="url(#gradClicks)"
          dot={false}
          activeDot={{ r: 4, fill: '#1a73e8', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
