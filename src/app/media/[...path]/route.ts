import { get } from "@vercel/blob";

import { blobToken, uploadPath } from "@/server/storage/blob-driver";
import { assertKey } from "@/server/storage/types";

/**
 * GET /media/<path>: an uploaded picture kept in a private Blob store
 * (with a public store, uploads use Blob's own public URLs instead).
 * File names are unique per upload and never change, so browsers and Vercel's
 * CDN may cache them for a year.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const token = blobToken();
  const filePath = (await params).path.join("/");
  try {
    assertKey(filePath);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!token) return new Response("Not found", { status: 404 });

  const result = await get(uploadPath(filePath), { access: "private", token }).catch(() => null);
  if (!result || result.statusCode !== 200) return new Response("Not found", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // SVGs are served from the site's own origin: never let one run scripts.
      "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
    },
  });
}
