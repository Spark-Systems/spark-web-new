import "server-only";

import { blobTokens, createBlobDriver } from "./blob-driver";
import { createFsDriver } from "./fs-driver";
import type { StorageDriver } from "./types";

export * from "./types";

let driver: StorageDriver | undefined;

/**
 * The storage in use: Vercel Blob when both stores are connected (see
 * blobTokens), otherwise the local data/ and public/uploads/ folders. On
 * Vercel without the stores the local folders are read-only.
 */
export function storage(): StorageDriver {
  if (driver) return driver;
  const { content, uploads } = blobTokens();
  if (content && uploads) driver = createBlobDriver({ content, uploads });
  else {
    if (process.env.VERCEL && (content || uploads)) {
      console.error("[storage] Connect both Blob stores (private BLOB_DB_… for content, public for uploads); running read-only.");
    }
    driver = createFsDriver({ readOnly: Boolean(process.env.VERCEL) });
  }
  return driver;
}
