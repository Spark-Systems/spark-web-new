import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

import { SHARED_SECRET } from "@/lib/api/backend";
import { CONTENT_TAG } from "@/lib/api/revalidate";

const fromBackend = (request: Request) => {
  const given = Buffer.from(request.headers.get("x-spark-secret") ?? "");
  const expected = Buffer.from(SHARED_SECRET);
  return expected.length > 0 && given.length === expected.length && timingSafeEqual(given, expected);
};

/**
 * POST /api/revalidate: the backend calls this after every publish so the
 * website shows the new content. Pages share data (the footer lists solutions
 * and offices everywhere), so every cached page is refreshed.
 */
export function POST(request: Request) {
  if (!fromBackend(request)) return Response.json({ message: "Forbidden" }, { status: 403 });
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
