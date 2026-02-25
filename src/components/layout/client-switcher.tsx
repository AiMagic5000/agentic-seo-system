'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus, Globe } from 'lucide-react'
import { useClient, type SEOClient } from '@/contexts/client-context'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// ClientSwitcher — dropdown to switch between active clients
// ---------------------------------------------------------------------------

function ClientAvatar({
  client,
  size = 'md',
}: {
  client: SEOClient
  size?: 'sm' | 'md'
}) {
  const dim =
    size === 'sm'
      ? 'h-6 w-6 text-[10px]'
      : 'h-8 w-8 text-xs'
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-md font-semibold text-white shrink-0',
        dim
      )}
      style={{ backgroundColor: client.color ?? '#3B82F6' }}
      aria-hidden="true"
    >
      {client.name.charAt(0).toUpperCase()}
    </span>
  )
}

function ClientOption({
  client,
  isActive,
  onSelect,
}: {
  client: SEOClient
  isActive: boolean
  onSelect: (client: SEOClient) => void
}) {
  return (
    <button
      onClick={() => onSelect(client)}
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left',
        'transition-colors duration-100 cursor-pointer',
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-700 hover:bg-slate-50'
      )}
    >
      <ClientAvatar client={client} size="sm" />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium leading-none"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {client.name}
        </p>
        <p
          className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-400"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <Globe className="h-2.5 w-2.5 shrink-0" />
          {client.domain}
        </p>
      </div>
      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
      )}
    </button>
  )
}

interface ClientSwitcherProps {
  collapsed?: boolean
}

export function ClientSwitcher({ collapsed = false }: ClientSwitcherProps) {
  const { currentClient, clients, setCurrentClient } = useClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  if (!currentClient) return null

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-2">
        <ClientAvatar client={currentClient} size="sm" />
      </div>
    )
  }

  return (
    <div ref={ref} className="relative px-3 py-2.5">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left',
          'bg-slate-50 border-slate-200',
          'hover:border-slate-300 hover:bg-slate-100',
          'transition-all duration-150 cursor-pointer'
        )}
      >
        <ClientAvatar client={currentClient} />
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold text-slate-900 leading-none"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {currentClient.name}
          </p>
          <p
            className="mt-0.5 truncate text-[11px] text-slate-400"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {currentClient.domain}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute left-3 right-3 top-full z-50 mt-1',
            'rounded-lg border border-slate-200 bg-white py-1.5',
            'shadow-lg shadow-slate-200/50'
          )}
        >
          <p
            className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Active Client
          </p>

          <div className="space-y-0.5 px-1.5">
            {clients.map((client) => (
              <ClientOption
                key={client.id}
                client={client}
                isActive={client.id === currentClient.id}
                onSelect={(c) => {
                  setCurrentClient(c)
                  setOpen(false)
                }}
              />
            ))}
          </div>

          <div className="mx-1.5 mt-1.5 border-t border-slate-100 pt-1.5">
            <button
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm',
                'text-blue-600 hover:bg-blue-50',
                'transition-colors duration-100 cursor-pointer'
              )}
              style={{ fontFamily: 'var(--font-sans)' }}
              onClick={() => setOpen(false)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Client
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
