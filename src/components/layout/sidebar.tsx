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
  Activity,
} from "lucide-react";
import { ClientSwitcher } from "./client-switcher";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Keywords", href: "/keywords", icon: Search },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Audit", href: "/audit", icon: Shield },
  { label: "Competitors", href: "/competitors", icon: Eye },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

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
        className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md bg-[#202124] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100"
      >
        {label}
        <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#202124]" />
      </div>
    </div>
  );
}

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
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 cursor-pointer ${
        collapsed ? "justify-center px-0 py-2.5 w-10 mx-auto" : ""
      } ${
        isActive
          ? "bg-[#e8f0fe] text-[#1a73e8] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-[#1a73e8] before:content-['']"
          : "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]"
      }`}
    >
      <Icon
        className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-[#1a73e8]" : ""}`}
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
        width: collapsed ? 64 : 256,
        minWidth: collapsed ? 64 : 256,
      }}
      className="relative flex h-screen flex-col border-r border-[#dadce0] bg-white transition-all duration-300 ease-in-out"
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-[#e8eaed] ${
          collapsed ? "justify-center px-0 py-4" : "gap-2.5 px-4 py-4"
        }`}
        style={{ minHeight: 64 }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1a73e8] shadow-sm">
          <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>

        {!collapsed && (
          <span className="select-none text-[15px] font-semibold tracking-tight text-[#202124]">
            <span className="text-[#1a73e8]">SMB</span>
            {" "}
            <span className="text-[#202124]">Agentic</span>
            <span className="text-[#5f6368] font-normal">SEO</span>
          </span>
        )}
      </div>

      {/* Client Switcher */}
      {!collapsed && (
        <div className="border-b border-[#e8eaed]">
          <ClientSwitcher collapsed={false} />
        </div>
      )}

      {collapsed && (
        <div className="border-b border-[#e8eaed] py-1">
          <ClientSwitcher collapsed />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#80868b]">
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

      {/* Bottom */}
      <div className="border-t border-[#e8eaed] px-2 py-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#e6f4ea] px-3 py-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1e8e3e] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1e8e3e]" />
            </span>
            <span className="text-xs font-medium text-[#1e8e3e]">
              System Online
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#80868b] transition-all hover:bg-[#f1f3f4] hover:text-[#202124] cursor-pointer ${
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
