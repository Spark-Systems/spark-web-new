import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/** GET /api/preview/exit: back to the published website, on the page you were viewing. */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const referer = request.headers.get("referer");
  const from = referer ? new URL(referer) : null;
  redirect(from && from.origin === request.nextUrl.origin ? from.pathname : "/");
}
