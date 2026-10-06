"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Images, Package, Tags } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
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
import { FormSelect, type SelectOption } from "@/components/form/form-select"
import { FormTextarea } from "@/components/form/form-textarea"
import { KEYWORDS_MAX, MetaFields } from "@/components/form/meta-fields"
import { TabbedFormActions, type SaveIntent } from "@/components/form/tabbed-form-actions"
import { useFormTabs } from "@/components/form/use-form-tabs"
import type { DropzoneItem } from "@/components/inputs/file-dropzone"
import type { Crumb } from "@/components/layout/app-breadcrumb"
import { PageHeader } from "@/components/layout/page-header"
import { SegmentedTabs } from "@/components/segmented-tabs"
import { productCategoriesQueries } from "@/lib/api/services/product-categories"
import { productsApi, productsQueries } from "@/lib/api/services/products"
import { uploadsApi } from "@/lib/api/services/uploads"
import type { Product, ProductCategory, ProductInput } from "@/lib/api/types"

export const PRODUCTS_PATH = "/products/list"
const NAME_MAX = 150
const SUMMARY_MAX = 500
const PICTURE_MAX_BYTES = 2 * 1024 * 1024
const GALLERY_MAX = 30
/** Order given to new products. */
const DEFAULT_ORDER = -10

const tabValues = ["info", "gallery", "meta"] as const
type TabValue = (typeof tabValues)[number]

/** Images added inside rich text are uploaded right away; the returned URL goes in the HTML. */
const uploadContentImage = async (file: File) => (await uploadsApi.upload(file, "products/content")).url

const isHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function useProductSchema() {
  const t = useTranslations("Products.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    const summary = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(SUMMARY_MAX, t("maxLength", { max: SUMMARY_MAX }))
    // The editor reports an empty document as "", so whitespace-only HTML is the only other empty case.
    const richText = z.string().refine((v): boolean => v.trim() !== "", t("required"))
    const keywords = z.array(z.string()).max(KEYWORDS_MAX, t("maxTags", { max: KEYWORDS_MAX }))
    return z.object({
      // Product information
      categoryId: z.string().min(1, t("categoryRequired")),
      nameEn: name,
      nameAr: name,
      summaryEn: summary,
      summaryAr: summary,
      contentEn: richText,
      contentAr: richText,
      specificationsEn: z.string(),
      specificationsAr: z.string(),
      picture: z.array(z.custom<DropzoneItem>()).min(1, t("pictureRequired")).max(1),
      videoUrl: z
        .string()
        .trim()
        .refine((v): boolean => v === "" || isHttpUrl(v), t("invalidUrl")),
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
      // Meta settings
      metaDescriptionEn: z.string(),
      metaDescriptionAr: z.string(),
      keywordsEn: keywords,
      keywordsAr: keywords,
    })
  }, [t])
}

type ProductFormValues = z.infer<ReturnType<typeof useProductSchema>>

/** Which tab each field lives on, to jump to the first tab with an error. */
const fieldTab: Record<keyof ProductFormValues, TabValue> = {
  categoryId: "info",
  nameEn: "info",
  nameAr: "info",
  summaryEn: "info",
  summaryAr: "info",
  contentEn: "info",
  contentAr: "info",
  specificationsEn: "info",
  specificationsAr: "info",
  picture: "info",
  videoUrl: "info",
  order: "info",
  hidden: "info",
  gallery: "gallery",
  metaDescriptionEn: "meta",
  metaDescriptionAr: "meta",
  keywordsEn: "meta",
  keywordsAr: "meta",
}

const toForm = (product?: Product): ProductFormValues => ({
  categoryId: product?.category_id ?? "",
  nameEn: product?.name_en ?? "",
  nameAr: product?.name_ar ?? "",
  summaryEn: product?.summary_en ?? "",
  summaryAr: product?.summary_ar ?? "",
  contentEn: product?.content_en ?? "",
  contentAr: product?.content_ar ?? "",
  specificationsEn: product?.specifications_en ?? "",
  specificationsAr: product?.specifications_ar ?? "",
  picture: product?.image_url
    ? [{ id: `${product.id}-picture`, url: product.image_url, name: product.name_en, type: "image/*" }]
    : [],
  videoUrl: product?.video_url ?? "",
  order: product?.order ?? DEFAULT_ORDER,
  hidden: product?.hidden ?? false,
  gallery: (product?.gallery ?? []).map((image) => ({ ...image, type: "image/*" })),
  metaDescriptionEn: product?.meta_description_en ?? "",
  metaDescriptionAr: product?.meta_description_ar ?? "",
  keywordsEn: product?.keywords_en ?? [],
  keywordsAr: product?.keywords_ar ?? [],
})

const uploadIfNew = async (item: DropzoneItem, folder: string) =>
  item.file ? (await uploadsApi.upload(item.file, folder)).url : item.url

