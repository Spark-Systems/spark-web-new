"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Images, Tags } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormDropzone } from "@/components/form/form-dropzone"
import { FormInput } from "@/components/form/form-input"
import { FormNumberInput } from "@/components/form/form-number-input"
import { FormRichText } from "@/components/form/form-rich-text"
import { FormSection } from "@/components/form/form-section"
import { KEYWORDS_MAX, MetaFields } from "@/components/form/meta-fields"
import { TabbedFormActions, type SaveIntent } from "@/components/form/tabbed-form-actions"
import { useFormTabs } from "@/components/form/use-form-tabs"
import type { DropzoneItem } from "@/components/inputs/file-dropzone"
import type { Crumb } from "@/components/layout/app-breadcrumb"
import { PageHeader } from "@/components/layout/page-header"
import { SegmentedTabs } from "@/components/segmented-tabs"
import { aboutApi, aboutQueries } from "@/lib/api/services/about"
import { uploadsApi } from "@/lib/api/services/uploads"
import type { AboutSection, AboutSectionInput } from "@/lib/api/types"

export const ABOUT_PATH = "/about-us"
const NAME_MAX = 150
const PICTURE_MAX_BYTES = 2 * 1024 * 1024
const GALLERY_MAX = 30
/** Order given to new sections. */
const DEFAULT_ORDER = -10

const tabValues = ["info", "gallery", "meta"] as const
type TabValue = (typeof tabValues)[number]

/** Images added inside a description are uploaded right away; the returned URL goes in the HTML. */
const uploadContentImage = async (file: File) => (await uploadsApi.upload(file, "about-us/content")).url

function useAboutSchema() {
  const t = useTranslations("AboutUs.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    // The editor reports an empty document as "", so whitespace-only HTML is the only other empty case.
    const description = z.string().refine((v): boolean => v.trim() !== "", t("required"))
    const keywords = z.array(z.string()).max(KEYWORDS_MAX, t("maxTags", { max: KEYWORDS_MAX }))
    return z.object({
      // About Us information
      nameEn: name,
      nameAr: name,
      descriptionEn: description,
      descriptionAr: description,
      picture: z.array(z.custom<DropzoneItem>()).min(1, t("pictureRequired")).max(1),
      // Explicit boolean return: a type-guard predicate would narrow the output to
      // `number` and no longer match the form's `number | null` values.
      order: z
        .number({ error: t("required") })
        .int(t("integer"))
        .nullable()
        .refine((v): boolean => v !== null, t("required")),
      hidden: z.boolean(),
      // Photo gallery
      gallery: z.array(z.custom<DropzoneItem>()).max(GALLERY_MAX, t("galleryMax", { max: GALLERY_MAX })),
      // Meta description
      metaDescriptionEn: z.string(),
      metaDescriptionAr: z.string(),
      keywordsEn: keywords,
      keywordsAr: keywords,
    })
  }, [t])
}

type AboutFormValues = z.infer<ReturnType<typeof useAboutSchema>>

/** Which tab each field lives on, to jump to the first tab with an error. */
const fieldTab: Record<keyof AboutFormValues, TabValue> = {
  nameEn: "info",
  nameAr: "info",
  descriptionEn: "info",
  descriptionAr: "info",
  picture: "info",
  order: "info",
  hidden: "info",
  gallery: "gallery",
  metaDescriptionEn: "meta",
  metaDescriptionAr: "meta",
  keywordsEn: "meta",
  keywordsAr: "meta",
}

const toForm = (section?: AboutSection): AboutFormValues => ({
  nameEn: section?.name_en ?? "",
  nameAr: section?.name_ar ?? "",
  descriptionEn: section?.description_en ?? "",
  descriptionAr: section?.description_ar ?? "",
  picture: section?.image_url
    ? [{ id: `${section.id}-picture`, url: section.image_url, name: section.name_en, type: "image/*" }]
    : [],
  order: section?.order ?? DEFAULT_ORDER,
  hidden: section?.hidden ?? false,
  gallery: (section?.gallery ?? []).map((image) => ({ ...image, type: "image/*" })),
  metaDescriptionEn: section?.meta_description_en ?? "",
  metaDescriptionAr: section?.meta_description_ar ?? "",
  keywordsEn: section?.keywords_en ?? [],
  keywordsAr: section?.keywords_ar ?? [],
})

const uploadIfNew = async (item: DropzoneItem, folder: string) =>
  item.file ? (await uploadsApi.upload(item.file, folder)).url : item.url

/** Uploads newly picked files (keeping the gallery order), then builds the API payload. */
async function toApi(values: AboutFormValues): Promise<AboutSectionInput> {
  const [imageUrl, ...galleryUrls] = await Promise.all([
    uploadIfNew(values.picture[0], "about-us"),
    ...values.gallery.map((item) => uploadIfNew(item, "about-us/gallery")),
  ])
  return {
    name_en: values.nameEn,
    name_ar: values.nameAr,
    description_en: values.descriptionEn,
    description_ar: values.descriptionAr,
    image_url: imageUrl,
    order: values.order ?? DEFAULT_ORDER,
    hidden: values.hidden,
    gallery: values.gallery.map((item, index) => ({
      // New files get a fresh id; stored ones keep theirs.
      id: item.file ? `img_${Date.now().toString(36)}_${index}` : item.id,
      url: galleryUrls[index],
      name: item.name,
    })),
    meta_description_en: values.metaDescriptionEn,
    meta_description_ar: values.metaDescriptionAr,
    keywords_en: values.keywordsEn,
    keywords_ar: values.keywordsAr,
  }
}

