import { enquirySubmitSchema } from "@/lib/cms/schemas";
import { createEnquiry, senderOf } from "@/server/enquiries";
import { handle, HttpError, json, readBody } from "@/server/http/respond";

/**
 * POST /api/v1/enquiries { name, company, email, message, source? }: sends a
 * message to the Enquiries inbox (same as the website's contact forms).
 */
export const POST = handle(async (request) => {
  const input = await readBody(request, enquirySubmitSchema);
  const result = await createEnquiry(input, senderOf(request.headers));
  if (!result.ok) throw new HttpError(429, "Too many messages. Please try again later.", "rate_limited");
  return json({ ok: true }, 201);
});
