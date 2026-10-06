"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
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
import { solutionsResource } from "@admin/lib/api/services/site-content"
import { uploadsApi } from "@admin/lib/api/services/uploads"
import { siteIcons, type SiteIcon, type Solution, type SolutionInput } from "@admin/lib/api/types"
import { ADMIN_BASE } from "@admin/lib/auth/constants"
import { SLUG_MAX, SLUG_PATTERN } from "@admin/lib/slug"

export const SOLUTIONS_PATH = `${ADMIN_BASE}/solutions`
const NAME_MAX = 80
const DESCRIPTION_MAX = 300
const TAGS_MAX = 5
const TAG_LENGTH_MAX = 40
const PICTURE_MAX_BYTES = 2 * 1024 * 1024
/** Order given to new solutions. */
const DEFAULT_ORDER = -10

const { api, queries } = solutionsResource

function useSolutionSchema() {
  const t = useTranslations("Solutions.validation")
  return useMemo(() => {
    const name = z.string().trim().min(1, t("required")).max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    const description = z.string().trim().max(DESCRIPTION_MAX, t("maxLength", { max: DESCRIPTION_MAX }))
    return z
      .object({
        nameEn: name,
        nameAr: name,
        slug: z
          .string()
          .trim()
          .min(1, t("required"))
          .max(SLUG_MAX, t("maxLength", { max: SLUG_MAX }))
          .regex(SLUG_PATTERN, t("slugFormat")),
        flagship: z.boolean(),
        descriptionEn: description,
        descriptionAr: description,
        tagsEn: z.array(z.string()).max(TAGS_MAX),
        tagsAr: z.array(z.string()).max(TAGS_MAX),
        icon: z.enum(siteIcons, { error: t("iconRequired") }),
        picture: z.array(z.custom<DropzoneItem>()).min(1, t("pictureRequired")).max(1),
        hasDetail: z.boolean(),
        order: z
          .number({ error: t("required") })
          .int(t("integer"))
          .nullable()
          .refine((v): boolean => v !== null, t("required")),
        hidden: z.boolean(),
      })
      .superRefine((values, ctx) => {
        // The flagship card shows a description and tags, so they're only required for flagships.
        if (!values.flagship) return
        for (const field of ["descriptionEn", "descriptionAr"] as const) {
          if (!values[field]) ctx.addIssue({ code: "custom", path: [field], message: t("required") })
        }
        for (const field of ["tagsEn", "tagsAr"] as const) {
          if (values[field].length === 0) ctx.addIssue({ code: "custom", path: [field], message: t("tagsRequired") })
        }
      })
  }, [t])
}

type SolutionFormValues = z.infer<ReturnType<typeof useSolutionSchema>>

const toForm = (solution?: Solution): SolutionFormValues => ({
  nameEn: solution?.name_en ?? "",
  nameAr: solution?.name_ar ?? "",
  slug: solution?.slug ?? "",
  flagship: solution?.flagship ?? false,
  descriptionEn: solution?.description_en ?? "",
  descriptionAr: solution?.description_ar ?? "",
  tagsEn: solution?.tags_en ?? [],
  tagsAr: solution?.tags_ar ?? [],
  // An empty icon until one is picked; the schema rejects it on submit.
  icon: solution?.icon ?? ("" as SiteIcon),
  picture: solution?.image_url
    ? [{ id: `${solution.id}-picture`, url: solution.image_url, name: solution.name_en, type: "image/*" }]
    : [],
  hasDetail: solution?.has_detail ?? false,
  order: solution?.order ?? DEFAULT_ORDER,
  hidden: solution?.hidden ?? false,
})

const uploadIfNew = async (item: DropzoneItem, folder: string) =>
  item.file ? (await uploadsApi.upload(item.file, folder)).url : item.url

/** Uploads a newly picked picture, then builds the API payload. */
async function toApi(values: SolutionFormValues): Promise<SolutionInput> {
  return {
    slug: values.slug,
    name_en: values.nameEn,
    name_ar: values.nameAr,
    image_url: await uploadIfNew(values.picture[0], "solutions"),
    flagship: values.flagship,
    // Card copy only matters on flagships; others don't keep stale text around.
    description_en: values.flagship ? values.descriptionEn : "",
    description_ar: values.flagship ? values.descriptionAr : "",
    tags_en: values.flagship ? values.tagsEn : [],
    tags_ar: values.flagship ? values.tagsAr : [],
    icon: values.icon,
    has_detail: values.hasDetail,
    order: values.order ?? DEFAULT_ORDER,
    hidden: values.hidden,
  }
}

/** Create form when `solution` is omitted, edit form when it's given. */
export function SolutionForm({ solution }: { solution?: Solution }) {
  const t = useTranslations("Solutions")
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useSolutionSchema()
  const isEdit = Boolean(solution)

  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(solution),
  })
  const { isDirty } = form.formState
  const control = form.control
  const flagship = useWatch({ control, name: "flagship" })
  useSlugFromName(form, "nameEn", "slug", !isEdit)

  const save = useMutation({
    mutationFn: async (values: SolutionFormValues) => {
      const input = await toApi(values)
      return solution ? api.update(solution.id, input) : api.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(SOLUTIONS_PATH)
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
      </FormSection>

      <FormSection title={t("form.flagshipTitle")} description={t("form.flagshipDescription")}>
        <FormCheckbox
          control={control}
          name="flagship"
          label={t("form.flagship")}
          description={t("form.flagshipHint")}
          className="lg:col-span-2"
        />
        {flagship && (
          <>
            <FormTextarea
              control={control}
              name="descriptionEn"
              label={t("form.descriptionEn")}
              required
              dir="ltr"
              rows={3}
              maxLength={DESCRIPTION_MAX}
            />
            <FormTextarea
              control={control}
              name="descriptionAr"
              label={t("form.descriptionAr")}
              required
              dir="rtl"
              rows={3}
              maxLength={DESCRIPTION_MAX}
            />
            <FormTagInput
              control={control}
              name="tagsEn"
              label={t("form.tagsEn")}
              required
              dir="ltr"
              maxTags={TAGS_MAX}
              maxTagLength={TAG_LENGTH_MAX}
            />
            <FormTagInput
              control={control}
              name="tagsAr"
              label={t("form.tagsAr")}
              required
              dir="rtl"
              maxTags={TAGS_MAX}
              maxTagLength={TAG_LENGTH_MAX}
            />
          </>
        )}
      </FormSection>

      <FormSection title={t("form.mediaTitle")} description={t("form.mediaDescription")}>
        <FormIconSelect
          control={control}
          name="icon"
          label={t("form.icon")}
          description={t("form.iconHint")}
          placeholder={t("form.iconPlaceholder")}
          required
        />
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
        <Button variant="ghost" nativeButton={false} render={<Link href={SOLUTIONS_PATH} />}>
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
