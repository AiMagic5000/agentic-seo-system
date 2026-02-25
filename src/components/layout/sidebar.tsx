"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Shield,
  Eye,
  Bot,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";
import { ClientSwitcher } from "./client-switcher";

// ─── Nav config ───────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Keywords", href: "/dashboard/keywords", icon: Search },
  { label: "Content", href: "/dashboard/content", icon: FileText },
  { label: "Audit", href: "/dashboard/audit", icon: Shield },
  { label: "Competitors", href: "/dashboard/competitors", icon: Eye },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Tooltip wrapper for collapsed mode ───────────────────────────────────────

function NavTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group/tooltip relative flex justify-center">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md border border-white/8 bg-[#111827] px-2.5 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-xl transition-opacity duration-150 group-hover/tooltip:opacity-100"
      >
        {label}
        {/* Arrow */}
        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111827]" />
      </div>
    </div>
  );
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : ""
      } ${
        isActive
          ? "bg-blue-600/12 text-white before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-blue-500 before:content-['']"
          : "text-slate-400 hover:bg-white/4 hover:text-slate-200"
      }`}
    >
      <Icon
        className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-blue-400" : ""}`}
        strokeWidth={isActive ? 2 : 1.75}
      />
      {!collapsed && (
        <span className="truncate leading-none">{item.label}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return <NavTooltip label={item.label}>{linkContent}</NavTooltip>;
  }

  return linkContent;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Main navigation"
      style={{
        width: collapsed ? 64 : 260,
        minWidth: collapsed ? 64 : 260,
      }}
      className="relative flex h-screen flex-col border-r border-[#1e293b] bg-[#111827] transition-all duration-300 ease-in-out"
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className={`flex items-center border-b border-[#1e293b] ${
          collapsed ? "justify-center px-0 py-4" : "gap-2.5 px-4 py-4"
        }`}
        style={{ minHeight: 64 }}
      >
        {/* Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/40">
          <Radio className="h-4 w-4 text-white" strokeWidth={2} />
        </div>

        {!collapsed && (
          <span className="select-none text-base font-bold tracking-tight text-slate-100">
            <span style={{ color: "#D4A84B" }}>Agentic</span>
            <span className="text-slate-200">SEO</span>
          </span>
        )}
      </div>

      {/* ── Client Switcher ───────────────────────────────────── */}
      {!collapsed && (
        <div className="border-b border-[#1e293b]">
          <ClientSwitcher collapsed={false} />
        </div>
      )}

      {collapsed && (
        <div className="border-b border-[#1e293b] py-1">
          <ClientSwitcher collapsed />
        </div>
      )}

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
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

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div className="border-t border-[#1e293b] px-2 py-3">
        {/* System status */}
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/3 px-3 py-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-slate-400">
              System Online
            </span>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-white/5 hover:text-slate-300 ${
            collapsed ? "justify-center px-0" : ""
          }`}
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
  );
}
