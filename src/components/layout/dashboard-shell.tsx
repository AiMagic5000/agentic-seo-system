"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

// ─── Mobile drawer overlay ────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation drawer"
      >
        <Sidebar />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-3 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/8 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}

// ─── Dashboard Shell ──────────────────────────────────────────────────────────

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1a]">
      {/* ── Sidebar (desktop) ───────────────────────────────── */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <div className="flex h-14 items-center gap-3 border-b border-[#1e293b] px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/6 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-slate-100">
            <span style={{ color: "#D4A84B" }}>Agentic</span>SEO
          </span>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* Scrollable page content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
