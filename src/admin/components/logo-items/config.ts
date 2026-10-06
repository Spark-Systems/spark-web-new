"use client"

import { useTranslations } from "next-intl"

import type { Resource } from "@admin/lib/api/resource"
import { clientsResource, partnersResource } from "@admin/lib/api/services/site-content"
import { adminPaths } from "@admin/lib/paths"

/** Everything that differs between the logo lists; the table and editor are shared. */
export interface LogoItemsConfig {
  /** Message namespace; both have the same keys (see "Clients" in messages/en.json). */
  namespace: "Clients" | "Partners"
  path: string
  resource: Resource<"clients"> | Resource<"partners">
  uploadFolder: string
  /** Partners can print their name beside a symbol-only logo. */
  showNameOption: boolean
}

export const logoItemsConfigs = {
  clients: {
    namespace: "Clients",
    path: adminPaths.clients,
    resource: clientsResource,
    uploadFolder: "clients",
    showNameOption: false,
  },
  partners: {
    namespace: "Partners",
    path: adminPaths.partners,
    resource: partnersResource,
    uploadFolder: "partners",
    showNameOption: true,
  },
} satisfies Record<string, LogoItemsConfig>

export type LogoItemsKind = keyof typeof logoItemsConfigs

/** Translator for a logo list. The namespaces share one shape, so they're typed as "Clients". */
export function useLogoItemsT(config: LogoItemsConfig) {
  return useTranslations(config.namespace as "Clients")
}
