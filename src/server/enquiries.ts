import "server-only";

import { enquiries } from "@/server/db";
import { newId, now } from "@/server/db/ids";
import type { Enquiry } from "@/types/cms";

export interface EnquiryInput {
  name: string;
  company: string;
  email: string;
  message: string;
  /** The page it was sent from. */
  source?: string;
  /** Honeypot field: filled in only by bots. */
  website?: string;
}

// Flood brake: a few messages per sender address in a window. In memory, so
// it's per server instance; enough to stop a script hammering the form.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function allow(sender: string) {
  const since = Date.now() - WINDOW_MS;
  const times = (recent.get(sender) ?? []).filter((t) => t > since);
  if (times.length >= MAX_PER_WINDOW) return false;
  recent.set(sender, [...times, Date.now()]);
  return true;
}

export type EnquiryResult = { ok: true; enquiry: Enquiry | null } | { ok: false; reason: "rate_limited" };

/**
 * Saves a contact form message to the Enquiries inbox. Bot submissions (the
 * honeypot is filled) look successful but aren't stored.
 */
export async function createEnquiry(input: EnquiryInput, sender: string): Promise<EnquiryResult> {
  if (input.website) return { ok: true, enquiry: null };
  if (!allow(sender)) return { ok: false, reason: "rate_limited" };
  const enquiry = await enquiries.insert({
    id: newId("enq"),
    name: input.name.trim(),
    company: input.company.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    status: "new",
    created_at: now(),
    source: input.source?.slice(0, 300) ?? "",
  });
  return { ok: true, enquiry };
}

/** Best guess at the client's address for rate limiting (behind Vercel's proxy). */
export const senderOf = (headers: Headers) =>
  headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
