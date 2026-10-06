import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { assertKey, ConflictError, ReadOnlyStorageError, type StorageDriver, type StoredJson } from "./types";

/** JSON documents: <project>/data/<key>.json. Committed to git as the starting content. */
export const DATA_DIR = path.join(process.cwd(), "data");

/** Uploaded files: <project>/public/uploads/<path>, served by Next at /uploads/<path>. */
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const fileFor = (key: string) => {
  assertKey(key);
  return path.join(DATA_DIR, `${key}.json`);
};

const etagOf = (text: string) => createHash("sha1").update(text).digest("hex");

async function readText(file: string) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Reads a document straight from the data folder (also the Blob driver's fallback for untouched documents). */
export async function readJsonFile<T>(key: string): Promise<StoredJson<T> | null> {
  const text = await readText(fileFor(key));
  return text === null ? null : { data: JSON.parse(text) as T, etag: etagOf(text) };
}

// Writes to one key run one at a time, so the etag check and the write can't interleave.
const queues = new Map<string, Promise<unknown>>();

function serialize<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);
  queues.set(key, next);
  void next.finally(() => {
    if (queues.get(key) === next) queues.delete(key);
  });
  return next;
}

/**
 * Local files. Writes go to a temporary file that's then renamed over the
 * target, so a crash mid-write never leaves a half-written document. On a
 * serverless host (Vercel) the disk is read-only: reads work, writes throw.
 */
export function createFsDriver({ readOnly = false } = {}): StorageDriver {
  const assertWritable = () => {
    if (readOnly) throw new ReadOnlyStorageError();
  };

  return {
    kind: "fs",

    readJson: readJsonFile,

    writeJson(key, data, ifMatch) {
      assertWritable();
      const file = fileFor(key);
      return serialize(key, async () => {
        if (ifMatch !== undefined) {
          const current = await readText(file);
          const currentTag = current === null ? null : etagOf(current);
          if (currentTag !== ifMatch) throw new ConflictError(key);
        }
        const text = `${JSON.stringify(data, null, 2)}\n`;
        await mkdir(path.dirname(file), { recursive: true });
        const temp = `${file}.${randomBytes(6).toString("hex")}.tmp`;
        await writeFile(temp, text, "utf8");
        try {
          await rename(temp, file);
        } catch (error) {
          await rm(temp, { force: true });
          throw error;
        }
        return etagOf(text);
      });
    },

    async listJson(prefix) {
      const dir = path.join(DATA_DIR, prefix);
      let names: string[];
      try {
        names = await readdir(dir, { recursive: true });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
        throw error;
      }
      return names
        .filter((name) => name.endsWith(".json"))
        .map((name) => path.posix.join(prefix, name.split(path.sep).join("/")).replace(/\.json$/, ""));
    },

    async deleteJson(keys) {
      assertWritable();
      await Promise.all(keys.map((key) => rm(fileFor(key), { force: true })));
    },

    async saveFile(filePath, body) {
      assertWritable();
      assertKey(filePath);
      const target = path.join(UPLOADS_DIR, filePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, body);
      return `/uploads/${filePath}`;
    },
  };
}
