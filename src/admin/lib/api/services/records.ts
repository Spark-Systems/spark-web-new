import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import type { ActivityEntry, Enquiry, EnquiryStats, EnquiryStatus, Paginated, User, UserInput } from "../types"

const listOptions = <T>(key: string, base: string) => (query: DataTableQuery) =>
  queryOptions({
    queryKey: [key, "list", toListParams(query)],
    queryFn: () => apiClient.get<Paginated<T>>(base, { query: { ...toListParams(query) } }),
    placeholderData: keepPreviousData,
  })

// ---- Enquiries --------------------------------------------------------------

export const enquiriesApi = {
  setStatus: (id: string, status: EnquiryStatus) => apiClient.patch<Enquiry>(`/enquiries/${encodeURIComponent(id)}`, { status }),
  remove: (id: string) => apiClient.delete<void>(`/enquiries/${encodeURIComponent(id)}`),
  list: (query: DataTableQuery) => apiClient.get<Paginated<Enquiry>>("/enquiries", { query: { ...toListParams(query) } }),
}

export const enquiriesQueries = {
  all: ["enquiries"] as const,
  list: listOptions<Enquiry>("enquiries", "/enquiries"),
  stats: () =>
    queryOptions({
      queryKey: ["enquiries", "stats"],
      queryFn: () => apiClient.get<EnquiryStats>("/enquiries/stats"),
      // Keeps the sidebar's unread badge current.
      refetchInterval: 60_000,
    }),
}

// ---- Users ------------------------------------------------------------------

export const usersApi = {
  list: (query: DataTableQuery) => apiClient.get<Paginated<User>>("/users", { query: { ...toListParams(query) } }),
  get: (id: string) => apiClient.get<User>(`/users/${encodeURIComponent(id)}`),
  create: (input: UserInput) => apiClient.post<User>("/users", input),
  update: (id: string, input: UserInput) => apiClient.put<User>(`/users/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`/users/${encodeURIComponent(id)}`),
}

export const usersQueries = {
  all: ["users"] as const,
  list: listOptions<User>("users", "/users"),
  detail: (id: string) => queryOptions({ queryKey: ["users", "detail", id], queryFn: () => usersApi.get(id) }),
}

// ---- Activity log -----------------------------------------------------------

export const activityApi = {
  list: (query: DataTableQuery) => apiClient.get<Paginated<ActivityEntry>>("/activity", { query: { ...toListParams(query) } }),
}

export const activityQueries = {
  all: ["activity"] as const,
  list: listOptions<ActivityEntry>("activity", "/activity"),
}

// ---- Dashboard overview -----------------------------------------------------

export interface Overview {
  pending: {
    kind: "page" | "item"
    resource: string
    id: string | null
    label: string
    status: "draft" | "changed"
    updated_at: string
    updated_by: string | null
  }[]
  counts: Record<string, { total: number; published: number }>
  enquiries: { new: number; total: number; latest: Enquiry[] }
  activity: ActivityEntry[]
}

export const overviewQueries = {
  overview: () =>
    queryOptions({ queryKey: ["overview"], queryFn: () => apiClient.get<Overview>("/overview"), refetchInterval: 60_000 }),
}
