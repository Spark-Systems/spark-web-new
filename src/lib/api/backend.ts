import "server-only";

/**
 * The content backend (the separate spark-backend project): where the website's server reads pages and
 * sends form submissions. Browsers never call it directly: /api/admin, /api/v1
 * and /uploads on this site are forwarded to it (next.config.ts rewrites).
 */
export const BACKEND_URL = (process.env.BACKEND_URL || "http://127.0.0.1:4000").replace(/\/+$/, "");

/** Shared with the backend: proves requests (and the backend's refresh calls) come from our own servers. */
export const SHARED_SECRET = process.env.SPARK_SHARED_SECRET || "";

/** A backend answer that wasn't a success. `status` is the HTTP status; `code` the API's error code. */
export class BackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

/**
 * Passes the visitor's address on to the backend (forms are sent from this
 * server, so the backend would otherwise see every visitor as us). The backend
 * uses it to rate-limit submissions per visitor.
 */
export function visitorHeaders(headers: Headers): Record<string, string> {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip");
  return ip ? { "x-forwarded-for": ip } : {};
}

/** Calls the backend and returns its JSON, or throws a BackendError with its message. */
export async function backendFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { accept: "application/json", "x-spark-secret": SHARED_SECRET, ...init.headers },
    // Freshness is handled by the callers' cache (lib/api/pages), not fetch's.
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string; code?: string } | null;
    throw new BackendError(response.status, body?.message ?? `The backend answered ${response.status}`, body?.code);
  }
  return (await response.json()) as T;
}

/** Like backendFetch, but a 404 is null (a page or item that doesn't exist). */
export async function backendFetchOrNull<T>(path: string): Promise<T | null> {
  try {
    return await backendFetch<T>(path);
  } catch (error) {
    if (error instanceof BackendError && error.status === 404) return null;
    throw error;
  }
}
