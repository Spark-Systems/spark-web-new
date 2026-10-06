import type { Office, SocialLink } from "./contact";
import type { ContactContent, MenuItem, NavLink, Partner } from "./content";
import type { SolutionSummary } from "./solutions";

/** Company details shown across the site (header, menu, footer, contact page). */
export interface CompanyInfo {
  name: string;
  description: string;
  email: string;
  phone: NavLink;
  foundedYear: number;
}

/**
 * What the shared header, menu and footer render on every page; mirrors
 * `GET /api/v1/pages/layout`.
 */
export interface SiteLayoutData {
  company: CompanyInfo;
  /** SEO keywords from the site settings. */
  keywords: string[];
  menu: MenuItem[];
  footer: { slogan: string; blurb: string };
  /** Copy for the enquiry section most pages end with. */
  contact: ContactContent;
  solutions: SolutionSummary[];
  offices: Office[];
  partners: Partner[];
  socials: SocialLink[];
}
