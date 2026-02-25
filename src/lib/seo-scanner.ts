// ---------------------------------------------------------------------------
// SEO Scanner Engine
// Performs a real technical SEO audit of any domain by making HTTP requests.
// No external HTML parsing libraries needed -- uses regex for basic checks.
// ---------------------------------------------------------------------------

export interface ScanResult {
  domain: string
  scannedAt: string
  score: number
  issues: AuditIssue[]
  stats: {
    critical: number
    high: number
    medium: number
    low: number
    info: number
    totalChecks: number
    passedChecks: number
  }
  meta: {
    responseTimeMs: number
    httpStatus: number
    redirects: boolean
    ssl: boolean
  }
}

export interface AuditIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category:
    | 'performance'
    | 'seo'
    | 'mobile'
    | 'schema'
    | 'links'
    | 'accessibility'
    | 'security'
  title: string
  description: string
  recommendation: string
  url?: string
  evidence?: Record<string, unknown>
}

// Severity weights for scoring (higher = more impact on score deduction)
const SEVERITY_WEIGHT: Record<AuditIssue['severity'], number> = {
  critical: 15,
  high: 10,
  medium: 5,
  low: 2,
  info: 0,
}

const FETCH_TIMEOUT_MS = 10_000
const USER_AGENT =
  'AgenticSEO-Scanner/1.0 (https://agenticseo.com; technical-audit)'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...((options.headers as Record<string, string>) ?? {}),
      },
      redirect: 'follow',
    })
    return response
  } finally {
    clearTimeout(timer)
  }
}

async function fetchText(url: string): Promise<{ text: string; status: number } | null> {
  try {
    const res = await fetchWithTimeout(url)
    const text = await res.text()
    return { text, status: res.status }
  } catch {
    return null
  }
}

function countMatches(html: string, regex: RegExp): number {
  const matches = html.match(regex)
  return matches ? matches.length : 0
}

