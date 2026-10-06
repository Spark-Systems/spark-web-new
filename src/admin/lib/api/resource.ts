import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { apiClient } from "./client"
import { toListParams } from "./list-params"
import type { Paginated } from "./types"

/**
 * API calls and TanStack Query options for a standard list resource
 * (`GET base`, `GET base/:id`, `POST base`, `PUT base/:id`, `DELETE base/:id`).
 *
 * @example export const solutionsResource = createResource<Solution, SolutionInput>("/solutions", "solutions")
 */
export function createResource<T, I>(base: string, key: string) {
  const path = (id: string) => `${base}/${encodeURIComponent(id)}`
  const api = {
    list: (query: DataTableQuery) => apiClient.get<Paginated<T>>(base, { query: { ...toListParams(query) } }),
    get: (id: string) => apiClient.get<T>(path(id)),
    create: (input: I) => apiClient.post<T>(base, input),
    update: (id: string, input: I) => apiClient.put<T>(path(id), input),
    remove: (id: string) => apiClient.delete<void>(path(id)),
  }
  const queries = {
    all: [key] as const,
    list: (query: DataTableQuery) =>
      queryOptions({
        queryKey: [key, "list", toListParams(query)],
        queryFn: () => api.list(query),
        placeholderData: keepPreviousData,
      }),
    detail: (id: string) => queryOptions({ queryKey: [key, "detail", id], queryFn: () => api.get(id) }),
  }
  return { api, queries }
}
