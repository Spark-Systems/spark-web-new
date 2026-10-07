import type { ContactContent, ImageAsset, PageHeroContent, PageSeo, SectionIntro } from "./content";

/** An article in the list: enough to show and link it. */
export interface InsightSummary {
  slug: string;
  title: string;
  category: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  summary: string;
  image: ImageAsset;
}

/** Everything the insights page renders; mirrors `GET /api/v1/pages/insights`. */
export interface InsightsPageData {
  seo: PageSeo;
  hero: PageHeroContent;
  /** The highlighted article (the one marked featured, else the newest), or null when there are none. */
  featured: (InsightSummary & { eyebrow: string; ctaLabel: string }) | null;
  posts: SectionIntro & {
    /** Label of the filter that shows every article. */
    allLabel: string;
    /** Categories in use, in order of first appearance. */
    categories: string[];
    items: InsightSummary[];
  };
  contact: ContactContent;
}

/** An article page (/insights/[slug]); mirrors `GET /api/v1/insights/:slug`. */
export interface InsightArticle extends InsightSummary {
  seo: PageSeo;
  /** Article body as HTML (from the admin's rich text editor). */
  body: string;
  /** Other recent articles, for "Keep reading". */
  more: InsightSummary[];
  contact: ContactContent;
}
