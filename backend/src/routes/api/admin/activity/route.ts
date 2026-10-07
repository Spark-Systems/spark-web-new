import { requireSession } from "@/server/auth";
import { activityLog } from "@/server/db";
import { listQuery } from "@/server/http/list-query";
import { handle, json } from "@/server/http/respond";

/** GET /api/admin/activity: newest first; search, `action` and `resource` facets, pages. */
export const GET = handle(async (request) => {
  await requireSession(request);
  return json(
    listQuery(await activityLog.all(), new URL(request.url).searchParams, {
      search: (a) => [a.label, a.user_name, a.resource],
      defaultSort: "at",
      defaultOrder: "desc",
      facets: {
        action: (a, v) => a.action === v,
        // "pages" matches every page ("pages/home", …).
        resource: (a, v) => a.resource === v || a.resource.startsWith(`${v}/`),
      },
    }),
  );
});
