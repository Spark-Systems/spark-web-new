import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import type { AuthTokens } from "@admin/lib/api/types";
import {
  ACCESS_TOKEN_COOKIE,
  DEFAULT_REFRESH_TOKEN_MAX_AGE,
  LOGIN_PATH,
  REFRESH_TOKEN_COOKIE,
} from "@admin/lib/auth/constants";
import { BACKEND_URL } from "@/lib/api/backend";

/** The admin token is still valid (the backend knows who it belongs to). */
async function signedIn(token: string | undefined) {
  if (!token) return false;
  const response = await fetch(`${BACKEND_URL}/api/admin/auth/me`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);
  return response?.ok ?? false;
}

/** A new token pair for the refresh token, or null when the session is over. */
async function refreshed(refreshToken: string | undefined): Promise<AuthTokens | null> {
  if (!refreshToken) return null;
  const response = await fetch(`${BACKEND_URL}/api/admin/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  }).catch(() => null);
  return response?.ok ? ((await response.json()) as AuthTokens) : null;
}

/** Only same-site paths, so ?path= can't send anyone off-site. */
const safePath = (value: string | null) => (value?.startsWith("/") && !value.startsWith("//") ? value : "/");

/**
 * GET /api/preview?path=/about. Turns on preview mode (the website shows saved
 * drafts) for someone signed in to the admin, then opens `path`.
 *
 * The admin's access token is short-lived: when it has expired the session is
 * renewed here (as the admin itself does), and when the session is over the
 * admin's login page opens, coming back to the preview after signing in.
 */
export async function GET(request: NextRequest) {
  const jar = await cookies();
  const path = safePath(request.nextUrl.searchParams.get("path"));

  if (!(await signedIn(jar.get(ACCESS_TOKEN_COOKIE)?.value))) {
    const tokens = await refreshed(jar.get(REFRESH_TOKEN_COOKIE)?.value);
    // Same cookies the admin writes (readable by its scripts, which send the token).
    const options = {
      path: "/",
      sameSite: "lax" as const,
      secure: request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https",
    };
    if (!tokens) {
      jar.set(ACCESS_TOKEN_COOKIE, "", { ...options, maxAge: 0 });
      jar.set(REFRESH_TOKEN_COOKIE, "", { ...options, maxAge: 0 });
      redirect(`${LOGIN_PATH}?callbackUrl=${encodeURIComponent(`/api/preview?path=${encodeURIComponent(path)}`)}`);
    }
    const refreshMaxAge = tokens.refresh_expires_in ?? DEFAULT_REFRESH_TOKEN_MAX_AGE;
    jar.set(ACCESS_TOKEN_COOKIE, tokens.access_token, { ...options, maxAge: tokens.expires_in ?? refreshMaxAge });
    jar.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, { ...options, maxAge: refreshMaxAge });
  }

  (await draftMode()).enable();
  redirect(path);
}
