import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// ---------------------------------------------------------------------------
// POST /api/sop/generate
//
// Generates a structured SOP (Standard Operating Procedure) document from
// unfixed audit issues stored in site_audits. Each issue gets 3-5 actionable
// steps based on its category, with code snippets and verification checks.
// ---------------------------------------------------------------------------

interface SOPStep {
  stepNumber: number
  instruction: string
  codeSnippet?: string
}

interface SOPItem {
  issueId: string
  title: string
  severity: string
  category: string
  description: string
  url: string | null
  steps: SOPStep[]
  verification: string[]
}

interface SOPDocument {
  clientId: string
  domain: string
  generatedAt: string
  totalIssues: number
  sections: {
    category: string
    label: string
    issueCount: number
    items: SOPItem[]
  }[]
}

interface GenerateRequestBody {
  clientId: string
}

// Category display labels
const CATEGORY_LABELS: Record<string, string> = {
  seo: 'SEO & On-Page Optimization',
  schema: 'Structured Data & Schema Markup',
  links: 'Link Architecture',
  security: 'Security & HTTPS',
  performance: 'Performance & Core Web Vitals',
  accessibility: 'Accessibility & Compliance',
  mobile: 'Mobile Optimization',
}

// ---------------------------------------------------------------------------
// SOP step generators per category
// ---------------------------------------------------------------------------

function generateSEOSteps(issue: Record<string, unknown>): SOPStep[] {
  const title = String(issue.title ?? '')
  const steps: SOPStep[] = []

  if (title.toLowerCase().includes('title')) {
    steps.push(
      {
        stepNumber: 1,
        instruction:
          'Open the page in your CMS or HTML editor and locate the <title> tag inside the <head> section.',
      },
      {
        stepNumber: 2,
        instruction:
          'Write a unique, keyword-rich title between 50-60 characters. Place the primary keyword near the beginning.',
        codeSnippet: '<title>Primary Keyword - Secondary Keyword | Brand Name</title>',
      },
      {
        stepNumber: 3,
        instruction:
          'Make sure the title accurately reflects the page content and does not duplicate titles from other pages on the site.',
      },
      {
        stepNumber: 4,
        instruction:
          'Save and deploy the change. Use Google Search Console URL Inspection to request re-indexing.',
      }
    )
  } else if (title.toLowerCase().includes('meta description')) {
    steps.push(
      {
        stepNumber: 1,
        instruction:
          'Locate the meta description tag in the page <head>. If it does not exist, add one.',
        codeSnippet:
          '<meta name="description" content="Your compelling description here (150-160 characters)">',
      },
      {
        stepNumber: 2,
        instruction:
          'Write an action-oriented description that includes the target keyword and a clear value proposition. Stay between 150-160 characters.',
      },
      {
        stepNumber: 3,
        instruction:
          'Avoid duplicate meta descriptions across pages. Each page should have a unique description.',
      }
    )
  } else if (title.toLowerCase().includes('h1')) {
    steps.push(
      {
        stepNumber: 1,
        instruction:
          'Inspect the page source and search for <h1> tags. There should be exactly one per page.',
        codeSnippet: '<h1>Your Page Main Heading with Target Keyword</h1>',
      },
      {
        stepNumber: 2,
        instruction:
          'If multiple H1 tags exist, change the extras to <h2> or lower. If no H1 exists, wrap the main heading in an <h1> tag.',
      },
      {
        stepNumber: 3,
        instruction:
          'The H1 should clearly describe the page topic and include the primary keyword naturally.',
      }
    )
  } else if (title.toLowerCase().includes('canonical')) {
    steps.push(
      {
        stepNumber: 1,
        instruction:
          'Add a canonical link tag in the <head> of the page pointing to the preferred URL.',
        codeSnippet:
          '<link rel="canonical" href="https://yourdomain.com/preferred-page-url">',
      },
      {
        stepNumber: 2,
        instruction:
          'Ensure the canonical URL matches the live URL exactly (protocol, www vs non-www, trailing slash).',
      },
      {
        stepNumber: 3,
        instruction:
          'If the page has paginated versions, set the canonical to the first page or a "view all" page.',
      }
    )
  } else {
    steps.push(
      {
        stepNumber: 1,
        instruction: `Review the issue: "${title}". Identify the affected page or element.`,
      },
      {
        stepNumber: 2,
        instruction:
          String(issue.recommendation ?? 'Apply the recommended fix as described in the audit findings.'),
      },
      {
        stepNumber: 3,
        instruction:
          'Test the fix by viewing the page source and confirming the change is present.',
      }
    )
  }

  return steps
}

