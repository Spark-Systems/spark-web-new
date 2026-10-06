/**
 * Minimal client for the future content API.
 *
 * Set `CONTENT_API_URL` (server-only) to switch page getters from the static
 * content in `src/content` to live API data. Until then `hasContentApi` is
 * false and nothing here is called.
 */
const API_URL = process.env.CONTENT_API_URL;

export const hasContentApi = Boolean(API_URL);

/** Seconds a fetched response may be reused before Next refetches it. */
const REVALIDATE_SECONDS = 300;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`Content API ${status} for ${path}`);
  }
}

/** GET a JSON resource from the content API. */
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("CONTENT_API_URL is not set");
  const res = await fetch(new URL(path, API_URL), {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return (await res.json()) as T;
}