/**
 * Create form when `section` is omitted, edit form when it's given. Renders the
 * page header with the tabs on its end side.
 */
export function AboutForm({ section, title, crumbs }: { section?: AboutSection; title: string; crumbs?: Crumb[] }) {
  const t = useTranslations("AboutUs")
  const tForm = useTranslations("FormActions")
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useAboutSchema()
  const isEdit = Boolean(section)

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(section),
  })
  const { errors, isDirty } = form.formState
  const { tab, changeTab, nextTab, badge, showFirstError } = useFormTabs(tabValues, fieldTab, errors)

  const save = useMutation({
    mutationFn: async ({ values }: { values: AboutFormValues; intent: SaveIntent }) => {
      const input = await toApi(values)
      return section ? aboutApi.update(section.id, input) : aboutApi.create(input)
    },
    onSuccess: (saved, { intent }) => {
      queryClient.setQueryData(aboutQueries.detail(saved.id).queryKey, saved)
      queryClient.invalidateQueries({ queryKey: aboutQueries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      if (intent === "save" || !nextTab) return router.push(ABOUT_PATH)
      if (!isEdit) {
        // From here on, saving should update this section rather than create another.
        return router.replace(`${ABOUT_PATH}/${saved.id}/edit?tab=${nextTab}`)
      }
      form.reset(toForm(saved)) // new files are now stored URLs; nothing is dirty
      changeTab(nextTab)
    },
    onError: () => toast.error(t("saveError")),
  })

  const submit = (intent: SaveIntent) => {
    // Nothing changed while editing: "Save & Continue" just moves on.
    if (intent === "continue" && isEdit && !isDirty && nextTab) return changeTab(nextTab)
    form.handleSubmit(
      (values) => save.mutate({ values, intent }),
      (fieldErrors) => {
        showFirstError(fieldErrors)
        toast.error(tForm("fixErrors"))
      }
    )()
  }

  const control = form.control

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit("save")
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <SegmentedTabs
        value={tab}
        onValueChange={changeTab}
        className="gap-6"
        renderList={(list) => <PageHeader title={title} crumbs={crumbs} actions={list} />}
        tabs={[
          {
            value: "info",
            label: t("tabs.info"),
            icon: FileText,
            badge: badge("info"),
            content: (
              <div className="flex flex-col gap-4">
                <FormSection title={t("form.detailsTitle")} description={t("form.detailsDescription")}>
                  <FormInput control={control} name="nameEn" label={t("form.nameEn")} required dir="ltr" maxLength={NAME_MAX} autoFocus />
                  <FormInput control={control} name="nameAr" label={t("form.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
                </FormSection>

                <FormSection title={t("form.descriptionTitle")} description={t("form.descriptionDescription")}>
                  <FormRichText
                    control={control}
                    name="descriptionEn"
                    label={t("form.descriptionEn")}
                    required
                    dir="ltr"
                    sourceEditing
                    colors
                    headings
                    fontSizes
                    embeds
                    onImageUpload={uploadContentImage}
                    imageMaxSize={PICTURE_MAX_BYTES}
                    className="lg:col-span-2"
                  />
                  <FormRichText
                    control={control}
                    name="descriptionAr"
                    label={t("form.descriptionAr")}
                    required
                    dir="rtl"
                    sourceEditing
                    colors
                    headings
                    fontSizes
                    embeds
                    onImageUpload={uploadContentImage}
                    imageMaxSize={PICTURE_MAX_BYTES}
                    className="lg:col-span-2"
                  />
                </FormSection>

                <FormSection title={t("form.pictureTitle")} description={t("form.pictureDescription")}>
                  <FormDropzone
                    control={control}
                    name="picture"
                    label={t("form.picture")}
                    formats={["jpeg", "jpg", "png"]}
                    maxSize={PICTURE_MAX_BYTES}
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
              </div>
            ),
          },
          {
            value: "gallery",
            label: t("tabs.gallery"),
            icon: Images,
            badge: badge("gallery"),
            content: (
              <FormSection title={t("gallery.title")} description={t("gallery.description")}>
                <FormDropzone
                  control={control}
                  name="gallery"
                  label={t("gallery.photos")}
                  formats={["jpeg", "jpg", "png"]}
                  maxSize={PICTURE_MAX_BYTES}
                  multiple
                  sortable
                  maxFiles={GALLERY_MAX}
                  className="lg:col-span-2"
                />
              </FormSection>
            ),
          },
          {
            value: "meta",
            label: t("tabs.meta"),
            icon: Tags,
            badge: badge("meta"),
            content: <MetaFields control={control} />,
          },
        ]}
      />

      <TabbedFormActions
        cancelHref={ABOUT_PATH}
        isDirty={isDirty}
        isEdit={isEdit}
        pending={save.isPending ? save.variables?.intent : undefined}
        hasNextTab={Boolean(nextTab)}
        onContinue={() => submit("continue")}
      />
    </form>
  )
}
