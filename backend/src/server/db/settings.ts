import type { SettingsRecord } from "@/types/cms";
import { logActivity } from "./activity";
import { readDocument, updateDocument } from "./document";
import type { Actor } from "./ids";

/** Used until the settings are first saved. */
const defaults = (): SettingsRecord => ({
  meta: {
    site_name: "Spark Systems",
    description:
      "Intelligent solutions, always delivered. Since 2008 Spark Systems has built the platforms organisations across the Middle East depend on every day.",
    keywords: [],
  },
  social: {
    facebook: { url: "", icon_url: null },
    instagram: { url: "", icon_url: null },
    x: { url: "", icon_url: null },
    linkedin: { url: "", icon_url: null },
    youtube: { url: "", icon_url: null },
  },
  advanced: {
    website_url: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_use_ssl: false,
    default_email_address: "",
    default_email_name: "",
    notification_email: "",
    recaptcha_site_key: "",
    recaptcha_secret_key: "",
    google_analytics_code: "",
    google_analytics_emails: [],
    seo_scripts: "",
  },
});

export async function readSettings(): Promise<SettingsRecord> {
  const stored = await readDocument("settings", defaults);
  // Fill in groups added after the settings were saved.
  return { ...defaults(), ...stored };
}

/** Replaces one settings group (meta, social or advanced). */
export async function updateSettings<G extends keyof SettingsRecord>(
  group: G,
  change: (current: SettingsRecord[G]) => SettingsRecord[G],
  actor: Actor,
): Promise<SettingsRecord[G]> {
  const result = await updateDocument("settings", defaults, (current) => {
    const value = change({ ...defaults()[group], ...current[group] });
    return { next: { ...current, [group]: value }, result: value };
  });
  await logActivity(actor, "update", "settings", { id: group, label: group });
  return result;
}
