"use client"

import { useState } from "react"
import { useFormState, type Control, type FieldValues, type UseFormReturn } from "react-hook-form"

import { SegmentedTabs } from "@admin/components/segmented-tabs"
import { isApiError } from "@admin/lib/api/errors"

/** One tab of a long editor: its fields, and the top-level form keys they cover (for error badges). */
export interface EditorTab {
  value: string
  label: string
  /** Top-level value keys edited on this tab, e.g. ["detail"] or ["hero"]. */
  keys: string[]
  content: React.ReactNode
}

/**
 * Splits an editor into tabs, each with a badge counting its fields in error;
 * on a failed save, call `showFirstError` to jump to a tab with errors.
 * One tab renders its content without a tab bar.
 */
export function useEditorTabs<T extends FieldValues>(control: Control<T>, tabs: EditorTab[]) {
  const [tab, setTab] = useState(tabs[0]?.value)
  const { errors } = useFormState({ control })
  const errorKeys = Object.keys(errors)
  const count = (t: EditorTab) => errorKeys.filter((key) => t.keys.includes(key)).length

  const view =
    tabs.length === 1 ? (
      tabs[0].content
    ) : (
      <SegmentedTabs
        tabs={tabs.map((t) => ({ value: t.value, label: t.label, badge: count(t) || undefined, content: t.content }))}
        value={tab}
        onValueChange={setTab}
        listClassName="max-w-full overflow-x-auto"
        contentClassName="mt-4"
      />
    )

  return {
    view,
    showFirstError: (failed: Record<string, unknown>) => {
      const keys = Object.keys(failed)
      const first = tabs.find((t) => t.keys.some((key) => keys.includes(key)))
      if (first && !tabs.find((t) => t.value === tab)?.keys.some((key) => keys.includes(key))) setTab(first.value)
    },
  }
}

interface ApiIssue {
  path: string
  message: string
}

/**
 * Puts the API's validation errors on the matching fields. Returns true when
 * the error was about specific fields (so the caller needn't show a toast).
 * `stripPrefix` drops a wrapper from the paths, e.g. "content." for pages.
 */
export function applyApiErrors<T extends FieldValues>(form: UseFormReturn<T>, error: unknown, stripPrefix = ""): boolean {
  if (!isApiError(error)) return false
  const data = (error.data ?? {}) as { field?: string; issues?: ApiIssue[] }
  const fields: ApiIssue[] = data.issues ?? (data.field ? [{ path: data.field, message: error.message }] : [])
  if (fields.length === 0) return false
  fields.forEach(({ path, message }, i) =>
    form.setError((path.startsWith(stripPrefix) ? path.slice(stripPrefix.length) : path) as never, { message }, { shouldFocus: i === 0 }),
  )
  return true
}
