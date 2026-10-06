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
import { FormTagInput } from "@/components/form/form-tag-input"
import { QueryError } from "@/components/query-error"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/lib/api/errors"
import { settingsApi, settingsQueries } from "@/lib/api/services/settings"
import type { MetaSettings } from "@/lib/api/types"

const NAME_MAX = 100
const DESCRIPTION_MAX = 300
const KEYWORDS_MAX = 20
const KEYWORD_LENGTH_MAX = 50

function useMetaSchema() {
  const t = useTranslations("Configuration.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    const keywords = z.array(z.string()).max(KEYWORDS_MAX, t("maxTags", { max: KEYWORDS_MAX }))
    return z.object({
      nameEn: name,
      nameAr: name,
      descriptionEn: z.string(),
      descriptionAr: z.string(),
      keywordsEn: keywords,
      keywordsAr: keywords,
    })
  }, [t])
}

type MetaFormValues = z.infer<ReturnType<typeof useMetaSchema>>

const toForm = (meta: MetaSettings): MetaFormValues => ({
  nameEn: meta.name_en,
  nameAr: meta.name_ar,
  descriptionEn: meta.meta_description_en,
  descriptionAr: meta.meta_description_ar,
  keywordsEn: meta.keywords_en,
  keywordsAr: meta.keywords_ar,
})

const toApi = (values: MetaFormValues): MetaSettings => ({
  name_en: values.nameEn,
  name_ar: values.nameAr,
  meta_description_en: values.descriptionEn,
  meta_description_ar: values.descriptionAr,
  keywords_en: values.keywordsEn,
  keywords_ar: values.keywordsAr,
})

const emptyForm: MetaFormValues = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  keywordsEn: [],
  keywordsAr: [],
}

export function MetaInformationForm() {
  const t = useTranslations("Configuration")
  const queryClient = useQueryClient()
  const schema = useMetaSchema()
  const { data, isPending, isError, refetch } = useQuery(settingsQueries.meta())

  const form = useForm<MetaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
    // Re-syncs the form whenever fresh data arrives from the server.
    values: data ? toForm(data) : undefined,
  })

  const save = useMutation({
    mutationFn: (values: MetaFormValues) => settingsApi.updateMeta(toApi(values)),
    onSuccess: (saved) => {
      queryClient.setQueryData(settingsQueries.meta().queryKey, saved)
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
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const { isDirty } = form.formState
  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("meta.namesTitle")} description={t("meta.namesDescription")}>
        <FormInput control={control} name="nameEn" label={t("meta.nameEn")} required dir="ltr" maxLength={NAME_MAX} />
        <FormInput control={control} name="nameAr" label={t("meta.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
      </FormSection>

      <FormSection title={t("meta.descriptionsTitle")} description={t("meta.descriptionsDescription")}>
        <FormRichText control={control} name="descriptionEn" label={t("meta.descriptionEn")} dir="ltr" maxLength={DESCRIPTION_MAX} />
        <FormRichText control={control} name="descriptionAr" label={t("meta.descriptionAr")} dir="rtl" maxLength={DESCRIPTION_MAX} />
      </FormSection>

      <FormSection title={t("meta.keywordsTitle")} description={t("meta.keywordsDescription")}>
        <FormTagInput
          control={control}
          name="keywordsEn"
          label={t("meta.keywordsEn")}
          dir="ltr"
          maxTags={KEYWORDS_MAX}
          maxTagLength={KEYWORD_LENGTH_MAX}
        />
        <FormTagInput
          control={control}
          name="keywordsAr"
          label={t("meta.keywordsAr")}
          dir="rtl"
          maxTags={KEYWORDS_MAX}
          maxTagLength={KEYWORD_LENGTH_MAX}
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
