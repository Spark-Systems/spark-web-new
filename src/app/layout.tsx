import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

/** Marks the document as JS-enabled before first paint so reveal animations can start hidden. */
const MARK_JS = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MARK_JS }} />
      </head>
      <body data-highlight-tbc={process.env.NEXT_PUBLIC_HIGHLIGHT_TBC === "true" ? "" : undefined}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
