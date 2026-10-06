"use client"

import { FileText, Share2, SlidersHorizontal } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { PageHeader } from "@admin/components/layout/page-header"
import { SegmentedTabs } from "@admin/components/segmented-tabs"
import { AdvancedSettingsForm } from "./advanced-settings-form"
import { MetaInformationForm } from "./meta-information-form"
import { SocialLinksForm } from "./social-links-form"

const tabValues = ["meta", "social", "advanced"] as const
type TabValue = (typeof tabValues)[number]

const isTab = (value: string | null): value is TabValue => tabValues.includes(value as TabValue)

/** Page header with the tab bar on its end side, then the active tab's form. */
export function ConfigurationTabs({ title, description }: { title: string; description?: string }) {
  const t = useTranslations("Configuration.tabs")
  const searchParams = useSearchParams()
  const param = searchParams.get("tab")
  // Local state makes switching instant; the URL (?tab=social) is kept in step
  // with history.replaceState so a tab can be linked to and survives reloads.
  const [active, setActive] = useState<TabValue>(isTab(param) ? param : "meta")

  return (
    <SegmentedTabs
      value={active}
      onValueChange={(value) => {
        setActive(value)
        const params = new URLSearchParams(window.location.search)
        params.set("tab", value)
        window.history.replaceState(null, "", `?${params}`)
      }}
      className="gap-6"
      renderList={(list) => <PageHeader title={title} description={description} actions={list} />}
      tabs={[
        { value: "meta", label: t("meta"), icon: FileText, content: <MetaInformationForm /> },
        { value: "social", label: t("social"), icon: Share2, content: <SocialLinksForm /> },
        { value: "advanced", label: t("advanced"), icon: SlidersHorizontal, content: <AdvancedSettingsForm /> },
      ]}
    />
  )
}