function extractFirst(html: string, regex: RegExp): string | null {
  const match = html.match(regex)
  return match ? match[1] ?? match[0] : null
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordCount(text: string): number {
  const cleaned = text.trim()
  if (!cleaned) return 0
  return cleaned.split(/\s+/).length
}

function normalizeUrl(domain: string): string {
  const d = domain.replace(/\/+$/, '')
  if (d.startsWith('http://') || d.startsWith('https://')) return d
  return `https://${d}`
}

// ---------------------------------------------------------------------------
// Individual audit checks
// ---------------------------------------------------------------------------

async function checkSSL(
  baseUrl: string,
  issues: AuditIssue[]
): Promise<boolean> {
  const httpsUrl = baseUrl.replace(/^http:\/\//, 'https://')
  try {
    const res = await fetchWithTimeout(httpsUrl, { method: 'HEAD' })
    if (res.ok || res.status < 400) return true
    issues.push({
      severity: 'critical',
      category: 'security',
      title: 'SSL certificate issue',
      description: `HTTPS request returned status ${res.status}. The SSL certificate may be invalid or expired.`,
      recommendation:
        'Install a valid SSL certificate. Use a free provider like Let\'s Encrypt or Cloudflare.',
      url: httpsUrl,
      evidence: { status: res.status },
    })
    return false
  } catch {
    issues.push({
      severity: 'critical',
      category: 'security',
      title: 'HTTPS not available',
      description:
        'The site does not respond over HTTPS. This is a major security and ranking factor.',
      recommendation:
        'Enable HTTPS with a valid SSL certificate. Google penalizes non-HTTPS sites in rankings.',
      url: httpsUrl,
    })
    return false
  }
}

async function checkHttpToHttpsRedirect(
  domain: string,
  issues: AuditIssue[]
): Promise<boolean> {
  const httpUrl = `http://${domain.replace(/^(https?:\/\/)/, '')}`
  try {
    const res = await fetchWithTimeout(httpUrl, { redirect: 'manual' })
    const location = res.headers.get('location') ?? ''
    if (
      (res.status === 301 || res.status === 302 || res.status === 308) &&
      location.startsWith('https')
    ) {
      return true
    }
    // Follow redirect chain manually
    if (res.status >= 300 && res.status < 400 && location) {
      if (location.startsWith('https')) return true
    }
    issues.push({
      severity: 'high',
      category: 'security',
      title: 'HTTP does not redirect to HTTPS',
      description:
        'Requests to the HTTP version of the site do not redirect to HTTPS. This can cause duplicate content and security warnings.',
      recommendation:
        'Set up a 301 redirect from HTTP to HTTPS in your server configuration or .htaccess file.',
      url: httpUrl,
      evidence: { status: res.status, location },
    })
    return false
  } catch {
    // If HTTP fails entirely, that might be fine if HTTPS works
    return false
  }
}

function checkMetaTitle(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const titleMatch = extractFirst(html, /<title[^>]*>([^<]*)<\/title>/i)

  if (!titleMatch || !titleMatch.trim()) {
    issues.push({
      severity: 'critical',
      category: 'seo',
      title: 'Missing page title',
      description: 'The page does not have a <title> tag. This is required for search engine indexing.',
      recommendation: 'Add a unique, descriptive <title> tag between 50-60 characters.',
      url,
    })
    return
  }

  const titleLength = titleMatch.trim().length
  if (titleLength < 30) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Page title too short',
      description: `The page title is only ${titleLength} characters. Short titles miss keyword opportunities.`,
      recommendation: 'Expand the title to 50-60 characters with relevant keywords.',
      url,
      evidence: { title: titleMatch.trim(), length: titleLength },
    })
  } else if (titleLength > 70) {
    issues.push({
      severity: 'low',
      category: 'seo',
      title: 'Page title too long',
      description: `The page title is ${titleLength} characters. Google truncates titles longer than ~60 characters.`,
      recommendation: 'Shorten the title to 50-60 characters to prevent truncation in search results.',
      url,
      evidence: { title: titleMatch.trim(), length: titleLength },
    })
  }
}

function checkMetaDescription(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const descMatch = extractFirst(
    html,
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
  )
  const descMatchAlt = extractFirst(
    html,
    /<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i
  )
  const description = descMatch ?? descMatchAlt

  if (!description || !description.trim()) {
    issues.push({
      severity: 'high',
      category: 'seo',
      title: 'Missing meta description',
      description:
        'The page does not have a meta description. Search engines display this in results and it affects click-through rates.',
      recommendation:
        'Add a compelling meta description between 150-160 characters that summarizes the page content.',
      url,
    })
    return
  }

  const descLength = description.trim().length
  if (descLength < 70) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Meta description too short',
      description: `The meta description is only ${descLength} characters. Short descriptions miss the chance to persuade searchers to click.`,
      recommendation: 'Expand the meta description to 150-160 characters.',
      url,
      evidence: { description: description.trim(), length: descLength },
    })
  } else if (descLength > 170) {
    issues.push({
      severity: 'low',
      category: 'seo',
      title: 'Meta description too long',
      description: `The meta description is ${descLength} characters. Google truncates descriptions longer than ~160 characters.`,
      recommendation: 'Shorten to 150-160 characters for full display in search results.',
      url,
      evidence: { length: descLength },
    })
  }
}

