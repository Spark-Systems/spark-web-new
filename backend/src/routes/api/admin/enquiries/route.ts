import { requireSession } from "@/server/auth";
import { enquiries } from "@/server/db";
import { listQuery } from "@/server/http/list-query";
import { handle, json } from "@/server/http/respond";

/** GET /api/admin/enquiries: newest first; search, `status` facet (new, read, archived), sort, pages. */
export const GET = handle(async (request) => {
  await requireSession(request);
  return json(
    listQuery(await enquiries.all(), new URL(request.url).searchParams, {
      search: (e) => [e.name, e.company, e.email, e.message],
      defaultSort: "created_at",
      defaultOrder: "desc",
      facets: { status: (e, v) => e.status === v },
    }),
  );
});
