import { Construction } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { HOME_PATH } from "@/lib/auth/constants"

/** Empty state for sections that are planned but not built yet. */
export function ComingSoon({ showBackLink = true }: { showBackLink?: boolean }) {
  const t = useTranslations("Placeholder")

  return (
    <div className="bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <span className="bg-accent text-primary flex size-12 items-center justify-center rounded-xl">
        <Construction className="size-6" />
      </span>
      <h2 className="font-heading text-lg font-semibold">{t("comingSoonTitle")}</h2>
      <p className="text-muted-foreground max-w-sm text-sm">{t("comingSoonBody")}</p>
      {showBackLink && (
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href={HOME_PATH} />}>
          {t("backToDashboard")}
        </Button>
      )}
    </div>
  )
}
