'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// DataTable — compact, sortable, data-dense table (design system)
// ---------------------------------------------------------------------------

export interface Column<T = Record<string, unknown>> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  width?: string
  className?: string
  render?: (row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  keyExtractor?: (row: T, index: number) => string | number
  onRowClick?: (row: T, index: number) => void
  selectedKey?: string | number
  emptyMessage?: string
  loading?: boolean
  isLoading?: boolean
  loadingRows?: number
  skeletonRows?: number
  className?: string
  showRowNumbers?: boolean
  stickyHeader?: boolean
}

type SortDir = 'asc' | 'desc' | null

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === 'asc') return <ChevronUp size={11} className="text-blue-600" />
  if (dir === 'desc') return <ChevronDown size={11} className="text-blue-600" />
  return <ChevronsUpDown size={11} className="text-slate-300" />
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectedKey,
  emptyMessage = 'No data available.',
  loading,
  isLoading,
  loadingRows,
  skeletonRows = 5,
  className,
  showRowNumbers = false,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<SortDir>(null)

  const isLoadingState = loading ?? isLoading ?? false
  const skelRows = loadingRows ?? skeletonRows

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc')
      } else if (sortDir === 'desc') {
        setSortKey(null)
        setSortDir(null)
      } else {
        setSortDir('asc')
      }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av === bv) return 0
      const cmp = av! < bv! ? -1 : 1
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const getKey = (row: T, index: number) =>
    keyExtractor ? keyExtractor(row, index) : index

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-lg border border-slate-200 bg-white',
        className
      )}
    >
      <table className="w-full border-collapse">
        <thead
          className={cn(
            'bg-slate-50 border-b border-slate-200',
            stickyHeader && 'sticky top-0 z-10'
          )}
        >
          <tr>
            {showRowNumbers && (
              <th className="w-8 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                #
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  (!col.align || col.align === 'left') && 'text-left',
                  col.sortable &&
                    'cursor-pointer select-none hover:text-slate-900 hover:bg-slate-100 transition-colors duration-100',
                  col.className
                )}
                style={{ fontFamily: 'var(--font-sans)' }}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <SortIcon dir={sortKey === col.key ? sortDir : null} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isLoadingState ? (
            Array.from({ length: skelRows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="h-9">
                {showRowNumbers && (
                  <td className="px-3 py-1.5">
                    <div className="h-3 w-4 rounded-full bg-slate-200 animate-pulse" />
                  </td>
                )}
                {columns.map((col, colIdx) => (
                  <td key={col.key} className="px-3 py-1.5">
                    <div
                      className="h-3 rounded-full bg-slate-200 animate-pulse"
                      style={{
                        width: `${30 + ((rowIdx + colIdx) % 4) * 15}%`,
                        animationDelay: `${(rowIdx * columns.length + colIdx) * 40}ms`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (showRowNumbers ? 1 : 0)}
                className="py-12 text-center text-sm text-slate-400"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => {
              const key = getKey(row, index)
              const isSelected =
                selectedKey !== undefined && key === selectedKey
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  className={cn(
                    'h-9 transition-colors duration-100',
                    onRowClick && 'cursor-pointer',
                    isSelected
                      ? 'bg-blue-50/50 border-l-2 border-l-blue-500'
                      : 'hover:bg-slate-50/50'
                  )}
                >
                  {showRowNumbers && (
                    <td
                      className="px-3 py-1.5 text-[10px] text-slate-300 text-right tabular-nums w-8"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {index + 1}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3 py-1.5 text-sm text-slate-700',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.className
                      )}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {col.render
                        ? col.render(row, index)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

DataTable.displayName = 'DataTable'

export { DataTable }
