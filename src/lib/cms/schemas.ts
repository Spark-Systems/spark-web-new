import { z } from "zod";

import type {
  AboutContent,
  AdvancedSettingsRecord,
  CaseStudyContent,
  ContactPageContent,
  HomeContent,
  LayoutContent,
  LogoRecord,
  MetaSettings,
  OfferingContent,
  OfficeRecord,
  PageContentMap,
  PageKey,
  ProjectRecord,
  ServiceRecord,
  ServicesPageContent,
  SocialLinks,
  SolutionRecord,
  SolutionsPageContent,
  WorkPageContent,
} from "@/types/cms";
import { socialPlatforms } from "@/types/cms";
import {
  contactContent,
  href,
  icon,
  imageAsset,
  imageSource,
  navLink,
  optionalText,
  order,
  pageHero,
  processStep,
  sectionIntro,
  seo,
  slug,
  stat,
  tags,
  text,
  uploadedImage,
  webUrl,
} from "./fields";

/**
 * Validation for everything the admin API saves. Each schema is checked
 * against its TypeScript type (`satisfies`), so the two can't drift apart.
 */

// ---- Detail pages -----------------------------------------------------------

export const offeringContentSchema = z.object({
  seo,
  hero: pageHero,
  overview: z.object({ tags: tags(10), statement: text(600) }),
  features: sectionIntro.extend({
    items: z.array(z.object({ icon, title: text(120), body: text(600), image: imageAsset })).min(1).max(12),
  }),
  process: sectionIntro.extend({ steps: z.array(processStep).min(1).max(8) }),
  inUse: sectionIntro.extend({
    stat: stat.optional(),
    cases: z.array(z.object({ name: text(120), image: imageAsset, href })).max(12),
  }),
}) satisfies z.ZodType<OfferingContent>;

const deviceKind = z.enum(["web", "mobile", "tablet", "pos"]);

export const caseStudyContentSchema = z.object({
  seo,
  hero: pageHero,
  facts: z.array(z.object({ label: text(60), value: text(160) })).max(8),
  statement: text(600),
  showcase: imageAsset,
  story: z.array(z.object({ title: text(120), body: text(1200) })).max(6),
  features: sectionIntro.extend({
    items: z.array(z.object({ title: text(120), body: text(600), image: imageAsset })).min(1).max(12),
  }),
  gallery: z.object({
    title: text(200),
    items: z.array(z.object({ image: imageAsset, caption: optionalText(200) })).min(1).max(20),
  }),
  devices: sectionIntro.extend({
    items: z.array(z.object({ kind: deviceKind, label: text(60), image: imageAsset })).min(1).max(8),
  }),
  comparison: sectionIntro.extend({ hint: text(80), before: imageAsset, after: imageAsset }).optional(),
  results: z.object({
    eyebrow: text(80),
    headline: stat,
    builtOn: navLink.extend({ eyebrow: text(80) }).optional(),
    figures: z
      .array(
        z.object({
          label: text(160),
          // Left empty (null in the form) while the figure is unconfirmed.
          value: z.number().finite().nullish().transform((v) => v ?? undefined),
          suffix: optionalText(12).optional(),
        }),
      )
      .max(8),
  }),
  testimonial: z
    .object({
      eyebrow: text(80),
      quote: text(1000),
      author: text(120),
      role: text(160),
      logo: imageAsset.nullish().transform((v) => v ?? undefined),
      placeholder: z.boolean().optional(),
    })
    .optional(),
}) satisfies z.ZodType<CaseStudyContent>;

// ---- Lists ------------------------------------------------------------------

/**
 * The detail page of a list item (`detail`) is validated only while it's
 * switched on (`has_detail`). Switched off, whatever was there is kept as is
 * (so switching back restores it) and the website ignores it.
 */
function withDetailPage<D extends z.ZodType>(detail: D) {
  return <S extends { has_detail: boolean; detail: unknown }>(value: S, ctx: z.RefinementCtx) => {
    if (!value.has_detail) return { ...value, detail: (value.detail ?? null) as z.output<D> | null };
    if (value.detail === null || value.detail === undefined) {
      ctx.addIssue({ code: "custom", path: ["detail"], message: "Add the detail page content, or turn off the detail page" });
      return z.NEVER;
    }
    const parsed = detail.safeParse(value.detail);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        ctx.addIssue({ code: "custom", path: ["detail", ...issue.path], message: issue.message });
      }
      return z.NEVER;
    }
    return { ...value, detail: parsed.data as z.output<D> };
  };
}

const detailFields = { has_detail: z.boolean(), detail: z.unknown() };

export const solutionSchema = z
  .object({
    slug,
    name: text(120),
    image: uploadedImage,
    flagship: z.boolean(),
    description: optionalText(400),
    tags: tags(8),
    icon,
    ...detailFields,
    order,
  })
  .superRefine((value, ctx) => {
    if (value.flagship && !value.description) {
      ctx.addIssue({ code: "custom", path: ["description"], message: "Flagship solutions need a description" });
    }
  })
  .transform(withDetailPage(offeringContentSchema)) satisfies z.ZodType<SolutionRecord>;

