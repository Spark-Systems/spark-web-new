import { enquiryStatusSchema } from "@/lib/cms/schemas";
import { deleteCv } from "@/server/applications";
import { requireSession } from "@/server/auth";
import { applications, logActivity } from "@/server/db";
import { notFoundError } from "@/server/db/errors";
import { handle, json, noContent, readBody } from "@/server/http/respond";

type Context = { params: Promise<{ id: string }> };

export const GET = handle<Context>(async (request, { params }) => {
  await requireSession(request);
  const application = await applications.get((await params).id);
  if (!application) throw notFoundError("Application");
  return json(application);
});

/** PATCH /api/admin/applications/:id { status: new | read | archived } */
export const PATCH = handle<Context>(async (request, { params }) => {
  await requireSession(request, "editor");
  const { status } = await readBody(request, enquiryStatusSchema);
  return json(await applications.update((await params).id, (a) => ({ ...a, status })));
});

/** DELETE /api/admin/applications/:id: the application and its CV. */
export const DELETE = handle<Context>(async (request, { params }) => {
  const { actor } = await requireSession(request, "editor");
  const [removed] = await applications.remove([(await params).id]);
  if (!removed) throw notFoundError("Application");
  if (removed.cv) await deleteCv(removed.id).catch(() => undefined);
  await logActivity(actor, "delete", "applications", { id: removed.id, label: `${removed.name} <${removed.email}>` });
  return noContent();
});
