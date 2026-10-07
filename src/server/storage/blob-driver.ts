import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { BlobPreconditionFailedError, del, get, list, put } from "@vercel/blob";

import { readJsonFile } from "./fs-driver";
import { assertKey, ConflictError, type StorageDriver } from "./types";

/**
 * Optional folder inside the store, e.g. "preview/" so Preview deployments
 * sharing the store don't touch Production's content.
 */
const PATH_PREFIX = (process.env.BLOB_PATH_PREFIX ?? "").replace(/^\/+/, "");

const jsonPath = (key: string) => {
  assertKey(key);
  return `${PATH_PREFIX}db/${key}.json`;
};

/** Where an uploaded file lives in the store, and the site URL that serves it from a private store (app/media). */
export const uploadPath = (filePath: string) => `${PATH_PREFIX}uploads/${filePath}`;
export const MEDIA_ROUTE = "/media";

/**
 * The Blob store's read-write token: BLOB_READ_WRITE_TOKEN, or
 * <PREFIX>_READ_WRITE_TOKEN when the store was connected with a custom prefix
 * (this project's: BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN). The store may be
 * public or private (see createBlobDriver).
 */
export const blobToken = () =>
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN || undefined;

/** Etag given to a document read from the bundled data folder (never saved to Blob yet). */
const SEED_PREFIX = "seed:";

/**
 * Documents that belong to one environment and never come from the deployed
 * data folder: user accounts (password hashes), messages, the activity log
 * and backups. A fresh store starts with these empty, so the first admin is
 * created from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
const NOT_SEEDED = /^(users|enquiries|activity|backups\/)/;

/** A private operation on a public store (some SDK calls throw a plain Error for it). */
const isPublicStoreError = (error: unknown) =>
  error instanceof Error && /private access on a public store|Failed to fetch blob: 400/i.test(error.message);

// ---- Encryption (public stores) ---------------------------------------------

const ENCRYPTED = "spark-enc:v1:";

/**
 * Documents in a public store are encrypted (AES-256-GCM) with a key derived
 * from AUTH_SECRET, so their public URLs reveal nothing. Changing AUTH_SECRET
 * makes saved content unreadable, so keep it stable once content is saved.
 */
function contentKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required to store content in a public Blob store");
  return createHash("sha256").update(`spark-blob-content:${secret}`).digest();
}

function encrypt(text: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", contentKey(), iv);
  const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return ENCRYPTED + Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}

