import { applicationSubmitSchema } from "@/lib/cms/schemas";
import { createApplication } from "@/server/applications";
import { senderOf } from "@/server/enquiries";
import { handle, HttpError, json } from "@/server/http/respond";

/**
 * POST /api/v1/applications (multipart: name, email, mobile, country,
 * position, cover_letter, cv?) → 201 { ok: true }. Same as the careers page form.
 */
export const POST = handle(async (request) => {
  const form = await request.formData().catch(() => null);
  if (!form) throw new HttpError(400, "Send the application as multipart form data", "bad_form");
  const text = (key: string) => String(form.get(key) ?? "");
  const input = applicationSubmitSchema.parse({
    name: text("name"),
    email: text("email"),
    mobile: text("mobile"),
    country: text("country"),
    position: text("position"),
    cover_letter: text("cover_letter"),
    website: text("website") || undefined,
  });
  const cv = form.get("cv");
  await createApplication(
    { ...input, website: input.website ?? "" },
    cv instanceof File ? cv : null,
    senderOf(request.headers),
  );
  return json({ ok: true }, 201);
});
