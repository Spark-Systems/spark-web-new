"use client"

import { useTranslations } from "next-intl"

import { StatusBadge, type StatusTone } from "@admin/components/status-badge"
import type { PublishStatus } from "@admin/lib/api/types"

const tones: Record<PublishStatus, StatusTone> = { published: "success", changed: "warning", draft: "neutral" }

/** Published / Unpublished changes / Draft. */
export function PublishStatusBadge({ status, className }: { status: PublishStatus; className?: string }) {
  const t = useTranslations("Publish.status")
  return (
    <StatusBadge tone={tones[status]} className={className}>
      {t(status)}
    </StatusBadge>
  )
}
