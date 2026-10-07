import type { CollectionRow, PublishAction } from "@/types/cms";
import { logActivity } from "./activity";
import { readDocument, updateDocument } from "./document";
import { DbError, notFoundError } from "./errors";
import { newId, type Actor } from "./ids";
import { applyAction, newEnvelope, publishInfo, saveDraft, type Envelope } from "./publishable";

type StoredItem<T> = Envelope<T> & { id: string };

interface StoredCollection<T> {
  items: StoredItem<T>[];
}

export interface CollectionOptions<T> {
  /** Storage key, also the resource name in the activity log. */
  key: string;
  /** Prefix for new ids, e.g. "sol". */
  idPrefix: string;
  /** Singular name for error messages, e.g. "Solution". */
  noun: string;
  /** Name shown in the activity log. */
  title: (item: T) => string;
  /** Fields no two items may share (compared case-insensitively), e.g. the slug. */
  unique?: (keyof T & string)[];
}

/** A list item with its id, as the website reads it. */
export type WithId<T> = T & { id: string };

/**
 * A list of draft/publish items stored in one document, e.g. solutions.
 * The admin reads and writes drafts; the website reads `published()`.
 */
export function defineCollection<T extends { order: number }>(options: CollectionOptions<T>) {
  const { key, idPrefix, noun, title, unique = [] } = options;
  const empty = (): StoredCollection<T> => ({ items: [] });

  const toRow = (item: StoredItem<T>): CollectionRow<T> => ({ ...item.draft, id: item.id, ...publishInfo(item) });
  const byOrder = <V extends { order: number }>(a: V, b: V) => a.order - b.order;

  function assertUnique(input: T, items: StoredItem<T>[], selfId?: string) {
    for (const field of unique) {
      const value = String(input[field]).trim().toLowerCase();
      const clash = items.some(
        (item) =>
          item.id !== selfId &&
          [item.draft, item.published].some((version) => version && String(version[field]).trim().toLowerCase() === value),
      );
      if (clash) throw new DbError(409, `Another ${noun.toLowerCase()} already uses this ${field}`, `${field}_taken`, field);
    }
  }

  const change = <R>(fn: (items: StoredItem<T>[]) => { items: StoredItem<T>[]; result: R }) =>
    updateDocument(key, empty, (doc) => {
      const { items, result } = fn(doc.items);
      return { next: { items }, result };
    });

  return {
    key,

    /** Every item's saved (draft) version with its publication details, in display order. */
    async rows(): Promise<CollectionRow<T>[]> {
      return (await readDocument(key, empty)).items.map(toRow).sort(byOrder);
    },

    async row(id: string): Promise<CollectionRow<T>> {
      const item = (await readDocument(key, empty)).items.find((i) => i.id === id);
      if (!item) throw notFoundError(noun);
      return toRow(item);
    },

    async create(input: T, actor: Actor, { publish = false } = {}): Promise<CollectionRow<T>> {
      const row = await change((items) => {
        assertUnique(input, items);
        const item: StoredItem<T> = { id: newId(idPrefix), ...newEnvelope(input, actor, publish) };
        return { items: [...items, item], result: toRow(item) };
      });
      await logActivity(actor, publish ? "publish" : "create", key, { id: row.id, label: title(input) });
      return row;
    },

    async update(id: string, input: T, actor: Actor): Promise<CollectionRow<T>> {
      const row = await change((items) => {
        const current = items.find((i) => i.id === id);
        if (!current) throw notFoundError(noun);
        assertUnique(input, items, id);
        const updated = { ...saveDraft(current, input, actor), id };
        return { items: items.map((i) => (i.id === id ? updated : i)), result: toRow(updated) };
      });
      await logActivity(actor, "update", key, { id, label: title(input) });
      return row;
    },

    async remove(ids: string[], actor: Actor): Promise<void> {
      const removed = await change((items) => ({
        items: items.filter((i) => !ids.includes(i.id)),
        result: items.filter((i) => ids.includes(i.id)),
      }));
      if (removed.length === 0) throw notFoundError(noun);
      for (const item of removed) await logActivity(actor, "delete", key, { id: item.id, label: title(item.draft) });
    },

    async act(id: string, action: PublishAction, actor: Actor): Promise<CollectionRow<T>> {
      const row = await change((items) => {
        const current = items.find((i) => i.id === id);
        if (!current) throw notFoundError(noun);
        const updated = { ...applyAction(current, action, actor), id };
        return { items: items.map((i) => (i.id === id ? updated : i)), result: toRow(updated) };
      });
      await logActivity(actor, action, key, { id, label: title(row) });
      return row;
    },

    /** What the website shows: published items, in display order. */
    async published(): Promise<WithId<T>[]> {
      return (await readDocument(key, empty)).items
        .filter((item) => item.published !== null)
        .map((item) => ({ ...(item.published as T), id: item.id }))
        .sort(byOrder);
    },

    /** Preview: every item's saved version, published or not, in display order. */
    async drafts(): Promise<WithId<T>[]> {
      return (await readDocument(key, empty)).items.map((item) => ({ ...item.draft, id: item.id })).sort(byOrder);
    },
  };
}

export type Collection<T extends { order: number }> = ReturnType<typeof defineCollection<T>>;
