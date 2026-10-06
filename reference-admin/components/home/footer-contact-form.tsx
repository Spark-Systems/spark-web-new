"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormInput } from "@/components/form/form-input"
import { FormRichText } from "@/components/form/form-rich-text"
import { FormSaveBar } from "@/components/form/form-save-bar"
import { FormSection } from "@/components/form/form-section"
import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { homeApi, homeQueries } from "@/lib/api/services/home"
import type { FooterContact } from "@/lib/api/types"

const NAME_MAX = 150

function useFooterSchema() {
  const t = useTranslations("FooterContact.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    // The editor reports an empty document as "", so whitespace-only HTML is the only other empty case.
    const content = z.string().refine((v): boolean => v.trim() !== "", t("required"))
    return z.object({ nameEn: name, nameAr: name, contentEn: content, contentAr: content })
  }, [t])
}

type FooterFormValues = z.infer<ReturnType<typeof useFooterSchema>>

const toForm = (footer: FooterContact): FooterFormValues => ({
  nameEn: footer.name_en,
  nameAr: footer.name_ar,
  contentEn: footer.content_en,
  contentAr: footer.content_ar,
})

const toApi = (values: FooterFormValues): FooterContact => ({
  name_en: values.nameEn,
  name_ar: values.nameAr,
  content_en: values.contentEn,
  content_ar: values.contentAr,
})

const emptyForm: FooterFormValues = { nameEn: "", nameAr: "", contentEn: "", contentAr: "" }

/** The footer's contact block: one record, edited in place. */
export function FooterContactForm() {
  const t = useTranslations("FooterContact")
  const queryClient = useQueryClient()
  const schema = useFooterSchema()
  const { data, isPending, isError, refetch } = useQuery(homeQueries.footer())

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
    // Re-syncs the form whenever fresh data arrives from the server.
    values: data ? toForm(data) : undefined,
  })

  const save = useMutation({
    mutationFn: (values: FooterFormValues) => homeApi.updateFooter(toApi(values)),
    onSuccess: (saved) => {
      queryClient.setQueryData(homeQueries.footer().queryKey, saved)
      form.reset(toForm(saved))
      toast.success(t("saved"))
    },
    onError: (error) => {
      toast.error(isApiError(error) && error.status === 422 ? error.message : t("saveError"))
    },
  })

  if (isError) return <QueryError message={t("loadError")} onRetry={() => refetch()} />
  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  const { isDirty } = form.formState
  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("form.titleSection")} description={t("form.titleDescription")}>
        <FormInput control={control} name="nameEn" label={t("form.nameEn")} required dir="ltr" maxLength={NAME_MAX} />
        <FormInput control={control} name="nameAr" label={t("form.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
      </FormSection>

      <FormSection title={t("form.contentTitle")} description={t("form.contentDescription")}>
        <FormRichText
          control={control}
          name="contentEn"
          label={t("form.contentEn")}
          required
          dir="ltr"
          sourceEditing
          colors
          headings
          className="lg:col-span-2"
        />
        <FormRichText
          control={control}
          name="contentAr"
          label={t("form.contentAr")}
          required
          dir="rtl"
          sourceEditing
          colors
          headings
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSaveBar
        isDirty={isDirty}
        isSaving={save.isPending}
        onDiscard={() => form.reset(data ? toForm(data) : emptyForm)}
      />
    </form>
  )
}