function generateSchemaSteps(issue: Record<string, unknown>): SOPStep[] {
  return [
    {
      stepNumber: 1,
      instruction:
        'Determine the most relevant schema type for this page (Organization, WebPage, FAQPage, Product, LocalBusiness, etc.).',
    },
    {
      stepNumber: 2,
      instruction:
        'Create a JSON-LD script block and add it before the closing </head> tag.',
      codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "description": "Page description",
  "url": "https://yourdomain.com/page",
  "publisher": {
    "@type": "Organization",
    "name": "Your Business",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/logo.png"
    }
  }
}
</script>`,
    },
    {
      stepNumber: 3,
      instruction:
        'Validate the markup using Google Rich Results Test (https://search.google.com/test/rich-results) and fix any errors.',
    },
    {
      stepNumber: 4,
      instruction:
        'For FAQ pages, add FAQPage schema with at least 5 questions for maximum rich result coverage.',
      codeSnippet: `{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Your question here?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your answer here."
      }
    }
  ]
}`,
    },
    {
      stepNumber: 5,
      instruction:
        `Deploy and request re-indexing via Google Search Console. Monitor the Rich Results report for new enhancements.`,
    },
  ]
}

function generateLinksSteps(issue: Record<string, unknown>): SOPStep[] {
  const title = String(issue.title ?? '').toLowerCase()

  if (title.includes('internal')) {
    return [
      {
        stepNumber: 1,
        instruction:
          'Identify 3-5 related pages on your site that are topically relevant to this page.',
      },
      {
        stepNumber: 2,
        instruction:
          'Add contextual anchor text links within the body content pointing to those pages. Use descriptive anchor text instead of "click here".',
        codeSnippet:
          '<a href="/related-service">learn more about our related service</a>',
      },
      {
        stepNumber: 3,
        instruction:
          'Review your site navigation and footer links to ensure all high-priority pages are reachable within 3 clicks from the homepage.',
      },
    ]
  }

  return [
    {
      stepNumber: 1,
      instruction: `Review the link issue: "${issue.title}". Identify the broken or problematic links on the page.`,
    },
    {
      stepNumber: 2,
      instruction:
        'For broken links (404s), either update the href to the correct destination or remove the link entirely.',
    },
    {
      stepNumber: 3,
      instruction:
        'Run a crawl tool (Screaming Frog, Ahrefs, or the built-in scanner) to find all broken links site-wide and fix them in bulk.',
    },
  ]
}

function generateSecuritySteps(issue: Record<string, unknown>): SOPStep[] {
  return [
    {
      stepNumber: 1,
      instruction:
        'Verify your SSL certificate is valid and not expired. Use SSL Labs (https://www.ssllabs.com/ssltest/) for a full test.',
    },
    {
      stepNumber: 2,
      instruction:
        'Set up a 301 redirect from HTTP to HTTPS in your server config or .htaccess file.',
      codeSnippet: `# Apache .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}`,
    },
    {
      stepNumber: 3,
      instruction:
        'Add HSTS (HTTP Strict Transport Security) headers to prevent future HTTP access.',
      codeSnippet:
        'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    },
    {
      stepNumber: 4,
      instruction:
        'Update all internal links and resources (images, scripts, stylesheets) to use https:// URLs. Fix any mixed content warnings.',
    },
  ]
}

