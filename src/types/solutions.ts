import type { ContactContent, IconName, ImageAsset, PageHeroContent, PageSeo, SectionIntro } from "./content";
import type { OfferingDetail } from "./offering";

/** A solution in the catalogue: enough to list and link it. */
export interface SolutionSummary {
  slug: string;
  name: string;
  image: ImageAsset;
  /** True when /solutions/[slug] has a detail page; otherwise links go to the contact form. */
  hasDetail: boolean;
}

/** A flagship platform shown as a large card on the solutions overview. */
export interface FlagshipSolution extends SolutionSummary {
  icon: IconName;
  description: string;
  tags: string[];
}

/** Everything the solutions overview renders; mirrors the future `GET /pages/solutions` response. */
export interface SolutionsPageData {
  seo: PageSeo;
  hero: PageHeroContent;
  flagships: SectionIntro & { lead: string; items: FlagshipSolution[] };
  catalog: SectionIntro & { items: SolutionSummary[] };
  contact: ContactContent;
}

/** A solution detail page (/solutions/[slug]); same shape as a service detail page. */
export type SolutionDetail = OfferingDetail;
