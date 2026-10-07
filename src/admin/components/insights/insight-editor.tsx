"use client"

import { useTranslations } from "next-intl"

import { CollectionEditor, EditCollectionItem } from "@admin/components/cms/collection-editor"
import { FormImage } from "@admin/components/cms/form-image"
import { FormCheckbox } from "@admin/components/form/form-checkbox"
import { FormInput } from "@admin/components/form/form-input"
import { FormRichText } from "@admin/components/form/form-rich-text"
import { FormSection } from "@admin/components/form/form-section"
import { FormTextarea } from "@admin/components/form/form-textarea"
import { uploadsApi } from "@admin/lib/api/services/uploads"
import { insightsResource } from "@admin/lib/api/services/site-content"
import type { CollectionRow, InsightRecord } from "@admin/lib/api/types"
import { adminPaths } from "@admin/lib/paths"
import { SLUG_MAX } from "@/lib/cms/fields"
import { insightSchema } from "@/lib/cms/schemas"
import { insightPreviewPath } from "./insights-table"

const today = () => new Date().toISOString().slice(0, 10)

const defaults = (): InsightRecord => ({
  slug: "",
  title: "",
  category: "",
  date: today(),
  summary: "",
  image: null as unknown as InsightRecord["image"],
  featured: false,
  body: "",
  order: 0,
})

/** Pictures added inside the article body are uploaded straight away. */
const uploadBodyImage = async (file: File) => (await uploadsApi.upload(file, "insights")).url

/** Create form when `row` is omitted, edit form when it's given. */
export function InsightEditor({ row }: { row?: CollectionRow<InsightRecord> }) {
  const t = useTranslations("Insights")
  const tf = useTranslations("Fields")
  return (
    <CollectionEditor
      resource={insightsResource}
      row={row}
      schema={insightSchema}
      defaults={defaults}
      folder="insights"
      listPath={adminPaths.insights}
      previewPath={insightPreviewPath}
      slug={{ from: "title", to: "slug" }}
      title={(values) => values.title}
      tabs={({ control }) => [
        {
          value: "details",
          label: t("tabs.details"),
          keys: ["title", "slug", "category", "date", "summary", "image", "featured"],
          content: (
            <div className="flex flex-col gap-4">
              <FormSection title={t("form.detailsTitle")} description={t("form.detailsHint")}>
                <FormInput control={control} name="title" label={tf("title")} required maxLength={200} autoFocus className="lg:col-span-2" />
                <FormInput control={control} name="slug" label={tf("slug")} description={t("form.slugHint")} required dir="ltr" maxLength={SLUG_MAX} />
                <FormInput control={control} name="category" label={t("form.category")} description={t("form.categoryHint")} required maxLength={60} />
                <FormInput control={control} name="date" type="date" label={t("form.date")} description={t("form.dateHint")} required dir="ltr" />
                <FormCheckbox control={control} name="featured" label={t("form.featured")} description={t("form.featuredHint")} className="lg:pt-8" />
                <FormTextarea control={control} name="summary" label={t("form.summary")} description={t("form.summaryHint")} rows={3} maxLength={400} className="lg:col-span-2" />
              </FormSection>
              <FormSection title={t("form.coverTitle")} description={t("form.coverHint")}>
                <FormImage control={control} name="image" label={t("form.cover")} required className="lg:col-span-2" />
              </FormSection>
            </div>
          ),
        },
        {
          value: "body",
          label: t("tabs.body"),
          keys: ["body"],
          content: (
            <FormSection title={t("form.bodyTitle")} description={t("form.bodyHint")}>
              <FormRichText
                control={control}
                name="body"
                label={t("form.body")}
                headings
                onImageUpload={uploadBodyImage}
                imageMaxSize={4 * 1024 * 1024}
                className="lg:col-span-2"
              />
            </FormSection>
          ),
        },
      ]}
    />
  )
}

export function EditInsight({ id }: { id: string }) {
  return <EditCollectionItem resource={insightsResource} id={id}>{(row) => <InsightEditor row={row} />}</EditCollectionItem>
}
