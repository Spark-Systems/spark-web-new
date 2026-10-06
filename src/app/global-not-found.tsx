import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./(site)/globals.css";

// The app has two root layouts (website and admin), so URLs that match no
// route at all get this standalone page, styled like the website.

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Page not found — Spark Systems",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-ink px-6 text-center text-snow">
          <p className="text-sm tracking-[0.3em] text-brand uppercase">404</p>
          <h1 className="text-4xl font-medium tracking-tight md:text-6xl">Page not found</h1>
          <p className="max-w-md text-fog-300">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <Link
            href="/"
            className="mt-2 rounded-full border border-brand px-8 py-3 text-sm tracking-[0.2em] text-snow uppercase transition-colors hover:bg-brand"
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
