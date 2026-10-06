import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import type { BannerInput, InternalBanner, Paginated } from "../types"
import { toListParams } from "../list-params"

const base = "/internal-banners"

export const bannersApi = {
  list: (query: DataTableQuery) =>
    apiClient.get<Paginated<InternalBanner>>(base, { query: { ...toListParams(query) } }),
  get: (id: string) => apiClient.get<InternalBanner>(`${base}/${encodeURIComponent(id)}`),
  create: (input: BannerInput) => apiClient.post<InternalBanner>(base, input),
  update: (id: string, input: BannerInput) => apiClient.put<InternalBanner>(`${base}/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`${base}/${encodeURIComponent(id)}`),
}

export const bannersQueries = {
  all: ["internal-banners"] as const,
  list: (query: DataTableQuery) =>
    queryOptions({
      queryKey: ["internal-banners", "list", toListParams(query)],
      queryFn: () => bannersApi.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) =>
    queryOptions({ queryKey: ["internal-banners", "detail", id], queryFn: () => bannersApi.get(id) }),
}
