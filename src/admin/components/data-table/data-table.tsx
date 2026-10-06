"use client"

import {
  createColumnHelper,
  functionalUpdate,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type CellData,
  type Column,
  type ColumnDef,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Ellipsis, Search, X } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useEffect, useEffectEvent, useMemo, useState } from "react"

import { Button } from "@admin/components/ui/button"
import { Checkbox } from "@admin/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@admin/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@admin/components/ui/select"
import { Skeleton } from "@admin/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@admin/components/ui/table"
import { cn } from "@admin/lib/utils"
import { DataTableExport, type DataTableExportOptions } from "./data-table-export"
import { hasActiveFilters, type DataTableQuery } from "./use-data-table-query"

export interface DataTableColumnMeta {
  /** Applied to both the header and the cells of the column. */
  className?: string
  align?: "start" | "center" | "end"
}

// Shared feature set: the server sorts and paginates; the table only tracks state.
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
})
export type DataTableFeatures = typeof dataTableFeatures

/** Typed column helper for DataTable columns: `const col = dataTableColumnHelper<Country>()`. */
export const dataTableColumnHelper = <TData extends RowData>() => createColumnHelper<DataTableFeatures, TData>()

export interface DataTableProps<TData extends RowData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- columns mix value types
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  /** The current page of rows, already filtered, sorted and paginated by the server. */
  data: TData[]
  /** Total matching rows on the server (for page count and "x–y of z"). */
  rowCount: number
  query: DataTableQuery
  onQueryChange: (patch: Partial<DataTableQuery>) => void
  /** First load: shows skeleton rows. */
  isLoading?: boolean
  /** Refetching (e.g. new page): keeps the current rows on screen, dimmed. */
  isFetching?: boolean
  getRowId?: (row: TData) => string
  searchPlaceholder?: string
  /** Hide the search box for tables that don't support it. */
  searchable?: boolean
  /** Filter controls shown after the search box, e.g. <DataTableFacetFilter />. */
  filters?: React.ReactNode
  /** Buttons on the reading-end side of the toolbar, e.g. Add / Import. */
  toolbar?: React.ReactNode
  /** Adds "Excel" and "Print" buttons that export every row matching the current search and filters. */
  exportOptions?: DataTableExportOptions<TData>
  /** Adds a checkbox column. Selection clears whenever the page, sort or filters change. */
  enableRowSelection?: boolean
  /** Actions for the selected rows (shown while some are selected), e.g. a bulk delete. */
  bulkActions?: (rows: TData[], clearSelection: () => void) => React.ReactNode
  pageSizeOptions?: number[]
  emptyMessage?: React.ReactNode
}

const alignClass = { start: "text-start", center: "text-center", end: "text-end" }

/** Sortable header: click cycles ascending → descending → off. */
export function DataTableColumnHeader<TData extends RowData, TValue extends CellData = CellData>({
  column,
  title,
}: {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
}) {
  const t = useTranslations("DataTable")
  if (!column.getCanSort()) return <>{title}</>

  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      title={sorted === "asc" ? t("sortAscending") : sorted === "desc" ? t("sortDescending") : t("sortable")}
      className={cn(
        "hover:text-foreground -mx-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors",
        sorted && "text-foreground"
      )}
    >
      {title}
      <Icon className={cn("size-3.5", sorted ? "text-primary" : "text-muted-foreground/70")} />
    </button>
  )
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const t = useTranslations("DataTable")
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)

  // Follow outside resets of the search (e.g. "Reset filters").
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value)
  }

  // Debounce, so typing "egypt" sends one request rather than five. The effect
  // event always calls the latest onChange without restarting the timer.
  const commit = useEffectEvent((next: string) => onChange(next))
  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => commit(draft), 300)
    return () => clearTimeout(timer)
  }, [draft, value])

  return (
    <InputGroup className="w-full sm:w-64">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder ?? t("search")}
        aria-label={placeholder ?? t("search")}
      />
      {draft && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={t("clearSearch")} onClick={() => setDraft("")}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}

/** Page buttons with gaps, e.g. 1 2 3 4 … 9 10 or 1 2 … 5 6 7 … 9 10. */
function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1])
  if (current <= 3) [3, 4].forEach((p) => pages.add(p))
  if (current >= total - 2) [total - 3, total - 2].forEach((p) => pages.add(p))
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  return sorted.flatMap((page, i) => (i > 0 && page - sorted[i - 1] > 1 ? ["gap" as const, page] : [page]))
}

