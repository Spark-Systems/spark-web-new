"use server";

import { headers } from "next/headers";

import { createEnquiry, senderOf } from "@/server/enquiries";
import { parseContactForm, type ContactFormState } from "./validation";

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const { data, errors } = parseContactForm(formData);
  if (errors) return { status: "error", errors, values: data };

  const requestHeaders = await headers();
  try {
    const result = await createEnquiry(
      {
        ...data,
        website: String(formData.get("website") ?? ""),
        source: requestHeaders.get("referer") ?? "",
      },
      senderOf(requestHeaders),
    );
    if (!result.ok) {
      return { status: "error", message: "You've sent a few messages already. Please try again later.", values: data };
    }
  } catch (error) {
    console.error("[contact] saving the enquiry failed", error);
    return { status: "error", message: "Sorry, your message couldn't be sent. Please email us instead.", values: data };
  }

  return { status: "success", message: "Thanks — we'll be in touch shortly." };
}