function checkViewport(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const hasViewport =
    /<meta\s+[^>]*name=["']viewport["'][^>]*>/i.test(html) ||
    /<meta\s+[^>]*content=["'][^"']*width=device-width[^"']*["'][^>]*name=["']viewport["']/i.test(
      html
    )

  if (!hasViewport) {
    issues.push({
      severity: 'high',
      category: 'mobile',
      title: 'Missing viewport meta tag',
      description:
        'The page does not set a viewport meta tag. This causes poor rendering on mobile devices.',
      recommendation:
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head>.',
      url,
    })
  }
}

function checkOpenGraph(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const hasOgTitle =
    /<meta\s+[^>]*property=["']og:title["'][^>]*>/i.test(html) ||
    /<meta\s+[^>]*content=["'][^"']+["'][^>]*property=["']og:title["']/i.test(html)
  const hasOgDesc =
    /<meta\s+[^>]*property=["']og:description["'][^>]*>/i.test(html) ||
    /<meta\s+[^>]*content=["'][^"']+["'][^>]*property=["']og:description["']/i.test(html)
  const hasOgImage =
    /<meta\s+[^>]*property=["']og:image["'][^>]*>/i.test(html) ||
    /<meta\s+[^>]*content=["'][^"']+["'][^>]*property=["']og:image["']/i.test(html)

  const missing: string[] = []
  if (!hasOgTitle) missing.push('og:title')
  if (!hasOgDesc) missing.push('og:description')
  if (!hasOgImage) missing.push('og:image')

  if (missing.length > 0) {
    issues.push({
      severity: missing.includes('og:title') ? 'medium' : 'low',
      category: 'seo',
      title: 'Missing Open Graph tags',
      description: `The page is missing these Open Graph tags: ${missing.join(', ')}. Social media previews will not display correctly.`,
      recommendation:
        'Add all Open Graph tags (og:title, og:description, og:image) for proper social media sharing.',
      url,
      evidence: { missing },
    })
  }
}

function checkCanonical(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const hasCanonical =
    /<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html) ||
    /<link\s+[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["']/i.test(html)

  if (!hasCanonical) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Missing canonical URL',
      description:
        'No canonical link tag found. This can lead to duplicate content issues if the page is accessible via multiple URLs.',
      recommendation:
        'Add <link rel="canonical" href="..."> pointing to the preferred version of this URL.',
      url,
    })
  }
}

function checkH1(html: string, url: string, issues: AuditIssue[]): void {
  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi)
  const h1Count = h1Matches ? h1Matches.length : 0

  if (h1Count === 0) {
    issues.push({
      severity: 'high',
      category: 'seo',
      title: 'Missing H1 heading',
      description:
        'The page has no H1 heading. The H1 is a primary ranking signal for search engines.',
      recommendation:
        'Add exactly one H1 tag that clearly describes the page content and includes the target keyword.',
      url,
    })
  } else if (h1Count > 1) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Multiple H1 headings found',
      description: `The page has ${h1Count} H1 tags. Best practice is to use exactly one H1 per page.`,
      recommendation:
        'Keep one H1 for the main heading and change the others to H2 or lower.',
      url,
      evidence: { h1Count },
    })
  }
}

function checkStructuredData(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const hasJsonLd =
    /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html)
  const hasMicrodata = /itemscope/i.test(html)

  if (!hasJsonLd && !hasMicrodata) {
    issues.push({
      severity: 'medium',
      category: 'schema',
      title: 'No structured data found',
      description:
        'The page has no JSON-LD or Microdata structured data. Structured data helps search engines understand content and can enable rich results.',
      recommendation:
        'Add JSON-LD structured data (Organization, WebPage, BreadcrumbList, FAQPage, etc.) relevant to your content.',
      url,
    })
  }
}

function checkContentLength(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const plainText = stripTags(html)
  const words = wordCount(plainText)

  if (words < 100) {
    issues.push({
      severity: 'high',
      category: 'seo',
      title: 'Very thin content',
      description: `The page contains only ~${words} words of visible text. Thin content pages rank poorly.`,
      recommendation:
        'Add at least 300 words of unique, valuable content. For competitive keywords, aim for 1,000+ words.',
      url,
      evidence: { wordCount: words },
    })
  } else if (words < 300) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Low content volume',
      description: `The page contains ~${words} words. Pages with more comprehensive content tend to rank higher.`,
      recommendation:
        'Expand the content to at least 300 words. Consider adding FAQ sections, detailed descriptions, or supporting information.',
      url,
      evidence: { wordCount: words },
    })
  }
}

