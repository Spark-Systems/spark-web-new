import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import type { Paginated, Product, ProductInput } from "../types"

const base = "/products"

export const productsApi = {
  list: (query: DataTableQuery) => apiClient.get<Paginated<Product>>(base, { query: { ...toListParams(query) } }),
  get: (id: string) => apiClient.get<Product>(`${base}/${encodeURIComponent(id)}`),
  create: (input: ProductInput) => apiClient.post<Product>(base, input),
  update: (id: string, input: ProductInput) => apiClient.put<Product>(`${base}/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`${base}/${encodeURIComponent(id)}`),
}

export const productsQueries = {
  all: ["products"] as const,
  list: (query: DataTableQuery) =>
    queryOptions({
      queryKey: ["products", "list", toListParams(query)],
      queryFn: () => productsApi.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) => queryOptions({ queryKey: ["products", "detail", id], queryFn: () => productsApi.get(id) }),
}
