import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routes } from "@/config/site";
import { OfferingDetailPage } from "@/features/offering";
import { getService, getServiceSlugs } from "@/lib/api/pages";

/** Prerender every service that has a detail page; any other slug is rendered on demand (and 404s if unknown). */
export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return {};
  return { title: service.seo.title, description: service.seo.description };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = await getService((await params).slug);
  if (!service) notFound();

  return <OfferingDetailPage detail={service} back={{ label: "All services", href: routes.services }} />;
}
