import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "../client"
import type { PageContentMap, PageDocument, PageKey } from "../types"

/** The website's page documents (draft/publish, like the lists, but never unpublished). */
export const pagesApi = {
  get: <K extends PageKey>(page: K) => apiClient.get<PageDocument<K>>(`/pages/${page}`),
  save: <K extends PageKey>(page: K, content: PageContentMap[K]) =>
    apiClient.put<PageDocument<K>>(`/pages/${page}`, { content }),
  act: <K extends PageKey>(page: K, action: "publish" | "discard") =>
    apiClient.post<PageDocument<K>>(`/pages/${page}/${action}`),
}

export const pageQueries = {
  all: ["pages"] as const,
  detail: <K extends PageKey>(page: K) =>
    queryOptions({ queryKey: ["pages", page], queryFn: () => pagesApi.get(page) }),
}
