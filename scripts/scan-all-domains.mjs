#!/usr/bin/env node
/**
 * Scan all domains and populate site_audits + scan_jobs + agent_runs tables.
 * Run with: node scripts/scan-all-domains.mjs
 */

const SUPABASE_URL = 'http://10.28.28.97:8100'
const SRK = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJpc3MiOiAic3VwYWJhc2UiLCAiaWF0IjogMTc3MTU0MzQ4OSwgImV4cCI6IDIwODY5MDM0ODksICJyb2xlIjogInNlcnZpY2Vfcm9sZSJ9.2WwzRXuU1ZKzUYFo4AJrYEs8pI7hg6zTqDIu2Xa0pNY'

const headers = {
  'apikey': SRK,
  'Authorization': `Bearer ${SRK}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

// ---------------------------------------------------------------------------
// Mini SEO Scanner (standalone - doesn't import from src/lib)
// ---------------------------------------------------------------------------

async function fetchWithTimeout(url, opts = {}, timeoutMs = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function scanDomain(domain) {
  const issues = []
  let totalChecks = 0
  let passedChecks = 0
  const baseUrl = `https://${domain}`
  let htmlBody = ''
  let responseTimeMs = 0
  let httpStatus = 0
  let hasSSL = false
  let hasRedirects = false

  function addIssue(severity, category, title, description, recommendation, url, evidence) {
    issues.push({ severity, category, title, description, recommendation, url: url || baseUrl, evidence: evidence || {} })
  }

  // 1. Fetch homepage
  try {
    const t0 = Date.now()
    const res = await fetchWithTimeout(baseUrl, { redirect: 'follow' })
    responseTimeMs = Date.now() - t0
    httpStatus = res.status
    htmlBody = await res.text()
    hasSSL = true

    totalChecks++
    if (res.ok) passedChecks++
    else addIssue('critical', 'seo', `Homepage returns HTTP ${httpStatus}`, `The homepage returned status ${httpStatus} instead of 200.`, 'Fix your web server configuration to return HTTP 200 for the homepage.', baseUrl)

    // Response time
    totalChecks++
    if (responseTimeMs < 1500) { passedChecks++ }
    else if (responseTimeMs < 3000) { addIssue('medium', 'performance', 'Slow page load', `Homepage took ${responseTimeMs}ms to load (target: <1500ms).`, 'Optimize images, enable caching, and use a CDN.') }
    else if (responseTimeMs < 5000) { addIssue('high', 'performance', 'Very slow page load', `Homepage took ${responseTimeMs}ms to load (target: <1500ms).`, 'Investigate server response time, optimize database queries, and enable compression.') }
    else { addIssue('critical', 'performance', 'Extremely slow page load', `Homepage took ${responseTimeMs}ms to load (target: <1500ms).`, 'Server response is critically slow. Check server resources, CDN configuration, and third-party scripts.') }
  } catch (err) {
    httpStatus = 0
    addIssue('critical', 'security', 'Site unreachable via HTTPS', `Could not connect to ${baseUrl}: ${err.message}`, 'Ensure the site is accessible and SSL certificate is valid.')
  }

  // 2. HTTP to HTTPS redirect
  totalChecks++
  try {
    const res = await fetchWithTimeout(`http://${domain}`, { redirect: 'manual' }, 5000)
    const loc = res.headers.get('location') || ''
    if (loc.startsWith('https://')) { passedChecks++; hasRedirects = true }
    else addIssue('high', 'security', 'No HTTP to HTTPS redirect', 'The site does not redirect HTTP traffic to HTTPS.', 'Configure a 301 redirect from HTTP to HTTPS in your web server or hosting settings.')
  } catch {
    passedChecks++ // HTTP port might be closed, which is fine if HTTPS works
  }

  // 3. Parallel checks: robots.txt, sitemap.xml, favicon, llms.txt
  const [robotsRes, sitemapRes, faviconRes, llmsRes] = await Promise.allSettled([
    fetchWithTimeout(`${baseUrl}/robots.txt`, {}, 5000).then(async r => ({ ok: r.ok, text: r.ok ? await r.text() : '' })),
    fetchWithTimeout(`${baseUrl}/sitemap.xml`, {}, 5000).then(async r => ({ ok: r.ok, text: r.ok ? await r.text() : '' })),
    fetchWithTimeout(`${baseUrl}/favicon.ico`, { method: 'HEAD' }, 5000).then(r => ({ ok: r.ok })),
    fetchWithTimeout(`${baseUrl}/llms.txt`, {}, 5000).then(r => ({ ok: r.ok })),
  ])

  // robots.txt
  totalChecks++
  if (robotsRes.status === 'fulfilled' && robotsRes.value.ok) {
    passedChecks++
    const txt = robotsRes.value.text
    if (txt.includes('Disallow: /') && !txt.includes('Disallow: /wp-admin')) {
      addIssue('high', 'seo', 'robots.txt blocks all crawlers', 'Your robots.txt contains "Disallow: /" which blocks all search engine crawlers.', 'Update robots.txt to only block private directories, not the entire site.')
    }
  } else {
    addIssue('medium', 'seo', 'Missing robots.txt', 'No robots.txt file found. Search engines use this to understand crawling rules.', 'Create a robots.txt file with appropriate crawling directives.')
  }

  // sitemap.xml
  totalChecks++
  if (sitemapRes.status === 'fulfilled' && sitemapRes.value.ok) {
    const text = sitemapRes.value.text
    if (text.includes('<loc>') || text.includes('<urlset') || text.includes('<sitemapindex')) {
      passedChecks++
      const locCount = (text.match(/<loc>/g) || []).length
      if (locCount < 5) addIssue('low', 'seo', 'Small sitemap', `Sitemap has only ${locCount} URLs.`, 'Add more pages to your sitemap as your site grows.')
    } else {
      addIssue('medium', 'seo', 'Invalid sitemap format', 'sitemap.xml exists but does not appear to be valid XML.', 'Generate a proper XML sitemap using a sitemap generator tool.')
    }
  } else {
    addIssue('medium', 'seo', 'Missing sitemap.xml', 'No sitemap.xml found. Sitemaps help search engines discover and index your pages.', 'Create an XML sitemap and submit it to Google Search Console.')
  }

  // favicon
  totalChecks++
  if (faviconRes.status === 'fulfilled' && faviconRes.value.ok) passedChecks++
  else addIssue('low', 'seo', 'Missing favicon', 'No favicon.ico found. Favicons improve brand recognition in browser tabs and bookmarks.', 'Add a favicon.ico file to the root of your website.')

  // llms.txt
  totalChecks++
  if (llmsRes.status === 'fulfilled' && llmsRes.value.ok) passedChecks++
  else addIssue('info', 'seo', 'Missing llms.txt', 'No llms.txt file found. This file helps AI engines understand your site.', 'Create an llms.txt file with site information, services, and AI access policy.')

  // 5. HTML-based checks (only if we have HTML)
  if (htmlBody) {
    // Title
    totalChecks++
    const titleMatch = htmlBody.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    if (titleMatch) {
      const title = titleMatch[1].trim()
      if (title.length >= 30 && title.length <= 70) passedChecks++
      else if (title.length < 30) addIssue('medium', 'seo', 'Title tag too short', `Title is ${title.length} characters (recommended: 50-60).`, 'Write a descriptive title between 50-60 characters including your target keyword.')
      else addIssue('medium', 'seo', 'Title tag too long', `Title is ${title.length} characters (recommended: 50-60). May be truncated in search results.`, 'Shorten your title to 50-60 characters while keeping the target keyword.')
    } else {
      addIssue('critical', 'seo', 'Missing title tag', 'No <title> tag found. This is critical for search engine rankings.', 'Add a descriptive, keyword-rich title tag to every page.')
    }

    // Meta description
    totalChecks++
    const descMatch = htmlBody.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                      htmlBody.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)
    if (descMatch) {
      const desc = descMatch[1].trim()
      if (desc.length >= 70 && desc.length <= 170) passedChecks++
      else if (desc.length < 70) addIssue('medium', 'seo', 'Meta description too short', `Description is ${desc.length} characters (recommended: 150-160).`, 'Write a compelling meta description between 150-160 characters.')
      else addIssue('low', 'seo', 'Meta description too long', `Description is ${desc.length} characters (recommended: 150-160). May be truncated.`, 'Shorten your meta description to 150-160 characters.')
    } else {
      addIssue('high', 'seo', 'Missing meta description', 'No meta description tag found. Google uses this as the snippet in search results.', 'Add a unique, compelling meta description to every page.')
    }

    // Viewport
    totalChecks++
    if (/name=["']viewport["']/i.test(htmlBody)) passedChecks++
    else addIssue('high', 'mobile', 'Missing viewport meta tag', 'No viewport meta tag found. This is required for proper mobile rendering.', 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.')

    // OG tags
    totalChecks++
    const hasOgTitle = /property=["']og:title["']/i.test(htmlBody)
    const hasOgDesc = /property=["']og:description["']/i.test(htmlBody)
    const hasOgImage = /property=["']og:image["']/i.test(htmlBody)
    if (hasOgTitle && hasOgDesc && hasOgImage) passedChecks++
    else {
      const missing = []
      if (!hasOgTitle) missing.push('og:title')
      if (!hasOgDesc) missing.push('og:description')
      if (!hasOgImage) missing.push('og:image')
      addIssue('medium', 'seo', 'Missing Open Graph tags', `Missing: ${missing.join(', ')}. OG tags control how your pages appear when shared on social media.`, 'Add og:title, og:description, and og:image meta tags to all important pages.')
    }

    // Canonical
    totalChecks++
    if (/rel=["']canonical["']/i.test(htmlBody)) passedChecks++
    else addIssue('medium', 'seo', 'Missing canonical URL', 'No canonical link tag found. This can lead to duplicate content issues.', 'Add <link rel="canonical" href="..."> to specify the preferred URL for each page.')

    // H1
    totalChecks++
    const h1Matches = htmlBody.match(/<h1[\s>]/gi) || []
    if (h1Matches.length === 1) passedChecks++
    else if (h1Matches.length === 0) addIssue('high', 'seo', 'Missing H1 heading', 'No H1 heading found on the homepage. H1 is important for SEO and accessibility.', 'Add exactly one H1 heading that includes your primary keyword.')
    else addIssue('medium', 'seo', 'Multiple H1 headings', `Found ${h1Matches.length} H1 tags. Best practice is to have exactly one H1 per page.`, 'Use a single H1 for the main heading and H2-H6 for subheadings.')

    // Structured data
    totalChecks++
    if (/type=["']application\/ld\+json["']/i.test(htmlBody) || /itemscope/i.test(htmlBody)) passedChecks++
    else addIssue('medium', 'schema', 'No structured data found', 'No JSON-LD or microdata structured data detected. Structured data helps search engines understand your content.', 'Add JSON-LD structured data (Organization, WebSite, BreadcrumbList) to improve rich snippet eligibility.')

    // Content length
    totalChecks++
    const textOnly = htmlBody.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = textOnly.split(' ').filter(w => w.length > 0).length
    if (wordCount >= 300) passedChecks++
    else if (wordCount >= 100) addIssue('medium', 'seo', 'Thin content', `Homepage has approximately ${wordCount} words (recommended: 300+).`, 'Add more quality content to your homepage to improve topical relevance.')
    else addIssue('high', 'seo', 'Very thin content', `Homepage has approximately ${wordCount} words. This is too little for search engines.`, 'Significantly expand your homepage content with relevant, informative text.')

    // Images without alt
    totalChecks++
    const imgTags = htmlBody.match(/<img\s[^>]*>/gi) || []
    const noAlt = imgTags.filter(tag => !/alt=/i.test(tag)).length
    if (noAlt === 0) passedChecks++
    else addIssue(noAlt > 5 ? 'high' : 'medium', 'accessibility', `${noAlt} images missing alt text`, `Found ${noAlt} out of ${imgTags.length} images without alt attributes.`, 'Add descriptive alt text to all images for accessibility and SEO.')

    // Internal links
    totalChecks++
    const allLinks = htmlBody.match(/href=["']([^"'#]+)["']/gi) || []
    const internalLinks = allLinks.filter(l => l.includes(domain) || (l.match(/href=["']\//i) && !l.match(/href=["']\/\//i))).length
    if (internalLinks >= 3) passedChecks++
    else addIssue('medium', 'links', 'Few internal links', `Found only ${internalLinks} internal links on the homepage.`, 'Add more internal links to help users and search engines discover your content.')
  }

  // Calculate score
  const deductions = { critical: 15, high: 10, medium: 5, low: 2, info: 0 }
  let score = 100
  for (const issue of issues) {
    score -= deductions[issue.severity] || 0
  }
  score = Math.max(0, Math.min(100, score))

  const stats = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    info: issues.filter(i => i.severity === 'info').length,
    totalChecks,
    passedChecks,
  }

  return {
    domain,
    scannedAt: new Date().toISOString(),
    score,
    issues,
    stats,
    meta: { responseTimeMs, httpStatus, redirects: hasRedirects, ssl: hasSSL },
  }
}

// ---------------------------------------------------------------------------
// Main: Scan all domains and populate DB
// ---------------------------------------------------------------------------

async function main() {
  console.log('Fetching all clients...')
  const clientsRes = await fetch(`${SUPABASE_URL}/rest/v1/seo_clients?select=id,domain,business_name,site_url`, {
    headers: { 'apikey': SRK, 'Authorization': `Bearer ${SRK}` },
  })
  const clients = await clientsRes.json()
  console.log(`Found ${clients.length} clients\n`)

  for (const client of clients) {
    // Use domain field (plain domain name), not site_url (which has https://)
    const domain = client.domain
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Scanning: ${client.business_name} (${domain})`)
    console.log('='.repeat(60))

    try {
      const result = await scanDomain(domain)
      console.log(`  Score: ${result.score}/100`)
      console.log(`  Issues: ${result.stats.critical} critical, ${result.stats.high} high, ${result.stats.medium} medium, ${result.stats.low} low, ${result.stats.info} info`)
      console.log(`  Response: ${result.meta.httpStatus} in ${result.meta.responseTimeMs}ms | SSL: ${result.meta.ssl}`)

      // Delete old audit data for this client
      await fetch(`${SUPABASE_URL}/rest/v1/site_audits?client_id=eq.${client.id}`, {
        method: 'DELETE',
        headers,
      })

      // Insert new audit issues
      if (result.issues.length > 0) {
        const rows = result.issues.map(issue => ({
          client_id: client.id,
          audit_type: 'full',
          url: issue.url || `https://${domain}`,
          severity: issue.severity,
          category: issue.category,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          evidence: issue.evidence || {},
          is_fixed: false,
        }))

        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/site_audits`, {
          method: 'POST',
          headers,
          body: JSON.stringify(rows),
        })
        const insertData = await insertRes.json()
        console.log(`  Inserted ${Array.isArray(insertData) ? insertData.length : 0} audit issues`)
      } else {
        console.log('  No issues found!')
      }

      // Create scan_jobs entry
      const scanJob = {
        client_id: client.id,
        url: `https://${domain}`,
        depth: 'standard',
        status: 'completed',
        pages_scanned: 1,
        pages_total: 1,
        results: { score: result.score, meta: result.meta },
        stats: result.stats,
        issues_count: {
          critical: result.stats.critical,
          high: result.stats.high,
          medium: result.stats.medium,
          low: result.stats.low,
          info: result.stats.info,
        },
        crawl_duration_seconds: Math.ceil(result.meta.responseTimeMs / 1000),
        average_page_load_ms: result.meta.responseTimeMs,
        completed_at: new Date().toISOString(),
      }

      await fetch(`${SUPABASE_URL}/rest/v1/scan_jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(scanJob),
      })
      console.log('  Created scan_jobs entry')

      // Create agent_run entry
      const agentRun = {
        client_id: client.id,
        agent_type: 'audit-runner',
        agent_name: 'Audit Runner',
        status: 'completed',
        started_at: new Date(Date.now() - result.meta.responseTimeMs).toISOString(),
        completed_at: new Date().toISOString(),
        duration_ms: result.meta.responseTimeMs + 500,
        results: { score: result.score, issues_found: result.issues.length, stats: result.stats },
        triggered_by: 'manual',
        triggered_by_user: 'admin',
      }

      await fetch(`${SUPABASE_URL}/rest/v1/agent_runs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(agentRun),
      })
      console.log('  Created agent_runs entry')

    } catch (err) {
      console.error(`  ERROR scanning ${domain}: ${err.message}`)
    }
  }

  console.log('\n\nDone! All domains scanned.')
}

main().catch(console.error)
