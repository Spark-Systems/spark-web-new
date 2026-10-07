import { routes } from "@/config/site";
import { collections, readPage, readSettings } from "@/server/db";
import type { WithId } from "@/server/db/collection";
import type { AboutPageData } from "@/types/about";
import type { CareersPageData } from "@/types/careers";
import type { CollectionKey, CollectionMap, InsightRecord } from "@/types/cms";
import type { ImageSource } from "@/types/content";
import type { ContactPageData } from "@/types/contact";
import type { HomePageData } from "@/types/home";
import type { InsightArticle, InsightSummary, InsightsPageData } from "@/types/insights";
import type { SiteLayoutData } from "@/types/layout";
import type { ServiceDetail, ServicesPageData } from "@/types/services";
import type { SolutionDetail, SolutionsPageData } from "@/types/solutions";
import type { NextProject, ProjectDetail, WorkPageData } from "@/types/work";
import {
  toClientLogo,
  toFlagship,
  toOfferingDetail,
  toOffice,
  toPartner,
  toPartnerCard,
  toProjectSummary,
  toServiceArea,
  toSocialLinks,
  toSolutionSummary,
} from "./mappers";

/**
 * Builds each website page from the stored content. With `preview` on, saved
 * drafts are used (unpublished items included); otherwise only what's
 * published. Every function returns exactly what `GET /api/v1/...` serves.
 */
export interface ReadOptions {
  preview?: boolean;
}

const items = <K extends CollectionKey>(key: K, { preview = false }: ReadOptions): Promise<WithId<CollectionMap[K]>[]> =>
  preview ? collections[key].drafts() : collections[key].published();

/**
 * Each menu entry's preview picture: the hero image of the page it links to.
 * Detail pages (/solutions/ticketing) use their section's hero; the home page
 * has a video instead, so it (and any other link) uses the home "Our work" picture.
 */
