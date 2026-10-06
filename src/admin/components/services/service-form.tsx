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

import { FormActionBar } from "@admin/components/form/form-action-bar"
import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormDropzone } from "@admin/components/form/form-dropzone"
import { FormIconSelect } from "@admin/components/form/form-icon-select"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTagInput } from "@admin/components/form/form-tag-input"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { useSlugFromName } from "@admin/components/form/use-slug-from-name"
import type { DropzoneItem } from "@admin/components/inputs/file-dropzone"
import { Button } from "@admin/components/ui/button"
import { isApiError } from "@admin/lib/api/errors"
import { siteServicesResource } from "@admin/lib/api/services/site-content"
import { uploadsApi } from "@admin/lib/api/services/uploads"
import { siteIcons, type SiteIcon, type SiteService, type SiteServiceInput } from "@admin/lib/api/types"
import { ADMIN_BASE } from "@admin/lib/auth/constants"
import { SLUG_MAX, SLUG_PATTERN } from "@admin/lib/slug"

export const SERVICES_PATH = `${ADMIN_BASE}/services`
const NAME_MAX = 80
const SUMMARY_MAX = 200
const DESCRIPTION_MAX = 600
const CAPABILITIES_MAX = 8
const CAPABILITY_LENGTH_MAX = 40
const PICTURE_MAX_BYTES = 2 * 1024 * 1024
/** Order given to new services. */
const DEFAULT_ORDER = -10

const { api, queries } = siteServicesResource

