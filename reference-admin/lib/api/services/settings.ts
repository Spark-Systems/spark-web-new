import { queryOptions } from "@tanstack/react-query"

import { apiClient } from "../client"
import type { AdvancedSettings, AdvancedSettingsUpdate, MetaSettings, SocialLinks } from "../types"

export const settingsApi = {
  getMeta: () => apiClient.get<MetaSettings>("/settings/meta"),
  updateMeta: (payload: MetaSettings) => apiClient.put<MetaSettings>("/settings/meta", payload),
  getSocial: () => apiClient.get<SocialLinks>("/settings/social"),
  updateSocial: (payload: SocialLinks) => apiClient.put<SocialLinks>("/settings/social", payload),
  getAdvanced: () => apiClient.get<AdvancedSettings>("/settings/advanced"),
  updateAdvanced: (payload: AdvancedSettingsUpdate) =>
    apiClient.put<AdvancedSettings>("/settings/advanced", payload),
}

export const settingsQueries = {
  meta: () => queryOptions({ queryKey: ["settings", "meta"], queryFn: settingsApi.getMeta }),
  social: () => queryOptions({ queryKey: ["settings", "social"], queryFn: settingsApi.getSocial }),
  advanced: () => queryOptions({ queryKey: ["settings", "advanced"], queryFn: settingsApi.getAdvanced }),
}