export const serviceSchema = z
  .object({
    slug,
    name: text(120),
    summary: text(240),
    description: text(800),
    capabilities: tags(10),
    icon,
    image: uploadedImage,
    ...detailFields,
    order,
  })
  .transform(withDetailPage(offeringContentSchema)) satisfies z.ZodType<ServiceRecord>;

export const projectSchema = z
  .object({
    slug,
    name: text(120),
    category: text(60),
    summary: text(300),
    image: uploadedImage,
    ...detailFields,
    order,
  })
  .transform(withDetailPage(caseStudyContentSchema)) satisfies z.ZodType<ProjectRecord>;

export const logoSchema = z.object({
  name: text(160),
  logo: uploadedImage,
  link: z.union([z.literal(""), webUrl]),
  show_name: z.boolean(),
  invert: z.boolean(),
  order,
}) satisfies z.ZodType<LogoRecord>;

const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const officeSchema = z.object({
  city: text(80),
  country: text(80),
  hq: z.boolean(),
  time_zone: z.string().trim().min(1).refine(isTimeZone, "Unknown time zone, e.g. Africa/Cairo"),
  address: text(300),
  map_url: webUrl,
  lines: z
    .array(
      z.object({
        type: z.enum(["phone", "mobile", "email"]),
        label: text(40),
        value: text(120),
        href: z.string().trim().regex(/^(tel:\+?[\d]+|mailto:\S+@\S+)$/, "Use tel:+201234567 or mailto:name@example.com"),
      }),
    )
    .max(8),
  order,
}) satisfies z.ZodType<OfficeRecord>;

// ---- Pages ------------------------------------------------------------------

const uploadedAsset = z.object({ src: uploadedImage, alt: optionalText(300) });

export const homeContentSchema = z.object({
  hero: z.object({
    titleStart: text(80),
    titleEnd: text(80),
    videoSrc: webUrl,
    paragraphs: z.array(text(600)).min(1).max(4),
    stats: z.array(stat).max(4),
  }),
  solutions: z.object({
    title: text(200),
    highlight: z.object({ value: text(20), label: text(80), tbc: optionalText(80) }),
    cta: navLink,
    items: z
      .array(
        z.object({
          id: text(60),
          title: text(80),
          caption: text(120),
          description: text(300),
          image: uploadedImage,
          imageAlt: optionalText(300),
          theme: z.enum(["brand", "navy"]),
          href,
        }),
      )
      .min(1)
      .max(8),
  }),
  services: z.object({
    title: text(120),
    items: z.array(z.object({ name: text(80), description: text(300), image: uploadedImage })).min(1).max(12),
  }),
  clients: z.object({ moreLink: navLink, partnersLabel: text(80) }),
  work: z.object({
    intro: z.object({ before: text(40), after: text(40), image: uploadedImage, imageAlt: optionalText(300) }),
    title: text(120),
    cta: navLink,
    items: z
      .array(
        z.object({
          title: text(120),
          subtitle: text(200),
          subtitleTbc: z.boolean().optional(),
          tags: tags(6),
          metric: z.object({ value: text(30), label: text(80) }),
          image: uploadedImage,
          href,
        }),
      )
      .min(1)
      .max(8),
  }),
  testimonials: z.object({
    eyebrow: text(80),
    title: text(200),
    items: z
      .array(
        z.object({
          quote: text(1000),
          author: text(120),
          role: optionalText(160).optional(),
          company: text(120),
          // Optional: left empty (null in the form) when there's no logo.
          logo: uploadedImage.nullish().transform((v) => v ?? undefined),
        }),
      )
      .max(12),
  }),
  ai: z.object({
    title: text(200),
    lead: text(400),
    capabilities: z.array(z.object({ title: text(60), description: text(400) })).min(1).max(6),
  }),
}) satisfies z.ZodType<HomeContent>;

const mvvBase = { id: text(40), label: text(40), eyebrow: text(80), image: imageAsset };

export const aboutContentSchema = z.object({
  seo,
  hero: pageHero,
  intro: z.object({ statement: text(600), stats: z.array(stat).max(6) }),
  mvv: z.object({
    title: text(200),
    steps: z
      .array(
        z.discriminatedUnion("kind", [
          z.object({ ...mvvBase, kind: z.literal("statement"), text: text(400) }),
          z.object({
            ...mvvBase,
            kind: z.literal("values"),
            values: z.array(z.object({ title: text(80), body: text(300) })).min(1).max(6),
          }),
        ]),
      )
      .min(1)
      .max(5),
  }),
  story: sectionIntro.extend({
    milestones: z
      .array(z.object({ year: text(10), title: text(120), body: text(500), icon, tbc: z.boolean().optional() }))
      .min(1)
      .max(20),
  }),
  clients: sectionIntro,
  partnerships: sectionIntro.extend({ label: text(40) }),
}) satisfies z.ZodType<AboutContent>;

export const solutionsPageSchema = z.object({
  seo,
  hero: pageHero,
  flagships: sectionIntro.extend({ lead: text(400) }),
  catalog: sectionIntro,
}) satisfies z.ZodType<SolutionsPageContent>;

