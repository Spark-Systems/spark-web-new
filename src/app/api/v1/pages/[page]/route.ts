import {
  getAboutPage,
  getCareersPage,
  getContactPage,
  getHomePage,
  getInsightsPage,
  getServicesPage,
  getSiteLayout,
  getSolutionsPage,
  getWorkPage,
} from "@/lib/api/pages";
import { pageKeyParam } from "@/server/http/page-key";
import { handle, json } from "@/server/http/respond";
import type { PageKey } from "@/types/cms";

const readers: Record<PageKey, () => Promise<unknown>> = {
  home: getHomePage,
  about: getAboutPage,
  solutions: getSolutionsPage,
  services: getServicesPage,
  work: getWorkPage,
  contact: getContactPage,
  careers: getCareersPage,
  insights: getInsightsPage,
  layout: getSiteLayout,
};

/**
 * GET /api/v1/pages/:page: a website page's published content, exactly as the
 * site renders it (lists filled in). Pages: home, about, solutions, services,
 * work, contact, careers, insights, and layout (menu, footer, company details).
 */
export const GET = handle<{ params: Promise<{ page: string }> }>(async (_request, { params }) =>
  json(await readers[await pageKeyParam(params)]()),
);
