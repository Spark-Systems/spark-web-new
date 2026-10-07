import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@admin/lib/auth/constants";
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

/** Only same-site paths, so ?path= can't send anyone off-site. */
const safePath = (value: string | null) => (value?.startsWith("/") && !value.startsWith("//") ? value : "/");

/**
 * GET /api/preview?path=/about. Turns on preview mode (the website shows saved
 * drafts) for someone signed in to the admin, then opens `path`.
 */
export async function GET(request: NextRequest) {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!(await signedIn(token))) {
    return Response.json({ message: "Sign in to the admin to preview" }, { status: 401 });
  }
  (await draftMode()).enable();
  redirect(safePath(request.nextUrl.searchParams.get("path")));
}
