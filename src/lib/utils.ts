import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names intelligently.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-blue-600', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format a raw number with K/M suffix for compact display.
 * e.g. 1234 -> "1.2K", 2500000 -> "2.5M"
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`
  }
  return n.toLocaleString()
}

/**
 * Format a number with compact notation via Intl (alias for formatNumber).
 * e.g. 1234 -> "1.2K"
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format a decimal fraction as a percentage string.
 * Accepts both 0-1 range (e.g. 0.032) and 0-100 range (e.g. 3.2).
 * Values <= 1 are treated as 0-1 range and multiplied by 100.
 * e.g. 0.032 -> "3.2%", 3.2 -> "3.2%"
 */
export function formatPercent(n: number): string {
  const pct = n <= 1 ? n * 100 : n
  return `${pct.toFixed(1)}%`
}

/**
 * Format an average position with a leading "#" prefix.
 * Rounds to one decimal place.
 * e.g. 4.2 -> "#4.2", 1 -> "#1.0"
 */
export function formatPosition(n: number): string {
  return `#${n.toFixed(1)}`
}

/**
 * Return a Tailwind text-color class based on search ranking position.
 * 1-3   -> green  (top 3)
 * 4-10  -> blue   (page 1)
 * 11-20 -> yellow (page 2)
 * 21+   -> red    (page 3+)
 */
export function getPositionColor(pos: number): string {
  if (pos <= 3) return 'text-green-500'
  if (pos <= 10) return 'text-blue-500'
  if (pos <= 20) return 'text-yellow-500'
  return 'text-red-500'
}

/**
 * Return an arrow symbol and a Tailwind text-color class for a numeric change.
 * Positive change (improvement) -> up arrow, green.
 * Negative change (decline) -> down arrow, red.
 * Zero change -> dash, gray.
 *
 * NOTE: For positions, a lower number is better. Callers that want
 * "lower position = improvement" should negate the value before passing.
 */
export function getChangeIndicator(change: number): { arrow: string; color: string } {
  if (change > 0) return { arrow: '↑', color: 'text-green-500' }
  if (change < 0) return { arrow: '↓', color: 'text-red-500' }
  return { arrow: '—', color: 'text-gray-400' }
}

/**
 * Truncate a URL for display, stripping the protocol and keeping the
 * path short. Defaults to 50 characters.
 * e.g. "https://www.example.com/very/long/path/here" -> "example.com/very/long..."
 */
export function truncateUrl(url: string, max = 50): string {
  try {
    const { host, pathname } = new URL(url)
    const clean = `${host}${pathname}`.replace(/\/$/, '')
    if (clean.length <= max) return clean
    return `${clean.slice(0, max - 3)}...`
  } catch {
    // Not a valid URL -- truncate raw string
    if (url.length <= max) return url
    return `${url.slice(0, max - 3)}...`
  }
}

/**
 * Calculate a composite SEO health score (0-100) from three signals.
 * - avgPosition: ideal is 1; penalizes scores above 10 heavily
 * - totalClicks: rewards higher click volume
 * - issueCount: each technical issue subtracts points
 */
export function calculateHealthScore(metrics: {
  avgPosition: number
  totalClicks: number
  issueCount: number
}): number {
  const { avgPosition, totalClicks, issueCount } = metrics

  // Position score: 100 at pos 1, 0 at pos 50+
  const positionScore = Math.max(0, 100 - (avgPosition - 1) * 2)

  // Click score: logarithmic scale, capped at 100
  const clickScore = Math.min(100, Math.log10(Math.max(1, totalClicks)) * 25)

  // Issue penalty: each issue costs 5 points, max penalty 50
  const issuePenalty = Math.min(50, issueCount * 5)

  const raw = positionScore * 0.4 + clickScore * 0.4 - issuePenalty * 0.2
  return Math.round(Math.max(0, Math.min(100, raw)))
}

/**
 * Return a human-readable "time ago" string for a given date.
 * e.g. "2 hours ago", "3 days ago", "just now"
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)

  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`

  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} ago`
}
