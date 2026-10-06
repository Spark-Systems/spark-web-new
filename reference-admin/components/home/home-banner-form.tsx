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

import { FormActionBar } from "@/components/form/form-action-bar"
import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormDropzone } from "@/components/form/form-dropzone"
import { FormInput } from "@/components/form/form-input"
import { FormLinkTarget } from "@/components/form/form-link-target"
import { FormNumberInput } from "@/components/form/form-number-input"
import { FormSection } from "@/components/form/form-section"
import type { DropzoneItem } from "@/components/inputs/file-dropzone"
import { Button } from "@/components/ui/button"
import { homeBannersApi, homeBannersQueries } from "@/lib/api/services/home"
import { uploadsApi } from "@/lib/api/services/uploads"
import type { HomeBanner, HomeBannerInput } from "@/lib/api/types"
import { isLinkTarget, isValidLink } from "@/lib/links"

export const HOME_BANNERS_PATH = "/home/banner"
const HEADLINE_MAX = 150
const PICTURE_MAX_BYTES = 2 * 1024 * 1024
/** Order given to new slides. */
const DEFAULT_ORDER = -10

function useHomeBannerSchema() {
  const t = useTranslations("HomeBanners.validation")
  return useMemo(() => {
    const required = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(HEADLINE_MAX, t("maxLength", { max: HEADLINE_MAX }))
    const optional = z.string().trim().max(HEADLINE_MAX, t("maxLength", { max: HEADLINE_MAX }))
    const picture = z.array(z.custom<DropzoneItem>()).min(1, t("pictureRequired")).max(1)
    const link = z
      .string()
      .trim()
      .refine((v): boolean => isValidLink(v), t("invalidLink"))
    return z.object({
      headline1En: required,
      headline1Ar: required,
      headline2En: optional,
      headline2Ar: optional,
      headline3En: optional,
      headline3Ar: optional,
      pictureEn: picture,
      pictureAr: picture,
      linkEn: link,
      linkAr: link,
      // Explicit boolean: a type-guard predicate would narrow the output type.
      linkTarget: z.string().refine((v): boolean => isLinkTarget(v)),
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

type HomeBannerFormValues = z.infer<ReturnType<typeof useHomeBannerSchema>>

const storedPicture = (id: string, url: string, name: string): DropzoneItem[] =>
  url ? [{ id, url, name, type: "image/*" }] : []

const toForm = (banner?: HomeBanner): HomeBannerFormValues => ({
  headline1En: banner?.headline1_en ?? "",
  headline1Ar: banner?.headline1_ar ?? "",
  headline2En: banner?.headline2_en ?? "",
  headline2Ar: banner?.headline2_ar ?? "",
  headline3En: banner?.headline3_en ?? "",
  headline3Ar: banner?.headline3_ar ?? "",
  pictureEn: banner ? storedPicture(`${banner.id}-en`, banner.image_en_url, banner.headline1_en) : [],
  pictureAr: banner ? storedPicture(`${banner.id}-ar`, banner.image_ar_url, banner.headline1_ar) : [],
  linkEn: banner?.link_en ?? "",
  linkAr: banner?.link_ar ?? "",
  linkTarget: banner?.link_target ?? "_self",
  order: banner?.order ?? DEFAULT_ORDER,
  hidden: banner?.hidden ?? false,
})

const uploadIfNew = async (item: DropzoneItem) =>
  item.file ? (await uploadsApi.upload(item.file, "home-banners")).url : item.url

/** Uploads newly picked pictures, then builds the API payload. */
async function toApi(values: HomeBannerFormValues): Promise<HomeBannerInput> {
  const [imageEn, imageAr] = await Promise.all([uploadIfNew(values.pictureEn[0]), uploadIfNew(values.pictureAr[0])])
  return {
    headline1_en: values.headline1En,
    headline1_ar: values.headline1Ar,
    headline2_en: values.headline2En,
    headline2_ar: values.headline2Ar,
    headline3_en: values.headline3En,
    headline3_ar: values.headline3Ar,
    image_en_url: imageEn,
    image_ar_url: imageAr,
    link_en: values.linkEn,
    link_ar: values.linkAr,
    link_target: isLinkTarget(values.linkTarget) ? values.linkTarget : "_self",
    order: values.order ?? DEFAULT_ORDER,
    hidden: values.hidden,
  }
}

/** Create form when `banner` is omitted, edit form when it's given. */
export function HomeBannerForm({ banner }: { banner?: HomeBanner }) {
  const t = useTranslations("HomeBanners")
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useHomeBannerSchema()
  const isEdit = Boolean(banner)

  const form = useForm<HomeBannerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(banner),
  })
  const { isDirty } = form.formState

  const save = useMutation({
    mutationFn: async (values: HomeBannerFormValues) => {
      const input = await toApi(values)
      return banner ? homeBannersApi.update(banner.id, input) : homeBannersApi.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeBannersQueries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(HOME_BANNERS_PATH)
    },
    onError: () => toast.error(t("saveError")),
  })

  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("form.headlinesTitle")} description={t("form.headlinesDescription")}>
        <FormInput control={control} name="headline1En" label={t("form.headline1En")} required dir="ltr" maxLength={HEADLINE_MAX} autoFocus />
        <FormInput control={control} name="headline1Ar" label={t("form.headline1Ar")} required dir="rtl" maxLength={HEADLINE_MAX} />
        <FormInput control={control} name="headline2En" label={t("form.headline2En")} dir="ltr" maxLength={HEADLINE_MAX} />
        <FormInput control={control} name="headline2Ar" label={t("form.headline2Ar")} dir="rtl" maxLength={HEADLINE_MAX} />
        <FormInput control={control} name="headline3En" label={t("form.headline3En")} dir="ltr" maxLength={HEADLINE_MAX} />
        <FormInput control={control} name="headline3Ar" label={t("form.headline3Ar")} dir="rtl" maxLength={HEADLINE_MAX} />
      </FormSection>

      <FormSection title={t("form.picturesTitle")} description={t("form.picturesDescription")}>
        <FormDropzone
          control={control}
          name="pictureEn"
          label={t("form.pictureEn")}
          formats={["jpeg", "jpg", "png"]}
          maxSize={PICTURE_MAX_BYTES}
          required
        />
        <FormDropzone
          control={control}
          name="pictureAr"
          label={t("form.pictureAr")}
          formats={["jpeg", "jpg", "png"]}
          maxSize={PICTURE_MAX_BYTES}
          required
        />
      </FormSection>

      <FormSection title={t("form.linkTitle")} description={t("form.linkDescription")}>
        <FormInput control={control} name="linkEn" label={t("form.linkEn")} dir="ltr" placeholder="https:// or /page" />
        <FormInput control={control} name="linkAr" label={t("form.linkAr")} dir="ltr" placeholder="https:// or /page" />
        <FormLinkTarget control={control} name="linkTarget" />
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
        <Button variant="ghost" nativeButton={false} render={<Link href={HOME_BANNERS_PATH} />}>
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
