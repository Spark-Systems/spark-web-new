import type { ContactContent, IconName, ImageAsset, PageHeroContent, PageSeo, SectionIntro } from "./content";
import type { OfferingDetail } from "./offering";

/** One service area on the services overview. */
export interface ServiceArea {
  slug: string;
  name: string;
  icon: IconName;
  image: ImageAsset;
  /** One-line pitch, shown large. */
  summary: string;
  /** A longer paragraph under the pitch. */
  description: string;
  /** What the area covers ("UX research", "UI design", …). */
  capabilities: string[];
  /** True when /services/[slug] has a detail page; otherwise links go to the contact form. */
  hasDetail: boolean;
}

/** One stage of how Spark runs a project. */
export interface ApproachStep {
  title: string;
  body: string;
}

/** Everything the services overview renders; mirrors the future `GET /pages/services` response. */
export interface ServicesPageData {
  seo: PageSeo;
  hero: PageHeroContent;
  areas: SectionIntro & { items: ServiceArea[] };
  approach: SectionIntro & { lead: string; steps: ApproachStep[] };
  contact: ContactContent;
}

/** A service detail page (/services/[slug]); same shape as a solution detail page. */
export type ServiceDetail = OfferingDetail;
