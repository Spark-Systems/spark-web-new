"use client"

import { useTranslations } from "next-intl"
import type { FieldValues } from "react-hook-form"

import { linkTargets } from "@/lib/links"
import type { FormFieldBaseProps } from "./form-field"
import { FormSelect } from "./form-select"

/**
 * "Open link in" select: same tab ("_self") or a new tab ("_blank").
 *
 * @example <FormLinkTarget control={form.control} name="linkTarget" />
 */
export function FormLinkTarget<T extends FieldValues>({
  label,
  ...props
}: Omit<FormFieldBaseProps<T>, "label"> & { label?: string; disabled?: boolean }) {
  const t = useTranslations("Inputs.linkTarget")
  return (
    <FormSelect
      {...props}
      label={label ?? t("label")}
      options={linkTargets.map((value) => ({ value, label: t(value === "_blank" ? "newTab" : "sameTab") }))}
    />
  )
}
