"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormActionBar } from "@/components/form/form-action-bar"
import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormDropzone } from "@/components/form/form-dropzone"
import { FormInput } from "@/components/form/form-input"
import { FormNumberInput } from "@/components/form/form-number-input"
import { FormSection } from "@/components/form/form-section"
import type { DropzoneItem } from "@/components/inputs/file-dropzone"
import { Button } from "@/components/ui/button"
import { uploadsApi } from "@/lib/api/services/uploads"
import type { LogoItem, LogoItemInput } from "@/lib/api/types"
import { isValidLink } from "@/lib/links"
import { logoItemsConfigs, useLogoItemsT, type LogoItemsConfig, type LogoItemsKind } from "./config"

const NAME_MAX = 150
const LOGO_MAX_BYTES = 1024 * 1024
/** Order given to new entries. */
const DEFAULT_ORDER = -10

function useLogoItemSchema(config: LogoItemsConfig) {
  const t = useLogoItemsT(config)
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .max(NAME_MAX, t("validation.maxLength", { max: NAME_MAX }))
    return z.object({
      nameEn: name,
      nameAr: name,
      logo: z.array(z.custom<DropzoneItem>()).min(1, t("validation.logoRequired")).max(1),
      link: z
        .string()
        .trim()
        .refine((v): boolean => isValidLink(v), t("validation.invalidLink")),
      // Explicit boolean return: a type-guard predicate would narrow the output to
      // `number` and no longer match the form's `number | null` values.
      order: z
        .number({ error: t("validation.required") })
        .int(t("validation.integer"))
        .nullable()
        .refine((v): boolean => v !== null, t("validation.required")),
      hidden: z.boolean(),
    })
  }, [t])
}

type LogoItemFormValues = z.infer<ReturnType<typeof useLogoItemSchema>>

const toForm = (item?: LogoItem): LogoItemFormValues => ({
  nameEn: item?.name_en ?? "",
  nameAr: item?.name_ar ?? "",
  logo: item?.logo_url ? [{ id: `${item.id}-logo`, url: item.logo_url, name: item.name_en, type: "image/*" }] : [],
  link: item?.link ?? "",
  order: item?.order ?? DEFAULT_ORDER,
  hidden: item?.hidden ?? false,
})

/**
 * Create form when `item` is omitted, edit form when it's given. Shared by every
 * logo list; `kind` picks the API, path and wording (a plain string, so server
 * pages can pass it).
 */
export function LogoItemForm({ kind, item }: { kind: LogoItemsKind; item?: LogoItem }) {
  const config = logoItemsConfigs[kind]
  const t = useLogoItemsT(config)
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useLogoItemSchema(config)
  const isEdit = Boolean(item)
  const { api, queries } = config.api

  const form = useForm<LogoItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(item),
  })
  const { isDirty } = form.formState

  const save = useMutation({
    mutationFn: async (values: LogoItemFormValues) => {
      const logo = values.logo[0]
      const input: LogoItemInput = {
        name_en: values.nameEn,
        name_ar: values.nameAr,
        logo_url: logo.file ? (await uploadsApi.upload(logo.file, config.uploadFolder)).url : logo.url,
        link: values.link,
        order: values.order ?? DEFAULT_ORDER,
        hidden: values.hidden,
      }
      return item ? api.update(item.id, input) : api.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(config.path)
    },
    onError: () => toast.error(t("saveError")),
  })

  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("form.detailsTitle")} description={t("form.detailsDescription")}>
        <FormInput control={control} name="nameEn" label={t("form.nameEn")} required dir="ltr" maxLength={NAME_MAX} autoFocus />
        <FormInput control={control} name="nameAr" label={t("form.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
        <FormInput
          control={control}
          name="link"
          label={t("form.link")}
          description={t("form.linkHint")}
          type="url"
          dir="ltr"
          placeholder="https://"
          className="lg:col-span-2"
        />
      </FormSection>

      <FormSection title={t("form.logoTitle")} description={t("form.logoDescription")}>
        <FormDropzone
          control={control}
          name="logo"
          label={t("form.logo")}
          formats={["png"]}
          maxSize={LOGO_MAX_BYTES}
          required
          className="lg:col-span-2"
        />
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

      <FormActionBar status={isDirty && t("form.unsaved")}>
        <Button variant="ghost" nativeButton={false} render={<Link href={config.path} />}>
          {t("form.cancel")}
        </Button>
        <Button type="submit" disabled={save.isPending || (isEdit && !isDirty)}>
          {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {isEdit
            ? save.isPending ? t("form.saving") : t("form.save")
            : save.isPending ? t("form.creating") : t("form.create")}
        </Button>
      </FormActionBar>
    </form>
  )
}
