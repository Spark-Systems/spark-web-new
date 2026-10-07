import { requireSession } from "@/server/auth";
import { enquiries } from "@/server/db";
import { handle, json } from "@/server/http/respond";

/** GET /api/admin/enquiries/stats → { new, total } (the unread count is the sidebar badge). */
export const GET = handle(async (request) => {
  await requireSession(request);
  const all = await enquiries.all();
  return json({ new: all.filter((e) => e.status === "new").length, total: all.length });
});
