import { requireSession } from "@/server/auth";
import { MAX_UPLOAD_BYTES, storeImage } from "@/server/media";
import { handle, HttpError, json } from "@/server/http/respond";

/**
 * POST /api/admin/uploads (multipart: `file`, optional `folder`) → the stored
 * picture: `{ url, src, width, height, blurDataURL? }`. Pictures are resized
 * and converted to WebP; SVGs are checked for scripts and kept as they are.
 */
export const POST = handle(async (request) => {
  await requireSession(request, "editor");
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(422, "No file provided", "no_file");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "The file is larger than 4 MB", "too_large");
  const folder = String(form?.get("folder") || "misc");
  const image = await storeImage(Buffer.from(await file.arrayBuffer()), file.name, folder);
  return json({ url: image.src, ...image }, 201);
});
