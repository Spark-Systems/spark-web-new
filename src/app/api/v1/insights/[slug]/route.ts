import { getInsight } from "@/lib/api/pages";
import { notFoundError } from "@/server/db/errors";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/insights/:slug: a published article, with a few others to keep reading. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (_request, { params }) => {
  const article = await getInsight((await params).slug);
  if (!article) throw notFoundError("Article");
  return json(article);
});
