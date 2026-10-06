import "server-only";

import type { ActivityAction, ActivityEntry } from "@/types/cms";
import { newId, now, type Actor } from "./ids";
import { defineRecords } from "./records";

/** The activity log keeps the newest entries only. */
export const activityLog = defineRecords<ActivityEntry>("activity", { label: "Entry", limit: 1000, backup: false });

/**
 * Records who changed what. Never throws: a failed log entry shouldn't undo
 * or fail the change it describes.
 */
export async function logActivity(
  actor: Actor,
  action: ActivityAction,
  resource: string,
  target: { id?: string | null; label: string },
) {
  try {
    await activityLog.insert({
      id: newId("act"),
      at: now(),
      user_id: actor.id,
      user_name: actor.name,
      action,
      resource,
      resource_id: target.id ?? null,
      label: target.label,
    });
  } catch (error) {
    console.error("[db] activity log write failed", error);
  }
}
