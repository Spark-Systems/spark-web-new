import { getSolution } from "@/lib/api/pages";
import { notFoundError } from "@/server/db/errors";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/solutions/:slug: a published solution's detail page. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (_request, { params }) => {
  const solution = await getSolution((await params).slug);
  if (!solution) throw notFoundError("Solution");
  return json(solution);
});
