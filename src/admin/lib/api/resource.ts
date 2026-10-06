import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { apiClient } from "./client"
import { toListParams } from "./list-params"
import type { CollectionKey, CollectionMap, CollectionRow, Paginated, PublishAction } from "./types"

/**
 * API calls and TanStack Query options for a draft/publish list
 * (`GET base`, `GET base/:id`, `POST base`, `PUT base/:id`, `DELETE base/:id`,
 * `POST base/:id/:action`). Saving changes the draft; publishing makes it live.
 *
 * @example export const solutionsResource = createResource("solutions")
 */
export function createResource<K extends CollectionKey>(key: K) {
  type T = CollectionMap[K]
  type Row = CollectionRow<T>
  const base = `/${key}`
  const path = (id: string) => `${base}/${encodeURIComponent(id)}`
  const api = {
    list: (query: DataTableQuery) => apiClient.get<Paginated<Row>>(base, { query: { ...toListParams(query) } }),
    get: (id: string) => apiClient.get<Row>(path(id)),
    /** Creates a draft; `publish` puts it on the website straight away. */
    create: (input: T, { publish = false } = {}) => apiClient.post<Row>(base, input, { query: { publish } }),
    update: (id: string, input: T) => apiClient.put<Row>(path(id), input),
    remove: (id: string) => apiClient.delete<void>(path(id)),
    act: (id: string, action: PublishAction) => apiClient.post<Row>(`${path(id)}/${action}`),
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
  return { key, api, queries }
}

export type Resource<K extends CollectionKey> = ReturnType<typeof createResource<K>>