/** Uploads newly picked files (keeping the gallery order), then builds the API payload. */
async function toApi(values: ProductFormValues): Promise<ProductInput> {
  const [imageUrl, ...galleryUrls] = await Promise.all([
    uploadIfNew(values.picture[0], "products"),
    ...values.gallery.map((item) => uploadIfNew(item, "products/gallery")),
  ])
  return {
    category_id: values.categoryId,
    name_en: values.nameEn,
    name_ar: values.nameAr,
    summary_en: values.summaryEn,
    summary_ar: values.summaryAr,
    content_en: values.contentEn,
    content_ar: values.contentAr,
    specifications_en: values.specificationsEn,
    specifications_ar: values.specificationsAr,
    image_url: imageUrl,
    video_url: values.videoUrl,
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

/** Main categories, each followed by its subcategories (indented); a product can belong to either. */
function categoryOptions(categories: ProductCategory[], locale: string): SelectOption[] {
  const name = (c: Pick<ProductCategory, "name_en" | "name_ar">) => (locale === "ar" ? c.name_ar : c.name_en)
  return categories
    .filter((c) => !c.parent_id)
    .flatMap((main) => [
      { value: main.id, label: name(main) },
      ...categories
        .filter((c) => c.parent_id === main.id)
        // The trigger shows "Main › Sub" so the choice is clear once the list closes.
        .map((sub) => ({ value: sub.id, label: `${name(main)} › ${name(sub)}`, itemLabel: name(sub), level: 1 })),
    ])
}

/** Full rich text toolbar for product content and specifications. */
const richTextFeatures = {
  sourceEditing: true,
  colors: true,
  headings: true,
  fontSizes: true,
  embeds: true,
  onImageUpload: uploadContentImage,
  imageMaxSize: PICTURE_MAX_BYTES,
}

/**
 * Create form when `product` is omitted, edit form when it's given. Renders the
 * page header with the tabs on its end side.
 */
export function ProductForm({ product, title, crumbs }: { product?: Product; title: string; crumbs?: Crumb[] }) {
  const t = useTranslations("Products")
  const tForm = useTranslations("FormActions")
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useProductSchema()
  const isEdit = Boolean(product)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(product),
  })
  const { errors, isDirty } = form.formState
  const { tab, changeTab, nextTab, badge, showFirstError } = useFormTabs(tabValues, fieldTab, errors)

  const categories = useQuery(productCategoriesQueries.allCategories())
  const options = useMemo(() => categoryOptions(categories.data?.data ?? [], locale), [categories.data, locale])

  const save = useMutation({
    mutationFn: async ({ values }: { values: ProductFormValues; intent: SaveIntent }) => {
      const input = await toApi(values)
      return product ? productsApi.update(product.id, input) : productsApi.create(input)
    },
    onSuccess: (saved, { intent }) => {
      queryClient.setQueryData(productsQueries.detail(saved.id).queryKey, saved)
      queryClient.invalidateQueries({ queryKey: productsQueries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      if (intent === "save" || !nextTab) return router.push(PRODUCTS_PATH)
      if (!isEdit) {
        // From here on, saving should update this product rather than create another.
        return router.replace(`${PRODUCTS_PATH}/${saved.id}/edit?tab=${nextTab}`)
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
            icon: Package,
            badge: badge("info"),
            content: (
              <div className="flex flex-col gap-4">
                <FormSection title={t("form.detailsTitle")} description={t("form.detailsDescription")}>
                  <FormSelect
                    control={control}
                    name="categoryId"
                    label={t("form.category")}
                    placeholder={t("form.categoryPlaceholder")}
                    options={options}
                    disabled={categories.isPending}
                    required
                    className="lg:col-span-2"
                  />
                  <FormInput control={control} name="nameEn" label={t("form.nameEn")} required dir="ltr" maxLength={NAME_MAX} />
                  <FormInput control={control} name="nameAr" label={t("form.nameAr")} required dir="rtl" maxLength={NAME_MAX} />
                  <FormTextarea control={control} name="summaryEn" label={t("form.summaryEn")} required dir="ltr" maxLength={SUMMARY_MAX} />
                  <FormTextarea control={control} name="summaryAr" label={t("form.summaryAr")} required dir="rtl" maxLength={SUMMARY_MAX} />
                </FormSection>

                <FormSection title={t("form.contentTitle")} description={t("form.contentDescription")}>
                  <FormRichText control={control} name="contentEn" label={t("form.contentEn")} required dir="ltr" className="lg:col-span-2" {...richTextFeatures} />
                  <FormRichText control={control} name="contentAr" label={t("form.contentAr")} required dir="rtl" className="lg:col-span-2" {...richTextFeatures} />
                </FormSection>

                <FormSection title={t("form.specificationsTitle")} description={t("form.specificationsDescription")}>
                  <FormRichText control={control} name="specificationsEn" label={t("form.specificationsEn")} dir="ltr" className="lg:col-span-2" {...richTextFeatures} />
                  <FormRichText control={control} name="specificationsAr" label={t("form.specificationsAr")} dir="rtl" className="lg:col-span-2" {...richTextFeatures} />
                </FormSection>

                <FormSection title={t("form.mediaTitle")} description={t("form.mediaDescription")}>
                  <FormDropzone
                    control={control}
                    name="picture"
                    label={t("form.picture")}
                    formats={["jpeg", "jpg", "png"]}
                    maxSize={PICTURE_MAX_BYTES}
                    required
                    className="lg:col-span-2"
                  />
                  <FormInput
                    control={control}
                    name="videoUrl"
                    label={t("form.videoUrl")}
                    description={t("form.videoUrlHint")}
                    type="url"
                    dir="ltr"
                    placeholder="https://www.youtube.com/watch?v=…"
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
        cancelHref={PRODUCTS_PATH}
        isDirty={isDirty}
        isEdit={isEdit}
        pending={save.isPending ? save.variables?.intent : undefined}
        hasNextTab={Boolean(nextTab)}
        onContinue={() => submit("continue")}
      />
    </form>
  )
}
