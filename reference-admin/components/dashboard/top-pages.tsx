"use client"

import { useFormatter, useTranslations } from "next-intl"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PageRow } from "@/lib/analytics/types"

export function TopPages({ pages }: { pages: PageRow[] }) {
  const t = useTranslations("Dashboard")
  const format = useFormatter()

  if (pages.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">{t("empty")}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("pages.page")}</TableHead>
          <TableHead className="text-end">{t("pages.views")}</TableHead>
          <TableHead className="text-end">{t("pages.users")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page) => (
          <TableRow key={page.path}>
            <TableCell className="w-full max-w-0">
              <span dir="ltr" className="block truncate text-start font-medium">
                {page.path}
              </span>
            </TableCell>
            <TableCell className="text-end tabular-nums">{format.number(page.views)}</TableCell>
            <TableCell className="text-muted-foreground text-end tabular-nums">
              {format.number(page.users)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
