'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Search,
  FileText,
  Shield,
  Eye,
  Bot,
  BarChart3,
  Settings,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { ClientSwitcher } from './client-switcher'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Keywords',    href: '/keywords',    icon: Search },
  { label: 'Content',     href: '/content',     icon: FileText },
  { label: 'Audit',       href: '/audit',       icon: Shield },
  { label: 'Competitors', href: '/competitors', icon: Eye },
  { label: 'Agents',      href: '/agents',      icon: Bot },
  { label: 'Reports',     href: '/reports',     icon: BarChart3 },
  { label: 'Onboarding',  href: '/onboarding',  icon: ClipboardList },
  { label: 'Settings',    href: '/settings',    icon: Settings },
]

function NavTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="group/tooltip relative flex justify-center">
      {children}
      <div
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap',
          'rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white',
          'opacity-0 shadow-lg transition-opacity duration-150',
          'group-hover/tooltip:opacity-100'
        )}
      >
        {label}
        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
      </div>
    </div>
  )
}

function NavLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem
  collapsed: boolean
  isActive: boolean
}) {
  const Icon = item.icon

  const linkEl = (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex items-center rounded-lg text-[13px] font-medium',
        'transition-all duration-150 cursor-pointer',
        collapsed ? 'justify-center w-10 h-9 mx-auto' : 'gap-3 px-3 py-2',
        isActive
          ? [
              'bg-blue-50 text-blue-700',
              'before:absolute before:left-0 before:top-1/2 before:h-5',
              'before:w-[3px] before:-translate-y-1/2 before:rounded-full',
              "before:bg-blue-600 before:content-['']",
            ]
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0',
          isActive ? 'text-blue-600' : ''
        )}
        strokeWidth={isActive ? 2 : 1.75}
      />
      {!collapsed && (
        <span className="truncate leading-none">{item.label}</span>
      )}
    </Link>
  )

  return collapsed ? (
    <NavTooltip label={item.label}>{linkEl}</NavTooltip>
  ) : (
    linkEl
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      aria-label="Main navigation"
      style={{
        width: collapsed ? 64 : 256,
        minWidth: collapsed ? 64 : 256,
      }}
      className="relative flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out"
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-slate-200',
          collapsed ? 'justify-center px-0 py-4' : 'gap-2.5 px-4 py-4'
        )}
        style={{ minHeight: 56 }}
      >
        <Image
          src="/logo.png"
          alt="SMB Agentic SEO"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-lg"
        />
        {!collapsed && (
          <span
            className="select-none text-sm font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <span className="text-blue-700">SMB</span>{' '}
            <span className="text-slate-700">Agentic</span>
            <span className="text-slate-400 font-normal"> SEO</span>
          </span>
        )}
      </div>

      {/* Client Switcher */}
      <div className={cn('border-b border-slate-200', collapsed && 'py-1')}>
        <ClientSwitcher collapsed={collapsed} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <p
            className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-300"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Navigation
          </p>
        )}
        <ul role="list" className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                collapsed={collapsed}
                isActive={isActive(item.href)}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom status + collapse */}
      <div className="border-t border-slate-200 px-2 py-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span
              className="text-xs font-medium text-emerald-700"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              System Online
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg text-xs font-medium',
            'text-slate-400 transition-all duration-150 cursor-pointer',
            'hover:bg-slate-50 hover:text-slate-700',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
          )}
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
