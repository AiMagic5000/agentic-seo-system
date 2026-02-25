"use client"

import Link from "next/link"
import { useState } from "react"
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
} from "lucide-react"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
]

const FEATURES = [
  {
    icon: Search,
    color: "#1a73e8",
    title: "Keyword Intelligence",
    description:
      "AI-powered keyword discovery and tracking across all your client sites. Uncover gaps your competitors missed.",
  },
  {
    icon: FileText,
    color: "#1e8e3e",
    title: "Content Optimizer",
    description:
      "Auto-generate SEO briefs and optimize existing content with AI recommendations tied directly to ranking data.",
  },
  {
    icon: Shield,
    color: "#d93025",
    title: "Technical Auditor",
    description:
      "Crawl every site and surface technical SEO issues automatically - broken links, slow pages, missing meta tags, and more.",
  },
  {
    icon: Eye,
    color: "#f9ab00",
    title: "Competitor Watcher",
    description:
      "Monitor competitor rankings, content gaps, and backlink changes. Know what your rivals are doing before your clients ask.",
  },
  {
    icon: Bot,
    color: "#9334e6",
    title: "AI Agent Console",
    description:
      "6 autonomous agents working on your SEO 24/7. Each agent specializes in a different dimension of search optimization.",
  },
  {
    icon: BarChart3,
    color: "#1a73e8",
    title: "Automated Reports",
    description:
      "Weekly PDF reports delivered to your inbox and your clients. White-label ready, branded to your agency.",
  },
]

const STEPS = [
  {
    number: "01",
    color: "#1a73e8",
    icon: Globe,
    title: "Connect Your Sites",
    description:
      "Link Google Search Console, add your domains, and import your existing keyword lists. Setup takes under 5 minutes.",
  },
  {
    number: "02",
    color: "#1e8e3e",
    icon: Zap,
    title: "AI Agents Activate",
    description:
      "6 specialized agents immediately begin scanning, ranking, and optimizing across every connected property.",
  },
  {
    number: "03",
    color: "#9334e6",
    icon: TrendingUp,
    title: "Watch Rankings Climb",
    description:
      "Track keyword movements, content improvements, and technical fixes with real-time dashboards updated daily.",
  },
]

const TRUSTED_DOMAINS = [
  "assetrecoverybusiness.com",
  "usmortgagerecovery.com",
  "startmybusiness.us",
  "usforeclosureleads.com",
  "usforeclosurerecovery.com",
  "scorewise.app",
]

const FREE_FEATURES = [
  "Up to 2 websites",
  "100 keywords tracked",
  "All 6 AI agents",
  "Daily site scans",
  "7 days full access",
  "No credit card required",
]

