/** One column of an Excel or print export. */
export interface ExportColumn<TRow> {
  header: string
  value: (row: TRow) => string | number | null | undefined
  /**
   * "image": the value is a picture URL. It prints as a thumbnail and is left out
   * of Excel, since a spreadsheet cell can't show a picture from a link.
   */
  type?: "text" | "number" | "image"
  /** Text direction of the values, e.g. "rtl" for Arabic names in an English page. */
  dir?: "ltr" | "rtl"
}
