import { readDocument, updateDocument } from "./document";
import { notFoundError } from "./errors";

interface StoredRecords<T> {
  items: T[];
}

/**
 * A plain list of records in one document, without drafts: users, enquiries,
 * the activity log. `limit` keeps only the newest records (by insertion).
 */
export function defineRecords<T extends { id: string }>(
  key: string,
  { label, limit, backup = true }: { label: string; limit?: number; backup?: boolean },
) {
  const empty = (): StoredRecords<T> => ({ items: [] });

  return {
    async all(): Promise<T[]> {
      return (await readDocument(key, empty)).items;
    },

    async get(id: string): Promise<T | null> {
      return (await this.all()).find((item) => item.id === id) ?? null;
    },

    async insert(item: T): Promise<T> {
      return updateDocument(
        key,
        empty,
        (doc) => {
          const items = [...doc.items, item];
          return { next: { items: limit ? items.slice(-limit) : items }, result: item };
        },
        { backup },
      );
    },

    /** Applies `change` to one record (it may throw to reject the update). */
    async update(id: string, change: (item: T, all: T[]) => T): Promise<T> {
      return updateDocument(
        key,
        empty,
        (doc) => {
          const current = doc.items.find((item) => item.id === id);
          if (!current) throw notFoundError(label);
          const updated = change(current, doc.items);
          return { next: { items: doc.items.map((item) => (item.id === id ? updated : item)) }, result: updated };
        },
        { backup },
      );
    },

    /** Removes the records and returns the ones that existed. */
    async remove(ids: string[]): Promise<T[]> {
      return updateDocument(
        key,
        empty,
        (doc) => ({
          next: { items: doc.items.filter((item) => !ids.includes(item.id)) },
          result: doc.items.filter((item) => ids.includes(item.id)),
        }),
        { backup },
      );
    },
  };
}
