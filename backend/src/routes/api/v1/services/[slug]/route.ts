import { getServiceData } from "@/server/content/pages";
import { notFoundError } from "@/server/db/errors";
import { readOptions } from "@/server/http/read-options";
import { handle, json } from "@/server/http/respond";

/** GET /api/v1/services/:slug: a published service's detail page. */
export const GET = handle<{ params: Promise<{ slug: string }> }>(async (request, { params }) => {
  const service = await getServiceData((await params).slug, readOptions(request));
  if (!service) throw notFoundError("Service");
  return json(service);
});
