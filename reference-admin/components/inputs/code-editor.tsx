"use client"

import { html } from "@codemirror/lang-html"
import { Prec } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { useMemo } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// CodeMirror is client-only and fairly large; load it when an editor first renders.
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full rounded-none" />,
})

export interface CodeEditorProps {
  value: string
  onChange: (code: string) => void
  onBlur?: () => void
  id?: string
  placeholder?: string
  /** Visible height before it scrolls, e.g. "10rem". */
  minHeight?: string
  maxHeight?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  "aria-describedby"?: string
  "aria-labelledby"?: string
}

// Colors come from the app's tokens, so the editor matches light and dark mode.
// Font and line height sit on the scroller, which holds both the gutter and the
// code, so line numbers always line up with their lines.
const sparkTheme = EditorView.theme({
  "&": { backgroundColor: "transparent", fontSize: "13px" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--font-geist-mono), ui-monospace, monospace", lineHeight: "1.6" },
  ".cm-content": { padding: "8px 0" },
  ".cm-gutters": {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
    borderInlineEnd: "1px solid var(--border)",
  },
  ".cm-activeLineGutter": { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklab, var(--muted) 60%, transparent)" },
  ".cm-placeholder": { color: "var(--muted-foreground)" },
})

/**
 * Code editor (CodeMirror 6) with HTML highlighting, which also covers inline
 * <script> and <style>. Meant for snippets such as analytics tags and SEO scripts.
 */
export function CodeEditor({
  value,
  onChange,
  onBlur,
  id,
  placeholder,
  minHeight = "10rem",
  maxHeight = "24rem",
  disabled,
  invalid,
  className,
  "aria-describedby": describedBy,
  "aria-labelledby": labelledBy,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme()

  const extensions = useMemo(
    () => [
      html(),
      // Highest precedence so it wins over the built-in light/dark theme.
      Prec.highest(sparkTheme),
      EditorView.lineWrapping,
      // Forward the field's label/description to the editable element.
      EditorView.contentAttributes.of({
        ...(id && { id }),
        ...(labelledBy && { "aria-labelledby": labelledBy }),
        ...(describedBy && { "aria-describedby": describedBy }),
        ...(invalid && { "aria-invalid": "true" }),
      }),
    ],
    [id, labelledBy, describedBy, invalid]
  )

  return (
    <div
      // Code is always left-to-right, whatever the page language.
      dir="ltr"
      data-invalid={invalid || undefined}
      className={cn(
        "border-input dark:bg-input/30 overflow-hidden rounded-lg border bg-transparent text-start transition-colors",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3",
        "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40 data-invalid:ring-3",
        disabled && "opacity-50",
        className
      )}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        editable={!disabled}
        placeholder={placeholder}
        minHeight={minHeight}
        maxHeight={maxHeight}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        extensions={extensions}
        basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: true }}
      />
    </div>
  )
}
