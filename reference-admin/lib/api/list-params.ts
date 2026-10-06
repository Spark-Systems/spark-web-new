import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import type { ListParams } from "./types"

/** Turns a data table's query state into API list parameters (shared by every list endpoint). */
export const toListParams = (query: DataTableQuery): ListParams => ({
  page: query.page,
  page_size: query.pageSize,
  sort: query.sort?.id,
  order: query.sort ? (query.sort.desc ? "desc" : "asc") : undefined,
  q: query.search || undefined,
  ...Object.fromEntries(
    Object.entries(query.filters)
      .filter(([, values]) => values.length > 0)
      .map(([key, values]) => [key, values.join(",")])
  ),
})
