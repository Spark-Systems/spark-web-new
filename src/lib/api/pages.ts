import { aboutPage } from "@/content/about";
import { contactPage } from "@/content/contact";
import { serviceDetails, servicesPage } from "@/content/services";
import { solutionDetails, solutionsPage } from "@/content/solutions";
import { projectCatalog, projectDetails, workPage } from "@/content/work";
import type { AboutPageData } from "@/types/about";
import type { ContactPageData } from "@/types/contact";
import type { ServiceDetail, ServicesPageData } from "@/types/services";
import type { SolutionDetail, SolutionsPageData } from "@/types/solutions";
import type { NextProject, ProjectDetail, ProjectSummary, WorkPageData } from "@/types/work";
import { routes } from "@/config/site";
import { ApiError, apiGet, hasContentApi } from "./client";

/**
 * Page data getters. Each returns the static content from `src/content` today
 * and the API response once `CONTENT_API_URL` is set; both share one type, so
 * pages and sections don't change when the source does.
 */

export async function getAboutPage(): Promise<AboutPageData> {
  if (hasContentApi) return apiGet<AboutPageData>("/pages/about");
  return aboutPage;
}

export async function getSolutionsPage(): Promise<SolutionsPageData> {
  if (hasContentApi) return apiGet<SolutionsPageData>("/pages/solutions");
  return solutionsPage;
}

/** GET a resource that may not exist: null on a 404, any other error is rethrown. */
async function apiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** A solution's detail page, or null when there is none for `slug`. */
export async function getSolution(slug: string): Promise<SolutionDetail | null> {
  if (hasContentApi) return apiGetOrNull<SolutionDetail>(`/solutions/${encodeURIComponent(slug)}`);
  return solutionDetails[slug] ?? null;
}

/** Slugs of every solution with a detail page (prerendered at build time). */
export async function getSolutionSlugs(): Promise<string[]> {
  if (hasContentApi) return apiGet<string[]>("/solutions/slugs");
  return Object.keys(solutionDetails);
}

export async function getServicesPage(): Promise<ServicesPageData> {
  if (hasContentApi) return apiGet<ServicesPageData>("/pages/services");
  return servicesPage;
}

/** A service's detail page, or null when there is none for `slug`. */
export async function getService(slug: string): Promise<ServiceDetail | null> {
  if (hasContentApi) return apiGetOrNull<ServiceDetail>(`/services/${encodeURIComponent(slug)}`);
  return serviceDetails[slug] ?? null;
}

/** Slugs of every service with a detail page (prerendered at build time). */
export async function getServiceSlugs(): Promise<string[]> {
  if (hasContentApi) return apiGet<string[]>("/services/slugs");
  return Object.keys(serviceDetails);
}

export async function getContactPage(): Promise<ContactPageData> {
  if (hasContentApi) return apiGet<ContactPageData>("/pages/contact");
  return contactPage;
}

export async function getWorkPage(): Promise<WorkPageData> {
  if (hasContentApi) return apiGet<WorkPageData>("/pages/work");
  return workPage;
}

/** A case study, or null when there is none for `slug`. */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
  if (hasContentApi) return apiGetOrNull<ProjectDetail>(`/work/${encodeURIComponent(slug)}`);
  return projectDetails[slug] ?? null;
}

/** Slugs of every project with a case study (prerendered at build time). */
export async function getProjectSlugs(): Promise<string[]> {
  if (hasContentApi) return apiGet<string[]>("/work/slugs");
  return Object.keys(projectDetails);
}

/**
 * The project shown in a case study's "Next" panel: the next project in the
 * portfolio that has its own case study (wrapping round). When this is the
 * only case study, the panel leads back to the full portfolio instead.
 */
export async function getNextProject(slug: string): Promise<NextProject> {
  const projects: ProjectSummary[] = hasContentApi ? (await getWorkPage()).portfolio.items : projectCatalog;
  const withDetail = projects.filter((p) => p.hasDetail);
  const at = withDetail.findIndex((p) => p.slug === slug);
  const next = withDetail.length > 1 ? withDetail[(at + 1) % withDetail.length] : null;
  if (next) return { name: next.name, category: next.category, image: next.image, href: routes.project(next.slug) };
  const lead = projects.find((p) => p.slug !== slug) ?? projects[0];
  return { name: "All work", category: "See every project", image: lead.image, href: routes.work };
}
