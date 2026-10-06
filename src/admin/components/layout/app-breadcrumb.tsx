"use client"

import { House } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@admin/components/ui/breadcrumb"
import { HOME_PATH } from "@admin/lib/auth/constants"
import { cn } from "@admin/lib/utils"
import { findNavPath } from "./nav-config"

export interface Crumb {
  label: string
  /** Omit for the current page or for sections that have no page of their own. */
  href?: string
}

/**
 * Breadcrumb derived from the URL and the sidebar's nav tree, so it never drifts
 * from the menu. Pages deeper than the menu (e.g. an edit form) append their own
 * crumbs via `extra`.
 */
export function AppBreadcrumb({ extra = [] }: { extra?: Crumb[] }) {
  const t = useTranslations("Nav")
  const pathname = usePathname()

  const trail = (findNavPath(pathname) ?? []).filter((item) => item.href !== HOME_PATH)
  const crumbs: Crumb[] = [
    { label: t("dashboard"), href: HOME_PATH },
    ...trail.map((item) => ({ label: t(item.labelKey), href: item.href })),
    ...extra,
  ]

  // On phones, long trails keep the first and last crumb and fold the middle.
  const foldable = crumbs.length > 3

  return (
    <Breadcrumb aria-label={t("breadcrumb")}>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isFirst = i === 0
          const isLast = i === crumbs.length - 1
          const folded = foldable && !isFirst && !isLast
          const content = (
            <>
              {isFirst && <House className="size-3.5" />}
              {crumb.label}
            </>
          )

          return (
            <Fragment key={`${i}-${crumb.label}`}>
              {foldable && i === 1 && (
                <>
                  <BreadcrumbItem className="sm:hidden">
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="sm:hidden" />
                </>
              )}
              <BreadcrumbItem className={cn(folded && "hidden sm:inline-flex")}>
                {isLast ? (
                  <BreadcrumbPage className="inline-flex items-center gap-1">{content}</BreadcrumbPage>
                ) : crumb.href ? (
                  <BreadcrumbLink className="inline-flex items-center gap-1" render={<Link href={crumb.href} />}>
                    {content}
                  </BreadcrumbLink>
                ) : (
                  <span>{content}</span>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className={cn(folded && "hidden sm:block")} />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
