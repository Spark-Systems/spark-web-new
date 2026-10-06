import "server-only";

import type { User } from "@/types/cms";
import { defineRecords } from "./records";

/** A user as stored: the public fields plus login secrets the API never returns. */
export interface StoredUser extends User {
  /** scrypt hash (see server/auth/password). */
  password_hash: string;
  /** Bumped on password change, which invalidates every token issued before. */
  token_version: number;
}

export const users = defineRecords<StoredUser>("users", { label: "User" });

/** Strips the login secrets. */
export function publicUser({ password_hash: _hash, token_version: _version, ...user }: StoredUser): User {
  return user;
}
