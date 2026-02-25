"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Zap,
  ChevronRight,
} from "lucide-react";

// ─── Route metadata ───────────────────────────────────────────────────────────

interface RouteInfo {
  title: string;
  breadcrumb: string[];
}

function getRouteInfo(pathname: string): RouteInfo {
  const map: Record<string, RouteInfo> = {
    "/dashboard": {
      title: "Dashboard",
      breadcrumb: ["Home", "Dashboard"],
    },
    "/dashboard/keywords": {
      title: "Keywords",
      breadcrumb: ["Home", "Keywords"],
    },
    "/dashboard/content": {
      title: "Content",
      breadcrumb: ["Home", "Content"],
    },
    "/dashboard/audit": {
      title: "Site Audit",
      breadcrumb: ["Home", "Audit"],
    },
    "/dashboard/competitors": {
      title: "Competitors",
      breadcrumb: ["Home", "Competitors"],
    },
    "/dashboard/agents": {
      title: "AI Agents",
      breadcrumb: ["Home", "Agents"],
    },
    "/dashboard/reports": {
      title: "Reports",
      breadcrumb: ["Home", "Reports"],
    },
    "/dashboard/settings": {
      title: "Settings",
      breadcrumb: ["Home", "Settings"],
    },
  };

  return (
    map[pathname] ?? {
      title: "Dashboard",
      breadcrumb: ["Home"],
    }
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-xs text-slate-500">
        {parts.map((part, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-slate-700" />}
            <span className={i === parts.length - 1 ? "text-slate-400" : ""}>
              {part}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Scan Now button ──────────────────────────────────────────────────────────

function ScanButton() {
  const [scanning, setScanning] = useState(false);

  function handleScan() {
    setScanning(true);
    // Simulate async scan kick-off
    setTimeout(() => setScanning(false), 2500);
  }

  return (
    <button
      onClick={handleScan}
      disabled={scanning}
      aria-label="Trigger site scan"
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#0a0f1a] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: "#D4A84B" }}
    >
      <Zap
        className={`h-3.5 w-3.5 ${scanning ? "animate-pulse" : ""}`}
        strokeWidth={2.5}
      />
      {scanning ? "Scanning..." : "Scan Now"}
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

const NOTIFICATION_COUNT = 4;

export function Header() {
  const pathname = usePathname();
  const { title, breadcrumb } = getRouteInfo(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#1e293b] bg-[#0a0f1a] px-6">
      {/* Left: title + breadcrumb */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[15px] font-semibold leading-none text-slate-100">
          {title}
        </h1>
        <Breadcrumb parts={breadcrumb} />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          aria-label="Open search"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/6 hover:text-slate-200"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          aria-label={`Notifications (${NOTIFICATION_COUNT} unread)`}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/6 hover:text-slate-200"
        >
          <Bell className="h-4 w-4" />
          {NOTIFICATION_COUNT > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white leading-none">
              {NOTIFICATION_COUNT > 9 ? "9+" : NOTIFICATION_COUNT}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-[#1e293b]" aria-hidden="true" />

        {/* Scan */}
        <ScanButton />
      </div>
    </header>
  );
}
