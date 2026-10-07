import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { UPLOADS_DIR } from "@/server/storage/fs-driver";
import { assertKey } from "@/server/storage/types";

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

const notFound = () => new Response("Not found", { status: 404 });

/**
 * GET /uploads/<path>: an uploaded picture. File names are unique per upload
 * and never change, so browsers may cache them for a year.
 */
export async function serveUpload(filePath: string, method: string) {
  try {
    assertKey(filePath);
  } catch {
    return notFound();
  }
  const type = TYPES[path.extname(filePath).toLowerCase()];
  if (!type) return notFound();

  const file = path.join(UPLOADS_DIR, filePath);
  const info = await stat(file).catch(() => null);
  if (!info?.isFile()) return notFound();

  const headers = new Headers({
    "Content-Type": type,
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=31536000, immutable",
    "Last-Modified": info.mtime.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });
  // SVGs come from the site's own origin: never let one run scripts.
  if (type === "image/svg+xml") {
    headers.set("Content-Security-Policy", "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox");
  }
  if (method === "HEAD") return new Response(null, { headers });
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>, { headers });
}
