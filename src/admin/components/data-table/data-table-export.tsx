"use client"

import { FileSpreadsheet, Loader2, Printer } from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@admin/components/ui/button"
import { printTable } from "@admin/lib/export/print"
import type { ExportColumn } from "@admin/lib/export/types"
import { downloadXlsx } from "@admin/lib/export/xlsx"

export type { ExportColumn }

/** What a table exports. Excel and print always cover every matching row, not just the page shown. */
export interface DataTableExportOptions<TData> {
  /** File name without extension, e.g. "countries". */
  fileName: string
  /** Heading on the printout and the Excel sheet name. */
  title: string
  columns: ExportColumn<TData>[]
  /** Rows matching the current search, filters and sort, across all pages. */
  fetchRows: () => Promise<TData[]>
}

/** "Excel" and "Print" buttons for a DataTable toolbar. */
export function DataTableExport<TData>({ options }: { options: DataTableExportOptions<TData> }) {
  const t = useTranslations("DataTable")
  const format = useFormatter()
  const locale = useLocale()
  const [busy, setBusy] = useState<"excel" | "print" | null>(null)

  const run = async (kind: "excel" | "print") => {
    setBusy(kind)
    try {
      const rows = await options.fetchRows()
      if (rows.length === 0) return toast.info(t("exportEmpty"))
      if (kind === "excel") {
        await downloadXlsx({
          rows,
          columns: options.columns,
          fileName: `${options.fileName}-${new Date().toISOString().slice(0, 10)}`,
          sheetName: options.title,
          rightToLeft: locale === "ar",
        })
      } else {
        await printTable({
          rows,
          columns: options.columns,
          title: options.title,
          meta: t("printMeta", {
            date: format.dateTime(new Date(), { dateStyle: "medium", timeStyle: "short" }),
            count: rows.length,
          }),
          lang: locale,
          dir: locale === "ar" ? "rtl" : "ltr",
        })
      }
    } catch {
      toast.error(kind === "excel" ? t("exportError") : t("printError"))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => run("excel")} disabled={busy !== null}>
        {busy === "excel" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <FileSpreadsheet data-icon="inline-start" />}
        {t("excel")}
      </Button>
      <Button variant="outline" onClick={() => run("print")} disabled={busy !== null}>
        {busy === "print" ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Printer data-icon="inline-start" />}
        {t("print")}
      </Button>
    </>
  )
}