function checkImageAlts(
  html: string,
  url: string,
  issues: AuditIssue[]
): void {
  const imgTags = html.match(/<img\s[^>]*>/gi) ?? []
  const totalImages = imgTags.length

  if (totalImages === 0) return

  let missingAlt = 0
  let emptyAlt = 0

  for (const img of imgTags) {
    const hasAltAttr = /\salt=["']/i.test(img) || /\salt=/i.test(img)
    if (!hasAltAttr) {
      missingAlt++
    } else {
      const altValue = extractFirst(img, /alt=["']([^"']*)["']/i)
      if (altValue !== null && altValue.trim() === '') {
        emptyAlt++
      }
    }
  }

  if (missingAlt > 0) {
    issues.push({
      severity: missingAlt > 3 ? 'high' : 'medium',
      category: 'accessibility',
      title: 'Images missing alt attributes',
      description: `${missingAlt} out of ${totalImages} images are missing alt attributes. Alt text is required for accessibility and helps with image SEO.`,
      recommendation:
        'Add descriptive alt attributes to all images. Use keywords naturally when relevant.',
      url,
      evidence: { totalImages, missingAlt, emptyAlt },
    })
  }
}

function checkLinks(html: string, url: string, issues: AuditIssue[]): void {
  const linkTags = html.match(/<a\s[^>]*href=["'][^"']+["'][^>]*>/gi) ?? []
  let internal = 0
  let external = 0
  let nofollow = 0

  const domain = new URL(url).hostname

  for (const link of linkTags) {
    const href = extractFirst(link, /href=["']([^"']+)["']/i)
    if (!href) continue

    if (
      href.startsWith('/') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      internal++
      continue
    }

    try {
      const linkDomain = new URL(href).hostname
      if (linkDomain === domain || linkDomain === `www.${domain}` || `www.${linkDomain}` === domain) {
        internal++
      } else {
        external++
      }
    } catch {
      internal++ // relative URL
    }

    if (/rel=["'][^"']*nofollow[^"']*["']/i.test(link)) {
      nofollow++
    }
  }

  if (internal === 0 && linkTags.length > 0) {
    issues.push({
      severity: 'medium',
      category: 'links',
      title: 'No internal links found',
      description:
        'The page has no internal links. Internal linking helps distribute page authority and improve crawlability.',
      recommendation:
        'Add internal links to other relevant pages on your site. Aim for at least 3-5 internal links per page.',
      url,
      evidence: { internal, external, totalLinks: linkTags.length },
    })
  }

  if (external === 0 && internal > 0) {
    issues.push({
      severity: 'info',
      category: 'links',
      title: 'No external links found',
      description:
        'The page contains no outbound links to external sites. Linking to authoritative sources can improve topical relevance.',
      recommendation:
        'Consider linking to authoritative external sources to support your content claims.',
      url,
      evidence: { internal, external },
    })
  }
}

async function checkRobotsTxt(
  baseUrl: string,
  issues: AuditIssue[]
): Promise<void> {
  const robotsUrl = `${baseUrl}/robots.txt`
  const result = await fetchText(robotsUrl)

  if (!result || result.status !== 200) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Missing robots.txt',
      description:
        'No robots.txt file found. While not required, a robots.txt helps manage crawler behavior.',
      recommendation:
        'Create a robots.txt file at the root of your site. At minimum include: User-agent: *\\nAllow: /\\nSitemap: [your-sitemap-url]',
      url: robotsUrl,
      evidence: { status: result?.status ?? 'unreachable' },
    })
    return
  }

  const text = result.text.toLowerCase()

  // Check if everything is blocked
  if (text.includes('disallow: /') && !text.includes('disallow: /\n')) {
    // "disallow: /" followed by more path chars means specific path
    // but just "disallow: /" on its own blocks everything
    const lines = text.split('\n').map((l) => l.trim())
    const blockAll = lines.some((l) => l === 'disallow: /')
    if (blockAll) {
      issues.push({
        severity: 'critical',
        category: 'seo',
        title: 'robots.txt blocks all crawlers',
        description:
          'The robots.txt contains "Disallow: /" which blocks all search engines from crawling the site.',
        recommendation:
          'Change "Disallow: /" to "Allow: /" unless you intentionally want to block indexing.',
        url: robotsUrl,
      })
    }
  }

  // Check for AI crawler blocking (informational)
  const aiCrawlers = [
    'gptbot',
    'chatgpt-user',
    'claudebot',
    'claude-web',
    'perplexitybot',
    'google-extended',
  ]
  const blockedAi = aiCrawlers.filter(
    (crawler) =>
      text.includes(`user-agent: ${crawler}`) &&
      text.includes('disallow: /')
  )
  if (blockedAi.length > 0) {
    issues.push({
      severity: 'info',
      category: 'seo',
      title: 'AI crawlers blocked in robots.txt',
      description: `The following AI crawlers are blocked: ${blockedAi.join(', ')}. This prevents AI models from using your content for training and answers.`,
      recommendation:
        'If you want AI visibility (AI Engine Optimization), consider allowing these crawlers. If you prefer to block them, this is intentional.',
      url: robotsUrl,
      evidence: { blockedAi },
    })
  }
}

