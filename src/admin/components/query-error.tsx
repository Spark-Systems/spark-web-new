"use client"

import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@admin/components/ui/button"

/** Error state for a failed query, with a retry button. */
export function QueryError({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const t = useTranslations("Common")

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <AlertCircle className="text-destructive size-6" />
      <p className="text-muted-foreground text-sm">{message ?? t("genericError")}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  )
}
