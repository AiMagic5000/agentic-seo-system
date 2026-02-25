"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Search,
  Bell,
  Zap,
  ChevronRight,
} from "lucide-react";

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
    "/keywords": {
      title: "Keywords",
      breadcrumb: ["Home", "Keywords"],
    },
    "/content": {
      title: "Content",
      breadcrumb: ["Home", "Content"],
    },
    "/audit": {
      title: "Site Audit",
      breadcrumb: ["Home", "Audit"],
    },
    "/competitors": {
      title: "Competitors",
      breadcrumb: ["Home", "Competitors"],
    },
    "/agents": {
      title: "AI Agents",
      breadcrumb: ["Home", "Agents"],
    },
    "/reports": {
      title: "Reports",
      breadcrumb: ["Home", "Reports"],
    },
    "/settings": {
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

function Breadcrumb({ parts }: { parts: string[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-xs text-[#80868b]">
        {parts.map((part, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-[#dadce0]" />}
            <span className={i === parts.length - 1 ? "text-[#5f6368]" : ""}>
              {part}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ScanButton() {
  const [scanning, setScanning] = useState(false);

  function handleScan() {
    setScanning(true);
    setTimeout(() => setScanning(false), 2500);
  }

  return (
    <button
      onClick={handleScan}
      disabled={scanning}
      aria-label="Trigger site scan"
      className="flex items-center gap-2 rounded-md bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1557b0] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      <Zap
        className={`h-3.5 w-3.5 ${scanning ? "animate-pulse" : ""}`}
        strokeWidth={2.5}
      />
      {scanning ? "Scanning..." : "Scan Now"}
    </button>
  );
}

const NOTIFICATION_COUNT = 4;

export function Header() {
  const pathname = usePathname();
  const { title, breadcrumb } = getRouteInfo(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e8eaed] bg-white px-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[15px] font-semibold leading-none text-[#202124]">
          {title}
        </h1>
        <Breadcrumb parts={breadcrumb} />
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Open search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] cursor-pointer"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <button
          aria-label={`Notifications (${NOTIFICATION_COUNT} unread)`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] transition-colors hover:bg-[#f1f3f4] cursor-pointer"
        >
          <Bell className="h-[18px] w-[18px]" />
          {NOTIFICATION_COUNT > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#d93025] text-[9px] font-bold text-white leading-none">
              {NOTIFICATION_COUNT > 9 ? "9+" : NOTIFICATION_COUNT}
            </span>
          )}
        </button>

        <div className="mx-1 h-5 w-px bg-[#dadce0]" aria-hidden="true" />

        <ScanButton />

        <div className="mx-1 h-5 w-px bg-[#dadce0]" aria-hidden="true" />

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
