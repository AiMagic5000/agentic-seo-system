"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SEOClient {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  color?: string; // avatar background
}

interface ClientContextValue {
  currentClient: SEOClient | null;
  setCurrentClient: (client: SEOClient) => void;
  clients: SEOClient[];
  isLoading: boolean;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const DEFAULT_CLIENTS: SEOClient[] = [
  {
    id: "client-1",
    name: "Acme Corp",
    domain: "acmecorp.com",
    industry: "E-commerce",
    color: "#2563eb",
  },
  {
    id: "client-2",
    name: "Bright Media",
    domain: "brightmedia.io",
    industry: "Media",
    color: "#D4A84B",
  },
  {
    id: "client-3",
    name: "Nova Health",
    domain: "novahealth.co",
    industry: "Healthcare",
    color: "#10b981",
  },
  {
    id: "client-4",
    name: "Frontier Tech",
    domain: "frontiertech.dev",
    industry: "SaaS",
    color: "#8b5cf6",
  },
];

const STORAGE_KEY = "agentic-seo-current-client";

// ─── Context ──────────────────────────────────────────────────────────────────

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients] = useState<SEOClient[]>(DEFAULT_CLIENTS);
  const [currentClient, setCurrentClientState] = useState<SEOClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SEOClient;
        // Validate the stored client still exists in our list
        const found = DEFAULT_CLIENTS.find((c) => c.id === parsed.id);
        if (found) {
          setCurrentClientState(found);
        } else {
          setCurrentClientState(DEFAULT_CLIENTS[0]);
        }
      } else {
        setCurrentClientState(DEFAULT_CLIENTS[0]);
      }
    } catch {
      setCurrentClientState(DEFAULT_CLIENTS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrentClient = useCallback((client: SEOClient) => {
    setCurrentClientState(client);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(client));
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, []);

  return (
    <ClientContext.Provider
      value={{ currentClient, setCurrentClient, clients, isLoading }}
    >
      {children}
    </ClientContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useClient(): ClientContextValue {
  const ctx = useContext(ClientContext);
  if (!ctx) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return ctx;
}
