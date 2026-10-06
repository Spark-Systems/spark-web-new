import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/page-hero";
import { ContactSection } from "@/features/contact";
import { FeaturedCase, WorkPortfolio } from "@/features/work";
import { getWorkPage } from "@/lib/api/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getWorkPage();
  return { title: seo.title, description: seo.description };
}

export default async function WorkPage() {
  const page = await getWorkPage();

  return (
    <>
      <PageHero {...page.hero} />
      <WorkPortfolio {...page.portfolio} />
      <FeaturedCase {...page.featured} />
      <ContactSection content={page.contact} />
    </>
  );
}
