export interface ContactInput {
  name: string;
  company: string;
  email: string;
  message: string;
}

export type ContactField = keyof ContactInput;

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<ContactField, string>>;
  values?: Partial<ContactInput>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseContactForm(formData: FormData): {
  data: ContactInput;
  errors: ContactFormState["errors"];
} {
  const get = (key: ContactField) => String(formData.get(key) ?? "").trim();
  const data: ContactInput = {
    name: get("name"),
    company: get("company"),
    email: get("email"),
    message: get("message"),
  };

  const errors: NonNullable<ContactFormState["errors"]> = {};
  if (!data.name) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.message.length < 10) errors.message = "Tell us a little more (10+ characters).";

  return { data, errors: Object.keys(errors).length ? errors : undefined };
}
