import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/config/site";
import "lenis/dist/lenis.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Intelligent solutions, always delivered`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
};

/**
 * Root layout of the marketing site (the admin panel has its own, in
 * app/(admin)). The wrapper is the size container for the `cqw`-based fluid
 * type, and the parent the floating nav sticks in.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body data-highlight-tbc={process.env.NEXT_PUBLIC_HIGHLIGHT_TBC === "true" ? "" : undefined}>
        <AppProviders>
          <div className="@container relative overflow-clip bg-ink text-snow">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
