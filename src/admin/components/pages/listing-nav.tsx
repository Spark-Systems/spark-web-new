"use client"

import { useTranslations } from "next-intl"

import { SectionNav } from "@admin/components/cms/section-nav"
import { adminPaths } from "@admin/lib/paths"

const sections = {
  solutions: { list: adminPaths.solutions, page: adminPaths.solutionsPage },
  services: { list: adminPaths.services, page: adminPaths.servicesPage },
  work: { list: adminPaths.work, page: adminPaths.workPage },
}

/** Switches between a section's list and the page copy around it (/solutions, /services, /work). */
export function ListingNav({ section }: { section: keyof typeof sections }) {
  const t = useTranslations("ListingPages")
  const paths = sections[section]
  return (
    <SectionNav
      items={[
        { href: paths.list, label: t("navItems") },
        { href: paths.page, label: t("navPage") },
      ]}
    />
  )
}
