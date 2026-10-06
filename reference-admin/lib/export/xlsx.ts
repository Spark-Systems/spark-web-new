import type { ExportColumn } from "./types"

const MIN_WIDTH = 8
const MAX_WIDTH = 60

/** Saves a Blob as a file through a temporary link. */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement("a"), { href: url, download: fileName }).click()
  URL.revokeObjectURL(url)
}

/**
 * Builds an .xlsx file from rows and downloads it: a bold, frozen header row,
 * columns sized to their content, and the sheet mirrored for Arabic.
 */
export async function downloadXlsx<TRow>({
  rows,
  columns,
  fileName,
  sheetName,
  rightToLeft,
}: {
  rows: TRow[]
  columns: ExportColumn<TRow>[]
  /** Without the extension. */
  fileName: string
  sheetName?: string
  rightToLeft?: boolean
}) {
  // Loaded on demand: only needed when someone exports.
  const { default: writeExcelFile } = await import("write-excel-file/universal")
  const cols = columns.filter((column) => column.type !== "image")

  const body = rows.map((row) =>
    cols.map((column) => {
      const value = column.value(row)
      if (value === null || value === undefined || value === "") return null
      return column.type === "number" && typeof value === "number"
        ? { value, type: Number }
        : { value: String(value), type: String }
    })
  )
  const widths = cols.map((column, i) => {
    const longest = Math.max(column.header.length, ...body.map((cells) => String(cells[i]?.value ?? "").length))
    return { width: Math.min(Math.max(longest + 2, MIN_WIDTH), MAX_WIDTH) }
  })

  const blob = await writeExcelFile(
    [cols.map((column) => ({ value: column.header, fontWeight: "bold" as const })), ...body],
    {
      columns: widths,
      stickyRowsCount: 1,
      rightToLeft,
      // Excel sheet names are capped at 31 characters.
      sheet: sheetName?.slice(0, 31),
    }
  ).toBlob()
  saveBlob(blob, `${fileName}.xlsx`)
}
