import { getService } from "@/lib/api/pages";
import { notFoundError } from "@/server/db/errors";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/services/:slug: a published service's detail page. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (_request, { params }) => {
  const service = await getService((await params).slug);
  if (!service) throw notFoundError("Service");
  return json(service);
});