function useServiceSchema() {
  const t = useTranslations("Services.validation")
  return useMemo(() => {
    const text = (max: number) => z.string().trim().min(1, t("required")).max(max, t("maxLength", { max }))
    const capabilities = z.array(z.string()).min(1, t("capabilitiesRequired")).max(CAPABILITIES_MAX)
    return z.object({
      nameEn: text(NAME_MAX),
      nameAr: text(NAME_MAX),
      slug: z
        .string()
        .trim()
        .min(1, t("required"))
        .max(SLUG_MAX, t("maxLength", { max: SLUG_MAX }))
        .regex(SLUG_PATTERN, t("slugFormat")),
      summaryEn: text(SUMMARY_MAX),
      summaryAr: text(SUMMARY_MAX),
      descriptionEn: text(DESCRIPTION_MAX),
      descriptionAr: text(DESCRIPTION_MAX),
      capabilitiesEn: capabilities,
      capabilitiesAr: capabilities,
      icon: z.enum(siteIcons, { error: t("iconRequired") }),
      picture: z.array(z.custom<DropzoneItem>()).min(1, t("pictureRequired")).max(1),
      hasDetail: z.boolean(),
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

type ServiceFormValues = z.infer<ReturnType<typeof useServiceSchema>>

const toForm = (service?: SiteService): ServiceFormValues => ({
  nameEn: service?.name_en ?? "",
  nameAr: service?.name_ar ?? "",
  slug: service?.slug ?? "",
  summaryEn: service?.summary_en ?? "",
  summaryAr: service?.summary_ar ?? "",
  descriptionEn: service?.description_en ?? "",
  descriptionAr: service?.description_ar ?? "",
  capabilitiesEn: service?.capabilities_en ?? [],
  capabilitiesAr: service?.capabilities_ar ?? [],
  // An empty icon until one is picked; the schema rejects it on submit.
  icon: service?.icon ?? ("" as SiteIcon),
  picture: service?.image_url
    ? [{ id: `${service.id}-picture`, url: service.image_url, name: service.name_en, type: "image/*" }]
    : [],
  hasDetail: service?.has_detail ?? false,
  order: service?.order ?? DEFAULT_ORDER,
  hidden: service?.hidden ?? false,
})

const uploadIfNew = async (item: DropzoneItem, folder: string) =>
  item.file ? (await uploadsApi.upload(item.file, folder)).url : item.url

/** Uploads a newly picked picture, then builds the API payload. */
async function toApi(values: ServiceFormValues): Promise<SiteServiceInput> {
  return {
    slug: values.slug,
    name_en: values.nameEn,
    name_ar: values.nameAr,
    summary_en: values.summaryEn,
    summary_ar: values.summaryAr,
    description_en: values.descriptionEn,
    description_ar: values.descriptionAr,
    capabilities_en: values.capabilitiesEn,
    capabilities_ar: values.capabilitiesAr,
    icon: values.icon,
    image_url: await uploadIfNew(values.picture[0], "services"),
    has_detail: values.hasDetail,
    order: values.order ?? DEFAULT_ORDER,
    hidden: values.hidden,
  }
}

/** Create form when `service` is omitted, edit form when it's given. */
export function ServiceForm({ service }: { service?: SiteService }) {
  const t = useTranslations("Services")
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useServiceSchema()
  const isEdit = Boolean(service)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(service),
  })
  const { isDirty } = form.formState
  useSlugFromName(form, "nameEn", "slug", !isEdit)

  const save = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const input = await toApi(values)
      return service ? api.update(service.id, input) : api.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(SERVICES_PATH)
    },
    onError: (error) => {
      // A clashing slug is the user's to fix, so point at the field.
      if (isApiError(error) && error.status === 409) {
        form.setError("slug", { message: t("validation.slugTaken") }, { shouldFocus: true })
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
        <FormInput
          control={control}
          name="slug"
          label={t("form.slug")}
          description={t("form.slugHint")}
          required
          dir="ltr"
          maxLength={SLUG_MAX}
          className="lg:col-span-2"
        />
        <FormTextarea control={control} name="summaryEn" label={t("form.summaryEn")} required dir="ltr" rows={2} maxLength={SUMMARY_MAX} />
        <FormTextarea control={control} name="summaryAr" label={t("form.summaryAr")} required dir="rtl" rows={2} maxLength={SUMMARY_MAX} />
        <FormTextarea control={control} name="descriptionEn" label={t("form.descriptionEn")} required dir="ltr" maxLength={DESCRIPTION_MAX} />
        <FormTextarea control={control} name="descriptionAr" label={t("form.descriptionAr")} required dir="rtl" maxLength={DESCRIPTION_MAX} />
      </FormSection>

      <FormSection title={t("form.capabilitiesTitle")} description={t("form.capabilitiesDescription")}>
        <FormTagInput
          control={control}
          name="capabilitiesEn"
          label={t("form.capabilitiesEn")}
          required
          dir="ltr"
          maxTags={CAPABILITIES_MAX}
          maxTagLength={CAPABILITY_LENGTH_MAX}
        />
        <FormTagInput
          control={control}
          name="capabilitiesAr"
          label={t("form.capabilitiesAr")}
          required
          dir="rtl"
          maxTags={CAPABILITIES_MAX}
          maxTagLength={CAPABILITY_LENGTH_MAX}
        />
      </FormSection>

      <FormSection title={t("form.mediaTitle")} description={t("form.mediaDescription")}>
        <FormIconSelect control={control} name="icon" label={t("form.icon")} description={t("form.iconHint")} placeholder={t("form.iconPlaceholder")} required />
        <FormDropzone
          control={control}
          name="picture"
          label={t("form.picture")}
          formats={["jpeg", "jpg", "png", "webp"]}
          maxSize={PICTURE_MAX_BYTES}
          required
        />
      </FormSection>

      <FormSection title={t("form.displayTitle")} description={t("form.displayDescription")}>
        {/* Order stays narrow; the checkboxes sit right beside it, lined up with its input. */}
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
          <div className="flex flex-col gap-4 sm:pt-8.5">
            <FormCheckbox control={control} name="hasDetail" label={t("form.hasDetail")} description={t("form.hasDetailHint")} />
            <FormCheckbox control={control} name="hidden" label={t("form.hidden")} description={t("form.hiddenHint")} />
          </div>
        </div>
      </FormSection>

      <FormActionBar status={isDirty && t("form.unsaved")}>
        <Button variant="ghost" nativeButton={false} render={<Link href={SERVICES_PATH} />}>
          {t("form.cancel")}
        </Button>
        <Button type="submit" disabled={save.isPending || (isEdit && !isDirty)}>
          {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {isEdit
            ? save.isPending
              ? t("form.saving")
              : t("form.save")
            : save.isPending
              ? t("form.creating")
              : t("form.create")}
        </Button>
      </FormActionBar>
    </form>
  )
}
