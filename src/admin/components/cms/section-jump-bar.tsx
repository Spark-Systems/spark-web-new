"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState, type RefObject } from "react"

import { cn } from "@admin/lib/utils"

interface Section {
  el: HTMLElement
  title: string
  invalid: boolean
}

/** Visible sections (inactive tabs stay mounted but hidden) inside `root`. */
function scan(root: HTMLElement): Section[] {
  return [...root.querySelectorAll<HTMLElement>("[data-form-section]")]
    .filter((el) => el.getClientRects().length > 0)
    .map((el) => ({
      el,
      title: el.dataset.sectionTitle ?? "",
      invalid: el.querySelector('[data-invalid="true"]') !== null,
    }))
}

/**
 * Sticky row of chips naming the form sections on screen; click one to jump to
 * it. The section in view is highlighted and sections with errors get a red
 * dot. Hidden when there are fewer than three sections.
 */
export function SectionJumpBar({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  const t = useTranslations("Editor")
  const [sections, setSections] = useState<Section[]>([])
  const [active, setActive] = useState(0)

  // Re-scan when tabs switch, fields are added/removed or errors change.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setSections(scan(root)))
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-invalid", "hidden", "data-hidden", "class"] })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [rootRef])

  // Highlight the section nearest the top of the viewport.
  useEffect(() => {
    if (sections.length < 3) return
    const onScroll = () => {
      const offset = 160
      let current = 0
      sections.forEach((s, i) => {
        if (s.el.getBoundingClientRect().top - offset <= 0) current = i
      })
      setActive(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [sections])

  if (sections.length < 3) return null

  return (
    <nav
      aria-label={t("jumpTo")}
      className="bg-background/90 sticky top-16 z-20 -mx-4 flex gap-1.5 overflow-x-auto border-b px-4 py-2 backdrop-blur md:-mx-6 md:px-6"
    >
      {sections.map((section, i) => (
        <button
          key={`${section.title}-${i}`}
          type="button"
          onClick={() => section.el.scrollIntoView({ behavior: "smooth", block: "start" })}
          aria-current={i === active ? "true" : undefined}
          className={cn(
            "text-muted-foreground hover:text-foreground hover:bg-muted inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors",
            i === active && "bg-accent text-accent-foreground border-transparent",
          )}
        >
          {section.invalid && <span className="bg-destructive size-1.5 rounded-full" aria-label={t("hasErrors")} />}
          {section.title}
        </button>
      ))}
    </nav>
  )
}
