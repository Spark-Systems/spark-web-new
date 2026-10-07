"use server";

import { headers } from "next/headers";

import { backendFetch, BackendError, visitorHeaders } from "@/lib/api/backend";
import { parseContactForm, type ContactFormState } from "./validation";

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const { data, errors } = parseContactForm(formData);
  if (errors) return { status: "error", errors, values: data };

  const requestHeaders = await headers();
  try {
    await backendFetch("/api/v1/enquiries", {
      method: "POST",
      headers: { "content-type": "application/json", ...visitorHeaders(requestHeaders) },
      body: JSON.stringify({
        ...data,
        website: String(formData.get("website") ?? ""),
        source: requestHeaders.get("referer") ?? "",
      }),
    });
  } catch (error) {
    if (error instanceof BackendError && error.status === 429) {
      return { status: "error", message: "You've sent a few messages already. Please try again later.", values: data };
    }
    console.error("[contact] saving the enquiry failed", error);
    return { status: "error", message: "Sorry, your message couldn't be sent. Please email us instead.", values: data };
  }

  return { status: "success", message: "Thanks — we'll be in touch shortly." };
}
