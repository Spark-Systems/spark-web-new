import {
  getAboutData,
  getCareersData,
  getContactData,
  getHomeData,
  getInsightsData,
  getLayoutData,
  getServicesData,
  getSolutionsData,
  getWorkData,
  type ReadOptions,
} from "@/server/content/pages";
import { pageKeyParam } from "@/server/http/page-key";
import { readOptions } from "@/server/http/read-options";
import { handle, json } from "@/server/http/respond";
import type { PageKey } from "@/types/cms";

const readers: Record<PageKey, (options: ReadOptions) => Promise<unknown>> = {
  home: getHomeData,
  about: getAboutData,
  solutions: getSolutionsData,
  services: getServicesData,
  work: getWorkData,
  contact: getContactData,
  careers: getCareersData,
  insights: getInsightsData,
  layout: getLayoutData,
};

/**
 * GET /api/v1/pages/:page: a website page's published content, exactly as the
 * site renders it (lists filled in). Pages: home, about, solutions, services,
 * work, contact, careers, insights, and layout (menu, footer, company details).
 */
export const GET = handle<{ params: Promise<{ page: string }> }>(async (request, { params }) =>
  json(await readers[await pageKeyParam(params)](readOptions(request))),
);
