"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface SEOClient {
  id: string;
  name: string;
  domain: string;
  industry?: string;
  color?: string;
}

interface ClientContextValue {
  currentClient: SEOClient | null;
  setCurrentClient: (client: SEOClient) => void;
  clients: SEOClient[];
  isLoading: boolean;
}

const DEFAULT_CLIENTS: SEOClient[] = [
  {
    id: "asset-recovery-biz",
    name: "Asset Recovery Biz",
    domain: "assetrecoverybusiness.com",
    industry: "Asset Recovery",
    color: "#d93025",
  },
  {
    id: "usmr",
    name: "USMR",
    domain: "usmortgagerecovery.com",
    industry: "Mortgage Recovery",
    color: "#e8710a",
  },
  {
    id: "smb",
    name: "SMB",
    domain: "startmybusiness.us",
    industry: "Business Services",
    color: "#1a73e8",
  },
  {
    id: "usfl",
    name: "USFL",
    domain: "usforeclosureleads.com",
    industry: "Lead Generation",
    color: "#d93025",
  },
  {
    id: "usfr",
    name: "USFR",
    domain: "usforeclosurerecovery.com",
    industry: "Foreclosure Recovery",
    color: "#9334e6",
  },
  {
    id: "scorewise",
    name: "Scorewise",
    domain: "scorewise.app",
    industry: "Credit Technology",
    color: "#1e8e3e",
  },
];

const STORAGE_KEY = "smb-agentic-seo-current-client";

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients] = useState<SEOClient[]>(DEFAULT_CLIENTS);
  const [currentClient, setCurrentClientState] = useState<SEOClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SEOClient;
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
      // localStorage may be unavailable
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

export function useClient(): ClientContextValue {
  const ctx = useContext(ClientContext);
  if (!ctx) {
    throw new Error("useClient must be used within a ClientProvider");
  }
  return ctx;
}
