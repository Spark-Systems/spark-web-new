"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { onUnauthorized } from "@admin/lib/api/client"
import { authApi, authQueries } from "@admin/lib/api/services/auth"
import type { LoginPayload, User } from "@admin/lib/api/types"
import { LOGIN_PATH } from "./constants"
import { tokenStorage } from "./token-storage"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  initialHasSession,
  children,
}: {
  /** Whether the request arrived with a session cookie (read on the server, avoids a hydration flash). */
  initialHasSession: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [hasSession, setHasSession] = useState(initialHasSession)

  const meQuery = useQuery({ ...authQueries.me(), enabled: hasSession })

  const endSession = useCallback(
    (redirectTo: string) => {
      tokenStorage.clear()
      setHasSession(false)
      queryClient.clear()
      router.replace(redirectTo)
    },
    [queryClient, router]
  )

  // The API client fires this when a 401 can't be fixed by refreshing tokens.
  useEffect(
    () =>
      onUnauthorized(() => {
        const callbackUrl = window.location.pathname + window.location.search
        endSession(`${LOGIN_PATH}?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      }),
    [endSession]
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      tokenStorage.setTokens(await authApi.login(payload))
      const user = await queryClient.fetchQuery(authQueries.me())
      setHasSession(true)
      return user
    },
    [queryClient]
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // The session is ended locally regardless of whether the server call succeeds.
    }
    endSession(LOGIN_PATH)
  }, [endSession])

  const status: AuthStatus = !hasSession
    ? "unauthenticated"
    : meQuery.isPending
      ? "loading"
      : meQuery.isSuccess
        ? "authenticated"
        : "unauthenticated"

  const value = useMemo<AuthContextValue>(
    () => ({ user: meQuery.data ?? null, status, login, logout }),
    [meQuery.data, status, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within <AuthProvider>")
  return context
}
