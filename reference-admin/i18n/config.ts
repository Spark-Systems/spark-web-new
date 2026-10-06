export const locales = ["en", "ar"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

/** Cookie that stores the user's chosen language (read by i18n/request.ts). */
export const LOCALE_COOKIE = "NEXT_LOCALE"

const rtlLocales: readonly Locale[] = ["ar"]

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr"
}

/** Native language names, shown untranslated in the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
}
