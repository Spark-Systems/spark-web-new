import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import type { Paginated, Service, ServiceInput } from "../types"

// "Site services" to keep these apart from the API service modules in this folder.
const base = "/services"

export const siteServicesApi = {
  list: (query: DataTableQuery) => apiClient.get<Paginated<Service>>(base, { query: { ...toListParams(query) } }),
  get: (id: string) => apiClient.get<Service>(`${base}/${encodeURIComponent(id)}`),
  create: (input: ServiceInput) => apiClient.post<Service>(base, input),
  update: (id: string, input: ServiceInput) => apiClient.put<Service>(`${base}/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`${base}/${encodeURIComponent(id)}`),
}

export const siteServicesQueries = {
  all: ["services"] as const,
  list: (query: DataTableQuery) =>
    queryOptions({
      queryKey: ["services", "list", toListParams(query)],
      queryFn: () => siteServicesApi.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) =>
    queryOptions({ queryKey: ["services", "detail", id], queryFn: () => siteServicesApi.get(id) }),
}
