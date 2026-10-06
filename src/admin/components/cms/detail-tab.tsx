"use client"

/* eslint-disable @typescript-eslint/no-explicit-any -- binds to any list item form with has_detail / detail */

import { FileText } from "lucide-react"
import { useEffect } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { Card, CardContent } from "@admin/components/ui/card"

/**
 * The "Detail page" tab of a list item that can have its own page: a switch
 * (`has_detail`) and, while it's on, the page's fields. Turning it on the
 * first time fills the page from `template`. Turning it off keeps the content,
 * so turning it back on restores it.
 */
export function DetailTab({
  form,
  label,
  description,
  emptyMessage,
  template,
  children,
}: {
  form: UseFormReturn<any>
  label: string
  description: string
  /** Shown while the page is off. */
  emptyMessage: string
  /** A blank page, given the item's name. */
  template: (name: string) => unknown
  children: React.ReactNode
}) {
  const hasDetail = useWatch({ control: form.control, name: "has_detail" }) as boolean
  const detail = useWatch({ control: form.control, name: "detail" })

  useEffect(() => {
    if (hasDetail && !detail) {
      form.setValue("detail", template(String(form.getValues("name") ?? "")), { shouldDirty: true })
    }
  }, [hasDetail, detail, form, template])

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <FormCheckbox control={form.control} name="has_detail" label={label} description={description} />
        </CardContent>
      </Card>
      {hasDetail && detail ? (
        children
      ) : (
        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center text-sm">
          <FileText className="size-6" />
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
