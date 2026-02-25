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
    <div
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <p className="mb-1.5 text-xs font-medium text-slate-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs capitalize text-slate-500">{entry.name}:</span>
          <span
            className="text-xs font-semibold text-slate-900 tabular-nums"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
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
          {/* Clicks — blue-500 */}
          <linearGradient id="gradClicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          {/* Impressions — violet-500 */}
          <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#F1F5F9"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCompact(v)}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 2' }}
        />

        {/* Impressions behind clicks */}
        <Area
          type="monotone"
          dataKey="impressions"
          stroke="#8B5CF6"
          strokeWidth={1.5}
          fill="url(#gradImpressions)"
          dot={false}
          activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
        />

        {/* Clicks on top */}
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#gradClicks)"
          dot={false}
          activeDot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
