"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormInput } from "@/components/form/form-input"
import { FormNumberInput } from "@/components/form/form-number-input"
import { FormSection } from "@/components/form/form-section"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/lib/api/errors"
import { countriesApi, countriesQueries } from "@/lib/api/services/countries"
import type { Country, CountryInput } from "@/lib/api/types"

export const COUNTRIES_PATH = "/settings/countries"
const NAME_MAX = 100
/** Order given to new countries. */
const DEFAULT_ORDER = -10

function useCountrySchema() {
  const t = useTranslations("Countries.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    return z.object({
      nameEn: name,
      nameAr: name,
      // Explicit boolean return: a type-guard predicate would narrow the output to
      // `number` and no longer match the form's `number | null` values.
      order: z
        .number({ error: t("required") })
        .int(t("integer"))
        .nullable()
        .refine((v): boolean => v !== null, t("required")),
      hidden: z.boolean(),
    })
  }, [t])
}

type CountryFormValues = z.infer<ReturnType<typeof useCountrySchema>>

const toForm = (country?: Country): CountryFormValues => ({
  nameEn: country?.name_en ?? "",
  nameAr: country?.name_ar ?? "",
  order: country?.order ?? DEFAULT_ORDER,
  hidden: country?.hidden ?? false,
})

const toApi = (values: CountryFormValues): CountryInput => ({
  name_en: values.nameEn,
  name_ar: values.nameAr,
  order: values.order ?? DEFAULT_ORDER,
  hidden: values.hidden,
})

/** Create form when `country` is omitted, edit form when it's given. */
export function CountryForm({ country }: { country?: Country }) {
  const t = useTranslations("Countries")
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useCountrySchema()
  const isEdit = Boolean(country)

  const form = useForm<CountryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(country),
  })

  const save = useMutation({
    mutationFn: (values: CountryFormValues) =>
      country ? countriesApi.update(country.id, toApi(values)) : countriesApi.create(toApi(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countriesQueries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(COUNTRIES_PATH)
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409) {
        // Point at the fields rather than a generic toast.
        form.setError("nameEn", { message: t("duplicate") })
        form.setError("nameAr", { message: t("duplicate") })
        return
      }
      toast.error(t("saveError"))
    },
  })

  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("form.detailsTitle")} description={t("form.detailsDescription")}>
        <FormInput control={control} name="nameEn" label={t("form.nameEn")} required dir="ltr" maxLength={NAME_MAX} autoFocus />
        <FormInput control={control} name="nameAr" label={t("form.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
      </FormSection>

      <FormSection title={t("form.displayTitle")} description={t("form.displayDescription")}>
        {/* Order stays narrow; the checkbox sits right beside it, lined up with its input. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8 lg:col-span-2">
          <FormNumberInput
            control={control}
            name="order"
            label={t("form.order")}
            description={t("form.orderHint")}
            required
            min={-9999}
            max={9999}
            className="w-full sm:max-w-[200px]"
          />
          <FormCheckbox
            control={control}
            name="hidden"
            label={t("form.hidden")}
            description={t("form.hiddenHint")}
            className="sm:pt-8.5"
          />
        </div>
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" nativeButton={false} render={<Link href={COUNTRIES_PATH} />}>
          {t("form.cancel")}
        </Button>
        <Button type="submit" disabled={save.isPending || (isEdit && !form.formState.isDirty)}>
          {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {isEdit
            ? save.isPending ? t("form.saving") : t("form.save")
            : save.isPending ? t("form.creating") : t("form.create")}
        </Button>
      </div>
    </form>
  )
}
