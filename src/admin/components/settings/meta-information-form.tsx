"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormInput } from "@admin/components/form/form-input"
import { FormSaveBar } from "@admin/components/form/form-save-bar"
import { FormSection } from "@admin/components/form/form-section"
import { FormTagInput } from "@admin/components/form/form-tag-input"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { QueryError } from "@admin/components/query-error"
import { Skeleton } from "@admin/components/ui/skeleton"
import { isApiError } from "@admin/lib/api/errors"
import { settingsApi, settingsQueries } from "@admin/lib/api/services/settings"
import type { MetaSettings } from "@admin/lib/api/types"

const NAME_MAX = 80
const DESCRIPTION_MAX = 320
const KEYWORDS_MAX = 20
const KEYWORD_LENGTH_MAX = 40

function useMetaSchema() {
  const t = useTranslations("Configuration.validation")
  return useMemo(
    () =>
      z.object({
        site_name: z
          .string()
          .trim()
          .min(1, t("required"))
          .max(NAME_MAX, t("maxLength", { max: NAME_MAX })),
        description: z
          .string()
          .trim()
          .min(1, t("required"))
          .max(DESCRIPTION_MAX, t("maxLength", { max: DESCRIPTION_MAX })),
        keywords: z.array(z.string()).max(KEYWORDS_MAX, t("maxTags", { max: KEYWORDS_MAX })),
      }),
    [t]
  )
}

const emptyForm: MetaSettings = { site_name: "", description: "", keywords: [] }

export function MetaInformationForm() {
  const t = useTranslations("Configuration")
  const queryClient = useQueryClient()
  const schema = useMetaSchema()
  const { data, isPending, isError, refetch } = useQuery(settingsQueries.meta())

  const form = useForm<MetaSettings>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
    // Re-syncs the form whenever fresh data arrives from the server.
    values: data,
  })

  const save = useMutation({
    mutationFn: (values: MetaSettings) => settingsApi.updateMeta(values),
    onSuccess: (saved) => {
      queryClient.setQueryData(settingsQueries.meta().queryKey, saved)
      form.reset(saved)
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
      <FormSection title={t("meta.siteTitle")} description={t("meta.siteDescription")}>
        <FormInput control={control} name="site_name" label={t("meta.name")} description={t("meta.nameHint")} required maxLength={NAME_MAX} />
        <FormTextarea
          control={control}
          name="description"
          label={t("meta.description")}
          description={t("meta.descriptionHint")}
          required
          rows={3}
          maxLength={DESCRIPTION_MAX}
          className="lg:col-span-2"
        />
        <FormTagInput
          control={control}
          name="keywords"
          label={t("meta.keywords")}
          maxTags={KEYWORDS_MAX}
          maxTagLength={KEYWORD_LENGTH_MAX}
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSaveBar
        isDirty={isDirty}
        isSaving={save.isPending}
        onDiscard={() => form.reset(data ?? emptyForm)}
      />
    </form>
  )
}
