import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BrandShowcase } from "@admin/components/auth/brand-showcase"
import { LoginForm } from "@admin/components/auth/login-form"
import { LocaleSwitcher } from "@admin/components/locale-switcher"
import { AdaptiveLogo } from "@admin/components/logo"
import { ThemeToggle } from "@admin/components/theme-toggle"
import { HOME_PATH } from "@admin/lib/auth/constants"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth")
  return { title: t("metaTitle") }
}

/** Only allow same-site relative paths, so ?callbackUrl= can't redirect off-site. */
function safeCallbackUrl(value: string | string[] | undefined) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : HOME_PATH
}

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const t = await getTranslations("Auth")
  const { callbackUrl } = await searchParams

  return (
    <div className="bg-background grid min-h-svh p-3 lg:grid-cols-2 lg:gap-6 lg:p-4">
      <main className="flex flex-col px-3 py-2 sm:px-8 lg:px-12">
        <div className="flex justify-end gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-md flex-col gap-8">
            <AdaptiveLogo priority className="h-8 self-start" />
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">{t("title")}</h1>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>
            <LoginForm callbackUrl={safeCallbackUrl(callbackUrl)} />
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </main>

      <BrandShowcase className="hidden lg:flex" />
    </div>
  )
}
