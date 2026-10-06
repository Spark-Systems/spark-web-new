import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

/** Tag on every cached website read (see lib/api/pages). */
export const CONTENT_TAG = "content";

/**
 * Makes the website show newly published content. Pages share data (the
 * footer lists solutions and offices on every page), so everything is
 * refreshed rather than tracking which page uses what.
 */
export function revalidateContent() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