function decrypt(stored: string) {
  if (!stored.startsWith(ENCRYPTED)) return stored;
  const raw = Buffer.from(stored.slice(ENCRYPTED.length), "base64");
  const decipher = createDecipheriv("aes-256-gcm", contentKey(), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
}

// ---- Driver ----------------------------------------------------------------

type Access = "private" | "public";

/** Versions kept per document in a public store (older ones are pruned). */
const VERSIONS_KEPT = 5;
const versionName = (n: number) => `v${String(n).padStart(9, "0")}.txt`;
const versionNumber = (pathname: string) => Number(/\/v(\d+)\.txt$/.exec(pathname)?.[1] ?? 0);

/**
 * Vercel Blob. Works with either kind of store, detected on first use.
 *
 * Private store: each document is one private blob, read past the CDN cache
 * so a save is visible straight away, and written with the etag it was read
 * with so two people saving at once can't overwrite each other. Uploads are
 * private too and served through the site at /media/…
 *
 * Public store: public reads always go through Blob's CDN (which caches), so
 * documents are never overwritten. Each save adds a new numbered, encrypted
 * version under db/<key>/; reads find the newest through the (uncached) list
 * API and fetch it by its own URL, which never changes. Creating a version
 * number that already exists fails, which catches two simultaneous saves.
 * Uploads are public files on Blob's CDN.
 *
 * A document that has never been saved is read from the data folder deployed
 * with the site, so a fresh store starts out with the committed content.
 */
export function createBlobDriver(token: string): StorageDriver {
  let accessCheck: Promise<Access> | undefined;

  /**
   * Finds out once whether the store is private or public, by writing a tiny
   * private marker (a public store refuses it; reads alone can't tell).
   */
  const storeAccess = () =>
    (accessCheck ??= put(`${PATH_PREFIX}db/.access-check`, "private", {
      access: "private",
      token,
      addRandomSuffix: false,
      allowOverwrite: true,
    }).then(
      () => "private" as const,
      (error) => {
        if (isPublicStoreError(error)) return "public" as const;
        accessCheck = undefined;
        throw error;
      },
    ));

  const fromSeed = async <T>(key: string) => {
    if (NOT_SEEDED.test(key)) return null;
    const seed = await readJsonFile<T>(key);
    return seed && { data: seed.data, etag: SEED_PREFIX + seed.etag };
  };

  async function listAll(prefix: string) {
    const blobs: { pathname: string; url: string }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, token });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return blobs;
  }

  // -- public store: versioned documents --

  const versionsOf = async (key: string) => {
    assertKey(key);
    return (await listAll(`${PATH_PREFIX}db/${key}/`))
      .filter((blob) => /\/v\d+\.txt$/.test(blob.pathname) && blob.pathname.lastIndexOf("/") === `${PATH_PREFIX}db/${key}`.length)
      .sort((a, b) => versionNumber(a.pathname) - versionNumber(b.pathname));
  };

  async function readVersioned<T>(key: string) {
    const latest = (await versionsOf(key)).at(-1);
    if (!latest) return fromSeed<T>(key);
    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Couldn't read "${key}" from Blob (${response.status})`);
    const text = decrypt(await response.text());
    return { data: JSON.parse(text) as T, etag: `v:${versionNumber(latest.pathname)}` };
  }

  async function writeVersioned(key: string, data: unknown, ifMatch?: string | null) {
    const versions = await versionsOf(key);
    const current = versions.at(-1) ? versionNumber(versions.at(-1)!.pathname) : 0;
    const expected = ifMatch === undefined ? current : ifMatch?.startsWith("v:") ? Number(ifMatch.slice(2)) : 0;
    if (expected !== current) throw new ConflictError(key);
    const next = current + 1;
    try {
      await put(`${PATH_PREFIX}db/${key}/${versionName(next)}`, encrypt(JSON.stringify(data)), {
        access: "public",
        token,
        contentType: "text/plain",
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });
    } catch (error) {
      if (error instanceof Error && /already exists/i.test(error.message)) throw new ConflictError(key);
      throw error;
    }
    const old = versions.slice(0, Math.max(0, versions.length + 1 - VERSIONS_KEPT));
    if (old.length) await del(old.map((blob) => blob.url), { token }).catch(() => undefined);
    return `v:${next}`;
  }

  // -- private store: one blob per document --

  async function readPrivate<T>(key: string) {
    const result = await get(jsonPath(key), { access: "private", useCache: false, token });
    if (result?.statusCode === 200) {
      const text = decrypt(await new Response(result.stream).text());
      return { data: JSON.parse(text) as T, etag: result.blob.etag };
    }
    return fromSeed<T>(key);
  }

  async function writePrivate(key: string, data: unknown, ifMatch?: string | null) {
    // Not in Blob yet (read from the bundled seed, or new): create it, failing if someone else just did.
    const createOnly = ifMatch === null || ifMatch?.startsWith(SEED_PREFIX);
    try {
      const result = await put(jsonPath(key), JSON.stringify(data), {
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
      if (createOnly && error instanceof Error && /already exists/i.test(error.message)) throw new ConflictError(key);
      throw error;
    }
  }

  return {
    kind: "blob",

    async readJson<T>(key: string) {
      return (await storeAccess()) === "public" ? readVersioned<T>(key) : readPrivate<T>(key);
    },

    async writeJson(key, data, ifMatch) {
      return (await storeAccess()) === "public" ? writeVersioned(key, data, ifMatch) : writePrivate(key, data, ifMatch);
    },

    async listJson(prefix) {
      const base = `${PATH_PREFIX}db/`;
      const blobs = await listAll(`${base}${prefix}`);
      if ((await storeAccess()) === "private") {
        return blobs.map((blob) => blob.pathname.slice(base.length).replace(/\.json$/, ""));
      }
      // Versioned: db/<key>/vNNN.txt → <key>
      const keys = blobs.map((blob) => blob.pathname.slice(base.length).replace(/\/v\d+\.txt$/, ""));
      return [...new Set(keys)];
    },

    async deleteJson(keys) {
      if (keys.length === 0) return;
      if ((await storeAccess()) === "private") {
        await del(keys.map(jsonPath), { token });
        return;
      }
      const blobs = (await Promise.all(keys.map(versionsOf))).flat();
      if (blobs.length) await del(blobs.map((blob) => blob.url), { token });
    },

    async saveFile(filePath, body, contentType) {
      assertKey(filePath);
      const access = await storeAccess();
      const result = await put(uploadPath(filePath), body, {
        access,
        token,
        contentType,
        addRandomSuffix: false,
        // Names are unique per upload, so the file never changes: cache it for a year.
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });
      return access === "public" ? result.url : `${MEDIA_ROUTE}/${filePath}`;
    },
  };
}
