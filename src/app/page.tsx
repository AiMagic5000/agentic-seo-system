'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Activity,
  Search,
  FileText,
  Shield,
  Eye,
  Bot,
  BarChart3,
  ArrowRight,
  Check,
  Zap,
  Globe,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

const FEATURES = [
  {
    icon: Search,
    color: '#1E40AF',
    bg: '#EFF6FF',
    title: 'Google Search Console Integration',
    description:
      'Real GSC data. Track keyword positions, clicks, and impressions across every domain you manage. No sampling, no delays.',
  },
  {
    icon: Bot,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'AI-Powered Agents',
    description:
      '6 autonomous agents running 24/7. Keyword Scout, Rank Tracker, Content Optimizer, Technical Auditor, Competitor Watcher, and Report Generator.',
  },
  {
    icon: Eye,
    color: '#DC2626',
    bg: '#FEF2F2',
    title: 'Competitor Intelligence',
    description:
      'Gap analysis, threat monitoring, and keyword overlap tracking against your top competitors. Know every move they make.',
  },
  {
    icon: Shield,
    color: '#059669',
    bg: '#ECFDF5',
    title: 'Technical Site Audits',
    description:
      'Automated crawling surfaces broken links, missing meta tags, Core Web Vital failures, and schema markup errors automatically.',
  },
  {
    icon: FileText,
    color: '#D97706',
    bg: '#FFFBEB',
    title: 'Content Optimization',
    description:
      'AI-generated content briefs mapped to real keyword data. Score your pages and identify exactly what to improve.',
  },
  {
    icon: BarChart3,
    color: '#0284C7',
    bg: '#F0F9FF',
    title: 'Executive Reports',
    description:
      'AI-generated weekly and monthly reports delivered automatically. White-label ready and branded to your agency.',
  },
]

const STEPS = [
  {
    number: '01',
    color: '#1E40AF',
    bg: '#EFF6FF',
    icon: Globe,
    title: 'Connect GSC',
    description:
      'Link Google Search Console, add your domains, and import existing keyword lists. Setup takes under 5 minutes.',
  },
  {
    number: '02',
    color: '#059669',
    bg: '#ECFDF5',
    icon: Zap,
    title: 'AI Agents Analyze',
    description:
      '6 specialized agents immediately begin scanning, ranking, and optimizing across every connected property.',
  },
  {
    number: '03',
    color: '#7C3AED',
    bg: '#F5F3FF',
    icon: TrendingUp,
    title: 'Get Actionable Insights',
    description:
      'Track keyword movements, content improvements, and technical fixes with real-time dashboards updated daily.',
  },
]

const TRUSTED_DOMAINS = [
  'assetrecoverybusiness.com',
  'usmortgagerecovery.com',
  'startmybusiness.us',
  'usforeclosureleads.com',
  'usforeclosurerecovery.com',
  'scorewise.app',
]

const FREE_FEATURES = [
  '1 website',
  '100 keywords tracked',
  'All 6 AI agents',
  'Daily site scans',
  '7 days full access',
  'No credit card required',
]

