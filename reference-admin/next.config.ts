import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  // gRPC-based client; load it from node_modules at runtime instead of bundling it.
  serverExternalPackages: ["@google-analytics/data"],
}

export default withNextIntl(nextConfig)
