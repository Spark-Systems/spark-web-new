import type { DataTableQuery } from "@admin/components/data-table/use-data-table-query"
import type { Paginated } from "./types"

const PAGE_SIZE = 100

/**
 * Every row matching a table's current search, filters and sort, across all
 * pages, by requesting the list page by page. Used for Excel and print exports.
 */
export async function fetchAllRows<T>(
  list: (query: DataTableQuery) => Promise<Paginated<T>>,
  query: DataTableQuery
): Promise<T[]> {
  const rows: T[] = []
  for (let page = 1; ; page++) {
    const result = await list({ ...query, page, pageSize: PAGE_SIZE })
    rows.push(...result.data)
    if (rows.length >= result.total || result.data.length === 0) return rows
  }
}