const PRO_FEATURES = [
  'Unlimited websites',
  'Unlimited keywords',
  'Priority agent processing',
  'Custom branded reports',
  'API access',
  'Dedicated support',
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Sticky Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-700">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-slate-900 font-semibold text-base tracking-tight"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              SMB Agentic SEO
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors duration-150 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition-all duration-150 cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold text-white px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all duration-150 cursor-pointer"
            >
              Start Free Trial
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-slate-200" />
            <Link
              href="/sign-in"
              className="text-sm font-medium text-blue-700 cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold text-white px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-center cursor-pointer transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 mb-6">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  6 AI Agents. 24/7 Automation.
                </span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                AI-Powered SEO Intelligence{' '}
                <span className="text-blue-700">for Growing Businesses</span>
              </h1>

              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Automate keyword research, rank tracking, content optimization, and
                technical audits across all your websites. Six AI agents working
                around the clock so you don't have to.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all duration-150 cursor-pointer text-sm"
                >
                  Start 7-Day Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 transition-all duration-150 cursor-pointer text-sm"
                >
                  Watch Demo
                </a>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  7 days free
                </span>
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="relative">
              <div className="rounded-xl border border-slate-200 shadow-xl overflow-hidden bg-slate-50">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-b border-slate-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div className="ml-3 flex-1 h-5 rounded bg-slate-100 border border-slate-200 flex items-center px-2">
                    <span className="text-[10px] text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
                      app.seo.startmybusiness.us/dashboard
                    </span>
                  </div>
                </div>

                {/* Stat row */}
                <div className="p-3 grid grid-cols-4 gap-2">
                  {[
                    { label: 'Keywords', value: '2,847', color: '#1E40AF', bg: '#EFF6FF' },
                    { label: 'Avg Position', value: '#14.2', color: '#059669', bg: '#ECFDF5' },
                    { label: 'Health Score', value: '87', color: '#D97706', bg: '#FFFBEB' },
                    { label: 'Issues', value: '12', color: '#DC2626', bg: '#FEF2F2' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg p-2.5 text-left"
                      style={{ backgroundColor: stat.bg }}
                    >
                      <div
                        className="text-lg font-bold tabular-nums"
                        style={{ color: stat.color, fontFamily: 'var(--font-mono)' }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="px-3 pb-2">
                  <div className="bg-white rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700">Organic Clicks (28d)</span>
                      <span className="text-[10px] text-emerald-600 font-medium">+18.4%</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {[30, 42, 38, 50, 44, 58, 52, 66, 60, 72, 68, 80, 74, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm transition-all"
                          style={{
                            height: `${h}%`,
                            backgroundColor: i >= 11 ? '#3B82F6' : '#DBEAFE',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-slate-300">Jan 28</span>
                      <span className="text-[9px] text-slate-300">Feb 24</span>
                    </div>
                  </div>
                </div>

                {/* Agent status row */}
                <div className="px-3 pb-3">
                  <div className="bg-white rounded-lg border border-slate-100 p-3">
                    <div className="text-xs font-semibold text-slate-700 mb-2">Agent Status</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { name: 'Keyword Scout', status: 'running' },
                        { name: 'Rank Tracker', status: 'ok' },
                        { name: 'Content Opt.', status: 'ok' },
                        { name: 'Tech Auditor', status: 'ok' },
                        { name: 'Competitor', status: 'ok' },
                        { name: 'Reports', status: 'ok' },
                      ].map((agent) => (
                        <div
                          key={agent.name}
                          className="flex items-center gap-1 px-1.5 py-1 rounded bg-slate-50"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                agent.status === 'running' ? '#3B82F6' : '#10B981',
                            }}
                          />
                          <span className="text-[9px] text-slate-500 truncate">{agent.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-y border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
            Trusted by teams managing 50+ domains
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TRUSTED_DOMAINS.map((domain) => (
              <span
                key={domain}
                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-500 shadow-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything your SEO operation needs
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              One platform. Six AI agents. Complete automation from discovery to reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 group"
                  style={{ borderLeftWidth: '3px', borderLeftColor: feature.color }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: feature.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Up and running in minutes
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Three steps from signup to fully automated SEO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-slate-200" />
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2"
                    style={{ borderColor: step.color, backgroundColor: step.bg }}
                  >
                    <Icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  <div
                    className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-3"
                    style={{ backgroundColor: step.bg, color: step.color }}
                  >
                    Step {step.number}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-500">Start free. Upgrade when you're ready to scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Free Trial */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="mb-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Free Trial
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold text-slate-900"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    $0
                  </span>
                  <span className="text-slate-400 text-sm">/ 7 days</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Full access to every feature. No credit card required.
                </p>
              </div>

              <ul className="space-y-2.5 mb-8">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full text-center px-6 py-2.5 rounded-lg font-semibold border border-amber-400 text-amber-600 hover:bg-amber-50 transition-all duration-150 cursor-pointer text-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-xl p-8 relative overflow-hidden bg-blue-700 text-white">
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">
                Most Popular
              </div>

              <div className="mb-6">
                <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                  Pro
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    $49
                  </span>
                  <span className="text-blue-200 text-sm">/ month</span>
                </div>
                <p className="text-sm text-blue-100 mt-2">
                  Everything you need to run SEO at scale.
                </p>
              </div>

              <ul className="space-y-2.5 mb-8">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 flex-shrink-0 text-blue-200" />
                    <span className="text-sm text-blue-50">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full text-center px-6 py-2.5 rounded-lg font-semibold bg-white text-blue-700 hover:bg-blue-50 transition-all duration-150 cursor-pointer text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-blue-700">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to automate your SEO?
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Join businesses running their entire SEO operation on autopilot. Your first 7 days are free.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition-all duration-150 cursor-pointer text-base"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-slate-400 mt-4">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-700">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">SMB Agentic SEO</span>
            <span className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} Start My Business Inc.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms
            </Link>
            <a
              href="mailto:support@startmybusiness.us"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
