import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routes } from "@/config/site";
import { OfferingDetailPage } from "@/features/offering";
import { getSolution, getSolutionSlugs } from "@/lib/api/pages";

/** Prerender every solution that has a detail page; any other slug is rendered on demand (and 404s if unknown). */
export async function generateStaticParams() {
  const slugs = await getSolutionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/solutions/[slug]">): Promise<Metadata> {
  const solution = await getSolution((await params).slug);
  if (!solution) return {};
  return { title: solution.seo.title, description: solution.seo.description };
}

export default async function SolutionPage({ params }: PageProps<"/solutions/[slug]">) {
  const solution = await getSolution((await params).slug);
  if (!solution) notFound();

  return <OfferingDetailPage detail={solution} back={{ label: "All solutions", href: routes.solutions }} />;
}
