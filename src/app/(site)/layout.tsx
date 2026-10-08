import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { PreviewBar } from "@/components/layout/preview-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { getSiteLayout } from "@/lib/api/pages";
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

// Pre-rendered pages are rebuilt at most every 5 minutes, even if the backend's
// "publish" call (app/api/revalidate) never arrives. Keep in step with lib/api/pages.
export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const { company, keywords } = await getSiteLayout();
  return {
    title: {
      default: `${company.name} — Intelligent solutions, always delivered`,
      template: `%s — ${company.name}`,
    },
    description: company.description,
    keywords: keywords.length > 0 ? keywords : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
};

/**
 * Root layout of the marketing site (the admin panel has its own, in
 * app/(admin)). The wrapper is the size container for the `cqw`-based fluid
 * type, and the parent the floating nav sticks in.
 */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [layout, { isEnabled: preview }] = await Promise.all([
    getSiteLayout(),
    draftMode(),
  ]);
  const menu = {
    items: layout.menu,
    cities: layout.offices.map((o) => o.city),
    email: layout.company.email,
    phone: layout.company.phone,
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>
          <div className="@container relative overflow-clip bg-ink text-snow">
            <SiteHeader menu={menu} />
            <main>{children}</main>
            <SiteFooter {...layout} />
          </div>
        </AppProviders>
        {preview && <PreviewBar />}
      </body>
    </html>
  );
}
