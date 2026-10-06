import "server-only"

import { API_BASE_URL, USE_MOCK_API } from "@/lib/api/config"
import { verifyToken } from "@/lib/api/mock"

// Short-lived memo so a dashboard load (several parallel requests) validates
// the token against the API once, not once per request.
const verified = new Map<string, number>()
const VERIFY_TTL_MS = 60_000

/**
 * Checks the `Authorization: Bearer` access token on a request to one of our
 * route handlers. In mock mode the fake JWT is checked locally; otherwise the
 * real API is asked via GET /auth/me.
 */
export async function verifyRequestSession(request: Request): Promise<boolean> {
  const token = request.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return false
  if (USE_MOCK_API) return verifyToken(token, "access")

  const expires = verified.get(token)
  if (expires && expires > Date.now()) return true

  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    })
    if (!res.ok) return false
    verified.set(token, Date.now() + VERIFY_TTL_MS)
    return true
  } catch {
    return false
  }
}
