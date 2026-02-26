const MATON_API_KEY =
  process.env.MATON_API_KEY ??
  'RzfjgLYTOSk2Q40WOBjciy8Rcw7ME7zlBRGtXdzxBEFyF6VjtvUKieNP7Wfzy-adMehfy5SQgmDA4UlYp2ktU5GU6dEqVCo4oRj768AjdA'

const MATON_BASE_URL =
  process.env.MATON_BASE_URL ?? 'https://gateway.maton.ai'

interface MatonRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  params?: Record<string, string>
}

/**
 * Low-level fetch wrapper for the Maton API Gateway.
 * Automatically injects the Bearer token and handles errors.
 */
async function matonFetch<T>(
  path: string,
  options: MatonRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options

  const url = new URL(`${MATON_BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${MATON_API_KEY}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Maton API error [${response.status}] ${path}: ${errorText}`
    )
  }

  return response.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Google Search Console
// ---------------------------------------------------------------------------

export type GSCDimension = 'query' | 'page' | 'country' | 'device' | 'date'

interface GSCSearchAnalyticsRequest {
  startDate: string
  endDate: string
  dimensions: GSCDimension[]
  rowLimit?: number
  startRow?: number
  dimensionFilterGroups?: Array<{
    groupType?: string
    filters: Array<{
      dimension: string
      operator: string
      expression: string
    }>
  }>
}

interface GSCRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface GSCSearchAnalyticsResponse {
  rows: GSCRow[]
  responseAggregationType: string
}

interface GSCSite {
  siteUrl: string
  permissionLevel: string
}

interface GSCSitesResponse {
  siteEntry: GSCSite[]
}

/**
 * Fetch search performance data from Google Search Console.
 *
 * @param siteUrl - The verified site URL (e.g. "https://example.com" or "sc-domain:example.com")
 * @param startDate - ISO date string (YYYY-MM-DD)
 * @param endDate - ISO date string (YYYY-MM-DD)
 * @param dimensions - Array of dimensions to group by
 * @param rowLimit - Max rows to return (default 1000)
 */
