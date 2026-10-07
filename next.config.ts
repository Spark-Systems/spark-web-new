import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Translations for the admin (/admin); the public site doesn't use next-intl.
const withNextIntl = createNextIntlPlugin("./src/admin/i18n/request.ts");

const nextConfig: NextConfig = {
  // Part of the content cache keys (src/lib/api/pages.ts): a new build never reads data cached by an older one.
  env: { CONTENT_CACHE_BUILD: Date.now().toString(36) },
  // The site and the admin have separate root layouts, so unmatched URLs get one global 404 page.
  experimental: {
    globalNotFound: true,
    // The careers form sends a CV (up to 4 MB) through a Server Action; the default limit is 1 MB.
    serverActions: { bodySizeLimit: "4.4mb" },
  },
  // gRPC-based Google Analytics client (admin dashboard); load it from node_modules at runtime.
  serverExternalPackages: ["@google-analytics/data"],
  // The content database (data/*.json) is read at runtime, so ship it with every server function.
  // With a Vercel Blob store connected it's the starting content until a document is first saved.
  outputFileTracingIncludes: {
    "/**": ["./data/**/*.json"],
  },
  images: {
    remotePatterns: [
      // Stock photography used in some page heroes.
      { protocol: "https", hostname: "images.pexels.com" },
      // Pictures uploaded in the admin when the site runs on Vercel (Blob storage).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
