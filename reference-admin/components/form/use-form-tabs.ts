"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import type { FieldErrors, FieldValues } from "react-hook-form"

/**
 * Tab state for a form split across tabs: keeps `?tab=` in the URL, knows the
 * next tab (for "Save & Continue"), counts errors per tab and jumps to the first
 * tab with an error when a submit fails.
 *
 * @example
 * const tabs = useFormTabs(["info", "gallery", "meta"], { nameEn: "info", gallery: "gallery", … }, form.formState.errors)
 * <SegmentedTabs value={tabs.tab} onValueChange={tabs.changeTab} … />
 * form.handleSubmit(onValid, tabs.showFirstError)
 */
export function useFormTabs<V extends string, T extends FieldValues>(
  tabValues: readonly V[],
  fieldTab: Record<keyof T, V>,
  errors: FieldErrors<T>
) {
  const searchParams = useSearchParams()
  const param = searchParams.get("tab") as V | null
  const [tab, setTab] = useState<V>(param && tabValues.includes(param) ? param : tabValues[0])

  const changeTab = (next: V) => {
    setTab(next)
    // Keep ?tab= in step so a tab can be linked to and survives a reload.
    const params = new URLSearchParams(window.location.search)
    params.set("tab", next)
    window.history.replaceState(null, "", `?${params}`)
  }

  const tabsOf = (fieldErrors: FieldErrors<T>) =>
    tabValues.filter((value) => Object.keys(fieldErrors).some((field) => fieldTab[field as keyof T] === value))

  const errorCount = (value: V) => Object.keys(errors).filter((field) => fieldTab[field as keyof T] === value).length

  return {
    tab,
    changeTab,
    /** The tab after the current one, or undefined on the last tab. */
    nextTab: tabValues[tabValues.indexOf(tab) + 1] as V | undefined,
    /** Error count for a tab's badge, or undefined when it has none. */
    badge: (value: V) => errorCount(value) || undefined,
    /** For handleSubmit's invalid callback: show a tab with an error if the current one has none. */
    showFirstError: (fieldErrors: FieldErrors<T>) => {
      const withErrors = tabsOf(fieldErrors)
      if (withErrors.length > 0 && !withErrors.includes(tab)) changeTab(withErrors[0])
    },
  }
}
