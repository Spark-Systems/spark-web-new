"use client"

import { useTranslations } from "next-intl"

import { clientsApi, partnersApi, type LogoItemsApi } from "@/lib/api/services/logo-items"

/** Everything that differs between logo lists; the table and form are shared. */
export interface LogoItemsConfig {
  /** Message namespace; each has the same keys (see "Clients" in messages/en.json). */
  namespace: "Clients" | "Partners"
  /** List page; new/edit pages live under it. */
  path: string
  api: LogoItemsApi
  uploadFolder: string
  /** Export file name, without extension. */
  fileName: string
}

export const logoItemsConfigs = {
  clients: { namespace: "Clients", path: "/clients", api: clientsApi, uploadFolder: "clients", fileName: "clients" },
  partners: { namespace: "Partners", path: "/partners", api: partnersApi, uploadFolder: "partners", fileName: "partners" },
} satisfies Record<string, LogoItemsConfig>

export type LogoItemsKind = keyof typeof logoItemsConfigs

/**
 * Translator for a logo list. The namespaces share one shape, so they're typed
 * as "Clients" to get key checking for both.
 */
export function useLogoItemsT(config: LogoItemsConfig) {
  return useTranslations(config.namespace as "Clients")
}
