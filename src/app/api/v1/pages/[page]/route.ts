import {
  getAboutPage,
  getContactPage,
  getHomePage,
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
  layout: getSiteLayout,
};

/**
 * GET /api/v1/pages/:page: a website page's published content, exactly as the
 * site renders it (lists filled in). Pages: home, about, solutions, services,
 * work, contact, and layout (menu, footer, company details).
 */
export const GET = handle<{ params: Promise<{ page: string }> }>(async (_request, { params }) =>
  json(await readers[await pageKeyParam(params)]()),
);
