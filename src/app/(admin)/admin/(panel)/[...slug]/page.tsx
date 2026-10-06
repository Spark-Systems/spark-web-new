import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ComingSoon } from "@admin/components/coming-soon"
import { findNavTrail } from "@admin/components/layout/nav-config"
import { PageHeader } from "@admin/components/layout/page-header"
import { ADMIN_BASE } from "@admin/lib/auth/constants"

// Placeholder for sidebar sections that don't have their own page yet. Only
// paths listed in nav-config render here; anything else is a real 404. Adding
// a concrete route (e.g. app/(admin)/admin/(panel)/offices/page.tsx) takes precedence.

async function resolve(slug: string[]) {
  const trail = findNavTrail(`${ADMIN_BASE}/${slug.join("/")}`)
  if (!trail) notFound()
  const t = await getTranslations("Nav")
  return trail.map((key) => t(key))
}

export async function generateMetadata({ params }: PageProps<"/admin/[...slug]">): Promise<Metadata> {
  const labels = await resolve((await params).slug)
  return { title: labels.at(-1) }
}

export default async function PlaceholderPage({ params }: PageProps<"/admin/[...slug]">) {
  const labels = await resolve((await params).slug)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={labels.at(-1) ?? ""} />
      <ComingSoon />
    </div>
  )
}