function generatePerformanceSteps(issue: Record<string, unknown>): SOPStep[] {
  return [
    {
      stepNumber: 1,
      instruction:
        'Run Google PageSpeed Insights (https://pagespeed.web.dev/) and note the specific recommendations.',
    },
    {
      stepNumber: 2,
      instruction:
        'Optimize images: convert to WebP/AVIF, compress to under 200KB each, and add width/height attributes to prevent layout shift.',
      codeSnippet:
        '<img src="image.webp" alt="description" width="800" height="600" loading="lazy">',
    },
    {
      stepNumber: 3,
      instruction:
        'Enable lazy loading for images and iframes below the fold using the loading="lazy" attribute.',
    },
    {
      stepNumber: 4,
      instruction:
        'Minify CSS and JavaScript. Enable Gzip or Brotli compression on your server. Add cache-control headers for static assets.',
      codeSnippet: `# Nginx gzip config
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_min_length 1000;`,
    },
    {
      stepNumber: 5,
      instruction:
        'Consider using a CDN (Cloudflare, Fastly) to reduce TTFB and serve assets from edge locations close to your users.',
    },
  ]
}

function generateAccessibilitySteps(
  issue: Record<string, unknown>
): SOPStep[] {
  return [
    {
      stepNumber: 1,
      instruction:
        'Audit all images on the page and add descriptive alt attributes to each one. Decorative images should use alt="".',
      codeSnippet:
        '<img src="product.jpg" alt="Blue running shoes, side view, Nike Air Max">',
    },
    {
      stepNumber: 2,
      instruction:
        'Add ARIA labels to interactive elements that lack visible text (icon buttons, hamburger menus, search toggles).',
      codeSnippet:
        '<button aria-label="Open navigation menu"><svg>...</svg></button>',
    },
    {
      stepNumber: 3,
      instruction:
        'Check color contrast ratios using WebAIM Contrast Checker. Text must meet WCAG AA: 4.5:1 for normal text, 3:1 for large text.',
    },
    {
      stepNumber: 4,
      instruction:
        'Ensure all form inputs have associated <label> elements and the page can be fully navigated using only the keyboard (Tab, Enter, Escape).',
    },
  ]
}

function generateStepsForIssue(
  issue: Record<string, unknown>
): SOPStep[] {
  const category = String(issue.category ?? '')

  switch (category) {
    case 'seo':
      return generateSEOSteps(issue)
    case 'schema':
      return generateSchemaSteps(issue)
    case 'links':
      return generateLinksSteps(issue)
    case 'security':
      return generateSecuritySteps(issue)
    case 'performance':
      return generatePerformanceSteps(issue)
    case 'accessibility':
      return generateAccessibilitySteps(issue)
    case 'mobile':
      return [
        {
          stepNumber: 1,
          instruction:
            'Add the viewport meta tag to the <head> if missing.',
          codeSnippet:
            '<meta name="viewport" content="width=device-width, initial-scale=1">',
        },
        {
          stepNumber: 2,
          instruction:
            'Test the page on mobile devices using Chrome DevTools device emulation. Fix any horizontal scrolling or overlapping elements.',
        },
        {
          stepNumber: 3,
          instruction:
            'Ensure tap targets (buttons, links) are at least 48x48 pixels and have sufficient spacing between them.',
        },
      ]
    default:
      return [
        {
          stepNumber: 1,
          instruction: `Review the issue: "${issue.title}".`,
        },
        {
          stepNumber: 2,
          instruction: String(
            issue.recommendation ?? 'Apply the recommended fix.'
          ),
        },
        {
          stepNumber: 3,
          instruction:
            'Verify the fix by re-running the SEO scanner.',
        },
      ]
  }
}