async function checkSitemap(
  baseUrl: string,
  issues: AuditIssue[]
): Promise<void> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  const result = await fetchText(sitemapUrl)

  if (!result || result.status !== 200) {
    issues.push({
      severity: 'high',
      category: 'seo',
      title: 'Missing sitemap.xml',
      description:
        'No sitemap.xml found at the standard location. Sitemaps help search engines discover and index pages efficiently.',
      recommendation:
        'Generate and upload an XML sitemap to /sitemap.xml. Most CMS platforms have plugins that auto-generate sitemaps.',
      url: sitemapUrl,
      evidence: { status: result?.status ?? 'unreachable' },
    })
    return
  }

  const text = result.text
  const isXml = text.includes('<urlset') || text.includes('<sitemapindex')

  if (!isXml) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Invalid sitemap format',
      description:
        'The sitemap.xml exists but does not appear to be valid XML. Search engines may not be able to parse it.',
      recommendation:
        'Verify the sitemap is valid XML using a sitemap validator tool and fix any formatting errors.',
      url: sitemapUrl,
    })
    return
  }

  // Count URLs in sitemap
  const urlCount = countMatches(text, /<loc>/gi)
  if (urlCount === 0) {
    issues.push({
      severity: 'medium',
      category: 'seo',
      title: 'Sitemap contains no URLs',
      description:
        'The sitemap.xml file is valid XML but contains no <loc> entries.',
      recommendation:
        'Populate the sitemap with all indexable page URLs on your site.',
      url: sitemapUrl,
      evidence: { urlCount },
    })
  }
}

async function checkFavicon(
  baseUrl: string,
  issues: AuditIssue[]
): Promise<void> {
  const faviconUrl = `${baseUrl}/favicon.ico`
  try {
    const res = await fetchWithTimeout(faviconUrl, { method: 'HEAD' })
    if (res.status !== 200) {
      issues.push({
        severity: 'low',
        category: 'seo',
        title: 'Missing favicon',
        description:
          'No favicon.ico found. Favicons appear in browser tabs, bookmarks, and search results.',
        recommendation:
          'Add a favicon.ico file at the root of your site. Include multiple sizes (16x16, 32x32, 180x180).',
        url: faviconUrl,
        evidence: { status: res.status },
      })
    }
  } catch {
    issues.push({
      severity: 'low',
      category: 'seo',
      title: 'Missing favicon',
      description:
        'Could not fetch favicon.ico. Favicons appear in browser tabs, bookmarks, and search results.',
      recommendation: 'Add a favicon.ico file at the root of your site.',
      url: faviconUrl,
    })
  }
}

