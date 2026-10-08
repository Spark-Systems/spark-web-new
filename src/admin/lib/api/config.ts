/**
 * The admin API, served by the backend (the separate spark-backend project).
 *
 * By default it's reached through this site (/api/admin, forwarded by the
 * next.config.ts rewrites): same origin, so no CORS. Set NEXT_PUBLIC_API_URL
 * (e.g. https://api.spark-sys.com) before `next build` to call the backend
 * directly instead; the backend must then allow this site's origin
 * (FRONTEND_URL or CORS_ORIGINS in its settings).
 */
const direct = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")

export const API_BASE_URL = direct ? `${direct}/api/admin` : "/api/admin"
