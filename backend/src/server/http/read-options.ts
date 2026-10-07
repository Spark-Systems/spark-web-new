import { timingSafeEqual } from "node:crypto";

import { config } from "@backend/config";
import type { ReadOptions } from "@/server/content/pages";
import { HttpError } from "./respond";

/** The request carries the secret shared with the website's server (x-spark-secret). */
export function hasSharedSecret(request: Request) {
  const given = Buffer.from(request.headers.get("x-spark-secret") ?? "");
  const expected = Buffer.from(config.sharedSecret);
  return expected.length > 0 && given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Published content by default. `?preview=1` returns saved drafts instead (the
 * website's preview mode), only for the website's own server.
 */
export function readOptions(request: Request): ReadOptions {
  if (new URL(request.url).searchParams.get("preview") !== "1") return {};
  if (!hasSharedSecret(request)) throw new HttpError(403, "Drafts are only available to the website", "forbidden");
  return { preview: true };
}
