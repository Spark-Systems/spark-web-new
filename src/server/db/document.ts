import "server-only";

import { ConflictError, storage } from "@/server/storage";

/** Previous versions kept per document (see `backups/` in the data folder or Blob store). */
const BACKUPS_KEPT = 10;
const WRITE_ATTEMPTS = 3;

/** Reads a document, or `fallback()` when it hasn't been saved yet. */
export async function readDocument<T>(key: string, fallback: () => T): Promise<T> {
  return (await storage().readJson<T>(key))?.data ?? fallback();
}

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

/** Copies the version about to be replaced into backups/<key>/, keeping the latest few. */
async function backUp(key: string, data: unknown) {
  try {
    const store = storage();
    await store.writeJson(`backups/${key}/${stamp()}`, data);
    const versions = (await store.listJson(`backups/${key}/`)).sort();
    if (versions.length > BACKUPS_KEPT) await store.deleteJson(versions.slice(0, versions.length - BACKUPS_KEPT));
  } catch (error) {
    // A failed backup shouldn't block the save itself.
    console.error(`[db] backup of "${key}" failed`, error);
  }
}

/**
 * Read-modify-write of one document. `change` gets the current data and
 * returns the next version plus a result for the caller. If someone else
 * saved in between, it re-reads and runs `change` again (a few times at most).
 */
export async function updateDocument<T, R>(
  key: string,
  fallback: () => T,
  change: (current: T) => { next: T; result: R } | Promise<{ next: T; result: R }>,
  { backup = true }: { backup?: boolean } = {},
): Promise<R> {
  const store = storage();
  for (let attempt = 1; ; attempt++) {
    const stored = await store.readJson<T>(key);
    const current = stored?.data ?? fallback();
    const { next, result } = await change(structuredClone(current));
    try {
      await store.writeJson(key, next, stored?.etag ?? null);
      if (backup && stored) await backUp(key, stored.data);
      return result;
    } catch (error) {
      if (error instanceof ConflictError && attempt < WRITE_ATTEMPTS) continue;
      throw error;
    }
  }
}
