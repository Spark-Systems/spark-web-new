import type { Locale } from "@admin/i18n/config"
import type messages from "./messages/en.json"

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale
    Messages: typeof messages
  }
}
