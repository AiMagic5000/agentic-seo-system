import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Agentic SEO System",
    template: "%s | Agentic SEO System",
  },
  description:
    "AI-powered SEO management platform. Automate keyword research, content audits, competitor tracking, and on-page optimization across all your clients.",
  keywords: ["SEO", "AI", "keyword research", "content audit", "agentic"],
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
