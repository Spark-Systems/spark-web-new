import type { AuthTokens } from "@/lib/api/types"
import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_REFRESH_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
} from "./constants"

// Tokens live in cookies (not localStorage) so proxy.ts can see whether a
// session exists and guard routes before any page renders.

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

export const tokenStorage = {
  getAccessToken: () => readCookie(ACCESS_TOKEN_COOKIE),
  getRefreshToken: () => readCookie(REFRESH_TOKEN_COOKIE),

  setTokens(tokens: AuthTokens) {
    const refreshMaxAge = tokens.refresh_expires_in ?? DEFAULT_REFRESH_TOKEN_MAX_AGE
    writeCookie(ACCESS_TOKEN_COOKIE, tokens.access_token, tokens.expires_in ?? refreshMaxAge)
    writeCookie(REFRESH_TOKEN_COOKIE, tokens.refresh_token, refreshMaxAge)
  },

  clear() {
    writeCookie(ACCESS_TOKEN_COOKIE, "", 0)
    writeCookie(REFRESH_TOKEN_COOKIE, "", 0)
  },
}
