import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/page-hero";
import { ContactEnquiry, OfficeLocations } from "@/features/contact";
import { getContactPage } from "@/lib/api/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContactPage();
  return { title: seo.title, description: seo.description };
}

export default async function ContactPage() {
  const page = await getContactPage();

  return (
    <>
      <PageHero {...page.hero} />
      <OfficeLocations {...page.offices} />
      <ContactEnquiry {...page.enquiry} />
    </>
  );
}
