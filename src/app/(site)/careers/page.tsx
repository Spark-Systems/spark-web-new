import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/page-hero";
import { CareersContent } from "@/features/careers";
import { getCareersPage } from "@/lib/api/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getCareersPage();
  return { title: seo.title, description: seo.description };
}

export default async function CareersPage() {
  const page = await getCareersPage();

  return (
    <>
      <PageHero {...page.hero} />
      <CareersContent roles={page.roles} apply={page.apply} />
    </>
  );
}