/**
 * Server-side data table: search, filters, sorting and pagination are sent to
 * the API through `query` / `onQueryChange`; the table renders the page it gets
 * back. Pair with `useDataTableQuery()` to keep the query in the URL.
 *
 * @example
 * const [query, setQuery] = useDataTableQuery({ sort: { id: "order", desc: false } })
 * const { data, isPending, isFetching } = useQuery(countriesQueries.list(query))
 * <DataTable columns={columns} data={data?.data ?? NO_ROWS} rowCount={data?.total ?? 0}
 *   query={query} onQueryChange={setQuery} isLoading={isPending} isFetching={isFetching} />
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  rowCount,
  query,
  onQueryChange,
  isLoading,
  isFetching,
  getRowId,
  searchPlaceholder,
  searchable = true,
  filters,
  toolbar,
  exportOptions,
  enableRowSelection = false,
  bulkActions,
  pageSizeOptions = [10, 20, 50, 100],
  emptyMessage,
}: DataTableProps<TData>) {
  const t = useTranslations("DataTable")
  const format = useFormatter()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Any change to what's shown clears the selection, so bulk actions only ever
  // apply to rows the user can see.
  const changeQuery = (patch: Partial<DataTableQuery>) => {
    setRowSelection({})
    onQueryChange(patch)
  }

  const allColumns = useMemo(() => {
    if (!enableRowSelection) return columns
    const helper = createColumnHelper<DataTableFeatures, TData>()
    const select = helper.display({
      id: "__select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
          aria-label={t("selectAll")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked === true)}
          aria-label={t("selectRow")}
        />
      ),
      meta: { className: "w-12" },
    })
    return [select, ...columns]
  }, [columns, enableRowSelection, t])

  const pagination: PaginationState = { pageIndex: query.page - 1, pageSize: query.pageSize }
  const sorting: SortingState = query.sort ? [query.sort] : []

  const table = useTable({
    features: dataTableFeatures,
    columns: allColumns,
    data,
    rowCount,
    getRowId,
    manualPagination: true,
    manualSorting: true,
    enableRowSelection,
    state: { pagination, sorting, rowSelection },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination)
      // A new page size starts over from page 1.
      changeQuery({
        page: next.pageSize !== pagination.pageSize ? 1 : next.pageIndex + 1,
        pageSize: next.pageSize,
      })
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting)
      changeQuery({ sort: next[0] ?? null, page: 1 })
    },
  })

  const pageCount = Math.max(table.getPageCount(), 1)
  const from = rowCount === 0 ? 0 : (query.page - 1) * query.pageSize + 1
  const to = Math.min(query.page * query.pageSize, rowCount)
  const columnCount = table.getAllLeafColumns().length
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
  const clearSelection = () => setRowSelection({})

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar: search + filters on the reading-start side, actions on the end side. */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <SearchBox
              value={query.search}
              onChange={(search) => changeQuery({ search, page: 1 })}
              placeholder={searchPlaceholder}
            />
          )}
          {filters}
          {hasActiveFilters(query) && (
            <Button variant="ghost" onClick={() => changeQuery({ search: "", filters: {}, page: 1 })}>
              {t("resetFilters")}
            </Button>
          )}
        </div>
        {(toolbar || exportOptions) && (
          <div className="flex flex-wrap items-center gap-2">
            {exportOptions && <DataTableExport options={exportOptions} />}
            {toolbar}
          </div>
        )}
      </div>

      {selectedRows.length > 0 && bulkActions && (
        <div className="bg-accent text-accent-foreground flex flex-wrap items-center gap-3 rounded-lg px-3 py-2 text-sm">
          <span className="font-medium">{t("selected", { count: selectedRows.length })}</span>
          <Button variant="link" size="sm" className="text-accent-foreground h-auto px-0" onClick={clearSelection}>
            {t("clearSelection")}
          </Button>
          <div className="ms-auto flex items-center gap-2">{bulkActions(selectedRows, clearSelection)}</div>
        </div>
      )}

      <div
        aria-busy={isFetching || isLoading || undefined}
        className={cn(
          "bg-card overflow-hidden rounded-xl border transition-opacity",
          isFetching && !isLoading && "opacity-60"
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                      className={cn(
                        "text-muted-foreground h-12 px-4 font-medium",
                        meta?.align && alignClass[meta.align],
                        meta?.className
                      )}
                    >
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(query.pageSize, 8) }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell colSpan={columnCount} className="px-4 py-3">
                    <Skeleton className="h-7 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="text-muted-foreground h-40 text-center">
                  {emptyMessage ?? t("noResults")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="hover:bg-muted/40 data-[state=selected]:bg-accent/50"
                >
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn("h-14 px-4", meta?.align && alignClass[meta.align], meta?.className)}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
        <span className="tabular-nums">
          {t("showing", { from: format.number(from), to: format.number(to), total: format.number(rowCount) })}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <span>{t("rowsPerPage")}</span>
            <Select value={String(query.pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger size="sm" className="w-18" aria-label={t("rowsPerPage")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <nav aria-label={t("pagination")} className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label={t("previousPage")}
            >
              <ChevronLeft className="rtl:rotate-180" />
            </Button>
            {pageItems(query.page, pageCount).map((item, i) =>
              item === "gap" ? (
                <span key={`gap-${i}`} aria-hidden className="flex size-7 items-center justify-center">
                  <Ellipsis className="size-4" />
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === query.page ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => table.setPageIndex(item - 1)}
                  aria-label={t("goToPage", { page: item })}
                  aria-current={item === query.page ? "page" : undefined}
                  className="tabular-nums"
                >
                  {format.number(item)}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label={t("nextPage")}
            >
              <ChevronRight className="rtl:rotate-180" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
