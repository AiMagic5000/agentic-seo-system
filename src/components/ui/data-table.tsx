'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Column<T> {
  /** Key in the data object used for default rendering */
  key: keyof T | string
  /** Column header label */
  label: string
  /** Optional custom renderer. Receives the row data. */
  render?: (row: T, index: number) => React.ReactNode
  /** Optional class names for the <th> and <td> of this column */
  className?: string
  /** Alignment for the column content */
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[]
  /** Array of row data objects */
  data: T[]
  /** Row click handler. Receives the row data and index. */
  onRowClick?: (row: T, index: number) => void
  /** Text shown when data is empty (overrides default empty state) */
  emptyMessage?: string
  /** Additional class names for the outer wrapper */
  className?: string
  /** Key extractor for React's key prop. Defaults to index. */
  keyExtractor?: (row: T, index: number) => string | number
  /** Show row numbers in first column */
  showRowNumbers?: boolean
  /** Loading state - shows skeleton rows */
  isLoading?: boolean
  /** Number of skeleton rows shown when isLoading is true */
  skeletonRows?: number
}

// ---------------------------------------------------------------------------
// Alignment helper
// ---------------------------------------------------------------------------
const alignMap: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available.',
  className,
  keyExtractor,
  showRowNumbers = false,
  isLoading = false,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const rowKey = (row: T, i: number) =>
    keyExtractor ? keyExtractor(row, i) : i

  return (
    <div
      className={cn(
        'w-full overflow-auto rounded-xl border border-[#1e293b]',
        className
      )}
    >
      <table className="w-full border-collapse text-sm">
        {/* Head */}
        <thead>
          <tr className="border-b border-[#1e293b] bg-[#0d1520]">
            {showRowNumbers && (
              <th className="w-10 py-3 pl-4 pr-2 text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                #
              </th>
            )}
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#64748b]',
                  alignMap[col.align ?? 'left'],
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-[#1e293b]">
          {isLoading ? (
            // Skeleton rows
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="bg-[#111827]">
                {showRowNumbers && (
                  <td className="py-3 pl-4 pr-2">
                    <div className="h-3 w-4 animate-pulse rounded bg-[#1e293b]" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div
                      className="h-3 animate-pulse rounded bg-[#1e293b]"
                      style={{ width: `${60 + Math.random() * 30}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            // Empty state
            <tr>
              <td
                colSpan={columns.length + (showRowNumbers ? 1 : 0)}
                className="py-12 text-center text-sm text-[#64748b]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            // Data rows
            data.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={cn(
                  'bg-[#111827] transition-colors duration-100',
                  onRowClick &&
                    'cursor-pointer hover:bg-[#162032] active:bg-[#1a2540]'
                )}
              >
                {showRowNumbers && (
                  <td className="py-3 pl-4 pr-2 text-xs tabular-nums text-[#64748b]">
                    {i + 1}
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-[#f1f5f9]',
                      alignMap[col.align ?? 'left'],
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(row, i)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

DataTable.displayName = 'DataTable'

export { DataTable }
