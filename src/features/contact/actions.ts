"use server";

import { parseContactForm, type ContactFormState } from "./validation";

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const { data, errors } = parseContactForm(formData);
  if (errors) return { status: "error", errors, values: data };

  // TODO: deliver the enquiry (email provider, CRM, etc.).

  return { status: "success", message: "Thanks — we'll be in touch shortly." };
}
