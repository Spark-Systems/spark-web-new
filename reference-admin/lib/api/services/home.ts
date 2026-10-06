import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type { DataTableQuery } from "@/components/data-table/use-data-table-query"
import { apiClient } from "../client"
import { toListParams } from "../list-params"
import type { FooterContact, HomeBanner, HomeBannerInput, Paginated, WelcomeMessage } from "../types"

const banners = "/home/banners"

export const homeBannersApi = {
  list: (query: DataTableQuery) =>
    apiClient.get<Paginated<HomeBanner>>(banners, { query: { ...toListParams(query) } }),
  get: (id: string) => apiClient.get<HomeBanner>(`${banners}/${encodeURIComponent(id)}`),
  create: (input: HomeBannerInput) => apiClient.post<HomeBanner>(banners, input),
  update: (id: string, input: HomeBannerInput) =>
    apiClient.put<HomeBanner>(`${banners}/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiClient.delete<void>(`${banners}/${encodeURIComponent(id)}`),
}

export const homeBannersQueries = {
  all: ["home-banners"] as const,
  list: (query: DataTableQuery) =>
    queryOptions({
      queryKey: ["home-banners", "list", toListParams(query)],
      queryFn: () => homeBannersApi.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (id: string) =>
    queryOptions({ queryKey: ["home-banners", "detail", id], queryFn: () => homeBannersApi.get(id) }),
}

export const homeApi = {
  getWelcome: () => apiClient.get<WelcomeMessage>("/home/welcome-message"),
  updateWelcome: (payload: WelcomeMessage) => apiClient.put<WelcomeMessage>("/home/welcome-message", payload),
  getFooter: () => apiClient.get<FooterContact>("/home/footer-contact"),
  updateFooter: (payload: FooterContact) => apiClient.put<FooterContact>("/home/footer-contact", payload),
}

export const homeQueries = {
  welcome: () => queryOptions({ queryKey: ["home", "welcome-message"], queryFn: homeApi.getWelcome }),
  footer: () => queryOptions({ queryKey: ["home", "footer-contact"], queryFn: homeApi.getFooter }),
}
