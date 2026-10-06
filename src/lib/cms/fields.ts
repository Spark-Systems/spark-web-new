import { z } from "zod";

import { contentIcons } from "./icons";

/**
 * Building blocks for the content schemas. Shared by the API (validating
 * what's saved) and the admin forms (validating as you type), so both apply
 * the same rules.
 */

/** A URL segment: lowercase letters and numbers separated by single hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;

/** Required text, trimmed. */
export const text = (max = 200) => z.string().trim().min(1).max(max);

/** Text that may be left empty. */
export const optionalText = (max = 200) => z.string().trim().max(max);

export const slug = z.string().trim().min(1).max(SLUG_MAX).regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens");

/** Where a link may point: a site path, a section (#contact), a web address, mailto: or tel:. */
export const href = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .regex(/^(\/|#|https?:\/\/|mailto:|tel:)/, "Start with /, #, https://, mailto: or tel:");

export const webUrl = z.string().trim().max(500).url();

/** An uploaded picture with its intrinsic size and optional blur preview (see UploadedImage). */
export const uploadedImage = z.object({
  src: z.string().trim().min(1).max(2000),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().max(10_000).optional(),
  blurWidth: z.number().optional(),
  blurHeight: z.number().optional(),
});

/** An uploaded picture or an external image URL (e.g. stock photography). */
export const imageSource = z.union([uploadedImage, webUrl]);

/** A picture plus its alt text ("" for decorative pictures). */
export const imageAsset = z.object({ src: imageSource, alt: optionalText(300) });

export const icon = z.enum(contentIcons);

export const tags = (max = 12, length = 60) => z.array(text(length)).max(max);

export const order = z.number().int().min(-9999).max(9999);

export const navLink = z.object({ label: text(120), href });

export const stat = z.object({
  value: z.number().finite(),
  suffix: optionalText(12).optional(),
  label: text(160),
});

export const seo = z.object({ title: text(120), description: text(320) });

export const sectionIntro = z.object({ eyebrow: text(80), title: text(240) });

export const pageHero = z.object({
  eyebrow: text(120),
  titleLines: z.array(text(80)).min(1).max(6),
  image: imageAsset,
});

export const processStep = z.object({ icon, title: text(120), body: text(600) });

export const contactContent = z.object({ title: text(240), lead: text(400), submitLabel: text(120) });
