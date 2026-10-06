import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import type { Paginated, ProductCategory, ProductCategoryInput } from "../types"

const base = "/product-categories"

export const productCategoriesApi = {
  list: (query: DataTableQuery) =>
    apiClient.get<Paginated<ProductCategory>>(base, { query: { ...toListParams(query) } }),
  /** Every main category, for the "parent category" select. */
  mainCategories: () =>
    apiClient.get<Paginated<ProductCategory>>(base, {
      query: { level: "main", page: 1, page_size: 100, sort: "order", order: "asc" },
    }),
  /** Every category (main and sub), for a product's category select. */
  allCategories: () =>
    apiClient.get<Paginated<ProductCategory>>(base, {
      query: { page: 1, page_size: 100, sort: "order", order: "asc" },
    }),
  get: (id: string) => apiClient.get<ProductCategory>(`${base}/${encodeURIComponent(id)}`),
  create: (input: ProductCategoryInput) => apiClient.post<ProductCategory>(base, input),
  update: (id: string, input: ProductCategoryInput) =>
    apiClient.put<ProductCategory>(`${base}/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`${base}/${encodeURIComponent(id)}`),
}

export const productCategoriesQueries = {
  all: ["product-categories"] as const,
  list: (query: DataTableQuery) =>
    queryOptions({
      queryKey: ["product-categories", "list", toListParams(query)],
      queryFn: () => productCategoriesApi.list(query),
      placeholderData: keepPreviousData,
    }),
  mainCategories: () =>
    queryOptions({
      queryKey: ["product-categories", "main"],
      queryFn: () => productCategoriesApi.mainCategories(),
    }),
  allCategories: () =>
    queryOptions({
      queryKey: ["product-categories", "all"],
      queryFn: () => productCategoriesApi.allCategories(),
    }),
  detail: (id: string) =>
    queryOptions({ queryKey: ["product-categories", "detail", id], queryFn: () => productCategoriesApi.get(id) }),
}
