/** A JSON document and the version tag of the stored copy. */
export interface StoredJson<T> {
  data: T;
  /** Changes on every write; pass it back as `ifMatch` to write only if nobody else has since. */
  etag: string;
}

/**
 * Where the database's JSON files and uploaded images live. Keys are paths
 * without extension, e.g. "solutions" or "pages/home".
 */
export interface StorageDriver {
  readonly kind: "fs" | "blob";
  readJson<T>(key: string): Promise<StoredJson<T> | null>;
  /**
   * Saves `data` and returns the new etag. With `ifMatch` the write only goes
   * through when the stored copy still has that etag (`null`: when there's no
   * stored copy yet); otherwise it throws a ConflictError.
   */
  writeJson(key: string, data: unknown, ifMatch?: string | null): Promise<string>;
  /** Keys of the documents under `prefix` (e.g. "backups/solutions/"). */
  listJson(prefix: string): Promise<string[]>;
  deleteJson(keys: string[]): Promise<void>;
  /** Stores a public file under `path` (e.g. "images/clients/kafd-x1y2.webp") and returns its URL. */
  saveFile(path: string, body: Buffer, contentType: string): Promise<string>;
}

/** The stored copy changed since it was read. */
export class ConflictError extends Error {
  constructor(key: string) {
    super(`"${key}" was changed by someone else; reload and try again`);
    this.name = "ConflictError";
  }
}

/** Writes aren't possible here (e.g. the data folder is read-only). */
export class ReadOnlyStorageError extends Error {
  constructor(reason = "Check that the backend can write to its data folder (SPARK_DATA_DIR).") {
    super(`Content storage is read-only here. ${reason}`);
    this.name = "ReadOnlyStorageError";
  }
}

const KEY_PATTERN = /^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/i;

/** Rejects keys that could escape the data folder ("../", absolute paths). */
export function assertKey(key: string) {
  if (!KEY_PATTERN.test(key) || key.includes("..")) throw new Error(`Invalid storage key "${key}"`);
}
