import { getSolutionData } from "@/server/content/pages";
import { notFoundError } from "@/server/db/errors";
import { readOptions } from "@/server/http/read-options";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/solutions/:slug: a published solution's detail page. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (request, { params }) => {
  const solution = await getSolutionData((await params).slug, readOptions(request));
  if (!solution) throw notFoundError("Solution");
  return json(solution);
});