function generateVerificationSteps(category: string): string[] {
  const common = ['Re-run the SEO scanner to confirm the issue is resolved.']

  switch (category) {
    case 'seo':
      return [
        'View page source and confirm the updated tags are present.',
        'Use Google Search Console URL Inspection to validate the changes.',
        ...common,
      ]
    case 'schema':
      return [
        'Validate with Google Rich Results Test.',
        'Check Schema.org validator for syntax errors.',
        ...common,
      ]
    case 'links':
      return [
        'Click every modified link to confirm it loads the correct destination.',
        'Run a site crawl to verify no new broken links were introduced.',
        ...common,
      ]
    case 'security':
      return [
        'Visit the site via http:// and confirm it redirects to https://.',
        'Check SSL Labs for an A or A+ rating.',
        ...common,
      ]
    case 'performance':
      return [
        'Run PageSpeed Insights and confirm the score improved.',
        'Test on a 3G throttled connection to verify acceptable load times.',
        ...common,
      ]
    case 'accessibility':
      return [
        'Run WAVE or axe accessibility checker and confirm zero critical errors.',
        'Navigate the entire page using only the keyboard.',
        ...common,
      ]
    default:
      return common
  }
}

/**
 * POST /api/sop/generate
 *
 * Fetches all unfixed audit issues for a client, groups them by category,
 * and generates a structured SOP document with step-by-step fixes.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: GenerateRequestBody = await request.json()
    const { clientId } = body

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'clientId is required' },
        { status: 400 }
      )
    }

    // Verify client and ownership
    const { data: client, error: clientError } = await supabaseAdmin
      .from('seo_clients')
      .select('id, domain, business_name, owner_clerk_id')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!user.isAdmin && client.owner_clerk_id !== user.clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Fetch all unfixed audit issues
    const { data: issues, error: issuesError } = await supabaseAdmin
      .from('site_audits')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_fixed', false)
      .order('created_at', { ascending: false })

    if (issuesError) {
      return NextResponse.json(
        { success: false, error: issuesError.message },
        { status: 500 }
      )
    }

    const allIssues = issues ?? []

    if (allIssues.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          clientId,
          domain: client.domain,
          generatedAt: new Date().toISOString(),
          totalIssues: 0,
          sections: [],
          message: 'No unfixed issues found. The site is in good shape.',
        },
      })
    }

    // Group issues by category
    const grouped: Record<string, Record<string, unknown>[]> = {}
    for (const issue of allIssues) {
      const cat = issue.category ?? 'other'
      if (!grouped[cat]) {
        grouped[cat] = []
      }
      grouped[cat].push(issue)
    }

    // Build SOP sections
    const sections: SOPDocument['sections'] = Object.entries(grouped).map(
      ([category, categoryIssues]) => ({
        category,
        label: CATEGORY_LABELS[category] ?? category,
        issueCount: categoryIssues.length,
        items: categoryIssues.map((issue) => ({
          issueId: String(issue.id),
          title: String(issue.title ?? ''),
          severity: String(issue.severity ?? 'medium'),
          category,
          description: String(issue.description ?? ''),
          url: issue.url ? String(issue.url) : null,
          steps: generateStepsForIssue(issue),
          verification: generateVerificationSteps(category),
        })),
      })
    )

    // Sort sections by severity weight so critical categories appear first
    const severityOrder: Record<string, number> = {
      security: 1,
      performance: 2,
      seo: 3,
      schema: 4,
      links: 5,
      accessibility: 6,
      mobile: 7,
    }

    sections.sort(
      (a, b) =>
        (severityOrder[a.category] ?? 99) -
        (severityOrder[b.category] ?? 99)
    )

    const sopDocument: SOPDocument = {
      clientId,
      domain: client.domain,
      generatedAt: new Date().toISOString(),
      totalIssues: allIssues.length,
      sections,
    }

    return NextResponse.json({
      success: true,
      data: sopDocument,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate SOP'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