async function menuPictures(options: ReadOptions): Promise<(href: string) => ImageSource> {
  const [home, ...pages] = await Promise.all([
    readPage("home", options),
    ...(["about", "solutions", "services", "work", "contact", "careers", "insights"] as const).map((key) =>
      readPage(key, options).then((page) => [routes[key], page.hero.image.src] as const),
    ),
  ]);
  const fallback = home.work.intro.image;
  const byPath = new Map<string, ImageSource>(pages);
  return (href) => {
    const path = href.split(/[?#]/)[0].replace(/\/+$/, "") || routes.home;
    if (path === routes.home) return fallback;
    const section = [...byPath.keys()].find((route) => path === route || path.startsWith(`${route}/`));
    return section ? byPath.get(section)! : fallback;
  };
}

export async function getLayoutData(options: ReadOptions = {}): Promise<SiteLayoutData> {
  const [layout, settings, solutions, offices, partners, pictureFor] = await Promise.all([
    readPage("layout", options),
    readSettings(),
    items("solutions", options),
    items("offices", options),
    items("partners", options),
    menuPictures(options),
  ]);
  return {
    company: {
      name: settings.meta.site_name,
      description: settings.meta.description,
      email: layout.email,
      phone: layout.phone,
      foundedYear: layout.foundedYear,
    },
    keywords: settings.meta.keywords,
    menu: layout.menu.map((item) => ({ ...item, image: pictureFor(item.href) })),
    footer: layout.footer,
    contact: layout.contact,
    solutions: solutions.map(toSolutionSummary),
    offices: offices.map(toOffice),
    partners: partners.map(toPartner),
    socials: toSocialLinks(settings.social),
  };
}

export async function getHomeData(options: ReadOptions = {}): Promise<HomePageData> {
  const [home, layout, clients, partners] = await Promise.all([
    readPage("home", options),
    readPage("layout", options),
    items("clients", options),
    items("partners", options),
  ]);
  return {
    ...home,
    clients: { ...home.clients, clients: clients.map(toClientLogo), partners: partners.map(toPartner) },
    contact: layout.contact,
  };
}

export async function getAboutData(options: ReadOptions = {}): Promise<AboutPageData> {
  const [about, layout, clients, partners] = await Promise.all([
    readPage("about", options),
    readPage("layout", options),
    items("clients", options),
    items("partners", options),
  ]);
  const [first, second] = partners;
  return {
    ...about,
    clients: { ...about.clients, logos: clients.map(toClientLogo) },
    // The partnership scene pairs two logos; it's left out with fewer than two partners.
    partnerships:
      first && second
        ? {
            eyebrow: about.partnerships.eyebrow,
            title: about.partnerships.title,
            partners: [toPartnerCard(first, about.partnerships.label), toPartnerCard(second, about.partnerships.label)],
          }
        : undefined,
    contact: layout.contact,
  };
}

export async function getSolutionsData(options: ReadOptions = {}): Promise<SolutionsPageData> {
  const [page, layout, solutions] = await Promise.all([
    readPage("solutions", options),
    readPage("layout", options),
    items("solutions", options),
  ]);
  return {
    seo: page.seo,
    hero: page.hero,
    flagships: { ...page.flagships, items: solutions.filter((s) => s.flagship).map(toFlagship) },
    catalog: { ...page.catalog, items: solutions.map(toSolutionSummary) },
    contact: layout.contact,
  };
}

export async function getSolutionData(slug: string, options: ReadOptions = {}): Promise<SolutionDetail | null> {
  const [layout, solutions] = await Promise.all([readPage("layout", options), items("solutions", options)]);
  const solution = solutions.find((s) => s.slug === slug && s.has_detail);
  return solution ? toOfferingDetail(solution, layout.contact) : null;
}

export async function getServicesData(options: ReadOptions = {}): Promise<ServicesPageData> {
  const [page, layout, services] = await Promise.all([
    readPage("services", options),
    readPage("layout", options),
    items("services", options),
  ]);
  return {
    seo: page.seo,
    hero: page.hero,
    areas: { ...page.areas, items: services.map(toServiceArea) },
    approach: page.approach,
    contact: layout.contact,
  };
}

export async function getServiceData(slug: string, options: ReadOptions = {}): Promise<ServiceDetail | null> {
  const [layout, services] = await Promise.all([readPage("layout", options), items("services", options)]);
  const service = services.find((s) => s.slug === slug && s.has_detail);
  return service ? toOfferingDetail(service, layout.contact) : null;
}

export async function getWorkData(options: ReadOptions = {}): Promise<WorkPageData> {
  const [page, layout, projects] = await Promise.all([
    readPage("work", options),
    readPage("layout", options),
    items("projects", options),
  ]);
  return {
    seo: page.seo,
    hero: page.hero,
    portfolio: { ...page.portfolio, items: projects.map(toProjectSummary) },
    featured: page.featured,
    contact: layout.contact,
  };
}

export async function getProjectData(slug: string, options: ReadOptions = {}): Promise<ProjectDetail | null> {
  const [layout, projects] = await Promise.all([readPage("layout", options), items("projects", options)]);
  const project = projects.find((p) => p.slug === slug && p.has_detail && p.detail);
  return project?.detail ? { slug: project.slug, ...project.detail, contact: layout.contact } : null;
}

/**
 * The project shown in a case study's "Next" panel: the next project with its
 * own case study (wrapping round). When this is the only case study, the panel
 * leads back to the full portfolio instead.
 */
export async function getNextProjectData(slug: string, options: ReadOptions = {}): Promise<NextProject> {
  const projects = (await items("projects", options)).map(toProjectSummary);
  const withDetail = projects.filter((p) => p.hasDetail);
  const at = withDetail.findIndex((p) => p.slug === slug);
  const next = withDetail.length > 1 ? withDetail[(at + 1) % withDetail.length] : null;
  if (next) return { name: next.name, category: next.category, image: next.image, href: routes.project(next.slug) };
  const lead = projects.find((p) => p.slug !== slug) ?? projects[0];
  return { name: "All work", category: "See every project", image: lead.image, href: routes.work };
}

export async function getContactData(options: ReadOptions = {}): Promise<ContactPageData> {
  const [page, layout, offices, settings] = await Promise.all([
    readPage("contact", options),
    readPage("layout", options),
    items("offices", options),
    readSettings(),
  ]);
  return {
    seo: page.seo,
    hero: page.hero,
    offices: { eyebrow: page.offices.eyebrow, items: offices.map(toOffice) },
    enquiry: { ...page.enquiry, email: layout.email, socials: toSocialLinks(settings.social) },
  };
}

/** Slugs of the published pages with their own route, for prerendering. */
export async function getDetailSlugs(key: "solutions" | "services" | "projects"): Promise<string[]> {
  return (await collections[key].published()).filter((r) => r.has_detail && r.detail).map((r) => r.slug);
}

// ---- Careers & insights -----------------------------------------------------

export async function getCareersData(options: ReadOptions = {}): Promise<CareersPageData> {
  const [page, jobs] = await Promise.all([readPage("careers", options), items("jobs", options)]);
  return {
    seo: page.seo,
    hero: page.hero,
    roles: { ...page.roles, items: jobs.map((j) => ({ id: j.id, title: j.title, location: j.location, groups: j.groups })) },
    apply: page.apply,
  };
}

/** Published articles, newest first. */
async function articles(options: ReadOptions) {
  return (await items("insights", options)).sort((a, b) => b.date.localeCompare(a.date));
}

const toInsightSummary = (a: InsightRecord): InsightSummary => ({
  slug: a.slug,
  title: a.title,
  category: a.category,
  date: a.date,
  summary: a.summary,
  image: { src: a.image, alt: a.title },
});

export async function getInsightsData(options: ReadOptions = {}): Promise<InsightsPageData> {
  const [page, layout, list] = await Promise.all([readPage("insights", options), readPage("layout", options), articles(options)]);
  const lead = list.find((a) => a.featured) ?? list[0];
  return {
    seo: page.seo,
    hero: page.hero,
    featured: lead ? { ...toInsightSummary(lead), ...page.featured } : null,
    posts: {
      ...page.posts,
      categories: [...new Set(list.map((a) => a.category))],
      items: list.map(toInsightSummary),
    },
    contact: layout.contact,
  };
}

export async function getInsightData(slug: string, options: ReadOptions = {}): Promise<InsightArticle | null> {
  const [layout, list] = await Promise.all([readPage("layout", options), articles(options)]);
  const article = list.find((a) => a.slug === slug);
  if (!article) return null;
  return {
    ...toInsightSummary(article),
    seo: { title: article.title, description: article.summary || article.title },
    body: article.body,
    more: list.filter((a) => a.slug !== slug).slice(0, 3).map(toInsightSummary),
    contact: layout.contact,
  };
}

/** Slugs of every published article, for prerendering. */
export async function getInsightSlugs(): Promise<string[]> {
  return (await collections.insights.published()).map((a) => a.slug);
}
