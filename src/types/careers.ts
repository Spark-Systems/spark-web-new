import type { PageHeroContent, PageSeo, SectionIntro } from "./content";

/** A titled list inside a role ("Requirements", "What you'll do"). */
export interface RoleGroup {
  heading: string;
  items: string[];
}

/** An open position. */
export interface JobRole {
  id: string;
  title: string;
  /** Where the role is based, e.g. "5th Settlement, New Cairo". */
  location: string;
  groups: RoleGroup[];
}

/** Copy for the application form. */
export interface ApplyContent extends SectionIntro {
  lead: string;
  /** Options of the country list. */
  countries: string[];
  submitLabel: string;
  successMessage: string;
}

/** Everything the careers page renders; mirrors `GET /api/v1/pages/careers`. */
export interface CareersPageData {
  seo: PageSeo;
  hero: PageHeroContent;
  roles: SectionIntro & { items: JobRole[] };
  apply: ApplyContent;
}