export const servicesPageSchema = z.object({
  seo,
  hero: pageHero,
  areas: sectionIntro,
  approach: sectionIntro.extend({
    lead: text(400),
    steps: z.array(z.object({ title: text(80), body: text(400) })).min(1).max(8),
  }),
}) satisfies z.ZodType<ServicesPageContent>;

export const workPageSchema = z.object({
  seo,
  hero: pageHero,
  portfolio: sectionIntro.extend({ allLabel: text(40) }),
  featured: z.object({
    eyebrow: text(80),
    slug,
    name: text(120),
    summary: text(600),
    ctaLabel: text(60),
    stats: z.array(stat).max(6),
  }),
}) satisfies z.ZodType<WorkPageContent>;

const prompt = z.object({ prompt: text(120), placeholder: text(80) });

export const contactPageSchema = z.object({
  seo,
  hero: pageHero,
  offices: z.object({ eyebrow: text(80) }),
  enquiry: z.object({
    eyebrow: text(80),
    lead: text(400),
    emailPrompt: text(80),
    form: z.object({
      name: prompt,
      company: prompt,
      email: prompt,
      message: prompt,
      submitLabel: text(120),
      successMessage: text(200),
      resetLabel: text(60),
    }),
  }),
}) satisfies z.ZodType<ContactPageContent>;

export const layoutContentSchema = z.object({
  email: z.email(),
  phone: navLink,
  foundedYear: z.number().int().min(1900).max(2100),
  menu: z
    .array(z.object({ label: text(40), href, brief: text(200), image: uploadedImage }))
    .min(1)
    .max(10),
  footer: z.object({ slogan: text(60), blurb: text(400) }),
  contact: contactContent,
}) satisfies z.ZodType<LayoutContent>;

/** Content schema of each page, by API path. */
export const pageSchemas = {
  home: homeContentSchema,
  about: aboutContentSchema,
  solutions: solutionsPageSchema,
  services: servicesPageSchema,
  work: workPageSchema,
  contact: contactPageSchema,
  layout: layoutContentSchema,
} satisfies { [K in PageKey]: z.ZodType<PageContentMap[K]> };

export const pageKeys = Object.keys(pageSchemas) as PageKey[];

export const isPageKey = (value: string): value is PageKey => value in pageSchemas;

// ---- Settings ---------------------------------------------------------------

export const metaSettingsSchema = z.object({
  site_name: text(80),
  description: text(320),
  keywords: tags(20, 40),
}) satisfies z.ZodType<MetaSettings>;

const socialLink = z.object({ url: z.union([z.literal(""), webUrl]), icon_url: z.string().max(2000).nullable() });

export const socialLinksSchema = z.object(
  Object.fromEntries(socialPlatforms.map((platform) => [platform, socialLink])) as Record<
    (typeof socialPlatforms)[number],
    typeof socialLink
  >,
) satisfies z.ZodType<SocialLinks>;

const optionalEmail = z.union([z.literal(""), z.email()]);

export const advancedSettingsSchema = z.object({
  website_url: z.union([z.literal(""), webUrl]),
  smtp_host: optionalText(200),
  smtp_port: z.number().int().min(1).max(65535),
  smtp_username: optionalText(200),
  /** "" keeps the stored password. */
  smtp_password: z.string().max(500),
  smtp_use_ssl: z.boolean(),
  default_email_address: optionalEmail,
  default_email_name: optionalText(120),
  notification_email: optionalEmail,
  recaptcha_site_key: optionalText(200),
  /** "" keeps the stored key. */
  recaptcha_secret_key: z.string().max(500),
  google_analytics_code: z.string().max(10_000),
  google_analytics_emails: z.array(z.email()).max(10),
  seo_scripts: z.string().max(20_000),
}) satisfies z.ZodType<AdvancedSettingsRecord>;

// ---- Users and enquiries ----------------------------------------------------

export const PASSWORD_MIN = 10;
const password = z.string().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters`).max(200);
const role = z.enum(["admin", "editor", "viewer"]);

export const loginSchema = z.object({ email: z.string().trim().min(1).max(200), password: z.string().min(1).max(200) });

export const userCreateSchema = z.object({ name: text(120), email: z.email(), role, password });

/** `password` left empty keeps the current one. */
export const userUpdateSchema = z.object({
  name: text(120),
  email: z.email(),
  role,
  password: z.union([z.literal(""), password]),
});

export const profileSchema = z.object({ name: text(120), email: z.email() });

export const passwordChangeSchema = z.object({ current_password: z.string().min(1).max(200), new_password: password });

export const enquirySubmitSchema = z.object({
  name: text(120),
  company: optionalText(160),
  email: z.email(),
  message: text(5000),
  /** Honeypot: hidden from people, so only bots fill it in. */
  website: z.string().max(0).optional(),
  source: optionalText(300).optional(),
});

export const enquiryStatusSchema = z.object({ status: z.enum(["new", "read", "archived"]) });

export { imageSource };