async function checkLlmsTxt(
  baseUrl: string,
  issues: AuditIssue[]
): Promise<void> {
  const llmsUrl = `${baseUrl}/llms.txt`
  const result = await fetchText(llmsUrl)

  if (!result || result.status !== 200) {
    issues.push({
      severity: 'info',
      category: 'seo',
      title: 'Missing llms.txt (AI optimization)',
      description:
        'No llms.txt file found. This emerging standard helps AI models understand your site purpose and offerings.',
      recommendation:
        'Create an llms.txt file describing your site, services, and AI access policy for better AI Engine Optimization (AEO).',
      url: llmsUrl,
    })
  }
}

function checkResponseTime(
  responseTimeMs: number,
  url: string,
  issues: AuditIssue[]
): void {
  if (responseTimeMs > 5000) {
    issues.push({
      severity: 'critical',
      category: 'performance',
      title: 'Extremely slow page load',
      description: `The homepage took ${(responseTimeMs / 1000).toFixed(1)}s to respond. Google recommends under 2.5s for good user experience.`,
      recommendation:
        'Investigate server performance, enable caching, optimize images, and consider a CDN.',
      url,
      evidence: { responseTimeMs },
    })
  } else if (responseTimeMs > 3000) {
    issues.push({
      severity: 'high',
      category: 'performance',
      title: 'Slow page response',
      description: `The homepage took ${(responseTimeMs / 1000).toFixed(1)}s to respond. Target under 2.5s for Core Web Vitals compliance.`,
      recommendation:
        'Optimize server response time. Enable compression, caching headers, and consider a faster hosting provider.',
      url,
      evidence: { responseTimeMs },
    })
  } else if (responseTimeMs > 1500) {
    issues.push({
      severity: 'medium',
      category: 'performance',
      title: 'Page response could be faster',
      description: `The homepage took ${(responseTimeMs / 1000).toFixed(1)}s to respond. Faster is better for both users and rankings.`,
      recommendation:
        'Review server-side caching and asset compression to bring response time under 1.5 seconds.',
      url,
      evidence: { responseTimeMs },
    })
  }
}

// ---------------------------------------------------------------------------
// Main scanner function
// ---------------------------------------------------------------------------

