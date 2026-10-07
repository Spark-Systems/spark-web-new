"use client"

import { ExternalLink, Monitor, RotateCw, Smartphone, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { Button } from "@admin/components/ui/button"
import { refreshSession } from "@admin/lib/api/client"
import { tokenStorage } from "@admin/lib/auth/token-storage"
import { cn } from "@admin/lib/utils"
import { openPreview, previewUrl } from "./publish-actions"

const WIDTHS = { desktop: 1440, mobile: 390 } as const
type Device = keyof typeof WIDTHS

/**
 * The website page in preview mode (saved drafts), scaled to fit beside the
 * editor. Reloads when `version` changes (after each draft save), keeping its
 * scroll position.
 */
export function LivePreview({
  path,
  version,
  status,
  onClose,
}: {
  path: string
  /** Bump to reload the page. */
  version: number
  /** Short line under the toolbar, e.g. "Draft saved". */
  status?: React.ReactNode
  onClose: () => void
}) {
  const t = useTranslations("Editor")
  const [device, setDevice] = useState<Device>("desktop")
  const [src, setSrc] = useState<string | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const scrollY = useRef(0)
  const [box, setBox] = useState({ width: 0, height: 0 })

  // The preview route checks the access token cookie: renew it first if it expired.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!tokenStorage.getAccessToken()) await refreshSession()
      if (!cancelled) setSrc(previewUrl(path))
    })()
    return () => {
      cancelled = true
    }
  }, [path])

  // Reload on each saved draft, remembering where the page was scrolled to.
  useEffect(() => {
    const win = frameRef.current?.contentWindow
    if (!win || version === 0) return
    // Same origin, so the frame can be reloaded in place.
    scrollY.current = win.scrollY
    win.location.reload()
  }, [version])

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) =>
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height }),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const width = WIDTHS[device]
  const scale = box.width ? Math.min(1, box.width / width) : 1

  return (
    <div className="bg-card flex h-full flex-col overflow-hidden rounded-xl border">
      <div className="flex items-center gap-1 border-b px-2 py-1.5">
        <span className="me-auto ps-1 text-sm font-medium">{t("livePreview")}</span>
        {(["desktop", "mobile"] as const).map((d) => (
          <Button
            key={d}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t(d)}
            aria-pressed={device === d}
            className={cn(device === d && "bg-accent text-accent-foreground")}
            onClick={() => setDevice(d)}
          >
            {d === "desktop" ? <Monitor /> : <Smartphone />}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("reload")}
          onClick={() => {
            try {
              scrollY.current = frameRef.current?.contentWindow?.scrollY ?? 0
              frameRef.current?.contentWindow?.location.reload()
            } catch {
              /* cross-origin: ignore */
            }
          }}
        >
          <RotateCw />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("openTab")} onClick={() => void openPreview(path)}>
          <ExternalLink />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("closePreview")} onClick={onClose}>
          <X />
        </Button>
      </div>
      {status && <div className="text-muted-foreground border-b px-3 py-1 text-xs">{status}</div>}
      <div ref={boxRef} className="bg-muted relative flex-1 overflow-hidden" dir="ltr">
        {src && (
          <iframe
            ref={frameRef}
            src={src}
            title={t("livePreview")}
            onLoad={() => {
              try {
                frameRef.current?.contentWindow?.scrollTo(0, scrollY.current)
              } catch {
                /* ignore */
              }
            }}
            className="absolute top-0 border-0 bg-white"
            style={{
              width,
              height: box.height / scale,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              left: Math.max(0, (box.width - width * scale) / 2),
            }}
          />
        )}
      </div>
    </div>
  )
}
