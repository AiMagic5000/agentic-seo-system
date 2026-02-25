'use client'

import { useState } from 'react'
import { Menu, X, Activity } from 'lucide-react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Mobile drawer overlay
// ---------------------------------------------------------------------------

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation drawer"
      >
        <Sidebar />
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// DashboardShell
// ---------------------------------------------------------------------------

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-700">
              <Activity className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span
              className="text-sm font-semibold text-slate-900"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <span className="text-blue-700">SMB</span> Agentic SEO
            </span>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Scrollable page content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto focus:outline-none bg-slate-50"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
