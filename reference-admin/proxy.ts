import { NextResponse, type NextRequest } from "next/server"

import { HOME_PATH, LOGIN_PATH, REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants"

const PUBLIC_PATHS = [LOGIN_PATH]

// Optimistic route guard: it only checks that a session cookie exists. The API
// is what actually validates tokens; when it rejects them the client clears
// the session and sends the user back to the login page.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSession = request.cookies.has(REFRESH_TOKEN_COOKIE)
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (!hasSession && !isPublic) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    if (pathname !== "/") loginUrl.searchParams.set("callbackUrl", pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (public assets).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}
