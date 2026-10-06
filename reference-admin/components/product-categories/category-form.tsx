"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormActionBar } from "@/components/form/form-action-bar"
import { FormCheckbox } from "@/components/form/form-checkbox"
import { FormDropzone } from "@/components/form/form-dropzone"
import { FormInput } from "@/components/form/form-input"
import { FormNumberInput } from "@/components/form/form-number-input"
import { FormSection } from "@/components/form/form-section"
import { FormSelect } from "@/components/form/form-select"
import type { DropzoneItem } from "@/components/inputs/file-dropzone"
import { Button } from "@/components/ui/button"
import { isApiError } from "@/lib/api/errors"
import { productCategoriesApi, productCategoriesQueries } from "@/lib/api/services/product-categories"
import { uploadsApi } from "@/lib/api/services/uploads"
import type { ProductCategory, ProductCategoryInput } from "@/lib/api/types"

export const CATEGORIES_PATH = "/products/categories"
const NAME_MAX = 150
const PICTURE_MAX_BYTES = 2 * 1024 * 1024
/** Order given to new categories. */
const DEFAULT_ORDER = -10

function useCategorySchema() {
  const t = useTranslations("ProductCategories.validation")
  return useMemo(() => {
    const name = z
      .string()
      .trim()
      .min(1, t("required"))
      .max(NAME_MAX, t("maxLength", { max: NAME_MAX }))
    return z.object({
      /** "" means no parent: the category is a main category. */
      parentId: z.string(),
      nameEn: name,
      nameAr: name,
      picture: z.array(z.custom<DropzoneItem>()).min(1, t("pictureRequired")).max(1),
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

type CategoryFormValues = z.infer<ReturnType<typeof useCategorySchema>>

const toForm = (category?: ProductCategory): CategoryFormValues => ({
  parentId: category?.parent_id ?? "",
  nameEn: category?.name_en ?? "",
  nameAr: category?.name_ar ?? "",
  picture: category?.image_url
    ? [{ id: `${category.id}-picture`, url: category.image_url, name: category.name_en, type: "image/*" }]
    : [],
  order: category?.order ?? DEFAULT_ORDER,
  hidden: category?.hidden ?? false,
})

/** Uploads a newly picked picture, then builds the API payload. */
async function toApi(values: CategoryFormValues): Promise<ProductCategoryInput> {
  const item = values.picture[0]
  const imageUrl = item.file ? (await uploadsApi.upload(item.file, "product-categories")).url : item.url
  return {
    parent_id: values.parentId || null,
    name_en: values.nameEn,
    name_ar: values.nameAr,
    image_url: imageUrl,
    order: values.order ?? DEFAULT_ORDER,
    hidden: values.hidden,
  }
}

/** Create form when `category` is omitted, edit form when it's given. */
export function CategoryForm({ category }: { category?: ProductCategory }) {
  const t = useTranslations("ProductCategories")
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()
  const schema = useCategorySchema()
  const isEdit = Boolean(category)
  // A category with subcategories has to stay a main category (two levels only).
  const hasChildren = (category?.children_count ?? 0) > 0

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toForm(category),
  })
  const parentId = useWatch({ control: form.control, name: "parentId" })
  const { isDirty } = form.formState

  const mains = useQuery(productCategoriesQueries.mainCategories())
  const parentOptions = useMemo(
    () =>
      (mains.data?.data ?? [])
        .filter((c) => c.id !== category?.id)
        .map((c) => ({ value: c.id, label: locale === "ar" ? c.name_ar : c.name_en })),
    [mains.data, category?.id, locale]
  )

  const save = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const input = await toApi(values)
      return category ? productCategoriesApi.update(category.id, input) : productCategoriesApi.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCategoriesQueries.all })
      toast.success(isEdit ? t("updated") : t("created"))
      router.push(CATEGORIES_PATH)
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
        <FormSelect
          control={control}
          name="parentId"
          label={t("form.parent")}
          description={
            hasChildren
              ? t("form.parentLocked", { count: category?.children_count ?? 0 })
              : parentId
                ? t("form.parentHintSub")
                : t("form.parentHintMain")
          }
          options={parentOptions}
          emptyOption={t("form.noParent")}
          disabled={hasChildren || mains.isPending}
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
        <Button variant="ghost" nativeButton={false} render={<Link href={CATEGORIES_PATH} />}>
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
