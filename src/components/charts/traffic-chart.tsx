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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
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
    <div className="rounded-lg border border-[#1e293b] bg-[#0d1520] px-3 py-2 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-[#64748b]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs capitalize text-[#94a3b8]">{entry.name}:</span>
          <span className="text-xs font-semibold text-[#f1f5f9]">
            {formatCompact(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TrafficChart({ data, height = 220 }: TrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          {/* Clicks gradient */}
          <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          {/* Impressions gradient */}
          <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4A84B" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#D4A84B" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCompact(v)}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 2' }}
        />

        {/* Impressions — render behind clicks */}
        <Area
          type="monotone"
          dataKey="impressions"
          stroke="#D4A84B"
          strokeWidth={1.5}
          fill="url(#gradImpressions)"
          dot={false}
          activeDot={{ r: 4, fill: '#D4A84B', strokeWidth: 0 }}
        />

        {/* Clicks — render on top */}
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#gradClicks)"
          dot={false}
          activeDot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
