"use client"

import { DirectionProvider } from "@base-ui/react/direction-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { useState } from "react"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { isApiError } from "@/lib/api/errors"
import { AuthProvider } from "@/lib/auth/auth-provider"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // Don't retry auth/validation errors; 401s are already handled by the API client.
        retry: (failureCount, error) =>
          !(isApiError(error) && error.status < 500) && failureCount < 2,
      },
    },
  })
}

export function Providers({
  dir,
  hasSession,
  children,
}: {
  dir: "ltr" | "rtl"
  hasSession: boolean
  children: React.ReactNode
}) {
  const [queryClient] = useState(makeQueryClient)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DirectionProvider direction={dir}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider initialHasSession={hasSession}>
            <TooltipProvider>
              {children}
              <Toaster position="top-center" dir={dir} />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </DirectionProvider>
    </ThemeProvider>
  )
}
