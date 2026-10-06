"use client"

import { useTranslations } from "next-intl"
import type { UseFormReturn } from "react-hook-form"

import { CollectionEditor, EditCollectionItem } from "@admin/components/cms/collection-editor"
import { IconField } from "@admin/components/cms/content-fields"
import { DetailTab } from "@admin/components/cms/detail-tab"
import { FormImage } from "@admin/components/cms/form-image"
import { emptyOffering, OfferingFields } from "@admin/components/cms/offering-fields"
import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormInput } from "@admin/components/form/form-input"
import { FormNumberInput } from "@admin/components/form/form-number-input"
import { FormSection } from "@admin/components/form/form-section"
import { FormTagInput } from "@admin/components/form/form-tag-input"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { solutionsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, SolutionRecord, UploadedImage } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"
import { SLUG_MAX } from "@/lib/cms/fields"
import { solutionSchema } from "@/lib/cms/schemas"
import { solutionPreviewPath } from "./solutions-table"

const defaults = (): SolutionRecord => ({
  slug: "",
  name: "",
  image: null as unknown as UploadedImage,
  flagship: false,
  description: "",
  tags: [],
  icon: "sparkle",
  has_detail: false,
  detail: null,
  order: 100,
})

function GeneralFields({ form }: { form: UseFormReturn<SolutionRecord> }) {
  const t = useTranslations("Solutions.form")
  const tf = useTranslations("Fields")
  const { control } = form
  return (
    <div className="flex flex-col gap-4">
      <FormSection title={t("detailsTitle")} description={t("detailsHint")}>
        <FormInput control={control} name="name" label={tf("name")} required maxLength={120} autoFocus />
        <FormInput control={control} name="slug" label={tf("slug")} description={t("slugHint")} required dir="ltr" maxLength={SLUG_MAX} />
        <IconField control={control} name="icon" />
        <FormNumberInput control={control} name="order" label={tf("order")} description={tf("orderHint")} required min={-9999} max={9999} />
        <FormImage control={control} name="image" label={tf("image")} description={t("imageHint")} required className="lg:col-span-2" />
      </FormSection>
      <FormSection title={t("flagshipTitle")} description={t("flagshipHint")}>
        <FormCheckbox control={control} name="flagship" label={t("flagship")} description={t("flagshipCheckHint")} className="lg:col-span-2" />
        <FormTextarea control={control} name="description" label={tf("description")} rows={2} maxLength={400} className="lg:col-span-2" />
        <FormTagInput control={control} name="tags" label={t("tags")} maxTags={8} maxTagLength={60} className="lg:col-span-2" />
      </FormSection>
    </div>
  )
}

/** Create form when `row` is omitted, edit form when it's given. */
export function SolutionEditor({ row }: { row?: CollectionRow<SolutionRecord> }) {
  const t = useTranslations("Solutions")
  return (
    <CollectionEditor
      resource={solutionsResource}
      row={row}
      schema={solutionSchema}
      defaults={defaults}
      folder="solutions"
      listPath={adminPaths.solutions}
      previewPath={solutionPreviewPath}
      slug={{ from: "name", to: "slug" }}
      title={(values) => values.name}
      tabs={(form) => [
        {
          value: "general",
          label: t("tabs.general"),
          keys: ["name", "slug", "icon", "order", "image", "flagship", "description", "tags"],
          content: <GeneralFields form={form} />,
        },
        {
          value: "detail",
          label: t("tabs.detail"),
          keys: ["has_detail", "detail"],
          content: (
            <DetailTab
              form={form}
              label={t("form.hasDetail")}
              description={t("form.hasDetailHint")}
              emptyMessage={t("form.noDetail")}
              template={emptyOffering}
            >
              <OfferingFields control={form.control} />
            </DetailTab>
          ),
        },
      ]}
    />
  )
}

export function EditSolution({ id }: { id: string }) {
  return <EditCollectionItem resource={solutionsResource} id={id}>{(row) => <SolutionEditor row={row} />}</EditCollectionItem>
}
