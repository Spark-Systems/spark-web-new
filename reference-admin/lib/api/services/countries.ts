import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import { fetchAllRows } from "../fetch-all"
import type { Country, CountryInput, ImportResult, ListParams, Paginated } from "../types"

export const countriesApi = {
  list: (params: ListParams) => apiClient.get<Paginated<Country>>("/countries", { query: { ...params } }),
  get: (id: string) => apiClient.get<Country>(`/countries/${encodeURIComponent(id)}`),
  create: (input: CountryInput) => apiClient.post<Country>("/countries", input),
  update: (id: string, input: CountryInput) => apiClient.put<Country>(`/countries/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`/countries/${encodeURIComponent(id)}`),
  import: (rows: Pick<CountryInput, "name_en" | "name_ar">[]) =>
    apiClient.post<ImportResult>("/countries/import", { rows }),

  /** Every row matching the current search, filters and sort (all pages). */
  exportAll: (query: DataTableQuery): Promise<Country[]> =>
    fetchAllRows((q) => countriesApi.list(toListParams(q)), query),
}

export const countriesQueries = {
  all: ["countries"] as const,
  list: (query: DataTableQuery) =>
    queryOptions({
      queryKey: ["countries", "list", toListParams(query)],
      queryFn: () => countriesApi.list(toListParams(query)),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) =>
    queryOptions({ queryKey: ["countries", "detail", id], queryFn: () => countriesApi.get(id) }),
}
