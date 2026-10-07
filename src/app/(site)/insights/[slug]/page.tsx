import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactSection } from "@/features/contact";
import { InsightArticle } from "@/features/insights";
import { getArticleSlugs, getInsight } from "@/lib/api/pages";

/** Prerender every published article; newer ones render on first visit (and 404 if unknown). */
export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const article = await getInsight((await params).slug);
  if (!article) return {};
  return { title: article.seo.title, description: article.seo.description };
}

export default async function InsightPage({ params }: PageProps<"/insights/[slug]">) {
  const article = await getInsight((await params).slug);
  if (!article) notFound();

  return (
    <>
      <InsightArticle article={article} />
      <ContactSection content={article.contact} />
    </>
  );
}
