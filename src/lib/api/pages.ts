import "server-only";

import { draftMode } from "next/headers";
import { unstable_cache } from "next/cache";

import {
  getAboutData,
  getContactData,
  getDetailSlugs,
  getHomeData,
  getLayoutData,
  getNextProjectData,
  getProjectData,
  getServiceData,
  getServicesData,
  getSolutionData,
  getSolutionsData,
  getWorkData,
  type ReadOptions,
} from "@/server/content/pages";
import { CONTENT_TAG } from "@/server/content/revalidate";

/**
 * Page data for the website. Published content is cached until the admin
 * publishes a change (which revalidates CONTENT_TAG). In preview mode (draft
 * mode, turned on from the admin) the saved drafts are read fresh instead.
 */
function cachedGetter<A extends string[], R>(name: string, read: (...args: [...A, ReadOptions]) => Promise<R>) {
  const live = unstable_cache((...args: A) => read(...args, {}), [`content:${name}`], { tags: [CONTENT_TAG] });
  return async (...args: A): Promise<R> => {
    if ((await draftMode()).isEnabled) return read(...args, { preview: true });
    return live(...args);
  };
}

export const getSiteLayout = cachedGetter("layout", getLayoutData);
export const getHomePage = cachedGetter("home", getHomeData);
export const getAboutPage = cachedGetter("about", getAboutData);
export const getSolutionsPage = cachedGetter("solutions", getSolutionsData);
export const getServicesPage = cachedGetter("services", getServicesData);
export const getWorkPage = cachedGetter("work", getWorkData);
export const getContactPage = cachedGetter("contact", getContactData);

/** A solution's detail page, or null when there is none for `slug`. */
export const getSolution = cachedGetter<[slug: string], Awaited<ReturnType<typeof getSolutionData>>>(
  "solution",
  getSolutionData,
);

/** A service's detail page, or null when there is none for `slug`. */
export const getService = cachedGetter<[slug: string], Awaited<ReturnType<typeof getServiceData>>>(
  "service",
  getServiceData,
);

/** A case study, or null when there is none for `slug`. */
export const getProject = cachedGetter<[slug: string], Awaited<ReturnType<typeof getProjectData>>>(
  "project",
  getProjectData,
);

/** The project in a case study's "Next" panel. */
export const getNextProject = cachedGetter<[slug: string], Awaited<ReturnType<typeof getNextProjectData>>>(
  "next-project",
  getNextProjectData,
);

// Slugs feed generateStaticParams, which runs at build time outside any request
// (so no draft mode). Pages published later render on first visit.

export const getSolutionSlugs = unstable_cache(() => getDetailSlugs("solutions"), ["content:solution-slugs"], {
  tags: [CONTENT_TAG],
});
export const getServiceSlugs = unstable_cache(() => getDetailSlugs("services"), ["content:service-slugs"], {
  tags: [CONTENT_TAG],
});
export const getProjectSlugs = unstable_cache(() => getDetailSlugs("projects"), ["content:project-slugs"], {
  tags: [CONTENT_TAG],
});
