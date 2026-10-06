"use client"

import { useTranslations } from "next-intl"
import type { FieldValues } from "react-hook-form"

import { TagInput, type TagInputProps } from "@/components/inputs/tag-input"
import { FormField, type FormFieldBaseProps } from "./form-field"

/**
 * Tag input bound to react-hook-form (the field value is a string[]).
 * Without a description it shows how to add tags, plus the count when capped.
 *
 * @example <FormTagInput control={form.control} name="keywordsAr" label="Arabic keywords" dir="rtl" maxTags={20} />
 */
export function FormTagInput<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  ...tagProps
}: FormFieldBaseProps<T> &
  Omit<TagInputProps, "value" | "onChange" | "onBlur" | "id" | "name" | "invalid" | "aria-describedby">) {
  const t = useTranslations("Inputs")

  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description ?? t("tagHint")}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => {
        const tags: string[] = field.value ?? []
        return (
          <div className="flex flex-col gap-1">
            <TagInput
              {...tagProps}
              id={id}
              name={field.name}
              value={tags}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={invalid}
              aria-describedby={describedBy}
            />
            {tagProps.maxTags !== undefined && (
              <span className="text-muted-foreground text-end text-xs tabular-nums">
                {t("tagLimit", { count: tags.length, max: tagProps.maxTags })}
              </span>
            )}
          </div>
        )
      }}
    />
  )
}
