"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@admin/components/ui/alert-dialog"

/**
 * Warns before leaving a form with unsaved changes: the browser's own prompt
 * when closing or reloading the tab, and a dialog when following a link inside
 * the admin (sidebar, breadcrumb, buttons rendered as links).
 *
 * @example <UnsavedChangesGuard when={form.formState.isDirty} />
 */
export function UnsavedChangesGuard({ when }: { when: boolean }) {
  const t = useTranslations("UnsavedChanges")
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const active = useRef(when)
  useLayoutEffect(() => {
    active.current = when
  }, [when])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!active.current) return
      event.preventDefault()
      event.returnValue = ""
    }
    // Capture phase, so it runs before Next's <Link> handler navigates.
    const onClick = (event: MouseEvent) => {
      if (!active.current || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      event.preventDefault()
      event.stopPropagation()
      setPendingHref(url.pathname + url.search + url.hash)
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [])

  return (
    <AlertDialog open={pendingHref !== null} onOpenChange={(open) => !open && setPendingHref(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("stay")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              const href = pendingHref
              active.current = false
              setPendingHref(null)
              if (href) router.push(href)
            }}
          >
            {t("leave")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
