import { enquiryStatusSchema } from "@/lib/cms/schemas";
import { requireSession } from "@/server/auth";
import { enquiries, logActivity } from "@/server/db";
import { notFoundError } from "@/server/db/errors";
import { handle, json, noContent, readBody } from "@/server/http/respond";

type Context = { params: Promise<{ id: string }> };

export const GET = handle<Context>(async (request, { params }) => {
  await requireSession(request);
  const enquiry = await enquiries.get((await params).id);
  if (!enquiry) throw notFoundError("Enquiry");
  return json(enquiry);
});

/** PATCH /api/admin/enquiries/:id { status: new | read | archived } */
export const PATCH = handle<Context>(async (request, { params }) => {
  await requireSession(request, "editor");
  const { status } = await readBody(request, enquiryStatusSchema);
  return json(await enquiries.update((await params).id, (e) => ({ ...e, status })));
});

export const DELETE = handle<Context>(async (request, { params }) => {
  const { actor } = await requireSession(request, "editor");
  const [removed] = await enquiries.remove([(await params).id]);
  if (!removed) throw notFoundError("Enquiry");
  await logActivity(actor, "delete", "enquiries", { id: removed.id, label: `${removed.name} <${removed.email}>` });
  return noContent();
});
