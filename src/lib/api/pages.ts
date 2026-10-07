import "server-only";

import { draftMode } from "next/headers";
import { unstable_cache } from "next/cache";

import type { AboutPageData } from "@/types/about";
import type { CareersPageData } from "@/types/careers";
import type { ContactPageData } from "@/types/contact";
import type { HomePageData } from "@/types/home";
import type { InsightArticle, InsightsPageData } from "@/types/insights";
import type { SiteLayoutData } from "@/types/layout";
import type { ServiceDetail, ServicesPageData } from "@/types/services";
import type { SolutionDetail, SolutionsPageData } from "@/types/solutions";
import type { NextProject, ProjectDetail, WorkPageData } from "@/types/work";
import { backendFetch, backendFetchOrNull } from "./backend";
import { CONTENT_TAG } from "./revalidate";

/**
 * Page data for the website, read from the backend's public API (/api/v1).
 * Published content is cached until the backend reports a publish (which
 * revalidates CONTENT_TAG, see app/api/revalidate). In preview mode (draft
 * mode, turned on from the admin) the saved drafts are read fresh instead.
 */
// Stamped at build time (next.config.ts), so each deploy starts with a fresh cache.
const BUILD = process.env.CONTENT_CACHE_BUILD ?? "dev";
const key = (name: string) => [`content:${name}`, BUILD];

const enc = encodeURIComponent;

/** `read(path)` cached by URL, or fresh with drafts (`?preview=1`) in preview mode. */
function cachedGetter<A extends string[], R>(name: string, pathOf: (...args: A) => string, read: (path: string) => Promise<R>) {
  const live = unstable_cache((...args: A) => read(pathOf(...args)), key(name), { tags: [CONTENT_TAG] });
  return async (...args: A): Promise<R> => {
    if ((await draftMode()).isEnabled) {
      const path = pathOf(...args);
      return read(`${path}${path.includes("?") ? "&" : "?"}preview=1`);
    }
    return live(...args);
  };
}

const page = <R,>(name: string) => cachedGetter<[], R>(name, () => `/api/v1/pages/${name}`, (path) => backendFetch<R>(path));

export const getSiteLayout = page<SiteLayoutData>("layout");
export const getHomePage = page<HomePageData>("home");
export const getAboutPage = page<AboutPageData>("about");
export const getSolutionsPage = page<SolutionsPageData>("solutions");
export const getServicesPage = page<ServicesPageData>("services");
export const getWorkPage = page<WorkPageData>("work");
export const getContactPage = page<ContactPageData>("contact");
export const getCareersPage = page<CareersPageData>("careers");
export const getInsightsPage = page<InsightsPageData>("insights");

/** An article, or null when there is none for `slug`. */
export const getInsight = cachedGetter<[slug: string], InsightArticle | null>(
  "insight",
  (slug) => `/api/v1/insights/${enc(slug)}`,
  backendFetchOrNull,
);

/** A solution's detail page, or null when there is none for `slug`. */
export const getSolution = cachedGetter<[slug: string], SolutionDetail | null>(
  "solution",
  (slug) => `/api/v1/solutions/${enc(slug)}`,
  backendFetchOrNull,
);

/** A service's detail page, or null when there is none for `slug`. */
export const getService = cachedGetter<[slug: string], ServiceDetail | null>(
  "service",
  (slug) => `/api/v1/services/${enc(slug)}`,
  backendFetchOrNull,
);

// One request returns a case study together with its "Next" project.
type CaseStudy = ProjectDetail & { next: NextProject };
const getCaseStudy = cachedGetter<[slug: string], CaseStudy | null>(
  "project",
  (slug) => `/api/v1/work/${enc(slug)}`,
  backendFetchOrNull,
);

/** A case study, or null when there is none for `slug`. */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
  const found = await getCaseStudy(slug);
  if (!found) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `next` is served by getNextProject
  const { next, ...project } = found;
  return project;
}

/** The project in a case study's "Next" panel. */
export async function getNextProject(slug: string): Promise<NextProject> {
  const found = await getCaseStudy(slug);
  if (!found) throw new Error(`No case study "${slug}"`);
  return found.next;
}

// Slugs feed generateStaticParams, which runs at build time outside any request
// (so no draft mode). Pages published later render on first visit.
const slugs = (kind: "solutions" | "services" | "work" | "insights") =>
  unstable_cache(() => backendFetch<string[]>(`/api/v1/slugs/${kind}`), key(`${kind}-slugs`), { tags: [CONTENT_TAG] });

export const getSolutionSlugs = slugs("solutions");
export const getServiceSlugs = slugs("services");
export const getProjectSlugs = slugs("work");
export const getArticleSlugs = slugs("insights");
