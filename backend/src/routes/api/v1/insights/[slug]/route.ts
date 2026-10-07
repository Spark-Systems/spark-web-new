import { getInsightData } from "@/server/content/pages";
import { notFoundError } from "@/server/db/errors";
import { readOptions } from "@/server/http/read-options";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/insights/:slug: a published article, with a few others to keep reading. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (request, { params }) => {
  const article = await getInsightData((await params).slug, readOptions(request));
  if (!article) throw notFoundError("Article");
  return json(article);
});
