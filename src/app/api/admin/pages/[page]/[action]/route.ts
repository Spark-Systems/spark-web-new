import { requireSession } from "@/server/auth";
import { revalidateContent } from "@/server/content/revalidate";
import { actOnPage } from "@/server/db";
import { pageKeyParam } from "@/server/http/page-key";
import { handle, HttpError, json } from "@/server/http/respond";

type Context = { params: Promise<{ page: string; action: string }> };

/** POST /api/admin/pages/:page/publish | discard */
export const POST = handle<Context>(async (request, { params }) => {
  const { actor } = await requireSession(request, "editor");
  const page = await pageKeyParam(params);
  const { action } = await params;
  if (action !== "publish" && action !== "discard") throw new HttpError(404, "Unknown action", "not_found");
  const doc = await actOnPage(page, action, actor);
  if (action === "publish") revalidateContent();
  return json(doc);
});
