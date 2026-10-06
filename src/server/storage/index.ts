import "server-only";

import { createBlobDriver } from "./blob-driver";
import { createFsDriver } from "./fs-driver";
import type { StorageDriver } from "./types";

export * from "./types";

let driver: StorageDriver | undefined;

/**
 * The storage in use: Vercel Blob when a store is connected
 * (BLOB_READ_WRITE_TOKEN), otherwise the local data/ and public/uploads/
 * folders. On Vercel without a store the local folders are read-only.
 */
export function storage(): StorageDriver {
  driver ??= process.env.BLOB_READ_WRITE_TOKEN
    ? createBlobDriver()
    : createFsDriver({ readOnly: Boolean(process.env.VERCEL) });
  return driver;
}