export async function scanDomain(domainInput: string): Promise<ScanResult> {
  const baseUrl = normalizeUrl(domainInput)
  const domain = domainInput
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
  const issues: AuditIssue[] = []

  // ---- Fetch homepage and measure response time ----
  let html = ''
  let httpStatus = 0
  let responseTimeMs = 0
  let sslValid = false
  let hadRedirects = false

  const startTime = Date.now()
  try {
    const res = await fetchWithTimeout(baseUrl)
    responseTimeMs = Date.now() - startTime
    httpStatus = res.status
    html = await res.text()
    sslValid = baseUrl.startsWith('https')
    hadRedirects = res.redirected
  } catch (err) {
    responseTimeMs = Date.now() - startTime
    // Try HTTP fallback
    try {
      const httpUrl = baseUrl.replace('https://', 'http://')
      const res = await fetchWithTimeout(httpUrl)
      responseTimeMs = Date.now() - startTime
      httpStatus = res.status
      html = await res.text()
    } catch {
      // Site completely unreachable
      return {
        domain,
        scannedAt: new Date().toISOString(),
        score: 0,
        issues: [
          {
            severity: 'critical',
            category: 'performance',
            title: 'Site unreachable',
            description: `Could not connect to ${baseUrl}. The site may be down, blocking automated requests, or the domain may not exist.`,
            recommendation:
              'Verify the domain is correct and the site is online. Check server logs for connection issues.',
            url: baseUrl,
            evidence: {
              error: err instanceof Error ? err.message : 'Connection failed',
            },
          },
        ],
        stats: {
          critical: 1,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
          totalChecks: 1,
          passedChecks: 0,
        },
        meta: {
          responseTimeMs,
          httpStatus: 0,
          redirects: false,
          ssl: false,
        },
      }
    }
  }

  // ---- Run all checks in parallel where possible ----

  // SSL and redirect checks (network calls)
  const [sslResult] = await Promise.allSettled([
    checkSSL(baseUrl, issues),
    checkHttpToHttpsRedirect(domain, issues),
  ])
  if (sslResult.status === 'fulfilled') {
    sslValid = sslResult.value
  }

  // Resource checks (network calls, run in parallel)
  await Promise.allSettled([
    checkRobotsTxt(baseUrl, issues),
    checkSitemap(baseUrl, issues),
    checkFavicon(baseUrl, issues),
    checkLlmsTxt(baseUrl, issues),
  ])

  // HTML-based checks (synchronous, no network)
  checkResponseTime(responseTimeMs, baseUrl, issues)
  checkMetaTitle(html, baseUrl, issues)
  checkMetaDescription(html, baseUrl, issues)
  checkViewport(html, baseUrl, issues)
  checkOpenGraph(html, baseUrl, issues)
  checkCanonical(html, baseUrl, issues)
  checkH1(html, baseUrl, issues)
  checkStructuredData(html, baseUrl, issues)
  checkContentLength(html, baseUrl, issues)
  checkImageAlts(html, baseUrl, issues)
  checkLinks(html, baseUrl, issues)

  // Check HTTP status
  if (httpStatus >= 400) {
    issues.push({
      severity: 'critical',
      category: 'performance',
      title: `HTTP ${httpStatus} error`,
      description: `The homepage returned HTTP status ${httpStatus}. This means the page is not accessible to users or search engines.`,
      recommendation: 'Fix the server error causing the non-200 status code.',
      url: baseUrl,
      evidence: { httpStatus },
    })
  } else if (httpStatus >= 300 && httpStatus < 400) {
    issues.push({
      severity: 'low',
      category: 'seo',
      title: 'Homepage returns redirect',
      description: `The homepage URL returns a ${httpStatus} redirect. While redirects are normal, the canonical homepage should return 200.`,
      recommendation:
        'Ensure your primary domain URL returns a 200 status, not a redirect chain.',
      url: baseUrl,
      evidence: { httpStatus },
    })
  }

  // ---- Calculate score ----
  // Total possible checks performed
  const CHECK_LABELS = [
    'ssl',
    'http-redirect',
    'response-time',
    'http-status',
    'robots-txt',
    'sitemap-xml',
    'meta-title',
    'meta-description',
    'viewport',
    'open-graph',
    'canonical',
    'h1-heading',
    'structured-data',
    'content-length',
    'image-alts',
    'internal-links',
    'favicon',
    'llms-txt',
  ]
  const totalChecks = CHECK_LABELS.length

  const stats = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    totalChecks,
    passedChecks: 0,
  }

  let totalDeduction = 0
  for (const issue of issues) {
    stats[issue.severity]++
    totalDeduction += SEVERITY_WEIGHT[issue.severity]
  }

  // Non-info issues count as failed checks
  const failedChecks = stats.critical + stats.high + stats.medium + stats.low
  stats.passedChecks = Math.max(0, totalChecks - failedChecks)

  // Score: start at 100, deduct based on issue severity
  // Cap deductions so score stays in 0-100
  const score = Math.max(0, Math.min(100, 100 - totalDeduction))

  return {
    domain,
    scannedAt: new Date().toISOString(),
    score,
    issues,
    stats,
    meta: {
      responseTimeMs,
      httpStatus,
      redirects: hadRedirects,
      ssl: sslValid,
    },
  }
}
