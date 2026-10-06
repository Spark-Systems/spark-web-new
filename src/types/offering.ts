import type {
  ContactContent,
  IconName,
  ImageAsset,
  PageHeroContent,
  PageSeo,
  ProcessStep,
  SectionIntro,
  Stat,
} from "./content";

/**
 * "Offering" covers anything Spark sells that gets its own detail page:
 * solutions (/solutions/[slug]) and services (/services/[slug]) share one
 * page layout and one data shape.
 */

/** One capability, paired with the image shown while it is in focus. */
export interface OfferingFeature {
  icon: IconName;
  title: string;
  body: string;
  image: ImageAsset;
}

/** A project or client where the offering is used, linking to its case study. */
export interface CaseLink {
  name: string;
  image: ImageAsset;
  href: string;
}

/** A solution or service detail page; mirrors the future `GET /solutions/:slug` and `GET /services/:slug` responses. */
export interface OfferingDetail {
  slug: string;
  seo: PageSeo;
  hero: PageHeroContent;
  overview: {
    name: string;
    tags: string[];
    /** Statement that fills in word by word as it scrolls into view. */
    statement: string;
  };
  features: SectionIntro & { items: OfferingFeature[] };
  process: SectionIntro & { steps: ProcessStep[] };
  /** Where it's used: an optional headline figure, then linked cases. */
  inUse: SectionIntro & { stat?: Stat; cases: CaseLink[] };
  contact: ContactContent;
}
