import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/page-hero";
import { ContactSection } from "@/features/contact";
import { SolutionsCatalog, SolutionsFlagships } from "@/features/solutions";
import { getSolutionsPage } from "@/lib/api/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSolutionsPage();
  return { title: seo.title, description: seo.description };
}

export default async function SolutionsPage() {
  const page = await getSolutionsPage();

  return (
    <>
      <PageHero {...page.hero} />
      <SolutionsFlagships {...page.flagships} />
      <SolutionsCatalog {...page.catalog} />
      <ContactSection content={page.contact} />
    </>
  );
}
