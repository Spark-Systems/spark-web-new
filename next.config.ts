import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Translations for the admin (/admin); the public site doesn't use next-intl.
const withNextIntl = createNextIntlPlugin("./src/admin/i18n/request.ts");

const nextConfig: NextConfig = {
  // The site and the admin have separate root layouts, so unmatched URLs get one global 404 page.
  experimental: {
    globalNotFound: true,
  },
  // gRPC-based Google Analytics client (admin dashboard); load it from node_modules at runtime.
  serverExternalPackages: ["@google-analytics/data"],
  images: {
    // Hosts allowed for remote <Image> sources: stock photography now, the content API's CDN later.
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
};

export default withNextIntl(nextConfig);
