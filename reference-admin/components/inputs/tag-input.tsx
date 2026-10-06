"use client"

import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"

// Enter or a comma (Latin "," or Arabic "،") commits the current text as a tag.
const SEPARATORS = /[,،\n]/

export interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  onBlur?: () => void
  id?: string
  name?: string
  placeholder?: string
  /** Stop accepting tags once this many exist. */
  maxTags?: number
  /** Longest single tag; longer text is cut. */
  maxTagLength?: number
  /** Text direction of the tags themselves, independent of the page's. */
  dir?: "ltr" | "rtl" | "auto"
  /** Return an error message to reject a tag (it stays in the box to fix), or null to accept. */
  validate?: (tag: string) => string | null
  disabled?: boolean
  invalid?: boolean
  className?: string
  "aria-describedby"?: string
}

/**
 * Free-form tag input: type and press Enter or comma, paste a comma-separated
 * list, Backspace on an empty input removes the last tag. Duplicates are
 * ignored case-insensitively.
 */
export function TagInput({
  value,
  onChange,
  onBlur,
  id,
  name,
  placeholder,
  maxTags,
  maxTagLength,
  dir,
  validate,
  disabled,
  invalid,
  className,
  "aria-describedby": describedBy,
}: TagInputProps) {
  const t = useTranslations("Inputs")
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState("")
  const [rejection, setRejection] = useState<string | null>(null)
  const atLimit = maxTags !== undefined && value.length >= maxTags

  /** Adds the valid entries; returns the ones that failed validation. */
  const addTags = (raw: string[]) => {
    const next = [...value]
    const rejected: string[] = []
    let message: string | null = null
    for (const text of raw) {
      const tag = text.trim().slice(0, maxTagLength)
      if (!tag) continue
      if (maxTags !== undefined && next.length >= maxTags) break
      if (next.some((existing) => existing.toLocaleLowerCase() === tag.toLocaleLowerCase())) continue
      const error = validate?.(tag) ?? null
      if (error) {
        rejected.push(tag)
        message ??= error
        continue
      }
      next.push(tag)
    }
    setRejection(message)
    if (next.length !== value.length) onChange(next)
    return rejected
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
    inputRef.current?.focus()
  }

  const commitDraft = () => {
    if (!draft.trim()) return
    // An invalid entry stays in the box so it can be corrected.
    setDraft(addTags([draft]).join(", "))
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        dir={dir}
        onClick={() => inputRef.current?.focus()}
        data-invalid={invalid || rejection ? true : undefined}
        className={cn(
          // Mirrors the shadcn Input look, including focus and invalid rings.
          "border-input dark:bg-input/30 flex min-h-8 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2 py-1 text-sm transition-colors",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3",
          "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 data-invalid:ring-3",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
          className
        )}
      >
        {value.map((tag, index) => (
          <span
            key={tag}
            className="bg-accent text-accent-foreground inline-flex max-w-full items-center gap-1 rounded-md py-0.5 ps-2 pe-1 text-xs font-medium"
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation()
                removeTag(index)
              }}
              aria-label={t("removeTag", { tag })}
              className="hover:bg-primary/15 rounded-sm p-0.5 transition-colors"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          name={name}
          value={draft}
          disabled={disabled || atLimit}
          placeholder={atLimit ? undefined : value.length === 0 ? (placeholder ?? t("tagPlaceholder")) : undefined}
          aria-invalid={invalid || rejection ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            const text = event.target.value
            if (SEPARATORS.test(text)) {
              const parts = text.split(SEPARATORS)
              const rejected = addTags(parts.slice(0, -1))
              setDraft([...rejected, parts.at(-1) ?? ""].filter(Boolean).join(", "))
            } else {
              setDraft(text)
              setRejection(null)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault() // never submit the surrounding form
              commitDraft()
            } else if (event.key === "Backspace" && !draft && value.length > 0) {
              removeTag(value.length - 1)
            }
          }}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text")
            if (!SEPARATORS.test(text)) return
            event.preventDefault()
            setDraft(addTags(text.split(SEPARATORS)).join(", "))
          }}
          onBlur={() => {
            commitDraft()
            onBlur?.()
          }}
          className="placeholder:text-muted-foreground h-6 min-w-24 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        />
      </div>
      {rejection && (
        <p role="alert" className="text-destructive text-xs">
          {rejection}
        </p>
      )}
    </div>
  )
}
