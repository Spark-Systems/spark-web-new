import { readCv } from "@/server/applications";
import { requireSession } from "@/server/auth";
import { notFoundError } from "@/server/db/errors";
import { handle } from "@/server/http/respond";

/** GET /api/admin/applications/:id/cv: the attached CV file (signed-in users only). */
export const GET = handle<{ params: Promise<{ id: string }> }>(async (request, { params }) => {
  await requireSession(request);
  const cv = await readCv((await params).id);
  if (!cv) throw notFoundError("CV");
  return new Response(new Uint8Array(cv.body), {
    headers: {
      "Content-Type": cv.type,
      "Content-Disposition": `attachment; filename="${cv.name.replace(/[^\w.\- ]+/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
