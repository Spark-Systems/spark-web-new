"use client"

import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import type { FieldValues, UseFormReturn } from "react-hook-form"

import { Button } from "@admin/components/ui/button"
import { LivePreview } from "./live-preview"
import { SectionJumpBar } from "./section-jump-bar"
import { UnsavedChangesGuard } from "./unsaved-changes-guard"

/** What a silent draft save (for the live preview) came back with. */
export type AutosaveResult = "saved" | "invalid" | "error"

const PREVIEW_PREF = "spark-admin:live-preview"
const AUTOSAVE_DELAY_MS = 1500

// The preview toggle is remembered per browser (localStorage), shared by all editors.
const listeners = new Set<() => void>()
const readPreference = () => {
  try {
    return localStorage.getItem(PREVIEW_PREF) === "1"
  } catch {
    return false
  }
}

function usePreviewPreference() {
  const open = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    readPreference,
    () => false,
  )
  const set = (next: boolean) => {
    try {
      localStorage.setItem(PREVIEW_PREF, next ? "1" : "0")
    } catch {
      /* storage unavailable */
    }
    listeners.forEach((listener) => listener())
  }
  return [open, set] as const
}

/**
 * Layout shared by the page and list editors:
 * - a "Live preview" toggle that opens the website beside the form (wide
 *   screens). While it's open, edits are saved as a draft after a short pause
 *   and the preview reloads; drafts never reach the live site.
 * - a sticky bar to jump between the form's sections
 * - a warning before leaving with unsaved changes
 */
export function EditorFrame<T extends FieldValues>({
  form,
  previewPath,
  saveSilently,
  readOnly,
  children,
  footer,
}: {
  form: UseFormReturn<T>
  /** Website path to preview; null until the item has been saved once. */
  previewPath: string | null
  /** Saves the current values as a draft without toasts or navigation. */
  saveSilently: () => Promise<AutosaveResult>
  readOnly?: boolean
  children: React.ReactNode
  /** The pinned action bar; gets the live preview toggle to place in it. */
  footer: (previewToggle: React.ReactNode) => React.ReactNode
}) {
  const t = useTranslations("Editor")
  const [previewOpen, setPreviewOpen] = usePreviewPreference()
  const [version, setVersion] = useState(0)
  const [status, setStatus] = useState<AutosaveResult | "saving" | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const isDirty = form.formState.isDirty

  // Latest callbacks/flags for the subscription below without re-subscribing.
  const live = useRef({ saveSilently, enabled: false })
  useLayoutEffect(() => {
    live.current = { saveSilently, enabled: previewOpen && !readOnly && previewPath !== null }
  })

  // Auto-save while the preview is open: debounce edits, one save at a time.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let running = false
    let again = false

    const run = async () => {
      if (running) {
        again = true
        return
      }
      running = true
      setStatus("saving")
      const result = await live.current.saveSilently()
      running = false
      setStatus(result)
      if (result === "saved") setVersion((v) => v + 1)
      if (again) {
        again = false
        void run()
      }
    }

    const subscription = form.watch(() => {
      if (!live.current.enabled) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (form.formState.isDirty) void run()
      }, AUTOSAVE_DELAY_MS)
    })
    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [form])

  const statusText =
    previewPath === null
      ? t("previewAfterFirstSave")
      : status === "saving"
        ? t("autosaving")
        : status === "saved"
          ? t("autosaved")
          : status === "invalid"
            ? t("autosaveInvalid")
            : status === "error"
              ? t("autosaveError")
              : readOnly
                ? undefined
                : t("autosaveHint")

  return (
    <>
      <UnsavedChangesGuard when={isDirty} />
      <div className={previewOpen ? "xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)] xl:items-start xl:gap-4" : undefined}>
        <div ref={rootRef} className="flex min-w-0 flex-col gap-4">
          <SectionJumpBar rootRef={rootRef} />
          {children}
        </div>
        {previewOpen && (
          <aside className="sticky top-20 hidden h-[calc(100svh-7rem)] xl:block">
            {previewPath ? (
              <LivePreview path={previewPath} version={version} status={statusText} onClose={() => setPreviewOpen(false)} />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm">
                {statusText}
              </div>
            )}
          </aside>
        )}
      </div>
      {footer(
        // Side-by-side preview needs room: wide screens only.
        <Button
          type="button"
          variant={previewOpen ? "secondary" : "ghost"}
          className="hidden xl:inline-flex"
          aria-pressed={previewOpen}
          onClick={() => setPreviewOpen(!previewOpen)}
        >
          {previewOpen ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
          {previewOpen ? t("hidePreview") : t("showPreview")}
        </Button>,
      )}
    </>
  )
}
