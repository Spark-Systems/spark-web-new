import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/page-hero";
import { AboutClients, AboutIntro, MissionVisionValues, Partnerships, StoryTimeline } from "@/features/about";
import { ContactSection } from "@/features/contact";
import { getAboutPage } from "@/lib/api/pages";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getAboutPage();
  return { title: seo.title, description: seo.description };
}

export default async function AboutPage() {
  const page = await getAboutPage();

  return (
    <>
      <PageHero {...page.hero} />
      <AboutIntro {...page.intro} />
      <MissionVisionValues {...page.mvv} />
      <StoryTimeline {...page.story} />
      <AboutClients {...page.clients} />
      <Partnerships {...page.partnerships} />
      <ContactSection content={page.contact} />
    </>
  );
}
