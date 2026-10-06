"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"

export interface DataTableSort {
  id: string
  desc: boolean
}

/** Everything the server needs to return one page: send it with the request. */
export interface DataTableQuery {
  /** 1-based. */
  page: number
  pageSize: number
  sort: DataTableSort | null
  search: string
  /** Facet filters by key, e.g. { status: ["hidden"] }. Empty arrays mean "no filter". */
  filters: Record<string, string[]>
}

const DEFAULTS: DataTableQuery = { page: 1, pageSize: 10, sort: null, search: "", filters: {} }
const FILTER_PREFIX = "f_"

function parse(params: URLSearchParams, defaults: DataTableQuery): DataTableQuery {
  const page = Number(params.get("page"))
  const pageSize = Number(params.get("size"))
  const [sortId, sortDir] = (params.get("sort") ?? "").split(".")
  const filters: Record<string, string[]> = { ...defaults.filters }
  params.forEach((value, key) => {
    if (key.startsWith(FILTER_PREFIX) && value) filters[key.slice(FILTER_PREFIX.length)] = value.split(",")
  })
  return {
    page: Number.isInteger(page) && page > 0 ? page : defaults.page,
    pageSize: Number.isInteger(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : defaults.pageSize,
    sort: sortId ? { id: sortId, desc: sortDir === "desc" } : defaults.sort,
    search: params.get("q") ?? defaults.search,
    filters,
  }
}

function toSearch(query: DataTableQuery, defaults: DataTableQuery) {
  const params = new URLSearchParams(window.location.search)
  const set = (key: string, value: string | null) => (value ? params.set(key, value) : params.delete(key))
  set("page", query.page !== 1 ? String(query.page) : null)
  set("size", query.pageSize !== defaults.pageSize ? String(query.pageSize) : null)
  set("sort", query.sort ? `${query.sort.id}.${query.sort.desc ? "desc" : "asc"}` : null)
  set("q", query.search || null)
  for (const key of [...params.keys()]) if (key.startsWith(FILTER_PREFIX)) params.delete(key)
  for (const [key, values] of Object.entries(query.filters)) {
    if (values.length) params.set(`${FILTER_PREFIX}${key}`, values.join(","))
  }
  const search = params.toString()
  return search ? `?${search}` : window.location.pathname
}

/** True when search or any facet filter is narrowing the results. */
export const hasActiveFilters = (query: DataTableQuery) =>
  query.search !== "" || Object.values(query.filters).some((values) => values.length > 0)

/**
 * Table query state (page, page size, sort, search, filters) mirrored to the URL,
 * e.g. ?page=2&sort=name_en.asc&q=eg&f_status=hidden, so views can be shared and
 * survive reloads. Changes apply instantly; the URL follows via history.replaceState.
 */
export function useDataTableQuery(defaults?: Partial<DataTableQuery>) {
  const searchParams = useSearchParams()
  const base = { ...DEFAULTS, ...defaults }
  const [query, setQueryState] = useState<DataTableQuery>(() => parse(searchParams, base))

  const setQuery = (patch: Partial<DataTableQuery>) => {
    const next = { ...query, ...patch }
    setQueryState(next)
    window.history.replaceState(null, "", toSearch(next, base))
  }

  return [query, setQuery] as const
}
