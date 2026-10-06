import type { ExportColumn } from "./types"

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// Brand colors are spelled out: the print document doesn't load the app's CSS.
const STYLES = `
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #050505; font: 11px/1.45 "IBM Plex Sans Arabic", "Segoe UI", Tahoma, Arial, sans-serif; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding-bottom: 10px; margin-bottom: 14px; border-bottom: 3px solid #B9383A; }
  header img { height: 26px; }
  h1 { margin: 0; font-size: 18px; }
  .meta { color: #6b6b6b; font-size: 10px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  th { background: #F8F8F8; font-weight: 600; text-align: start; border-bottom: 2px solid #D9D9D9; }
  th, td { padding: 6px 8px; vertical-align: middle; }
  td { border-bottom: 1px solid #ececec; }
  tr { break-inside: avoid; }
  td.num { font-variant-numeric: tabular-nums; }
  td img { display: block; width: 72px; height: 32px; object-fit: cover; border-radius: 4px; background: #f1f1f1; }
  .none { color: #9a9a9a; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`

/**
 * Prints rows as a branded table (logo, title, date, row count) through a hidden
 * iframe, so the page itself is untouched and the user gets the browser's print
 * dialog, where they can also save as PDF.
 */
export function printTable<TRow>({
  rows,
  columns,
  title,
  meta,
  lang,
  dir,
}: {
  rows: TRow[]
  columns: ExportColumn<TRow>[]
  title: string
  /** Line under the title, e.g. "Printed 5 Oct 2026 · 40 rows". */
  meta: string
  lang: string
  dir: "ltr" | "rtl"
}): Promise<void> {
  const head = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("")
  const body = rows
    .map((row) => {
      const cells = columns.map((column) => {
        const value = column.value(row)
        if (value === null || value === undefined || value === "") return `<td class="none">—</td>`
        if (column.type === "image") return `<td><img src="${escapeHtml(String(value))}" alt=""></td>`
        const cls = column.type === "number" ? ` class="num"` : ""
        const text = escapeHtml(String(value))
        // <bdi> keeps the value's own direction while it aligns with the rest of the column.
        return `<td${cls}>${column.dir ? `<bdi dir="${column.dir}">${text}</bdi>` : text}</td>`
      })
      return `<tr>${cells.join("")}</tr>`
    })
    .join("")

  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
<title>${escapeHtml(title)}</title><style>${STYLES}</style></head><body>
<header><div><h1>${escapeHtml(title)}</h1><div class="meta">${escapeHtml(meta)}</div></div>
<img src="${window.location.origin}/admin/pattern/logo-colored.svg" alt="Spark Systems"></header>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`

  return new Promise((resolve) => {
    const frame = document.createElement("iframe")
    frame.setAttribute("aria-hidden", "true")
    frame.style.cssText = "position:fixed;inset-inline-end:0;bottom:0;width:0;height:0;border:0;visibility:hidden"
    frame.onload = async () => {
      const win = frame.contentWindow
      if (!win) return resolve()
      // Wait for the logo and thumbnails so they appear in the printout.
      await Promise.all(
        Array.from(win.document.images).map((img) => (img.complete ? null : img.decode().catch(() => null)))
      )
      const cleanup = () => frame.isConnected && frame.remove()
      win.addEventListener("afterprint", cleanup, { once: true })
      win.focus()
      win.print()
      // The dialog is open (or done); the caller can carry on. Some browsers never
      // fire afterprint for iframes, so the frame is removed after a while regardless.
      resolve()
      setTimeout(cleanup, 60_000)
    }
    frame.srcdoc = html
    document.body.appendChild(frame)
  })
}