export async function getSearchConsoleData(
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: GSCDimension[] = ['query'],
  rowLimit = 1000
): Promise<GSCSearchAnalyticsResponse> {
  const encodedSiteUrl = encodeURIComponent(siteUrl)

  const body: GSCSearchAnalyticsRequest = {
    startDate,
    endDate,
    dimensions,
    rowLimit,
  }

  return matonFetch<GSCSearchAnalyticsResponse>(
    `/google-search-console/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    { method: 'POST', body: body as unknown as Record<string, unknown> }
  )
}

/**
 * List all verified sites in the connected Google Search Console account.
 */
export async function getSearchConsoleSites(): Promise<GSCSite[]> {
  const response = await matonFetch<GSCSitesResponse>(
    '/google-search-console/webmasters/v3/sites'
  )
  return response.siteEntry ?? []
}

// ---------------------------------------------------------------------------
// Google Analytics Data API (GA4)
// ---------------------------------------------------------------------------

interface GADateRange {
  startDate: string
  endDate: string
}

interface GAMetric {
  name: string
}

interface GADimension {
  name: string
}

interface GARunReportRequest {
  dateRanges: GADateRange[]
  metrics: GAMetric[]
  dimensions?: GADimension[]
  limit?: number
  offset?: number
  orderBys?: Array<{
    metric?: { metricName: string }
    dimension?: { dimensionName: string }
    desc?: boolean
  }>
}

interface GADimensionValue {
  value: string
}

interface GAMetricValue {
  value: string
}

interface GARow {
  dimensionValues?: GADimensionValue[]
  metricValues: GAMetricValue[]
}

interface GARunReportResponse {
  rows: GARow[]
  totals?: GARow[]
  rowCount: number
  metadata?: Record<string, unknown>
}

/**
 * Run a report against a GA4 property via the Maton gateway.
 *
 * @param propertyId - The GA4 property ID (numeric string, e.g. "123456789")
 * @param dateRange - { startDate, endDate } in YYYY-MM-DD or relative format (e.g. "30daysAgo")
 * @param metrics - Array of metric names (e.g. ["sessions", "totalUsers"])
 * @param dimensions - Optional array of dimension names (e.g. ["date", "country"])
 */
export async function getAnalyticsReport(
  propertyId: string,
  dateRange: GADateRange,
  metrics: string[],
  dimensions?: string[]
): Promise<GARunReportResponse> {
  const body: GARunReportRequest = {
    dateRanges: [dateRange],
    metrics: metrics.map((name) => ({ name })),
    dimensions: dimensions?.map((name) => ({ name })),
    limit: 10000,
  }

  return matonFetch<GARunReportResponse>(
    `/google-analytics-data/v1beta/properties/${propertyId}:runReport`,
    { method: 'POST', body: body as unknown as Record<string, unknown> }
  )
}

// ---------------------------------------------------------------------------
// Google Ads
// ---------------------------------------------------------------------------

const GOOGLE_ADS_CUSTOMER_ID =
  process.env.GOOGLE_ADS_CUSTOMER_ID ?? '9858534244'

interface GoogleAdsCampaign {
  id: string
  name: string
  status: string
  channelType: string
  budgetMicros: string
  impressions: number
  clicks: number
  costMicros: number
  conversions: number
  ctr: number
  avgCpc: number
}

interface GoogleAdsStreamResult {
  campaign?: {
    id?: string
    name?: string
    status?: string
    advertisingChannelType?: string
    resourceName?: string
  }
  campaignBudget?: {
    amountMicros?: string
  }
  metrics?: {
    impressions?: string
    clicks?: string
    costMicros?: string
    conversions?: string
    ctr?: string
    averageCpc?: string
  }
}

interface GoogleAdsStreamBatch {
  results?: GoogleAdsStreamResult[]
}

/**
 * Execute a Google Ads query via the Maton gateway searchStream endpoint.
 */
async function googleAdsQuery(
  gaql: string
): Promise<GoogleAdsStreamResult[]> {
  const batches = await matonFetch<GoogleAdsStreamBatch[]>(
    `/google-ads/v23/customers/${GOOGLE_ADS_CUSTOMER_ID}/googleAds:searchStream`,
    {
      method: 'POST',
      body: { query: gaql },
    }
  )

  const results: GoogleAdsStreamResult[] = []
  for (const batch of batches) {
    if (batch.results) {
      results.push(...batch.results)
    }
  }
  return results
}

/**
 * Fetch all Google Ads campaigns with performance metrics for the last 30 days.
 */
export async function getGoogleAdsCampaigns(): Promise<GoogleAdsCampaign[]> {
  const gaql = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ORDER BY metrics.impressions DESC
    LIMIT 50
  `

  const results = await googleAdsQuery(gaql)

  return results.map((r) => ({
    id: r.campaign?.id ?? '',
    name: r.campaign?.name ?? '',
    status: r.campaign?.status ?? 'UNKNOWN',
    channelType: r.campaign?.advertisingChannelType ?? 'UNKNOWN',
    budgetMicros: r.campaignBudget?.amountMicros ?? '0',
    impressions: parseInt(r.metrics?.impressions ?? '0', 10),
    clicks: parseInt(r.metrics?.clicks ?? '0', 10),
    costMicros: parseInt(r.metrics?.costMicros ?? '0', 10),
    conversions: parseFloat(r.metrics?.conversions ?? '0'),
    ctr: parseFloat(r.metrics?.ctr ?? '0'),
    avgCpc: parseInt(r.metrics?.averageCpc ?? '0', 10),
  }))
}

/**
 * Get a summary of Google Ads account performance.
 */
export async function getGoogleAdsAccountSummary(): Promise<{
  totalImpressions: number
  totalClicks: number
  totalCostMicros: number
  totalConversions: number
  avgCtr: number
  activeCampaigns: number
  pausedCampaigns: number
}> {
  const campaigns = await getGoogleAdsCampaigns()

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalCostMicros = campaigns.reduce((s, c) => s + c.costMicros, 0)
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0)
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
  const activeCampaigns = campaigns.filter(
    (c) => c.status === 'ENABLED'
  ).length
  const pausedCampaigns = campaigns.filter(
    (c) => c.status === 'PAUSED'
  ).length

  return {
    totalImpressions,
    totalClicks,
    totalCostMicros,
    totalConversions,
    avgCtr,
    activeCampaigns,
    pausedCampaigns,
  }
}

// ---------------------------------------------------------------------------
// Exports for testing / advanced usage
// ---------------------------------------------------------------------------

export { matonFetch, googleAdsQuery }
export type {
  GSCRow,
  GSCSearchAnalyticsResponse,
  GSCSite,
  GARunReportResponse,
  GARow,
  GADateRange,
  GoogleAdsCampaign,
}
