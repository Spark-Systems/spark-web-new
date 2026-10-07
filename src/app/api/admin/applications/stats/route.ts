import { requireSession } from "@/server/auth";
import { applications } from "@/server/db";
import { handle, json } from "@/server/http/respond";

/** GET /api/admin/applications/stats → { new, total } (the unread count is the sidebar badge). */
export const GET = handle(async (request) => {
  await requireSession(request);
  const all = await applications.all();
  return json({ new: all.filter((a) => a.status === "new").length, total: all.length });
});
