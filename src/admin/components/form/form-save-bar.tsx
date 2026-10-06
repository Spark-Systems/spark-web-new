"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@admin/components/ui/button"
import { FormActionBar } from "./form-action-bar"

/**
 * Save / discard bar pinned to the bottom of the viewport so Save is always in
 * reach on long forms. Both buttons are inactive until the form has changes.
 */
export function FormSaveBar({
  isDirty,
  isSaving,
  onDiscard,
}: {
  isDirty: boolean
  isSaving: boolean
  onDiscard: () => void
}) {
  const t = useTranslations("Configuration")

  return (
    <FormActionBar status={isDirty && t("unsaved")}>
      <Button type="button" variant="ghost" disabled={!isDirty || isSaving} onClick={onDiscard}>
        {t("discard")}
      </Button>
      <Button type="submit" disabled={!isDirty || isSaving}>
        {isSaving && <Loader2 className="animate-spin" data-icon="inline-start" />}
        {isSaving ? t("saving") : t("save")}
      </Button>
    </FormActionBar>
  )
}
