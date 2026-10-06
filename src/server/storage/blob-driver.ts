import "server-only";

import { BlobError, BlobPreconditionFailedError, del, get, list, put } from "@vercel/blob";

import { readJsonFile } from "./fs-driver";
import { assertKey, ConflictError, type StorageDriver } from "./types";

const jsonPath = (key: string) => {
  assertKey(key);
  return `db/${key}.json`;
};

/** Etag given to a document read from the bundled data folder (never saved to Blob yet). */
const SEED_PREFIX = "seed:";

/**
 * Vercel Blob. Documents are private blobs under db/, read past the CDN cache
 * so a save is visible straight away, and written with the etag they were read
 * with so two people saving at once can't overwrite each other. Uploaded files
 * are public blobs under uploads/.
 *
 * A document that has never been saved to Blob is read from the data folder
 * deployed with the site, so a fresh store starts out with the committed content.
 */
export function createBlobDriver(): StorageDriver {
  return {
    kind: "blob",

    async readJson<T>(key: string) {
      const result = await get(jsonPath(key), { access: "private", useCache: false });
      if (result?.statusCode === 200) {
        const text = await new Response(result.stream).text();
        return { data: JSON.parse(text) as T, etag: result.blob.etag };
      }
      const seed = await readJsonFile<T>(key);
      return seed && { data: seed.data, etag: SEED_PREFIX + seed.etag };
    },

    async writeJson(key, data, ifMatch) {
      const body = JSON.stringify(data);
      // Not in Blob yet (read from the bundled seed, or new): create it, failing if someone else just did.
      const createOnly = ifMatch === null || ifMatch?.startsWith(SEED_PREFIX);
      try {
        const result = await put(jsonPath(key), body, {
          access: "private",
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: !createOnly,
          ...(ifMatch && !createOnly ? { ifMatch } : {}),
        });
        return result.etag;
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) throw new ConflictError(key);
        if (createOnly && error instanceof BlobError && /already exists/i.test(error.message)) {
          throw new ConflictError(key);
        }
        throw error;
      }
    },

    async listJson(prefix) {
      const keys: string[] = [];
      let cursor: string | undefined;
      do {
        const page = await list({ prefix: `db/${prefix}`, cursor });
        keys.push(...page.blobs.map((blob) => blob.pathname.replace(/^db\//, "").replace(/\.json$/, "")));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return keys;
    },

    async deleteJson(keys) {
      if (keys.length) await del(keys.map(jsonPath));
    },

    async saveFile(filePath, body, contentType) {
      assertKey(filePath);
      const result = await put(`uploads/${filePath}`, body, {
        access: "public",
        contentType,
        addRandomSuffix: false,
        // Names are unique per upload, so the file never changes: cache it for a year.
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });
      return result.url;
    },
  };
}
