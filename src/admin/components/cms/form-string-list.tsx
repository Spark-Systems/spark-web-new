"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FieldValues } from "react-hook-form"

import { FormField, type FormFieldBaseProps } from "@admin/components/form/form-field"
import { Button } from "@admin/components/ui/button"
import { Input } from "@admin/components/ui/input"
import { Textarea } from "@admin/components/ui/textarea"

const swap = (list: string[], a: number, b: number) => {
  const next = [...list]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

/**
 * An ordered list of short texts (headline lines, paragraphs), one input per
 * entry, bound to react-hook-form (the value is a string[]).
 *
 * @example <FormStringList control={control} name="hero.titleLines" label="Headline lines" addLabel="Add line" max={6} />
 */
export function FormStringList<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  addLabel,
  multiline = false,
  min = 0,
  max,
  maxLength,
}: FormFieldBaseProps<T> & {
  addLabel: string
  /** Paragraph-sized entries (textareas). */
  multiline?: boolean
  min?: number
  max?: number
  maxLength?: number
}) {
  const t = useTranslations("Repeater")

  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }, fieldState) => {
        const list: string[] = field.value ?? []
        // Errors on single entries arrive as an array alongside the list.
        const entryErrors = (Array.isArray(fieldState.error) ? fieldState.error : []) as ({ message?: string } | undefined)[]
        const set = (next: string[]) => field.onChange(next)
        return (
          <div className="flex flex-col gap-2">
            {list.map((entry, index) => {
              const props = {
                id: index === 0 ? id : undefined,
                value: entry,
                maxLength,
                onBlur: field.onBlur,
                "aria-invalid": invalid || undefined,
                "aria-describedby": describedBy,
                "aria-label": `${label} ${index + 1}`,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  set(list.map((v, i) => (i === index ? event.target.value : v))),
              }
              return (
                <div key={index} className="flex items-start gap-1">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {multiline ? <Textarea rows={3} {...props} /> : <Input {...props} />}
                    {entryErrors[index]?.message && <p className="text-destructive text-sm">{entryErrors[index]?.message}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" className="mt-1" aria-label={t("moveUp")} disabled={index === 0} onClick={() => set(swap(list, index, index - 1))}>
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-1"
                    aria-label={t("moveDown")}
                    disabled={index === list.length - 1}
                    onClick={() => set(swap(list, index, index + 1))}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="hover:text-destructive mt-1"
                    aria-label={t("remove")}
                    disabled={list.length <= min}
                    onClick={() => set(list.filter((_, i) => i !== index))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              disabled={max !== undefined && list.length >= max}
              onClick={() => set([...list, ""])}
            >
              <Plus data-icon="inline-start" />
              {addLabel}
            </Button>
          </div>
        )
      }}
    />
  )
}
