import type { ContactContent, ImageAsset, NavLink, PageHeroContent, PageSeo, SectionIntro, Stat } from "./content";

/** A project in the portfolio: enough to list, filter and link it. */
export interface ProjectSummary {
  slug: string;
  name: string;
  /** Portfolio filter it belongs to ("Development", "Mobile", …). */
  category: string;
  /** One line under the card. */
  summary: string;
  image: ImageAsset;
  /** True when /work/[slug] has a case study; otherwise the card links to the contact form. */
  hasDetail: boolean;
}

/** Everything the work overview renders; mirrors the future `GET /pages/work` response. */
export interface WorkPageData {
  seo: PageSeo;
  hero: PageHeroContent;
  portfolio: SectionIntro & {
    /** Label of the filter that shows every project. */
    allLabel: string;
    items: ProjectSummary[];
  };
  featured: {
    eyebrow: string;
    /** The featured project's case study. */
    slug: string;
    name: string;
    summary: string;
    ctaLabel: string;
    stats: Stat[];
  };
  contact: ContactContent;
}

/** A label/value fact ("Client: Saudi Tickets"). */
export interface ProjectFact {
  label: string;
  value: string;
}

/** A titled paragraph (challenge, approach, outcome). */
export interface StoryBlock {
  title: string;
  body: string;
}

/** A key feature with the screen shown while it is active. */
export interface ProjectFeature {
  title: string;
  body: string;
  image: ImageAsset;
}

export interface GalleryImage {
  image: ImageAsset;
  caption: string;
}

/** Device frame a screen is shown in. */
export type DeviceKind = "web" | "mobile" | "tablet" | "pos";

export interface DeviceScreen {
  kind: DeviceKind;
  label: string;
  image: ImageAsset;
}

/** A results figure; without a value it renders as a marked placeholder. */
export interface ResultFigure {
  label: string;
  value?: number;
  suffix?: string;
}

export interface ProjectTestimonial {
  quote: string;
  author: string;
  role: string;
  logo?: ImageAsset;
  /** Marks a quote still awaiting the client. */
  placeholder?: boolean;
}

/** A case study page (/work/[slug]); mirrors the future `GET /work/:slug` response. */
export interface ProjectDetail {
  slug: string;
  seo: PageSeo;
  hero: PageHeroContent;
  facts: ProjectFact[];
  /** Overview statement that fills in word by word as it scrolls into view. */
  statement: string;
  /** Wide image that opens out from a rounded inset as it scrolls in. */
  showcase: ImageAsset;
  story: StoryBlock[];
  features: SectionIntro & { items: ProjectFeature[] };
  gallery: { title: string; items: GalleryImage[] };
  devices: SectionIntro & { items: DeviceScreen[] };
  comparison?: SectionIntro & { hint: string; before: ImageAsset; after: ImageAsset };
  results: {
    eyebrow: string;
    headline: Stat;
    /** The Spark solution the project runs on. */
    builtOn?: NavLink & { eyebrow: string };
    figures: ResultFigure[];
  };
  testimonial?: ProjectTestimonial & { eyebrow: string };
  contact: ContactContent;
}

/** The "Next" panel at the end of a case study. */
export interface NextProject {
  name: string;
  category: string;
  image: ImageAsset;
  href: string;
}
