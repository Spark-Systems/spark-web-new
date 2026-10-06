import "server-only";

import type { PublishAction, PublishInfo, PublishStatus } from "@/types/cms";
import { DbError } from "./errors";
import { now, type Actor } from "./ids";

/**
 * Draft/publish envelope. Saving changes `draft` only; publishing copies it to
 * `published`, which is all the website reads. Unpublishing clears
 * `published`; discarding resets `draft` to the published version.
 */
export interface Envelope<T> {
  draft: T;
  published: T | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  updated_by: string | null;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function statusOf(envelope: Envelope<unknown>): PublishStatus {
  if (envelope.published === null) return "draft";
  return same(envelope.draft, envelope.published) ? "published" : "changed";
}

export function publishInfo(envelope: Envelope<unknown>): PublishInfo {
  return {
    status: statusOf(envelope),
    created_at: envelope.created_at,
    updated_at: envelope.updated_at,
    published_at: envelope.published_at,
    updated_by: envelope.updated_by,
  };
}

export function newEnvelope<T>(draft: T, actor: Actor, publish = false): Envelope<T> {
  const at = now();
  return {
    draft,
    published: publish ? structuredClone(draft) : null,
    created_at: at,
    updated_at: at,
    published_at: publish ? at : null,
    updated_by: actor.name,
  };
}

export function saveDraft<T>(envelope: Envelope<T>, draft: T, actor: Actor): Envelope<T> {
  return { ...envelope, draft, updated_at: now(), updated_by: actor.name };
}

/** Applies a publish action; throws when it doesn't apply (e.g. discarding with nothing published). */
export function applyAction<T>(envelope: Envelope<T>, action: PublishAction, actor: Actor): Envelope<T> {
  const at = now();
  switch (action) {
    case "publish":
      return { ...envelope, published: structuredClone(envelope.draft), published_at: at, updated_by: actor.name };
    case "unpublish":
      return { ...envelope, published: null, published_at: null, updated_by: actor.name };
    case "discard":
      if (envelope.published === null) throw new DbError(422, "There is no published version to go back to", "nothing_published");
      return { ...envelope, draft: structuredClone(envelope.published), updated_at: at, updated_by: actor.name };
  }
}
