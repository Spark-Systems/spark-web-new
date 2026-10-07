import "server-only";

import { applications } from "@/server/db";
import { newId, now } from "@/server/db/ids";
import { HttpError } from "@/server/http/respond";
import { storage } from "@/server/storage";
import type { Application, ApplicationCv } from "@/types/cms";

/** Vercel caps request bodies at 4.5 MB; the rest of the form is small. */
export const MAX_CV_BYTES = 4 * 1024 * 1024;

/** Accepted CV formats, recognised by their first bytes (never the file name). */
function cvType(body: Buffer): string | null {
  if (body.subarray(0, 4).toString("latin1") === "%PDF") return "application/pdf";
  // Word 97–2003 (OLE compound file).
  if (body.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return "application/msword";
  // .docx is a zip with a word/ folder.
  if (body.subarray(0, 2).toString("latin1") === "PK" && body.includes("word/")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return null;
}

/** Where a CV is kept: a private document (encrypted in a public Blob store). */
const cvKey = (applicationId: string) => `cvs/${applicationId}`;

interface StoredCv {
  name: string;
  type: string;
  /** Base64 file contents. */
  data: string;
}

export async function readCv(applicationId: string): Promise<{ name: string; type: string; body: Buffer } | null> {
  const stored = await storage().readJson<StoredCv>(cvKey(applicationId));
  return stored && { name: stored.data.name, type: stored.data.type, body: Buffer.from(stored.data.data, "base64") };
}

export async function deleteCv(applicationId: string) {
  await storage().deleteJson([cvKey(applicationId)]);
}

// Flood brake: a few applications per sender in a window, per server instance.
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

export interface ApplicationInput {
  name: string;
  email: string;
  mobile: string;
  country: string;
  position: string;
  cover_letter: string;
  /** Honeypot: filled in only by bots. */
  website?: string;
}

/**
 * Saves a job application (and its CV, if one was attached). Bot submissions
 * look successful but aren't stored. Throws HttpError for a bad CV or too many
 * submissions.
 */
export async function createApplication(input: ApplicationInput, cvFile: File | null, sender: string): Promise<Application | null> {
  if (input.website) return null;

  let cv: ApplicationCv | null = null;
  let cvBody: Buffer | null = null;
  if (cvFile && cvFile.size > 0) {
    if (cvFile.size > MAX_CV_BYTES) throw new HttpError(413, "The CV is larger than 4 MB", "too_large");
    cvBody = Buffer.from(await cvFile.arrayBuffer());
    const type = cvType(cvBody);
    if (!type) throw new HttpError(415, "Upload your CV as a PDF or Word document", "unsupported_type");
    cv = { name: cvFile.name.slice(0, 200) || "cv", type, size: cvFile.size };
  }

  if (!allow(sender)) throw new HttpError(429, "Too many applications. Please try again later.", "rate_limited");

  const application: Application = {
    id: newId("app"),
    name: input.name.trim(),
    email: input.email.trim(),
    mobile: input.mobile.trim(),
    country: input.country.trim(),
    position: input.position.trim(),
    cover_letter: input.cover_letter.trim(),
    cv,
    status: "new",
    created_at: now(),
  };
  if (cv && cvBody) {
    await storage().writeJson(cvKey(application.id), { name: cv.name, type: cv.type, data: cvBody.toString("base64") });
  }
  return applications.insert(application);
}