const PRO_FEATURES = [
  "Unlimited websites",
  "Unlimited keywords",
  "Priority agent processing",
  "Custom branded reports",
  "API access",
  "Dedicated support",
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-[var(--font-inter)]">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#dadce0]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#1a73e8" }}
            >
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#202124] font-semibold text-lg tracking-tight">
              SMB Agentic SEO
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#5f6368] hover:text-[#202124] font-medium transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[#1a73e8] hover:text-[#1557b0] transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
              style={{ backgroundColor: "#1a73e8" }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1557b0")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a73e8")}
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-[#5f6368] hover:bg-[#f1f3f4] transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#dadce0] bg-white px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#5f6368] hover:text-[#202124] cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="border-[#dadce0]" />
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[#1a73e8] cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium text-white px-4 py-2 rounded-md text-center cursor-pointer"
              style={{ backgroundColor: "#1a73e8" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#dadce0] bg-[#f8f9fa] mb-8">
            <Bot className="w-3.5 h-3.5" style={{ color: "#1a73e8" }} />
            <span className="text-xs font-medium text-[#5f6368]">
              6 AI Agents. 24/7 Automation.
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#202124] leading-tight mb-6">
            AI-Powered SEO That Works{" "}
            <span style={{ color: "#1a73e8" }}>While You Sleep</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#5f6368] max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate keyword research, rank tracking, content optimization, and technical audits
            across all your client websites. 6 AI agents working 24/7.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium text-white transition-colors cursor-pointer text-base"
              style={{ backgroundColor: "#1a73e8" }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1557b0")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a73e8")}
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium text-[#1a73e8] border border-[#1a73e8] hover:bg-[#e8f0fe] transition-colors cursor-pointer text-base"
            >
              Watch Demo
            </a>
          </div>

          {/* Dashboard preview */}
          <div className="relative rounded-xl border border-[#dadce0] shadow-[0_8px_32px_rgba(60,64,67,0.12)] overflow-hidden bg-[#f8f9fa]">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-white border-b border-[#dadce0]">
              <div className="w-3 h-3 rounded-full bg-[#d93025] opacity-70" />
              <div className="w-3 h-3 rounded-full bg-[#f9ab00] opacity-70" />
              <div className="w-3 h-3 rounded-full bg-[#1e8e3e] opacity-70" />
              <div className="ml-4 flex-1 h-6 rounded bg-[#f1f3f4] border border-[#dadce0] flex items-center px-3">
                <span className="text-xs text-[#80868b]">app.smbagenticseo.com/dashboard</span>
              </div>
            </div>

            {/* Dashboard content mockup */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {/* Stat cards */}
              {[
                { label: "Keywords Tracked", value: "2,847", color: "#1a73e8" },
                { label: "Avg. Position", value: "14.2", color: "#1e8e3e" },
                { label: "Content Score", value: "87%", color: "#f9ab00" },
                { label: "Issues Fixed", value: "142", color: "#9334e6" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-lg border border-[#dadce0] p-4 text-left shadow-[0_1px_2px_rgba(60,64,67,0.1)]"
                >
                  <div className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#80868b] mt-1">{stat.label}</div>
                </div>
              ))}

              {/* Chart placeholder */}
              <div className="col-span-3 bg-white rounded-lg border border-[#dadce0] p-4 shadow-[0_1px_2px_rgba(60,64,67,0.1)]">
                <div className="text-sm font-medium text-[#202124] mb-3">Ranking Trends</div>
                <div className="flex items-end gap-1.5 h-20">
                  {[40, 55, 48, 60, 52, 70, 65, 80, 72, 85, 78, 92].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i >= 9 ? "#1a73e8" : "#e8f0fe",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Agent status */}
              <div className="bg-white rounded-lg border border-[#dadce0] p-4 shadow-[0_1px_2px_rgba(60,64,67,0.1)]">
                <div className="text-sm font-medium text-[#202124] mb-3">Agents</div>
                <div className="flex flex-col gap-2">
                  {["Keyword", "Content", "Technical", "Competitor"].map((agent) => (
                    <div key={agent} className="flex items-center justify-between">
                      <span className="text-xs text-[#5f6368]">{agent}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-[#dadce0] bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-medium text-[#80868b] uppercase tracking-wider mb-8">
            Trusted by growing businesses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {TRUSTED_DOMAINS.map((domain) => (
              <span
                key={domain}
                className="px-4 py-2 rounded-md border border-[#dadce0] bg-white text-sm font-medium text-[#5f6368] shadow-[0_1px_2px_rgba(60,64,67,0.1)]"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#202124] mb-4">
              Everything your SEO operation needs
            </h2>
            <p className="text-lg text-[#5f6368] max-w-2xl mx-auto">
              One platform. Six AI agents. Complete SEO automation from discovery to reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white border border-[#dadce0] rounded-lg p-6 shadow-[0_1px_2px_rgba(60,64,67,0.1)] hover:shadow-[0_4px_12px_rgba(60,64,67,0.15)] transition-shadow"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: feature.color + "15" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-[#202124] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#5f6368] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#202124] mb-4">
              Up and running in minutes
            </h2>
            <p className="text-lg text-[#5f6368] max-w-xl mx-auto">
              Three steps from signup to fully automated SEO across every site you manage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative text-center">
                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] right-0 h-px bg-[#dadce0]" />
                  )}

                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2"
                    style={{
                      borderColor: step.color,
                      backgroundColor: step.color + "10",
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>

                  <div
                    className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-3"
                    style={{ backgroundColor: step.color + "15", color: step.color }}
                  >
                    Step {step.number}
                  </div>

                  <h3 className="text-lg font-semibold text-[#202124] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#5f6368] leading-relaxed max-w-xs mx-auto">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-[#202124] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[#5f6368]">
              Start free. Upgrade when you are ready to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            {/* Free Trial */}
            <div className="bg-white border border-[#dadce0] rounded-lg p-8 shadow-[0_1px_2px_rgba(60,64,67,0.1)]">
              <div className="mb-6">
                <div className="text-sm font-medium text-[#5f6368] uppercase tracking-wider mb-2">
                  Free Trial
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#202124]">$0</span>
                  <span className="text-[#80868b] text-sm">/ 7 days</span>
                </div>
                <p className="text-sm text-[#5f6368] mt-2">
                  Full access to every feature. No credit card required.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#1e8e3e" }} />
                    <span className="text-sm text-[#5f6368]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full text-center px-6 py-3 rounded-md font-medium border border-[#1a73e8] text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors cursor-pointer text-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div
              className="rounded-lg p-8 relative overflow-hidden"
              style={{ backgroundColor: "#1a73e8" }}
            >
              {/* Popular badge */}
              <div className="absolute top-4 right-4 bg-white text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: "#1a73e8" }}>
                Most Popular
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium text-blue-200 uppercase tracking-wider mb-2">
                  Pro
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-blue-200 text-sm">/ month</span>
                </div>
                <p className="text-sm text-blue-100 mt-2">
                  Everything you need to run SEO at scale.
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-4 h-4 flex-shrink-0 text-white opacity-90" />
                    <span className="text-sm text-blue-50">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block w-full text-center px-6 py-3 rounded-md font-medium bg-white transition-colors cursor-pointer text-sm hover:bg-blue-50"
                style={{ color: "#1a73e8" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f8f9fa] border-t border-[#dadce0]">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#1a73e8" }}
          >
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#202124] mb-4">
            Ready to automate your SEO?
          </h2>
          <p className="text-lg text-[#5f6368] mb-8">
            Join businesses that run their entire SEO operation on autopilot.
            Your first 7 days are completely free.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-md font-medium text-white transition-colors cursor-pointer text-base"
            style={{ backgroundColor: "#1a73e8" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1557b0")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a73e8")}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-[#80868b] mt-4">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#dadce0] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: "#1a73e8" }}
            >
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#202124]">SMB Agentic SEO</span>
            <span className="text-sm text-[#80868b]">
              &copy; {new Date().getFullYear()} Start My Business Inc.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
            >
              Terms
            </Link>
            <a
              href="mailto:support@startmybusiness.us"
              className="text-sm text-[#5f6368] hover:text-[#202124] transition-colors cursor-pointer"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
