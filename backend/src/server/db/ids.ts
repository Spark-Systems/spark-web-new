import { randomBytes } from "node:crypto";

/** A short unique id with a readable prefix, e.g. "sol_m1x2k3_9f4a". */
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${randomBytes(3).toString("hex")}`;

export const now = () => new Date().toISOString();

/** Who made a change: shown in the activity log and as "last edited by". */
export interface Actor {
  id: string;
  name: string;
}
