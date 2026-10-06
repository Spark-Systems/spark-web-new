"use client"

import { useEffect } from "react"
import type { FieldPath, FieldValues, PathValue, UseFormReturn } from "react-hook-form"

import { slugify } from "@admin/lib/slug"

/**
 * While creating a record, fills the URL slug from the English name as it's
 * typed, until the slug is edited by hand. Editing an existing record never
 * touches the slug, since changing it would break the page's address.
 *
 * @example useSlugFromName(form, "nameEn", "slug", !isEdit)
 */
export function useSlugFromName<T extends FieldValues>(
  form: UseFormReturn<T>,
  nameField: FieldPath<T>,
  slugField: FieldPath<T>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    const subscription = form.watch((values, { name }) => {
      if (name !== nameField || form.getFieldState(slugField).isDirty) return
      const slug = slugify(String(values[nameField as keyof typeof values] ?? ""))
      form.setValue(slugField, slug as PathValue<T, FieldPath<T>>, { shouldValidate: form.formState.isSubmitted })
    })
    return () => subscription.unsubscribe()
  }, [form, nameField, slugField, enabled])
}
