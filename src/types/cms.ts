import type { StaticImageData } from "next/image";
import type { AboutPageData } from "./about";
import type { ContactLine, ContactPageData } from "./contact";
import type { ContactContent, IconName, MenuItem, NavLink, PageHeroContent, PageSeo, SectionIntro } from "./content";
import type {
  HomeAiSection,
  HomeHero,
  HomeServicesSection,
  HomeSolutionsSection,
  HomeTestimonialsSection,
  HomeWorkSection,
} from "./home";
import type { OfferingDetail } from "./offering";
import type { ServicesPageData } from "./services";
import type { ProjectDetail, WorkPageData } from "./work";

/**
 * The stored content model: what the database keeps and the admin API reads
 * and writes. The website never sees these directly; server/content turns
 * them into the page types in this folder.
 *
 * Top-level record fields are snake_case (API convention); page content
 * blocks reuse the website's own camelCase types so they need no mapping.
 */

// ---- Shared -----------------------------------------------------------------

/**
 * An uploaded picture: its URL, intrinsic size and blur preview. Same shape as
 * a static image import, so website components take it as `src` unchanged.
 */
export type UploadedImage = StaticImageData;

/**
 * Where a draft/publish document stands:
 * - draft: never published, or unpublished (not on the website)
 * - published: the website shows exactly the saved version
 * - changed: published, with saved edits not yet published
 */
export type PublishStatus = "draft" | "published" | "changed";

/** Publication details the admin API adds to every draft/publish document. */
export interface PublishInfo {
  status: PublishStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  /** Name of the last person to save it. */
  updated_by: string | null;
}

/** Actions on a draft/publish document besides saving. */
export type PublishAction = "publish" | "unpublish" | "discard";

/** A row from a draft/publish list: its saved (draft) fields plus id and publication details. */
export type CollectionRow<T> = T & PublishInfo & { id: string };

// ---- Lists ------------------------------------------------------------------

/** A solution or service detail page, minus what comes from its list entry (slug, name) or is shared (contact copy). */
export interface OfferingContent {
  seo: PageSeo;
  hero: PageHeroContent;
  overview: Omit<OfferingDetail["overview"], "name">;
  features: OfferingDetail["features"];
  process: OfferingDetail["process"];
  inUse: OfferingDetail["inUse"];
}

/** A case study, minus its slug and the shared contact copy. */
export type CaseStudyContent = Omit<ProjectDetail, "slug" | "contact">;

export interface SolutionRecord {
  /** URL segment, e.g. "ticketing" for /solutions/ticketing. */
  slug: string;
  name: string;
  image: UploadedImage;
  /** Shown as a large card in "Flagship platforms". */
  flagship: boolean;
  /** Flagship card text. */
  description: string;
  tags: string[];
  icon: IconName;
  /** Has its own page; otherwise links go to the contact form. */
  has_detail: boolean;
  detail: OfferingContent | null;
  /** Display order, lowest first. */
  order: number;
}

export interface ServiceRecord {
  slug: string;
  name: string;
  /** One-line pitch, shown large. */
  summary: string;
  description: string;
  capabilities: string[];
  icon: IconName;
  image: UploadedImage;
  has_detail: boolean;
  detail: OfferingContent | null;
  order: number;
}

export interface ProjectRecord {
  slug: string;
  name: string;
  /** Portfolio filter ("Development", "Mobile", …). */
  category: string;
  summary: string;
  image: UploadedImage;
  /** Has a case study page. */
  has_detail: boolean;
  detail: CaseStudyContent | null;
  order: number;
}

/** A company shown by its logo: a client or a partner. */
export interface LogoRecord {
  name: string;
  logo: UploadedImage;
  /** The company's website; "" when there's none. */
  link: string;
  /** Partners: print the name beside a symbol-only logo. */
  show_name: boolean;
  /** Draw the logo in white (for dark marks on a transparent background). */
  invert: boolean;
  order: number;
}

export interface OfficeRecord {
  city: string;
  country: string;
  hq: boolean;
  /** IANA time zone for the live clock, e.g. "Africa/Cairo". */
  time_zone: string;
  address: string;
  map_url: string;
  lines: ContactLine[];
  order: number;
}

/** Draft/publish lists, by API path. */
export interface CollectionMap {
  solutions: SolutionRecord;
  services: ServiceRecord;
  projects: ProjectRecord;
  clients: LogoRecord;
  partners: LogoRecord;
  offices: OfficeRecord;
}
export type CollectionKey = keyof CollectionMap;

