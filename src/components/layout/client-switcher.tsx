"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Globe } from "lucide-react";
import { useClient, type SEOClient } from "@/contexts/client-context";

function ClientAvatar({
  client,
  size = "md",
}: {
  client: SEOClient;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <span
      className={`${dim} flex items-center justify-center rounded-md font-semibold text-white shrink-0`}
      style={{ backgroundColor: client.color ?? "#1a73e8" }}
      aria-hidden="true"
    >
      {client.name.charAt(0).toUpperCase()}
    </span>
  );
}

function ClientOption({
  client,
  isActive,
  onSelect,
}: {
  client: SEOClient;
  isActive: boolean;
  onSelect: (client: SEOClient) => void;
}) {
  return (
    <button
      onClick={() => onSelect(client)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
        isActive
          ? "bg-[#e8f0fe] text-[#1a73e8]"
          : "text-[#202124] hover:bg-[#f1f3f4]"
      }`}
      role="menuitem"
    >
      <ClientAvatar client={client} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-none">{client.name}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#80868b]">
          <Globe className="h-3 w-3 shrink-0" />
          {client.domain}
        </p>
      </div>
      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#1a73e8] shrink-0" />
      )}
    </button>
  );
}

interface ClientSwitcherProps {
  collapsed?: boolean;
}

export function ClientSwitcher({ collapsed = false }: ClientSwitcherProps) {
  const { currentClient, clients, setCurrentClient } = useClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!currentClient) return null;

  if (collapsed) {
    return (
      <div className="flex justify-center px-2 py-2">
        <ClientAvatar client={currentClient} size="sm" />
      </div>
    );
  }

  return (
    <div ref={ref} className="relative px-3 py-2">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg border border-[#dadce0] bg-[#f8f9fa] px-3 py-2.5 text-left transition-all hover:border-[#bdc1c6] hover:bg-[#f1f3f4] cursor-pointer"
      >
        <ClientAvatar client={currentClient} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#202124] leading-none">
            {currentClient.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#80868b]">
            {currentClient.domain}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#80868b] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-[#dadce0] bg-white py-1.5 shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]"
        >
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-[#80868b]">
            Clients
          </p>

          <div className="space-y-0.5 px-1.5">
            {clients.map((client) => (
              <ClientOption
                key={client.id}
                client={client}
                isActive={client.id === currentClient.id}
                onSelect={(c) => {
                  setCurrentClient(c);
                  setOpen(false);
                }}
              />
            ))}
          </div>

          <div className="mx-1.5 mt-1.5 border-t border-[#e8eaed] pt-1.5">
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#1a73e8] transition-colors hover:bg-[#e8f0fe] cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Client
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
