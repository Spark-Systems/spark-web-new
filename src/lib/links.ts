import { routes } from "@/config/site";

interface Linkable {
  slug: string;
  hasDetail: boolean;
}

/** Where a solution links: its detail page when it has one, otherwise the contact form. */
export const solutionHref = (s: Linkable) => (s.hasDetail ? routes.solution(s.slug) : "#contact");

/** Where a service links: its detail page when it has one, otherwise the contact form. */
export const serviceHref = (s: Linkable) => (s.hasDetail ? routes.service(s.slug) : "#contact");

/** Where a project links: its case study when it has one, otherwise the contact form. */
export const projectHref = (p: Linkable) => (p.hasDetail ? routes.project(p.slug) : "#contact");