// ---- Pages ------------------------------------------------------------------

export interface HomeContent {
  hero: HomeHero;
  solutions: HomeSolutionsSection;
  services: HomeServicesSection;
  clients: { moreLink: NavLink; partnersLabel: string };
  work: HomeWorkSection;
  testimonials: HomeTestimonialsSection;
  ai: HomeAiSection;
}

export interface AboutContent extends Omit<AboutPageData, "clients" | "partnerships" | "contact"> {
  /** Logos come from the clients list. */
  clients: SectionIntro;
  /** The first two partners from the partners list, each captioned with `label`. */
  partnerships: SectionIntro & { label: string };
}

export interface SolutionsPageContent {
  seo: PageSeo;
  hero: PageHeroContent;
  flagships: SectionIntro & { lead: string };
  catalog: SectionIntro;
}

export interface ServicesPageContent {
  seo: PageSeo;
  hero: PageHeroContent;
  areas: SectionIntro;
  approach: ServicesPageData["approach"];
}

export interface WorkPageContent {
  seo: PageSeo;
  hero: PageHeroContent;
  portfolio: SectionIntro & { allLabel: string };
  featured: WorkPageData["featured"];
}

export interface ContactPageContent {
  seo: PageSeo;
  hero: PageHeroContent;
  offices: { eyebrow: string };
  /** The email comes from the layout's company details, the social links from the settings. */
  enquiry: Omit<ContactPageData["enquiry"], "email" | "socials">;
}

/** Site-wide content: the menu, footer and shared contact copy. */
export interface LayoutContent {
  email: string;
  phone: NavLink;
  foundedYear: number;
  menu: MenuItem[];
  footer: { slogan: string; blurb: string };
  contact: ContactContent;
}

/** Draft/publish page documents, by API path. */
export interface PageContentMap {
  home: HomeContent;
  about: AboutContent;
  solutions: SolutionsPageContent;
  services: ServicesPageContent;
  work: WorkPageContent;
  contact: ContactPageContent;
  layout: LayoutContent;
}
export type PageKey = keyof PageContentMap;

/** A page document as the admin API returns it: the saved (draft) content plus publication details. */
export type PageDocument<K extends PageKey = PageKey> = PublishInfo & { content: PageContentMap[K] };

// ---- Settings ---------------------------------------------------------------

export interface MetaSettings {
  site_name: string;
  /** Default meta description for search engines and link previews. */
  description: string;
  keywords: string[];
}

export const socialPlatforms = ["facebook", "instagram", "x", "linkedin", "youtube"] as const;
export type SocialPlatform = (typeof socialPlatforms)[number];

export interface SocialLinkSetting {
  url: string;
  /** Uploaded icon (SVG) URL, or null to use the built-in icon. */
  icon_url: string | null;
}

export type SocialLinks = Record<SocialPlatform, SocialLinkSetting>;

/** Stored form, secrets included; the API never returns the secrets. */
export interface AdvancedSettingsRecord {
  website_url: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_use_ssl: boolean;
  default_email_address: string;
  default_email_name: string;
  notification_email: string;
  recaptcha_site_key: string;
  recaptcha_secret_key: string;
  google_analytics_code: string;
  google_analytics_emails: string[];
  seo_scripts: string;
}

export interface SettingsRecord {
  meta: MetaSettings;
  social: SocialLinks;
  advanced: AdvancedSettingsRecord;
}

// ---- Records without drafts -------------------------------------------------

export type EnquiryStatus = "new" | "read" | "archived";

/** A message sent through the website's contact form. */
export interface Enquiry {
  id: string;
  name: string;
  company: string;
  email: string;
  message: string;
  status: EnquiryStatus;
  created_at: string;
  /** The page it was sent from. */
  source: string;
}

export type UserRole = "admin" | "editor" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  last_login_at: string | null;
}

export type ActivityAction = "create" | "update" | "delete" | "publish" | "unpublish" | "discard" | "login";

/** One entry in the activity log. */
export interface ActivityEntry {
  id: string;
  at: string;
  user_id: string;
  user_name: string;
  action: ActivityAction;
  /** What was changed, e.g. "solutions", "pages/home", "settings". */
  resource: string;
  resource_id: string | null;
  /** Human-readable name of the item at the time, e.g. "Ticketing". */
  label: string;
}
