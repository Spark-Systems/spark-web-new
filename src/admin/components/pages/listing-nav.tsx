"use client"

import { useTranslations } from "next-intl"

import { SectionNav } from "@admin/components/cms/section-nav"
import { adminPaths } from "@admin/lib/paths"

type Tab = { href: string; label: "navItems" | "navPage" | "navRoles" | "navApplications" | "navArticles" }

const sections: Record<string, Tab[]> = {
  solutions: [
    { href: adminPaths.solutions, label: "navItems" },
    { href: adminPaths.solutionsPage, label: "navPage" },
  ],
  services: [
    { href: adminPaths.services, label: "navItems" },
    { href: adminPaths.servicesPage, label: "navPage" },
  ],
  work: [
    { href: adminPaths.work, label: "navItems" },
    { href: adminPaths.workPage, label: "navPage" },
  ],
  careers: [
    { href: adminPaths.careers, label: "navRoles" },
    { href: adminPaths.applications, label: "navApplications" },
    { href: adminPaths.careersPage, label: "navPage" },
  ],
  insights: [
    { href: adminPaths.insights, label: "navArticles" },
    { href: adminPaths.insightsPage, label: "navPage" },
  ],
}

/** Switches between a section's lists and the page copy around them (/solutions, /services, /work, /careers, /insights). */
export function ListingNav({ section }: { section: "solutions" | "services" | "work" | "careers" | "insights" }) {
  const t = useTranslations("ListingPages")
  return <SectionNav items={sections[section].map((tab) => ({ href: tab.href, label: t(tab.label) }))} />
}
