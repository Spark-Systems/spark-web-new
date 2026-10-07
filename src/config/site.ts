import type { NavLink } from "@/types/content";

/** The brand name, for logos and alt text. Editable company details (email, phone, description…) come from the admin. */
export const siteConfig = {
  name: "Spark Systems",
} as const;

/**
 * Route paths. Home sections are linked page-qualified ("/#work") so the links
 * work from every page (see <SmartLink />).
 */
export const routes = {
  home: "/",
  about: "/about",
  solutions: "/solutions",
  solution: (slug: string) => `/solutions/${slug}`,
  services: "/services",
  service: (slug: string) => `/services/${slug}`,
  contact: "/contact",
  work: "/work",
  project: (slug: string) => `/work/${slug}`,
  careers: "/careers",
  insights: "/insights",
  insight: (slug: string) => `/insights/${slug}`,
} as const;

/** Inline links shown in the header and floating nav on desktop. */
export const primaryNav: NavLink[] = [
  { label: "Solutions", href: routes.solutions },
  { label: "Services", href: routes.services },
  { label: "Work", href: routes.work },
];

export const contactCta: NavLink = { label: "Talk to us", href: "#contact" };

/** Smaller links listed under the main menu entries. */
export const menuSecondaryNav: NavLink[] = [
  { label: "Insights", href: routes.insights },
  { label: "Careers", href: routes.careers },
];

export const companyNav: NavLink[] = [
  { label: "About", href: routes.about },
  { label: "Work", href: routes.work },
  { label: "Services", href: routes.services },
  { label: "Insights", href: routes.insights },
  { label: "Careers", href: routes.careers },
  { label: "Contact", href: routes.contact },
];

