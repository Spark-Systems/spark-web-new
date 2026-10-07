"use client"

import { Ellipsis, ExternalLink, Loader2, Trash2, Undo2, EyeOff } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { FormActionBar } from "@admin/components/form/form-action-bar"
import { Button } from "@admin/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@admin/components/ui/dropdown-menu"
import { refreshSession } from "@admin/lib/api/client"
import type { PublishStatus } from "@admin/lib/api/types"
import { tokenStorage } from "@admin/lib/auth/token-storage"
import { PublishStatusBadge } from "./publish-status-badge"

/** What's running, so its button shows the spinner (and the others wait). */
export type PublishPending = "draft" | "publish" | "unpublish" | "discard" | "delete" | null

/** Opens the website in preview mode (showing saved drafts) at `path`. */
export const previewUrl = (path: string) => `/api/preview?path=${encodeURIComponent(path)}`

/**
 * Opens the preview in a new tab. The preview route checks the access token
 * cookie, which expires after a few minutes, so renew it first if needed. The
 * tab is opened straight away (before awaiting) so popup blockers allow it.
 */
export async function openPreview(path: string) {
  const tab = window.open("about:blank", "_blank")
  if (!tokenStorage.getAccessToken()) await refreshSession()
  if (tab) tab.location.href = previewUrl(path)
}

/**
 * Pinned bar for a draft/publish form: status on the start side; Preview, a
 * menu (discard changes, unpublish, delete), Save draft and Publish on the
 * end. Save draft and Publish submit the form via their callbacks.
 */
export function PublishActions({
  status,
  isDirty,
  pending,
  readOnly,
  cancelHref,
  previewPath,
  onSaveDraft,
  onPublish,
  onUnpublish,
  onDiscard,
  onDelete,
  leading,
}: {
  /** Null while creating (nothing saved yet). */
  status: PublishStatus | null
  isDirty: boolean
  pending: PublishPending
  /** Viewers can look but not change anything. */
  readOnly?: boolean
  cancelHref?: string
  /** Website path to preview, once something is saved. */
  previewPath?: string
  onSaveDraft: () => void
  onPublish: () => void
  onUnpublish?: () => void
  onDiscard?: () => void
  onDelete?: () => void
  /** Extra controls before the buttons, e.g. the live preview toggle. */
  leading?: React.ReactNode
}) {
  const t = useTranslations("Publish")
  const busy = pending !== null
  const spinner = (what: PublishPending) =>
    pending === what ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null
  // Nothing to publish: saved, already live, no edits.
  const upToDate = status === "published" && !isDirty
  const canDiscard = onDiscard && status === "changed"
  const canUnpublish = onUnpublish && status !== null && status !== "draft"
  const hasMenu = !readOnly && (canDiscard || canUnpublish || onDelete)

  return (
    <FormActionBar
      status={
        <span className="flex flex-wrap items-center gap-2">
          {status && <PublishStatusBadge status={status} />}
          {isDirty && <span>{t("unsaved")}</span>}
          {readOnly && <span>{t("readOnly")}</span>}
        </span>
      }
    >
      {leading}
      {cancelHref && (
        <Button variant="ghost" nativeButton={false} render={<Link href={cancelHref} />}>
          {t("back")}
        </Button>
      )}
      {previewPath && status && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => openPreview(previewPath)}
          title={isDirty ? t("previewSavedHint") : undefined}
        >
          <ExternalLink data-icon="inline-start" />
          {t("preview")}
        </Button>
      )}
      {hasMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label={t("more")} disabled={busy} />}>
            <Ellipsis />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {canDiscard && (
              <DropdownMenuItem onClick={onDiscard}>
                <Undo2 />
                {t("discard")}
              </DropdownMenuItem>
            )}
            {canUnpublish && (
              <DropdownMenuItem onClick={onUnpublish}>
                <EyeOff />
                {t("unpublish")}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                {(canDiscard || canUnpublish) && <DropdownMenuSeparator />}
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 />
                  {t("delete")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!readOnly && (
        <>
          <Button type="button" variant="outline" disabled={busy || (status !== null && !isDirty)} onClick={onSaveDraft}>
            {spinner("draft")}
            {t("saveDraft")}
          </Button>
          <Button type="button" disabled={busy || upToDate} onClick={onPublish}>
            {spinner("publish")}
            {status === null || isDirty ? t("savePublish") : t("publish")}
          </Button>
        </>
      )}
    </FormActionBar>
  )
}
