'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T, index: number) => React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  className?: string
  keyExtractor?: (row: T, index: number) => string | number
  showRowNumbers?: boolean
  isLoading?: boolean
  skeletonRows?: number
}

const alignMap: Record<NonNullable<Column<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

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
        'w-full overflow-auto rounded-lg border border-[#dadce0]',
        className
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#e8eaed] bg-[#f8f9fa]">
            {showRowNumbers && (
              <th className="w-10 py-3 pl-4 pr-2 text-left text-xs font-medium text-[#80868b]">
                #
              </th>
            )}
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-xs font-medium text-[#5f6368]',
                  alignMap[col.align ?? 'left'],
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-[#e8eaed]">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i} className="bg-white">
                {showRowNumbers && (
                  <td className="py-3 pl-4 pr-2">
                    <div className="h-3 w-4 animate-pulse rounded bg-[#e8eaed]" />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div
                      className="h-3 animate-pulse rounded bg-[#e8eaed]"
                      style={{ width: `${60 + Math.random() * 30}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (showRowNumbers ? 1 : 0)}
                className="py-12 text-center text-sm text-[#80868b]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={cn(
                  'bg-white transition-colors duration-100',
                  onRowClick &&
                    'cursor-pointer hover:bg-[#f8f9fa]'
                )}
              >
                {showRowNumbers && (
                  <td className="py-3 pl-4 pr-2 text-xs tabular-nums text-[#80868b]">
                    {i + 1}
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-[#202124]',
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
