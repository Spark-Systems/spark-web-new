import { isPageKey } from "@/lib/cms/schemas";
import type { PageKey } from "@/types/cms";
import { HttpError } from "./respond";

/** The `:page` route parameter, checked against the known pages (404 otherwise). */
export async function pageKeyParam(params: Promise<{ page: string }>): Promise<PageKey> {
  const { page } = await params;
  if (!isPageKey(page)) throw new HttpError(404, "Unknown page", "not_found");
  return page;
}
