"use client"

import type { FieldValues } from "react-hook-form"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@admin/components/ui/select"
import { siteIcons, type SiteIcon } from "@admin/lib/api/types"
import { Icon } from "@/components/ui/icon"
import { FormField, type FormFieldBaseProps } from "./form-field"

/** "chart-line-up" → "Chart line up". Icon keys are code names, so they read the same in both languages. */
const iconLabel = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, " ")

const items = siteIcons.map((value) => ({ value, label: iconLabel(value) }))

/**
 * Picks one of the website's icons (its <Icon> set) by key, with a live
 * preview beside the menu and each option. The field value is the icon key.
 *
 * @example <FormIconSelect control={form.control} name="icon" label="Icon" required />
 */
export function FormIconSelect<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  placeholder,
}: FormFieldBaseProps<T> & { placeholder?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      render={(field, { id, describedBy, invalid }) => (
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg"
          >
            {field.value ? <Icon name={field.value as SiteIcon} size={18} /> : null}
          </span>
          <Select
            items={items}
            value={field.value || null}
            onValueChange={(value) => field.onChange(value ?? "")}
            name={field.name}
          >
            <SelectTrigger
              id={id}
              className="w-full"
              onBlur={field.onBlur}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  <Icon name={item.value} size={16} className="text-muted-foreground" />
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  )
}
