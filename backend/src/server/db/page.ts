import type { PageContentMap, PageDocument, PageKey, PublishAction } from "@/types/cms";
import { logActivity } from "./activity";
import { readDocument, updateDocument } from "./document";
import { DbError } from "./errors";
import type { Actor } from "./ids";
import { applyAction, publishInfo, saveDraft, type Envelope } from "./publishable";

const storageKey = (page: PageKey) => `pages/${page}`;

const missing = (page: PageKey) => (): never => {
  throw new DbError(404, `The "${page}" page has no content yet`, "not_found");
};

/** The admin's view of a page: its saved (draft) content plus publication details. */
export async function getPageDocument<K extends PageKey>(page: K): Promise<PageDocument<K>> {
  const envelope = await readDocument<Envelope<PageContentMap[K]>>(storageKey(page), missing(page));
  return { content: envelope.draft, ...publishInfo(envelope) };
}

export async function savePage<K extends PageKey>(page: K, content: PageContentMap[K], actor: Actor) {
  const doc = await updateDocument<Envelope<PageContentMap[K]>, PageDocument<K>>(storageKey(page), missing(page), (current) => {
    const next = saveDraft(current, content, actor);
    return { next, result: { content: next.draft, ...publishInfo(next) } };
  });
  await logActivity(actor, "update", storageKey(page), { label: page });
  return doc;
}

/** Publish the saved content, or discard it in favour of the published version. Pages can't be unpublished. */
export async function actOnPage<K extends PageKey>(page: K, action: Exclude<PublishAction, "unpublish">, actor: Actor) {
  const doc = await updateDocument<Envelope<PageContentMap[K]>, PageDocument<K>>(storageKey(page), missing(page), (current) => {
    const next = applyAction(current, action, actor);
    return { next, result: { content: next.draft, ...publishInfo(next) } };
  });
  await logActivity(actor, action, storageKey(page), { label: page });
  return doc;
}

/**
 * What the website shows. `preview` returns the saved draft instead. A page
 * that was never published falls back to its draft so the site never breaks.
 */
export async function readPage<K extends PageKey>(page: K, { preview = false } = {}): Promise<PageContentMap[K]> {
  const envelope = await readDocument<Envelope<PageContentMap[K]>>(storageKey(page), missing(page));
  return preview ? envelope.draft : (envelope.published ?? envelope.draft);
}
