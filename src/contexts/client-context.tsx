'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAuth } from '@clerk/nextjs'
import { CLIENT_COLORS } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SEOClient {
  id: string
  name: string
  domain: string
  industry?: string
  color?: string
  site_url?: string
  gsc_property_url?: string
  platform?: string
  active?: boolean
}

interface ClientContextValue {
  currentClient: SEOClient | null
  setCurrentClient: (client: SEOClient) => void
  clients: SEOClient[]
  isLoading: boolean
  isEmpty: boolean
  isAdmin: boolean
  hasNoBusiness: boolean
  refreshClients: () => Promise<void>
  refetchClients: () => Promise<void>
}

const STORAGE_KEY = 'smb-seo-current-client'

const ClientContext = createContext<ClientContextValue | null>(null)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assignColor(index: number): string {
  return CLIENT_COLORS[index % CLIENT_COLORS.length]
}

function mapClientFromApi(
  row: Record<string, unknown>,
  index: number
): SEOClient {
  return {
    id: row.id as string,
    name:
      (row.business_name as string) ||
      (row.domain as string) ||
      'Unknown',
    domain: (row.domain as string) ?? '',
    industry: (row.niche as string) || undefined,
    color: (row.color as string) || assignColor(index),
    site_url: (row.site_url as string) || undefined,
    gsc_property_url: (row.gsc_property_url as string) || undefined,
    platform: (row.platform as string) || undefined,
    active: row.active !== false,
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth()
  const [clients, setClients] = useState<SEOClient[]>([])
  const [currentClient, setCurrentClientState] = useState<SEOClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const fetchClients = useCallback(async () => {
    if (!isSignedIn) {
      setIsLoading(false)
      return
    }
    try {
      // Fetch user role
      const userRes = await fetch('/api/user/me')
      if (userRes.ok) {
        const userJson = await userRes.json()
        if (userJson.data?.role === 'admin') setIsAdmin(true)
      }

      // Fetch clients
      const res = await fetch('/api/clients')
      if (!res.ok) return

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        const mapped: SEOClient[] = json.data.map(mapClientFromApi)
        setClients(mapped)

        // Restore last selection from localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored) as SEOClient
            const found = mapped.find(
              (c) => c.id === parsed.id || c.domain === parsed.domain
            )
            if (found) {
              setCurrentClientState(found)
              return
            }
          }
        } catch {
          // Ignore localStorage errors
        }

        if (mapped.length > 0) {
          setCurrentClientState(mapped[0])
        }
      }
    } catch {
      // API unavailable — leave empty
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const setCurrentClient = useCallback((client: SEOClient) => {
    setCurrentClientState(client)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(client))
    } catch {
      // localStorage may be unavailable
    }
  }, [])

  const hasNoBusiness = !isAdmin && !isLoading && clients.length === 0

  return (
    <ClientContext.Provider
      value={{
        currentClient,
        setCurrentClient,
        clients,
        isLoading,
        isEmpty: !isLoading && clients.length === 0,
        isAdmin,
        hasNoBusiness,
        refreshClients: fetchClients,
        refetchClients: fetchClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useClient(): ClientContextValue {
  const ctx = useContext(ClientContext)
  if (!ctx) {
    throw new Error('useClient must be used within a ClientProvider')
  }
  return ctx
}
