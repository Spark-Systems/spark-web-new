"use client"

import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@admin/components/ui/button"
import { FormActionBar } from "./form-action-bar"

export type SaveIntent = "save" | "continue"

/**
 * Pinned Cancel / Save / Save & Continue bar for a form split across tabs.
 * Save is the form's submit button; "Save & Continue" shows only when there's a next tab.
 */
export function TabbedFormActions({
  cancelHref,
  isDirty,
  isEdit,
  pending,
  hasNextTab,
  onContinue,
}: {
  cancelHref: string
  isDirty: boolean
  isEdit: boolean
  /** The save in progress, if any, so its button shows the spinner. */
  pending?: SaveIntent
  hasNextTab: boolean
  onContinue: () => void
}) {
  const t = useTranslations("FormActions")

  return (
    <FormActionBar status={isDirty && t("unsaved")}>
      <Button variant="ghost" nativeButton={false} render={<Link href={cancelHref} />}>
        {t("cancel")}
      </Button>
      <Button
        type="submit"
        variant={hasNextTab ? "outline" : "default"}
        // Editing with no changes: nothing to save.
        disabled={Boolean(pending) || (isEdit && !isDirty)}
      >
        {pending === "save" && <Loader2 className="animate-spin" data-icon="inline-start" />}
        {t("save")}
      </Button>
      {hasNextTab && (
        <Button type="button" disabled={Boolean(pending)} onClick={onContinue}>
          {pending === "continue" && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {t("saveContinue")}
          <ArrowRight className="rtl:rotate-180" data-icon="inline-end" />
        </Button>
      )}
    </FormActionBar>
  )
}
