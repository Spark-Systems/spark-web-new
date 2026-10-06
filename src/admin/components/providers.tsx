"use client"

import { DirectionProvider } from "@base-ui/react/direction-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useLocale, useTranslations } from "next-intl"
import { ThemeProvider } from "next-themes"
import { useState } from "react"

import { configureZodLocale } from "@admin/components/cms/content-resolver"
import { Toaster } from "@admin/components/ui/sonner"
import { TooltipProvider } from "@admin/components/ui/tooltip"
import { isApiError } from "@admin/lib/api/errors"
import { AuthProvider } from "@admin/lib/auth/auth-provider"

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
  const locale = useLocale()
  const t = useTranslations("Common")
  // Form validation messages in the admin's language. Browser only: zod's config is
  // global, and on the server it would change the API's own error messages too.
  if (typeof window !== "undefined") configureZodLocale(locale, t("required"))

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
