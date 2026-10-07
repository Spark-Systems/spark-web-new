import "server-only";

import { BlobError, BlobPreconditionFailedError, del, get, list, put } from "@vercel/blob";

import { readJsonFile } from "./fs-driver";
import { assertKey, ConflictError, type StorageDriver } from "./types";

const jsonPath = (key: string) => {
  assertKey(key);
  return `db/${key}.json`;
};

/**
 * Vercel Blob stores are either public or private, so this uses two:
 * - content (the JSON documents, incl. users and settings): a PRIVATE store,
 *   connected with the env prefix BLOB_DB → BLOB_DB_READ_WRITE_TOKEN
 * - uploads (pictures): a PUBLIC store → BLOB_READ_WRITE_TOKEN, or
 *   BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN as this project's store was connected.
 */
export const blobTokens = () => ({
  content: process.env.BLOB_DB_READ_WRITE_TOKEN || undefined,
  uploads: process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN || undefined,
});

/** Etag given to a document read from the bundled data folder (never saved to Blob yet). */
const SEED_PREFIX = "seed:";

/**
 * Documents that belong to one environment and never come from the deployed
 * data folder: user accounts (password hashes), messages, the activity log
 * and backups. A fresh store starts with these empty, so the first admin is
 * created from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
const NOT_SEEDED = /^(users|enquiries|activity|backups\/)/;

/**
 * Vercel Blob. Documents are private blobs under db/ (in the private store),
 * read past the CDN cache so a save is visible straight away, and written
 * with the etag they were read with so two people saving at once can't
 * overwrite each other. Uploaded files are public blobs under uploads/ (in
 * the public store).
 *
 * A document that has never been saved to Blob is read from the data folder
 * deployed with the site, so a fresh store starts out with the committed content.
 */
export function createBlobDriver({ content: token, uploads: uploadsToken }: { content: string; uploads: string }): StorageDriver {
  return {
    kind: "blob",

    async readJson<T>(key: string) {
      const result = await get(jsonPath(key), { access: "private", useCache: false, token });
      if (result?.statusCode === 200) {
        const text = await new Response(result.stream).text();
        return { data: JSON.parse(text) as T, etag: result.blob.etag };
      }
      if (NOT_SEEDED.test(key)) return null;
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
          token,
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
        const page = await list({ prefix: `db/${prefix}`, cursor, token });
        keys.push(...page.blobs.map((blob) => blob.pathname.replace(/^db\//, "").replace(/\.json$/, "")));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return keys;
    },

    async deleteJson(keys) {
      if (keys.length) await del(keys.map(jsonPath), { token });
    },

    async saveFile(filePath, body, contentType) {
      assertKey(filePath);
      const result = await put(`uploads/${filePath}`, body, {
        access: "public",
        token: uploadsToken,
        contentType,
        addRandomSuffix: false,
        // Names are unique per upload, so the file never changes: cache it for a year.
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });
      return result.url;
    },
  };
}
