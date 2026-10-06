import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import type { LogoItem, LogoItemInput, Paginated } from "../types"

/** API and query options for a list of logo companies, e.g. "/clients". */
function createLogoItemsApi(base: string, key: string) {
  const api = {
    list: (query: DataTableQuery) => apiClient.get<Paginated<LogoItem>>(base, { query: { ...toListParams(query) } }),
    get: (id: string) => apiClient.get<LogoItem>(`${base}/${encodeURIComponent(id)}`),
    create: (input: LogoItemInput) => apiClient.post<LogoItem>(base, input),
    update: (id: string, input: LogoItemInput) => apiClient.put<LogoItem>(`${base}/${encodeURIComponent(id)}`, input),
    remove: (id: string) => apiClient.delete<void>(`${base}/${encodeURIComponent(id)}`),
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

export type LogoItemsApi = ReturnType<typeof createLogoItemsApi>

export const clientsApi = createLogoItemsApi("/clients", "clients")
export const partnersApi = createLogoItemsApi("/partners", "partners")
