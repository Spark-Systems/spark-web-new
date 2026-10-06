"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormDropzone } from "@/components/form/form-dropzone"
import { FormInput } from "@/components/form/form-input"
import { FormSection } from "@/components/form/form-section"
import { FormSelect } from "@/components/form/form-select"
import type { DropzoneItem } from "@/components/inputs/file-dropzone"
import { Button } from "@/components/ui/button"
import { bannersApi, bannersQueries } from "@/lib/api/services/banners"
import { uploadsApi } from "@/lib/api/services/uploads"
import { bannerSections, type BannerInput, type BannerSection, type InternalBanner } from "@/lib/api/types"

export const BANNERS_PATH = "/settings/internal-banners"
const NAME_MAX = 150
const PICTURE_MAX_BYTES = 2 * 1024 * 1024

const isSection = (value: string): value is BannerSection => bannerSections.includes(value as BannerSection)

function useBannerSchema() {
  const t = useTranslations("Banners.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    return z
      .object({
        // Explicit boolean: the type guard would narrow the output and break the form's "" initial value.
        section: z.string().refine((v): boolean => isSection(v), t("required")),
        nameEn: name,
        nameAr: name,
        picture: z.array(z.custom<DropzoneItem>()).max(1),
        noImage: z.boolean(),
      })
      .superRefine((values, ctx) => {
        // A picture is required unless the banner is explicitly picture-less.
        if (!values.noImage && values.picture.length === 0) {
          ctx.addIssue({ code: "custom", path: ["picture"], message: t("pictureRequired") })
        }
      })
  }, [t])
}

type BannerFormValues = z.infer<ReturnType<typeof useBannerSchema>>

const toForm = (banner?: InternalBanner): BannerFormValues => ({
  section: banner?.section ?? "",
  nameEn: banner?.name_en ?? "",
  nameAr: banner?.name_ar ?? "",
  picture: banner?.image_url
    ? [{ id: `${banner.id}-picture`, url: banner.image_url, name: banner.name_en, type: "image/*" }]
    : [],
  noImage: banner?.no_image ?? false,
})

/** Uploads a newly picked picture, then builds the API payload. */
async function toApi(values: BannerFormValues): Promise<BannerInput> {
  const item = values.picture[0]
  const imageUrl = values.noImage
    ? null
    : item?.file
      ? (await uploadsApi.upload(item.file, "banners")).url
      : (item?.url ?? null)
  return {
    section: values.section as BannerSection,
    name_en: values.nameEn,
    name_ar: values.nameAr,
    image_url: imageUrl,
    no_image: values.noImage,
  }
}

/** Create form when `banner` is omitted, edit form when it's given. */
export function BannerForm({ banner }: { banner?: InternalBanner }) {
  const t = useTranslations("Banners")
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useBannerSchema()
  const isEdit = Boolean(banner)

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(banner),
  })
  const noImage = useWatch({ control: form.control, name: "noImage" })

  // The picture rule depends on "No image"; re-check it when that changes so a
  // stale "picture required" error disappears as soon as the box is ticked.
  const { isSubmitted } = form.formState
  useEffect(() => {
    if (isSubmitted) form.trigger("picture")
  }, [noImage, isSubmitted, form])

  const sectionOptions = useMemo(
    () => bannerSections.map((value) => ({ value, label: t(`sections.${value}`) })),
    [t]
  )

  const save = useMutation({
    mutationFn: async (values: BannerFormValues) => {
      const input = await toApi(values)
      return banner ? bannersApi.update(banner.id, input) : bannersApi.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannersQueries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(BANNERS_PATH)
    },
    onError: () => toast.error(t("saveError")),
  })

  const control = form.control

  return (
    <form onSubmit={form.handleSubmit((values) => save.mutate(values))} noValidate className="flex flex-col gap-4">
      <FormSection title={t("form.detailsTitle")} description={t("form.detailsDescription")}>
        <FormSelect
          control={control}
          name="section"
          label={t("form.section")}
          placeholder={t("form.sectionPlaceholder")}
          options={sectionOptions}
          required
          className="lg:col-span-2"
        />
        <FormInput control={control} name="nameEn" label={t("form.nameEn")} required dir="ltr" maxLength={NAME_MAX} />
        <FormInput control={control} name="nameAr" label={t("form.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
      </FormSection>

      <FormSection title={t("form.pictureTitle")} description={t("form.pictureDescription")}>
        <FormDropzone
          control={control}
          name="picture"
          label={t("form.picture")}
          formats={["jpeg", "jpg", "png"]}
          maxSize={PICTURE_MAX_BYTES}
          required={!noImage}
          disabled={noImage}
          className="lg:col-span-2"
        />
        <FormCheckbox
          control={control}
          name="noImage"
          label={t("form.noImage")}
          description={t("form.noImageHint")}
          className="lg:col-span-2"
        />
      </FormSection>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" nativeButton={false} render={<Link href={BANNERS_PATH} />}>
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
