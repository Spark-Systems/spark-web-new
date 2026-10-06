import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import type { AboutSection, AboutSectionInput, Paginated } from "../types"

const base = "/about-us"

export const aboutApi = {
  list: (query: DataTableQuery) =>
    apiClient.get<Paginated<AboutSection>>(base, { query: { ...toListParams(query) } }),
  get: (id: string) => apiClient.get<AboutSection>(`${base}/${encodeURIComponent(id)}`),
  create: (input: AboutSectionInput) => apiClient.post<AboutSection>(base, input),
  update: (id: string, input: AboutSectionInput) =>
    apiClient.put<AboutSection>(`${base}/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`${base}/${encodeURIComponent(id)}`),
}

export const aboutQueries = {
  all: ["about-us"] as const,
  list: (query: DataTableQuery) =>
    queryOptions({
      queryKey: ["about-us", "list", toListParams(query)],
      queryFn: () => aboutApi.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) => queryOptions({ queryKey: ["about-us", "detail", id], queryFn: () => aboutApi.get(id) }),
}
