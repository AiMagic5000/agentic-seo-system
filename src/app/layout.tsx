import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SMB Agentic SEO | AI-Powered SEO Command Center",
    template: "%s | SMB Agentic SEO",
  },
  description:
    "Multi-client AI SEO platform by Start My Business. Automate keyword research, content audits, competitor tracking, rank monitoring, and on-page optimization from a single command center.",
  keywords: [
    "SEO",
    "AI SEO",
    "agentic SEO",
    "keyword research",
    "content audit",
    "competitor tracking",
    "rank tracking",
    "multi-client SEO",
    "SEO automation",
    "Start My Business",
  ],
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
