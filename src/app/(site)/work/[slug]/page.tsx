import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/blocks/page-hero";
import { routes } from "@/config/site";
import { ContactSection } from "@/features/contact";
import {
  CaseComparison,
  CaseDevices,
  CaseFacts,
  CaseFeatures,
  CaseGallery,
  CaseOverview,
  CaseResults,
  CaseTestimonial,
  NextProjectPanel,
} from "@/features/work";
import { getNextProject, getProject, getProjectSlugs } from "@/lib/api/pages";

/** Prerender every project with a case study; any other slug is rendered on demand (and 404s if unknown). */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return { title: project.seo.title, description: project.seo.description };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const [project, next] = await Promise.all([getProject(slug), getNextProject(slug)]);
  if (!project) notFound();

  return (
    <>
      <PageHero {...project.hero} back={{ label: "Back to Work", href: routes.work }} />
      <CaseFacts facts={project.facts} />
      <CaseOverview statement={project.statement} showcase={project.showcase} story={project.story} />
      <CaseFeatures {...project.features} />
      <CaseGallery {...project.gallery} />
      <CaseDevices {...project.devices} />
      {project.comparison && <CaseComparison {...project.comparison} />}
      <CaseResults {...project.results} />
      {project.testimonial && <CaseTestimonial {...project.testimonial} />}
      <ContactSection content={project.contact} />
      {/* Keyed so moving between case studies starts a fresh panel, not one mid-exit. */}
      <NextProjectPanel key={next.href} next={next} />
    </>
  );
}
