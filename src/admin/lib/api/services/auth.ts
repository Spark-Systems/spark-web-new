import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "../client"
import type { AuthTokens, LoginPayload, User } from "../types"

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>("/auth/login", payload, { auth: false }),
  logout: () => apiClient.post<void>("/auth/logout"),
  me: () => apiClient.get<User>("/auth/me"),
}

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: ["auth", "me"],
      queryFn: authApi.me,
      staleTime: Infinity,
      retry: false,
    }),
}
