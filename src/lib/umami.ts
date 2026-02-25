const UMAMI_URL =
  process.env.UMAMI_URL ?? 'https://analytics.alwaysencrypted.com'
const UMAMI_USERNAME = process.env.UMAMI_USERNAME ?? 'admin'
const UMAMI_PASSWORD = process.env.UMAMI_PASSWORD ?? 'Umamipassword#1'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const res = await fetch(`${UMAMI_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: UMAMI_USERNAME,
      password: UMAMI_PASSWORD,
    }),
  })

  if (!res.ok) {
    throw new Error(`Umami auth failed: ${res.status}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 3600_000, // Cache for 1 hour
  }
  return data.token
}

async function umamiFetch<T>(path: string): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${UMAMI_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Umami API error [${res.status}] ${path}: ${text}`)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UmamiWebsite {
  id: string
  name: string
  domain: string
}

export interface UmamiStats {
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

export interface UmamiPageviewEntry {
  date: string
  value: number
}

export interface UmamiPageviews {
  pageviews: UmamiPageviewEntry[]
  sessions: UmamiPageviewEntry[]
}

export interface UmamiMetric {
  x: string
  y: number
}

// ---------------------------------------------------------------------------
// Domain-to-Website ID mapping (cached)
// ---------------------------------------------------------------------------

let websiteCache: Map<string, string> | null = null
let websiteCacheExpiry = 0

async function getWebsiteMap(): Promise<Map<string, string>> {
  if (websiteCache && Date.now() < websiteCacheExpiry) {
    return websiteCache
  }

  const data = await umamiFetch<{ data: UmamiWebsite[] } | UmamiWebsite[]>(
    '/api/websites?limit=100'
  )
  const sites = Array.isArray(data) ? data : data.data || []

  const map = new Map<string, string>()
  for (const site of sites) {
    map.set(site.domain, site.id)
  }

  websiteCache = map
  websiteCacheExpiry = Date.now() + 300_000 // Cache 5 min
  return map
}

export async function getWebsiteIdForDomain(
  domain: string
): Promise<string | null> {
  const map = await getWebsiteMap()
  return map.get(domain) || map.get(`www.${domain}`) || null
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Get aggregate stats for a website over a date range.
 */
export async function getWebsiteStats(
  websiteId: string,
  startAt: number,
  endAt: number
): Promise<UmamiStats> {
  return umamiFetch<UmamiStats>(
    `/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`
  )
}

/**
 * Get pageviews grouped by day.
 */
export async function getPageviewsByDay(
  websiteId: string,
  startAt: number,
  endAt: number
): Promise<UmamiPageviews> {
  return umamiFetch<UmamiPageviews>(
    `/api/websites/${websiteId}/pageviews?startAt=${startAt}&endAt=${endAt}&unit=day`
  )
}

/**
 * Get top referrers.
 */
export async function getTopReferrers(
  websiteId: string,
  startAt: number,
  endAt: number,
  limit = 10
): Promise<UmamiMetric[]> {
  return umamiFetch<UmamiMetric[]>(
    `/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=referrer&limit=${limit}`
  )
}

/**
 * Get top pages.
 */
export async function getTopPages(
  websiteId: string,
  startAt: number,
  endAt: number,
  limit = 10
): Promise<UmamiMetric[]> {
  return umamiFetch<UmamiMetric[]>(
    `/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=url&limit=${limit}`
  )
}

/**
 * Get top browsers.
 */
export async function getTopBrowsers(
  websiteId: string,
  startAt: number,
  endAt: number,
  limit = 5
): Promise<UmamiMetric[]> {
  return umamiFetch<UmamiMetric[]>(
    `/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=browser&limit=${limit}`
  )
}

/**
 * Get top countries.
 */
export async function getTopCountries(
  websiteId: string,
  startAt: number,
  endAt: number,
  limit = 10
): Promise<UmamiMetric[]> {
  return umamiFetch<UmamiMetric[]>(
    `/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=country&limit=${limit}`
  )
}

/**
 * Get top devices.
 */
export async function getTopDevices(
  websiteId: string,
  startAt: number,
  endAt: number,
  limit = 5
): Promise<UmamiMetric[]> {
  return umamiFetch<UmamiMetric[]>(
    `/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=device&limit=${limit}`
  )
}
