"use server";

import { headers } from "next/headers";

import { backendFetch, BackendError, visitorHeaders } from "@/lib/api/backend";
import { applicationSubmitSchema } from "@/lib/cms/schemas";

export type ApplicationField = "name" | "email" | "mobile" | "country" | "position" | "cover_letter" | "cv";

export interface ApplicationFormState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ApplicationField, string>>;
}

const fieldMessages: Partial<Record<ApplicationField, string>> = {
  name: "Please tell us your name.",
  email: "Please enter a valid email address.",
  mobile: "Please add a mobile number we can reach you on.",
};

/** The careers form: saves the application (and CV) for the admin's Applications inbox. */
export async function submitApplication(_prev: ApplicationFormState, formData: FormData): Promise<ApplicationFormState> {
  const text = (key: string) => String(formData.get(key) ?? "");
  const parsed = applicationSubmitSchema.safeParse({
    name: text("name"),
    email: text("email"),
    mobile: text("mobile"),
    country: text("country"),
    position: text("position"),
    cover_letter: text("cover_letter"),
    website: text("website") || undefined,
  });
  if (!parsed.success) {
    const errors: ApplicationFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ApplicationField;
      errors[field] ??= fieldMessages[field] ?? "Please check this field.";
    }
    return { status: "error", errors };
  }

  // Sent on to the backend as the same multipart form (it checks the CV itself).
  const body = new FormData();
  for (const [name, value] of Object.entries(parsed.data)) if (value !== undefined) body.set(name, value);
  const cv = formData.get("cv");
  if (cv instanceof File && cv.size > 0) body.set("cv", cv, cv.name);

  try {
    await backendFetch("/api/v1/applications", {
      method: "POST",
      headers: visitorHeaders(await headers()),
      body,
    });
  } catch (error) {
    // The backend's own wording for problems the visitor can fix (CV type or size, too many tries).
    if (error instanceof BackendError && error.status < 500) {
      return error.code === "too_large" || error.code === "unsupported_type"
        ? { status: "error", errors: { cv: error.message } }
        : { status: "error", message: error.message };
    }
    console.error("[careers] saving the application failed", error);
    return { status: "error", message: "Sorry, your application couldn't be sent. Please try again later." };
  }
  return { status: "success" };
}
