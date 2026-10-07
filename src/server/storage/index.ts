import "server-only";

import { blobTokens, createBlobDriver } from "./blob-driver";
import { createFsDriver } from "./fs-driver";
import type { StorageDriver } from "./types";

export * from "./types";

let driver: StorageDriver | undefined;

/**
 * The storage in use: Vercel Blob when a store is connected (see blobTokens),
 * otherwise the local data/ and public/uploads/ folders. On Vercel without a
 * store the local folders are read-only.
 */
export function storage(): StorageDriver {
  if (driver) return driver;
  const { content, publicUploads } = blobTokens();
  if (content) driver = createBlobDriver({ content, publicUploads });
  else {
    // Names only (never values), so the admin can say exactly what to connect.
    const reason =
      "No Vercel Blob store is connected (BLOB_READ_WRITE_TOKEN). Create a Blob store with Private access, connect it to the project, and redeploy.";
    if (process.env.VERCEL) console.error(`[storage] ${reason}`);
    driver = createFsDriver({ readOnly: Boolean(process.env.VERCEL), reason });
  }
  return driver;
}
