import { NextResponse, type NextRequest } from "next/server";

import { HOME_PATH, LOGIN_PATH, REFRESH_TOKEN_COOKIE } from "@admin/lib/auth/constants";

const PUBLIC_PATHS = [LOGIN_PATH];

// Optimistic guard for the admin panel: it only checks that a session cookie
// exists. The API is what actually validates tokens; when it rejects them the
// client clears the session and sends the user back to the login page.
// The public website never reaches this (see the matcher below).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_TOKEN_COOKIE);
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!hasSession && !isPublic) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
