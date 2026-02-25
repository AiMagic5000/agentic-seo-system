import type { Metadata } from 'next'
import { Fira_Sans, Fira_Code } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SMB Agentic SEO',
    template: '%s | SMB Agentic SEO',
  },
  description:
    'AI-powered SEO intelligence platform for growing businesses. Autonomous agents monitor, analyze, and optimize your search presence 24/7.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  keywords: [
    'SEO',
    'AI SEO',
    'keyword tracking',
    'search console',
    'agentic AI',
    'small business SEO',
    'SEO automation',
  ],
  authors: [{ name: 'Start My Business Inc.' }],
  creator: 'Start My Business Inc.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${firaSans.variable} ${firaCode.variable}`}
        suppressHydrationWarning
      >
        <head>
          <meta
            name="ai-content-declaration"
            content="AI-assisted SEO platform for small businesses"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body
          className="antialiased min-h-screen bg-slate-50"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
