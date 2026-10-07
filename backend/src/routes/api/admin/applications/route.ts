import { requireSession } from "@/server/auth";
import { applications } from "@/server/db";
import { listQuery } from "@/server/http/list-query";
import { handle, json } from "@/server/http/respond";

/** GET /api/admin/applications: newest first; search, `status` and `position` facets, sort, pages. */
export const GET = handle(async (request) => {
  await requireSession(request);
  return json(
    listQuery(await applications.all(), new URL(request.url).searchParams, {
      search: (a) => [a.name, a.email, a.mobile, a.position, a.country],
      defaultSort: "created_at",
      defaultOrder: "desc",
      facets: { status: (a, v) => a.status === v, position: (a, v) => a.position === v },
    }),
  );
});
