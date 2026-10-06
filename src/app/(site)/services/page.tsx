import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/page-hero";
import { ContactSection } from "@/features/contact";
import { ServiceAreas, ServicesApproach } from "@/features/services";
import { getServicesPage } from "@/lib/api/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getServicesPage();
  return { title: seo.title, description: seo.description };
}

export default async function ServicesPage() {
  const page = await getServicesPage();

  return (
    <>
      <PageHero {...page.hero} />
      <ServiceAreas {...page.areas} />
      <ServicesApproach {...page.approach} />
      <ContactSection content={page.contact} />
    </>
  );
}
