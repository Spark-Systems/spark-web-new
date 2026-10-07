import type { ActivityAction, ActivityEntry } from "@/types/cms";
import { updateDocument } from "./document";
import { newId, now, type Actor } from "./ids";
import { defineRecords } from "./records";

const KEY = "activity";
const LIMIT = 1000;
/** Repeated saves of the same thing by the same person within this window count as one entry. */
const MERGE_WINDOW_MS = 10 * 60 * 1000;

/** The activity log keeps the newest entries only. */
export const activityLog = defineRecords<ActivityEntry>(KEY, { label: "Entry", limit: LIMIT, backup: false });

/**
 * Records who changed what. Saves of the same item by the same person in quick
 * succession (e.g. auto-saved drafts) update one entry instead of adding many.
 * Never throws: a failed log entry shouldn't undo or fail the change it describes.
 */
export async function logActivity(
  actor: Actor,
  action: ActivityAction,
  resource: string,
  target: { id?: string | null; label: string },
) {
  const entry: ActivityEntry = {
    id: newId("act"),
    at: now(),
    user_id: actor.id,
    user_name: actor.name,
    action,
    resource,
    resource_id: target.id ?? null,
    label: target.label,
  };
  try {
    await updateDocument(
      KEY,
      (): { items: ActivityEntry[] } => ({ items: [] }),
      (doc) => {
        const last = doc.items.at(-1);
        const merge =
          action === "update" &&
          last?.action === "update" &&
          last.user_id === entry.user_id &&
          last.resource === entry.resource &&
          last.resource_id === entry.resource_id &&
          Date.now() - new Date(last.at).getTime() < MERGE_WINDOW_MS;
        const items = merge ? [...doc.items.slice(0, -1), { ...last, at: entry.at, label: entry.label }] : [...doc.items, entry];
        return { next: { items: items.slice(-LIMIT) }, result: undefined };
      },
      { backup: false },
    );
  } catch (error) {
    console.error("[db] activity log write failed", error);
  }
}
