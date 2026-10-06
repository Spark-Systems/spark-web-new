import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ComingSoon } from "@/components/coming-soon"
import { findNavTrail } from "@/components/layout/nav-config"
import { PageHeader } from "@/components/layout/page-header"

// Placeholder for sidebar sections that don't have their own page yet. Only
// paths listed in nav-config render here; anything else is a real 404. Adding
// a concrete route (e.g. app/(admin)/clients/page.tsx) takes precedence.

async function resolve(slug: string[]) {
  const trail = findNavTrail(`/${slug.join("/")}`)
  if (!trail) notFound()
  const t = await getTranslations("Nav")
  return trail.map((key) => t(key))
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const labels = await resolve((await params).slug)
  return { title: labels.at(-1) }
}

export default async function PlaceholderPage({ params }: PageProps<"/[...slug]">) {
  const labels = await resolve((await params).slug)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={labels.at(-1) ?? ""} />
      <ComingSoon />
    </div>
  )
}
