'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  Search,
  Bell,
  Zap,
  ChevronRight,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface RouteInfo {
  title: string
  breadcrumb: string[]
}

function getRouteInfo(pathname: string): RouteInfo {
  const map: Record<string, RouteInfo> = {
    '/dashboard':   { title: 'Dashboard',   breadcrumb: ['Home', 'Dashboard'] },
    '/keywords':    { title: 'Keywords',    breadcrumb: ['Home', 'Keywords'] },
    '/content':     { title: 'Content',     breadcrumb: ['Home', 'Content'] },
    '/audit':       { title: 'Site Audit',  breadcrumb: ['Home', 'Audit'] },
    '/competitors': { title: 'Competitors', breadcrumb: ['Home', 'Competitors'] },
    '/agents':      { title: 'AI Agents',   breadcrumb: ['Home', 'Agents'] },
    '/reports':     { title: 'Reports',     breadcrumb: ['Home', 'Reports'] },
    '/settings':    { title: 'Settings',    breadcrumb: ['Home', 'Settings'] },
  }
  return map[pathname] ?? { title: 'Dashboard', breadcrumb: ['Home'] }
}

function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-xs text-slate-400">
        {parts.map((part, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            <span className={i === parts.length - 1 ? 'text-slate-500' : ''}>
              {part}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function ScanButton() {
  const [scanning, setScanning] = useState(false)

  function handleScan() {
    setScanning(true)
    setTimeout(() => setScanning(false), 2500)
  }

  return (
    <button
      onClick={handleScan}
      disabled={scanning}
      aria-label="Trigger site scan"
      className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-800 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      <Zap
        className={`h-3.5 w-3.5 ${scanning ? 'animate-pulse' : ''}`}
        strokeWidth={2.5}
      />
      {scanning ? 'Scanning...' : 'Scan Now'}
    </button>
  )
}

interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  title: string
  message: string | null
  read: boolean
  created_at: string
  action_url: string | null
}

function NotifIcon({ type }: { type: NotificationItem['type'] }) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function NotificationPanel() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?includeRead=true&limit=10')
      if (!res.ok) return
      const json = await res.json()
      if (json.success) {
        setItems(json.data || [])
        setUnread(json.meta?.unreadCount || 0)
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications (${unread} unread)`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 cursor-pointer"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                    !n.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const { title, breadcrumb } = getRouteInfo(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-col gap-0.5">
        <h1
          className="text-[15px] font-semibold leading-none text-slate-800"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {title}
        </h1>
        <Breadcrumb parts={breadcrumb} />
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Open search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-50 cursor-pointer"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <NotificationPanel />

        <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <ScanButton />
        <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: 'h-8 w-8' } }}
        />
      </div>
    </header>
  )
}
