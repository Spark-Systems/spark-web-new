import { advancedSettingsSchema, metaSettingsSchema, socialLinksSchema } from "@/lib/cms/schemas";
import { requireSession } from "@/server/auth";
import { revalidateContent } from "@/server/content/revalidate";
import { readSettings, updateSettings } from "@/server/db";
import { handle, HttpError, json, readBody } from "@/server/http/respond";
import type { AdvancedSettingsRecord, SettingsRecord } from "@/types/cms";

type Context = { params: Promise<{ group: string }> };

/** Secrets are write-only: the API says whether they're set, never what they are. */
const publicAdvanced = (stored: AdvancedSettingsRecord) => ({
  ...stored,
  smtp_password: "",
  smtp_password_set: stored.smtp_password !== "",
  recaptcha_secret_key: "",
  recaptcha_secret_set: stored.recaptcha_secret_key !== "",
});

const present = <G extends keyof SettingsRecord>(group: G, value: SettingsRecord[G]) =>
  group === "advanced" ? publicAdvanced(value as AdvancedSettingsRecord) : value;

async function groupParam(params: Context["params"]): Promise<keyof SettingsRecord> {
  const { group } = await params;
  if (group !== "meta" && group !== "social" && group !== "advanced") throw new HttpError(404, "Unknown settings group", "not_found");
  return group;
}

/** GET /api/admin/settings/meta | social | advanced */
export const GET = handle<Context>(async (request, { params }) => {
  const group = await groupParam(params);
  // Advanced settings include mail and reCAPTCHA configuration: admins only.
  await requireSession(request, group === "advanced" ? "admin" : "viewer");
  return json(present(group, (await readSettings())[group]));
});

/** PUT /api/admin/settings/meta | social | advanced. Takes effect on the website straight away. */
export const PUT = handle<Context>(async (request, { params }) => {
  const group = await groupParam(params);
  const { actor } = await requireSession(request, "admin");
  let saved: unknown;
  if (group === "meta") {
    const input = await readBody(request, metaSettingsSchema);
    saved = await updateSettings("meta", () => input, actor);
  } else if (group === "social") {
    const input = await readBody(request, socialLinksSchema);
    saved = await updateSettings("social", () => input, actor);
  } else {
    const input = await readBody(request, advancedSettingsSchema);
    saved = publicAdvanced(
      await updateSettings(
        "advanced",
        (current) => ({
          ...input,
          // An empty secret means "keep the stored one".
          smtp_password: input.smtp_password || current.smtp_password,
          recaptcha_secret_key: input.recaptcha_secret_key || current.recaptcha_secret_key,
        }),
        actor,
      ),
    );
  }
  revalidateContent();
  return json(saved);
});
