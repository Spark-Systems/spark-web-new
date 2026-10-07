import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/page-hero";
import { ContactSection } from "@/features/contact";
import { FeaturedInsight, InsightsGrid } from "@/features/insights";
import { getInsightsPage } from "@/lib/api/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getInsightsPage();
  return { title: seo.title, description: seo.description };
}

export default async function InsightsPage() {
  const page = await getInsightsPage();

  return (
    <>
      <PageHero {...page.hero} />
      {page.featured && <FeaturedInsight featured={page.featured} />}
      <InsightsGrid {...page.posts} />
      <ContactSection content={page.contact} />
    </>
  );
}
