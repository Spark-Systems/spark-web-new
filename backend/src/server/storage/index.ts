import { createFsDriver } from "./fs-driver";
import type { StorageDriver } from "./types";

export * from "./types";

let driver: StorageDriver | undefined;

/** The storage in use: JSON files and uploads on this server's disk (see config: dataDir, uploadsDir). */
export function storage(): StorageDriver {
  return (driver ??= createFsDriver());
}
