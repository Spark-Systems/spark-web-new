import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@admin/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import { refreshSession } from "../client"
import type { ActivityEntry, Application, Enquiry, EnquiryStats, EnquiryStatus, Paginated, User, UserInput } from "../types"
import { API_BASE_URL } from "../config"
import { tokenStorage } from "@admin/lib/auth/token-storage"

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

// ---- Job applications -------------------------------------------------------

export const applicationsApi = {
  setStatus: (id: string, status: EnquiryStatus) =>
    apiClient.patch<Application>(`/applications/${encodeURIComponent(id)}`, { status }),
  remove: (id: string) => apiClient.delete<void>(`/applications/${encodeURIComponent(id)}`),
  list: (query: DataTableQuery) => apiClient.get<Paginated<Application>>("/applications", { query: { ...toListParams(query) } }),
  /** Downloads the CV as a file (fetched with the session token, then saved). */
  downloadCv: async (application: Application) => {
    if (!tokenStorage.getAccessToken()) await refreshSession()
    const res = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(application.id)}/cv`, {
      headers: { Authorization: `Bearer ${tokenStorage.getAccessToken() ?? ""}` },
    })
    if (!res.ok) throw new Error(`CV download failed (${res.status})`)
    const url = URL.createObjectURL(await res.blob())
    const link = document.createElement("a")
    link.href = url
    link.download = application.cv?.name ?? "cv"
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  },
}

export const applicationsQueries = {
  all: ["applications"] as const,
  list: listOptions<Application>("applications", "/applications"),
  stats: () =>
    queryOptions({
      queryKey: ["applications", "stats"],
      queryFn: () => apiClient.get<EnquiryStats>("/applications/stats"),
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
