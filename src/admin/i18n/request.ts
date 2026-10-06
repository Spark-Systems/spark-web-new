import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

import { defaultLocale, LOCALE_COOKIE, locales } from "./config"

export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value
  const locale = hasLocale(locales, stored) ? stored : defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
