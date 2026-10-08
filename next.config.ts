import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Translations for the admin (/admin); the public site doesn't use next-intl.
const withNextIntl = createNextIntlPlugin("./src/admin/i18n/request.ts");

/** The content backend (the separate spark-backend project). Read when the site is built: set BACKEND_URL before `next build`. */
const backend = (process.env.BACKEND_URL || "http://127.0.0.1:4000").replace(/\/+$/, "");

// A remote backend over plain http answers the forwarded requests below with a
// redirect to https, which reaches the browser and fails there (CORS).
if (/^http:\/\//.test(backend) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(backend)) {
  console.warn(`\n⚠ BACKEND_URL is ${backend}: use https:// for a remote backend, or the admin's requests will fail with CORS errors.\n`);
}

const nextConfig: NextConfig = {
  // Part of the content cache keys (src/lib/api/pages.ts): a new build never reads data cached by an older one.
  env: { CONTENT_CACHE_BUILD: Date.now().toString(36) },
  // The site and the admin have separate root layouts, so unmatched URLs get one global 404 page.
  experimental: {
    globalNotFound: true,
    // The careers form sends a CV (up to 4 MB) through a Server Action; the default limit is 1 MB.
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  // The admin API, the public API and uploaded pictures live on the backend.
  // Forwarding them keeps everything on this one domain (no CORS; the admin's
  // sign-in cookies keep working). This site's own routes (/api/preview,
  // /api/revalidate) are matched first.
  async rewrites() {
    return [
      { source: "/api/admin/:path*", destination: `${backend}/api/admin/:path*` },
      { source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` },
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      // Stock photography used in some page heroes.
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
