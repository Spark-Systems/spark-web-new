import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@admin/lib/auth/constants";
import { userFromAccessToken } from "@/server/auth";

/** Only same-site paths, so ?path= can't send anyone off-site. */
const safePath = (value: string | null) => (value?.startsWith("/") && !value.startsWith("//") ? value : "/");

/**
 * GET /api/preview?path=/about. Turns on preview mode (the website shows saved
 * drafts) for someone signed in to the admin, then opens `path`.
 */
export async function GET(request: NextRequest) {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!(await userFromAccessToken(token))) {
    return Response.json({ message: "Sign in to the admin to preview" }, { status: 401 });
  }
  (await draftMode()).enable();
  redirect(safePath(request.nextUrl.searchParams.get("path")));
}
