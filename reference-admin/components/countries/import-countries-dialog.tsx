"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CircleAlert, CircleCheck, Download, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { FileDropzone, type DropzoneItem } from "@/components/inputs/file-dropzone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { countriesApi, countriesQueries } from "@/lib/api/services/countries"
import { cn } from "@/lib/utils"

const MAX_FILE_BYTES = 2 * 1024 * 1024

// Header names accepted for each column (compared case-insensitively).
const HEADERS = {
  en: ["english name", "name_en", "name en", "english", "name (en)", "الاسم بالإنجليزية"],
  ar: ["arabic name", "name_ar", "name ar", "arabic", "name (ar)", "الاسم بالعربية"],
}

type RowStatus = "ok" | "missingName" | "duplicateInFile"

interface ParsedRow {
  /** Spreadsheet row number, as shown in Excel. */
  line: number
  nameEn: string
  nameAr: string
  status: RowStatus
}

type ParseError = "parseError" | "missingColumns" | "empty"

const cellText = (value: unknown) => (value == null ? "" : String(value).trim())

/** Reads the first sheet and maps it to rows, flagging missing and duplicate names. */
async function parseFile(file: File): Promise<ParsedRow[] | ParseError> {
  let sheet: unknown[][]
  try {
    // Loaded on demand; "universal" reads the Blob directly without a worker.
    const { readSheet } = await import("read-excel-file/universal")
    sheet = await readSheet(file)
  } catch {
    return "parseError"
  }

  const [header = [], ...body] = sheet
  const names = header.map((cell) => cellText(cell).toLocaleLowerCase())
  const enIndex = names.findIndex((name) => HEADERS.en.includes(name))
  const arIndex = names.findIndex((name) => HEADERS.ar.includes(name))
  if (enIndex === -1 || arIndex === -1) return "missingColumns"

  const seen = new Set<string>()
  const rows: ParsedRow[] = []
  body.forEach((cells, i) => {
    const nameEn = cellText(cells[enIndex])
    const nameAr = cellText(cells[arIndex])
    if (!nameEn && !nameAr) return // blank line
    const key = nameEn.toLocaleLowerCase()
    const status: RowStatus = !nameEn || !nameAr ? "missingName" : seen.has(key) ? "duplicateInFile" : "ok"
    if (status === "ok") seen.add(key)
    rows.push({ line: i + 2, nameEn, nameAr, status })
  })
  return rows.length > 0 ? rows : "empty"
}

async function downloadTemplate(fileName: string) {
  const { default: writeExcelFile } = await import("write-excel-file/universal")
  const blob = await writeExcelFile(
    [
      [
        { value: "English name", fontWeight: "bold" },
        { value: "Arabic name", fontWeight: "bold" },
      ],
      ["Egypt", "مصر"],
      ["Jordan", "الأردن"],
    ],
    { columns: [{ width: 28 }, { width: 28 }] }
  ).toBlob()
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement("a"), { href: url, download: fileName })
  link.click()
  URL.revokeObjectURL(url)
}

export function ImportCountriesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("Countries.importDialog")
  const tColumns = useTranslations("Countries.columns")
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<DropzoneItem[]>([])
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [error, setError] = useState<ParseError | null>(null)
  const [parsing, setParsing] = useState(false)

  const valid = rows?.filter((row) => row.status === "ok") ?? []
  const invalidCount = (rows?.length ?? 0) - valid.length

  const reset = () => {
    setFiles([])
    setRows(null)
    setError(null)
  }

  const importRows = useMutation({
    mutationFn: () => countriesApi.import(valid.map((row) => ({ name_en: row.nameEn, name_ar: row.nameAr }))),
    onSuccess: ({ created, skipped }) => {
      queryClient.invalidateQueries({ queryKey: countriesQueries.all })
      toast.success(skipped > 0 ? t("resultSkipped", { created, skipped }) : t("result", { created }))
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error(t("error")),
  })

  const handleFiles = async (next: DropzoneItem[]) => {
    setFiles(next)
    setRows(null)
    setError(null)
    const file = next[0]?.file
    if (!file) return
    setParsing(true)
    const result = await parseFile(file)
    setParsing(false)
    if (typeof result === "string") setError(result)
    else setRows(result)
  }

  const statusBadge = (status: RowStatus) =>
    status === "ok" ? (
      <Badge variant="outline" className="gap-1">
        <CircleCheck className="text-primary" />
        {t("ok")}
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <CircleAlert />
        {t(status)}
      </Badge>
    )

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {rows === null ? (
          <div className="flex flex-col gap-3">
            <FileDropzone value={files} onChange={handleFiles} formats={["xlsx"]} maxSize={MAX_FILE_BYTES} disabled={parsing} />
            {parsing && (
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                {t("parsing")}
              </p>
            )}
            {error && (
              <p role="alert" className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                {t(error)}
              </p>
            )}
            <Button variant="link" className="self-start px-0" onClick={() => downloadTemplate(t("templateFile"))}>
              <Download data-icon="inline-start" />
              {t("template")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-medium">{t("summary", { valid: valid.length })}</span>
              {invalidCount > 0 && <span className="text-destructive">{t("invalidRows", { count: invalidCount })}</span>}
            </div>
            <div className="max-h-80 overflow-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16">{t("row")}</TableHead>
                    <TableHead>{tColumns("nameEn")}</TableHead>
                    <TableHead>{tColumns("nameAr")}</TableHead>
                    <TableHead className="w-40">{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.line} className={cn(row.status !== "ok" && "bg-destructive/5")}>
                      <TableCell className="text-muted-foreground tabular-nums">{row.line}</TableCell>
                      <TableCell dir="ltr" className="text-start">{row.nameEn || "—"}</TableCell>
                      <TableCell dir="rtl" className="text-start">{row.nameAr || "—"}</TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter>
          {rows !== null && (
            <Button variant="ghost" className="sm:me-auto" onClick={reset} disabled={importRows.isPending}>
              {t("back")}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importRows.isPending}>
            {t("cancel")}
          </Button>
          {rows !== null && (
            <Button onClick={() => importRows.mutate()} disabled={valid.length === 0 || importRows.isPending}>
              {importRows.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {importRows.isPending ? t("importing") : t("import", { count: valid.length })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
